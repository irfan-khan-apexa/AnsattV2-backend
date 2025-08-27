// services/generateSalarySlip.ts
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";
import wasabiS3 from "../config/wasabi";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { encrypt } from "../utils/encryption";
import templates from "../../templates"; // central templates import

function selectTemplateByName(name: string) {
  const key = name?.toLowerCase();
  const template = Object.entries(templates).find(
    ([tplName]) => tplName.toLowerCase() === key
  );
  return template ? template[1] : null;
}

export const createSalarySlip = async (
  salary: any,
  employee: any,
  templateName: string
) => {
  const filename = `SalarySlip-${employee.name}-${salary.month}-${Date.now()}`;
  const tmpDir = path.join(__dirname, "..", "..", "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const pdfPath = path.join(tmpDir, `${filename}.pdf`);
  const docxPath = path.join(tmpDir, `${filename}.docx`);

  // ✅ Pick template dynamically
  const templateFn =
    selectTemplateByName(templateName) || templates["standardSalaryTemplate"];
  const content = templateFn({ employee, salary });

  // PDF
  const pdfDoc = new PDFDocument();
  pdfDoc.pipe(fs.createWriteStream(pdfPath));
  pdfDoc.fontSize(12).text(content, { align: "left" });
  pdfDoc.end();

  // DOCX
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

  // Upload both
  const urls: { pdf?: string; docx?: string } = {};
  for (const format of ["pdf", "docx"] as const) {
    const filePath = format === "pdf" ? pdfPath : docxPath;
    const key = `documents/salary_slips/${filename}.${format}`;
    const fileBuffer = fs.readFileSync(filePath);

    await wasabiS3.send(
      new PutObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME!,
        Key: key,
        Body: fileBuffer,
        ACL: "public-read",
      })
    );

    const publicUrl = `${process.env.WASABI_ENDPOINT}/${process.env.WASABI_BUCKET_NAME}/${key}`;
    urls[format] = encrypt(publicUrl);
    fs.unlinkSync(filePath);
  }

  return urls;
};
