// src/services/generateOfferLetter.ts

import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";
import { generateOfferContent } from "../../templates/offerTemplate";
import wasabiS3 from "../config/wasabi";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { encrypt } from "../utils/encryption";

export const createOfferLetter = async (
  employee: any,
  company_name: string
) => {
  const name = employee.name || "Unknown";

  const filename = `OfferLetter-${name.replace(/\s+/g, "_")}-${Date.now()}`;
  const tmpDir = path.join(__dirname, "..", "..", "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const pdfPath = path.join(tmpDir, `${filename}.pdf`);
  const docxPath = path.join(tmpDir, `${filename}.docx`);

  // ✅ Validate required fields
  if (!employee.designation || !employee.joining_date) {
    throw new Error("Missing required employee fields.");
  }

  const content = generateOfferContent({
    name: employee.name,
    designation: employee.designation,
    department: employee.department,
    joining_date: employee.joining_date.toISOString().split("T")[0],
    probation_period: employee.probation_period || "3 months",
    company_name, // ✅ Use dynamic company name
  });

  // ✅ Generate PDF
  const pdfDoc = new PDFDocument();
  pdfDoc.pipe(fs.createWriteStream(pdfPath));
  pdfDoc.fontSize(12).text(content, { align: "left" });
  pdfDoc.end();

  // ✅ Generate DOCX
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

  // ✅ Upload to Wasabi
  const urls: { pdf?: string; docx?: string } = {};

  for (const format of ["pdf", "docx"] as const) {
    const filePath = format === "pdf" ? pdfPath : docxPath;
    const key = `documents/offer_letters/${filename}.${format}`;
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
    fs.unlinkSync(filePath); // cleanup
  }

  return urls;
};
