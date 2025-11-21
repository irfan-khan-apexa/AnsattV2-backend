// src/services/generateOfferLetter.ts
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";
import wasabiS3 from "../config/wasabi";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { encrypt } from "../utils/encryption";
import offerTemplates from "../../templates"; // central offer templates index

type TemplateContext = {
  name: string;
  designation: string;
  department?: any;
  joining_date: string;
  probation_period: string;
  company_name: string;
};

// --- Flexible template selector ---
// tries: 1) exact key, 2) alias map, 3) substring match, 4) fallback
function selectTemplateByName(name?: string) {
  if (!name) return undefined;
  const key = name.trim().toLowerCase();

  // 1) direct exact match with keys (case-insensitive)
  const exact = Object.entries(offerTemplates).find(
    ([tplName]) => tplName.toLowerCase() === key
  );
  if (exact) return exact[1];

  // 2) alias map for common friendly names
  const aliasMap: Record<string, string> = {
    standard: "standardOfferTemplate",
    executive: "executiveOfferTemplate",
    basic: "basicOfferTemplate",
    exit: "exitletter",
    experience: "experienceletter",
    salary_standard: "standardSalaryTemplate",
    salary_executive: "executiveSalaryTemplate",
  };
  if (aliasMap[key] && offerTemplates[aliasMap[key]]) {
    return offerTemplates[aliasMap[key]];
  }

  // 3) substring match: if user passes "standard", match "standardOfferTemplate"
  const substr = Object.entries(offerTemplates).find(([tplName]) =>
    tplName.toLowerCase().includes(key)
  );
  if (substr) return substr[1];

  // 4) no match
  return undefined;
}

// normalize template entry to a callable function
function resolveTemplateToFn(maybeTpl: any): ((ctx: TemplateContext) => string) | null {
  if (!maybeTpl) return null;
  if (typeof maybeTpl === "function") return maybeTpl;
  if (typeof maybeTpl === "object") {
    if (typeof maybeTpl.render === "function") return maybeTpl.render;
    if (typeof maybeTpl.template === "function") return maybeTpl.template;
    if (typeof maybeTpl.fn === "function") return maybeTpl.fn;
  }
  return null;
}

export const createOfferLetter = async (
  employee: any,
  company_name: string,
  templateName: string
): Promise<{ pdf?: string; docx?: string }> => {
  const name = employee?.name || "Unknown";
  const filename = `OfferLetter-${name.replace(/\s+/g, "_")}-${Date.now()}`;

  const tmpDir = path.join(__dirname, "..", "..", "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const pdfPath = path.join(tmpDir, `${filename}.pdf`);
  const docxPath = path.join(tmpDir, `${filename}.docx`);

  // Validate required fields
  if (!employee) throw new Error("Missing employee data.");
  if (!employee.designation) throw new Error("Missing employee.designation.");
  if (!employee.joining_date) throw new Error("Missing employee.joining_date.");

  // Resolve template safely (flexible)
  const rawTemplate =
    selectTemplateByName(templateName) ||
    // fallback to any default key you keep in templates
    (offerTemplates as any)["generateOfferContent"] ||
    undefined;

  const templateFn = resolveTemplateToFn(rawTemplate);

  if (!templateFn) {
    console.error("Invalid template resolved:", {
      requested: templateName,
      rawTemplate,
      availableKeys: Object.keys(offerTemplates || {}),
    });
    throw new Error(
      `Invalid template "${templateName}". Expected a function or an object with render/template/fn function.`
    );
  }

  // Format joining_date defensively
  let joiningDateStr = "";
  try {
    if (employee.joining_date instanceof Date) {
      joiningDateStr = employee.joining_date.toISOString().split("T")[0];
    } else if (typeof employee.joining_date === "string") {
      const d = new Date(employee.joining_date);
      if (!isNaN(d.getTime())) joiningDateStr = d.toISOString().split("T")[0];
      else joiningDateStr = String(employee.joining_date);
    } else {
      joiningDateStr = String(employee.joining_date || "");
    }
  } catch {
    joiningDateStr = String(employee.joining_date || "");
  }

  // Build content using template function
  const content = templateFn({
    name: employee.name || "Unknown",
    designation: employee.designation,
    department: employee.department,
    joining_date: joiningDateStr,
    probation_period: employee.probation_period || "3 months",
    company_name,
  });

  if (typeof content !== "string") {
    throw new Error("Template function must return a string.");
  }

  // Create PDF (write to tmp)
  try {
    const pdfDoc = new PDFDocument({ autoFirstPage: true });
    const pdfStream = fs.createWriteStream(pdfPath);
    pdfDoc.pipe(pdfStream);
    pdfDoc.fontSize(12).text(content, { align: "left" });
    pdfDoc.end();

    await new Promise<void>((resolve, reject) => {
      pdfStream.on("finish", () => resolve());
      pdfStream.on("error", (err) => reject(err));
    });
  } catch (err) {
    if (fs.existsSync(pdfPath)) {
      try { fs.unlinkSync(pdfPath); } catch {}
    }
    throw new Error("PDF generation failed: " + (err as Error).message);
  }

  // Create DOCX
  try {
    const doc = new Document({
      sections: [
        {
          children: content.split("\n").map(
            (line) =>
              new Paragraph({
                children: [new TextRun(line.trim())],
              })
          ),
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(docxPath, buffer);
  } catch (err) {
    if (fs.existsSync(docxPath)) {
      try { fs.unlinkSync(docxPath); } catch {}
    }
    if (fs.existsSync(pdfPath)) {
      try { fs.unlinkSync(pdfPath); } catch {}
    }
    throw new Error("DOCX generation failed: " + (err as Error).message);
  }

  // Upload both files to Wasabi and encrypt public URLs
  const urls: { pdf?: string; docx?: string } = {};
  try {
    const bucket = process.env.WASABI_BUCKET_NAME!;
    const endpoint = process.env.WASABI_ENDPOINT!.replace(/\/+$/, "");

    for (const format of ["pdf", "docx"] as const) {
      const filePath = format === "pdf" ? pdfPath : docxPath;
      const key = `documents/offer_letters/${filename}.${format}`;
      const fileBuffer = fs.readFileSync(filePath);

      await wasabiS3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: fileBuffer,
          ACL: "public-read",
        })
      );

      const publicUrl = `${endpoint}/${bucket}/${key}`;
      urls[format] = encrypt(publicUrl);

      try { fs.unlinkSync(filePath); } catch {}
    }
  } catch (err) {
    if (fs.existsSync(pdfPath)) {
      try { fs.unlinkSync(pdfPath); } catch {}
    }
    if (fs.existsSync(docxPath)) {
      try { fs.unlinkSync(docxPath); } catch {}
    }
    throw new Error("Failed to upload generated files: " + (err as Error).message);
  }

  return urls;
};

export default createOfferLetter;
