import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";
import wasabiS3 from "../config/wasabi";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { encrypt } from "../utils/encryption";

import { exitLetterTemplate } from "../../templates/exitTemplate";
import { experienceLetterTemplate } from "../../templates/experienceLetterTemplate";

export const createLetter = async (
  type: "exit" | "experience",
  employee: any,
  company_name: string
) => {
  const name = employee.name || "Unknown";
  const filename = `${
    type === "exit" ? "ExitLetter" : "ExperienceLetter"
  }-${name.replace(/\s+/g, "_")}-${Date.now()}`;

  const tmpDir = path.join(__dirname, "..", "..", "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const pdfPath = path.join(tmpDir, `${filename}.pdf`);
  const docxPath = path.join(tmpDir, `${filename}.docx`);

  let content: string;

  if (type === "exit") {
    if (
      !employee.designation ||
      !employee.joining_date ||
      !employee.exit_date
    ) {
      throw new Error("Missing required fields for exit letter.");
    }
    content = exitLetterTemplate({
      name: employee.name,
      designation: employee.designation,
      department: employee.department,
      joining_date: new Date(employee.joining_date).toISOString().split("T")[0],
      exit_date: new Date(employee.exit_date).toISOString().split("T")[0],
      company_name,
    });
  } else {
    if (!employee.designation || !employee.joining_date) {
      throw new Error("Missing required fields for experience letter.");
    }
    content = experienceLetterTemplate({
      name: employee.name,
      designation: employee.designation,
      department: employee.department,
      joining_date: new Date(employee.joining_date).toISOString().split("T")[0],
      exit_date: employee.exit_date
        ? new Date(employee.exit_date).toISOString().split("T")[0]
        : "",
      company_name,
      company_address: employee.company_address || "",
    });
  }

  // PDF
  const pdfDoc = new PDFDocument();
  pdfDoc.pipe(fs.createWriteStream(pdfPath));
  pdfDoc.fontSize(12).text(content, { align: "left" });
  pdfDoc.end();

  // DOCX
  const doc = new Document({
    sections: [
      {
        children: content
          .split("\n")
          .map(
            (line) => new Paragraph({ children: [new TextRun(line.trim())] })
          ),
      },
    ],
  });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);

  const urls: { pdf?: string; docx?: string } = {};

  for (const format of ["pdf", "docx"] as const) {
    const filePath = format === "pdf" ? pdfPath : docxPath;
    const key = `documents/${type}_letters/${filename}.${format}`;
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
