// src/services/generateSalarySlip.ts

import PDFDocument from "pdfkit";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import fs from "fs";
import path from "path";

import { encrypt } from "../utils/encryption";

import templates from "../../templates";

// ✅ STORAGE SERVICE
import {
  uploadToCentralStorage,
} from "./uploadfileService";

// ================= TEMPLATE SELECTOR =================
function selectTemplateByName(
  name?: string
) {
  if (!name) return null;

  const key = name
    .trim()
    .toLowerCase();

  const exact =
    Object.entries(
      templates
    ).find(
      ([tplName]) =>
        tplName.toLowerCase() ===
        key
    );

  if (exact) return exact[1];

  const aliasMap: Record<
    string,
    string
  > = {
    standard:
      "standardSalaryTemplate",

    executive:
      "executiveSalaryTemplate",
  };

  if (
    aliasMap[key] &&
    templates[
      aliasMap[key]
    ]
  ) {
    return templates[
      aliasMap[key]
    ];
  }

  return null;
}

// ================= MAIN FUNCTION =================
export const createSalarySlip =
  async (
    salary: any,
    employee: any,
    templateName: string
  ): Promise<{
    pdf?: string;
    docx?: string;
  }> => {

    console.log(
      "🚀 createSalarySlip START"
    );

    const filename = `SalarySlip-${
      employee.name
    }-${
      salary.month
    }-${Date.now()}`;

    console.log(
      "📄 Filename:",
      filename
    );

    // ================= TMP DIR =================
    const tmpDir = path.join(
      __dirname,
      "..",
      "..",
      "tmp"
    );

    if (
      !fs.existsSync(tmpDir)
    ) {
      fs.mkdirSync(tmpDir, {
        recursive: true,
      });
    }

    const pdfPath = path.join(
      tmpDir,
      `${filename}.pdf`
    );

    const docxPath = path.join(
      tmpDir,
      `${filename}.docx`
    );

    console.log(
      "📄 PDF PATH:",
      pdfPath
    );

    console.log(
      "📄 DOCX PATH:",
      docxPath
    );

    // ================= TEMPLATE =================
    console.log(
      "📄 Selecting template..."
    );

    const templateFn =
      selectTemplateByName(
        templateName
      ) ||
      templates[
        "standardSalaryTemplate"
      ];

    console.log(
      "✅ Template selected"
    );

    const content =
      templateFn({
        employee,
        salary,
      });

    console.log(
      "✅ Template generated"
    );

    // ================= PDF =================
    try {

      console.log(
        "📄 Generating PDF..."
      );

      const pdfDoc =
        new PDFDocument({
          autoFirstPage: true,
        });

      const pdfStream =
        fs.createWriteStream(
          pdfPath
        );

      pdfDoc.pipe(pdfStream);

      pdfDoc
        .fontSize(12)
        .text(content, {
          align: "left",
        });

      pdfDoc.end();

      await new Promise<void>(
        (
          resolve,
          reject
        ) => {

          pdfStream.on(
            "finish",
            () => {

              console.log(
                "✅ PDF generated"
              );

              resolve();
            }
          );

          pdfStream.on(
            "error",
            (err) => {

              reject(err);
            }
          );
        }
      );

    } catch (err: any) {

      console.log(
        "❌ PDF ERROR"
      );

      throw new Error(
        "PDF generation failed: " +
          err.message
      );
    }

    // ================= DOCX =================
    try {

      console.log(
        "📄 Generating DOCX..."
      );

      const doc =
        new Document({
          sections: [
            {
              children:
                content
                  .split("\n")
                  .map(
                    (line) =>
                      new Paragraph(
                        {
                          children:
                            [
                              new TextRun({
                                text:
                                  line.trim(),

                                size:
                                  24,
                              }),
                            ],
                        }
                      )
                  ),
            },
          ],
        });

      const buffer =
        await Packer.toBuffer(
          doc
        );

      fs.writeFileSync(
        docxPath,
        buffer
      );

      console.log(
        "✅ DOCX generated"
      );

    } catch (err: any) {

      console.log(
        "❌ DOCX ERROR"
      );

      throw new Error(
        "DOCX generation failed: " +
          err.message
      );
    }

    // ================= UPLOAD =================
    const urls: {
      pdf?: string;
      docx?: string;
    } = {};

    try {

      // ================= PDF =================
      console.log(
        "☁️ Uploading PDF..."
      );

      const pdfBuffer =
        fs.readFileSync(
          pdfPath
        );

      const uploadedPdf =
        await uploadToCentralStorage(
          {
            buffer:
              pdfBuffer,

            originalname:
              `${filename}.pdf`,

            mimetype:
              "application/pdf",
          } as any
        );

      console.log(
        "✅ PDF Uploaded:",
        uploadedPdf
      );

      urls.pdf = encrypt(
        uploadedPdf.fileId
      );

      console.log(
        "🔐 PDF encrypted"
      );

      // ================= DOCX =================
      console.log(
        "☁️ Uploading DOCX..."
      );

      const docxBuffer =
        fs.readFileSync(
          docxPath
        );

      const uploadedDocx =
        await uploadToCentralStorage(
          {
            buffer:
              docxBuffer,

            originalname:
              `${filename}.docx`,

            mimetype:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          } as any
        );

      console.log(
        "✅ DOCX Uploaded:",
        uploadedDocx
      );

      urls.docx =
        encrypt(
          uploadedDocx.fileId
        );

      console.log(
        "🔐 DOCX encrypted"
      );

      // ================= CLEANUP =================
      try {

        if (
          fs.existsSync(
            pdfPath
          )
        ) {

          fs.unlinkSync(
            pdfPath
          );
        }

        if (
          fs.existsSync(
            docxPath
          )
        ) {

          fs.unlinkSync(
            docxPath
          );
        }

        console.log(
          "🗑️ TEMP FILES DELETED"
        );

      } catch (
        deleteError
      ) {

        console.log(
          "⚠️ TEMP DELETE ERROR"
        );

        console.log(
          deleteError
        );
      }

      console.log(
        "✅ Salary Slip Upload Completed"
      );

    } catch (err: any) {

      console.log(
        "❌ UPLOAD ERROR"
      );

      console.log(err);

      throw new Error(
        "Salary slip upload failed: " +
          err.message
      );
    }

    console.log(
      "🎉 createSalarySlip FINISHED"
    );

    return urls;
  };

export default createSalarySlip;