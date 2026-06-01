// src/services/generateExitLetter.ts

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

// ✅ STORAGE SERVICE
import {
  uploadToCentralStorage,
} from "./uploadfileService";

import { exitLetterTemplate } from "../../templates/exitTemplate";

import { experienceLetterTemplate } from "../../templates/experienceLetterTemplate";

// ================= MAIN =================
export const createLetter =
  async (
    type:
      | "exit"
      | "experience",

    employee: any,

    company_name: string
  ): Promise<{
    pdf?: string;
    docx?: string;
  }> => {

    console.log(
      "🚀 createLetter START"
    );

    const name =
      employee.name ||
      "Unknown";

    const filename = `${
      type === "exit"
        ? "ExitLetter"
        : "ExperienceLetter"
    }-${name.replace(
      /\s+/g,
      "_"
    )}-${Date.now()}`;

    console.log(
      "📄 Filename:",
      filename
    );

    // ================= TMP DIR =================
    const tmpDir =
      path.join(
        __dirname,
        "..",
        "..",
        "tmp"
      );

    if (
      !fs.existsSync(
        tmpDir
      )
    ) {

      fs.mkdirSync(
        tmpDir,
        {
          recursive:
            true,
        }
      );
    }

    const pdfPath =
      path.join(
        tmpDir,
        `${filename}.pdf`
      );

    const docxPath =
      path.join(
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
    let content = "";

    if (
      type ===
      "exit"
    ) {

      console.log(
        "📄 Using Exit Template"
      );

      content =
        exitLetterTemplate(
          {
            name:
              employee.name,

            designation:
              employee.designation,

            department:
              employee.department,

            joining_date:
              new Date(
                employee.joining_date
              )
                .toISOString()
                .split(
                  "T"
                )[0],

            exit_date:
              new Date(
                employee.exit_date
              )
                .toISOString()
                .split(
                  "T"
                )[0],

            company_name,
          }
        );

    } else {

      console.log(
        "📄 Using Experience Template"
      );

      content =
        experienceLetterTemplate(
          {
            name:
              employee.name,

            designation:
              employee.designation,

            department:
              employee.department,

            joining_date:
              new Date(
                employee.joining_date
              )
                .toISOString()
                .split(
                  "T"
                )[0],

            exit_date:
              employee.exit_date
                ? new Date(
                    employee.exit_date
                  )
                    .toISOString()
                    .split(
                      "T"
                    )[0]
                : "",

            company_name,

            company_address:
              employee.company_address ||
              "",
          }
        );
    }

    console.log(
      "✅ Template Generated"
    );

    // ================= PDF =================
    try {

      console.log(
        "📄 Generating PDF..."
      );

      const pdfDoc =
        new PDFDocument({
          autoFirstPage:
            true,
        });

      const pdfStream =
        fs.createWriteStream(
          pdfPath
        );

      pdfDoc.pipe(
        pdfStream
      );

      pdfDoc
        .fontSize(12)
        .text(content, {
          align:
            "left",
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
                "✅ PDF Generated"
              );

              resolve();
            }
          );

          pdfStream.on(
            "error",
            (err) => {

              reject(
                err
              );
            }
          );
        }
      );

    } catch (
      err: any
    ) {

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
                  .split(
                    "\n"
                  )
                  .map(
                    (
                      line
                    ) =>
                      new Paragraph(
                        {
                          children:
                            [
                              new TextRun(
                                {
                                  text:
                                    line.trim(),

                                  size:
                                    24,
                                }
                              ),
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
        "✅ DOCX Generated"
      );

    } catch (
      err: any
    ) {

      console.log(
        "❌ DOCX ERROR"
      );

      throw new Error(
        "DOCX generation failed: " +
          err.message
      );
    }

    // ================= URLS =================
    const urls: {
      pdf?: string;
      docx?: string;
    } = {};

    // ================= UPLOAD =================
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

      // ✅ RAW FILE ID
      urls.pdf =
        uploadedPdf.fileId;

      console.log(
        "✅ RAW PDF FILE ID SAVED"
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

      // ✅ RAW FILE ID
      urls.docx =
        uploadedDocx.fileId;

      console.log(
        "✅ RAW DOCX FILE ID SAVED"
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
        "✅ Upload Completed"
      );

    } catch (
      err: any
    ) {

      console.log(
        "❌ UPLOAD ERROR"
      );

      console.log(
        err
      );

      throw new Error(
        "Letter upload failed: " +
          err.message
      );
    }

    console.log(
      "🎉 createLetter FINISHED"
    );

    return urls;
  };

export default createLetter;