import PDFDocument from "pdfkit";

import fs from "fs";
import path from "path";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import { encrypt } from "../utils/encryption";

import offerTemplates from "../../templates";

// ✅ STORAGE SERVICE
import {
  uploadToCentralStorage,
} from "./uploadfileService";

type TemplateContext = {
  name: string;
  designation: string;
  department?: any;
  joining_date: string;
  probation_period: string;
  company_name: string;
};

// ================= TEMPLATE SELECTOR =================
function selectTemplateByName(
  name?: string
) {
  if (!name)
    return undefined;

  const key = name
    .trim()
    .toLowerCase();

  const exact =
    Object.entries(
      offerTemplates
    ).find(
      ([tplName]) =>
        tplName.toLowerCase() ===
        key
    );

  if (exact)
    return exact[1];

  const aliasMap: Record<
    string,
    string
  > = {
    standard:
      "standardOfferTemplate",

    executive:
      "executiveOfferTemplate",

    basic:
      "basicOfferTemplate",
  };

  if (
    aliasMap[key] &&
    offerTemplates[
      aliasMap[key]
    ]
  ) {
    return offerTemplates[
      aliasMap[key]
    ];
  }

  const substr =
    Object.entries(
      offerTemplates
    ).find(([tplName]) =>
      tplName
        .toLowerCase()
        .includes(key)
    );

  if (substr)
    return substr[1];

  return undefined;
}

// ================= TEMPLATE FUNCTION =================
function resolveTemplateToFn(
  maybeTpl: any
):
  | ((
      ctx: TemplateContext
    ) => string)
  | null {
  if (!maybeTpl)
    return null;

  if (
    typeof maybeTpl ===
    "function"
  ) {
    return maybeTpl;
  }

  if (
    typeof maybeTpl ===
    "object"
  ) {
    if (
      typeof maybeTpl.render ===
      "function"
    ) {
      return maybeTpl.render;
    }

    if (
      typeof maybeTpl.template ===
      "function"
    ) {
      return maybeTpl.template;
    }

    if (
      typeof maybeTpl.fn ===
      "function"
    ) {
      return maybeTpl.fn;
    }
  }

  return null;
}

// ================= MAIN FUNCTION =================
export const createOfferLetter =
  async (
    employee: any,
    company_name: string,
    templateName: string
  ): Promise<{
    pdf?: string;
    docx?: string;
  }> => {

    console.log(
      "🚀 createOfferLetter START"
    );

    try {

      const name =
        employee?.name ||
        "Unknown";

      console.log(
        "👤 Employee Name:",
        name
      );

      // ✅ SAFE FILENAME
      const safeName =
        name.replace(
          /\s+/g,
          "_"
        );

      const filename =
        `OfferLetter-${safeName}-${Date.now()}`;

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

      console.log(
        "📁 TMP DIR:",
        tmpDir
      );

      if (
        !fs.existsSync(
          tmpDir
        )
      ) {

        console.log(
          "📁 Creating tmp directory..."
        );

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

      // ================= VALIDATION =================
      if (!employee) {
        throw new Error(
          "Missing employee data"
        );
      }

      if (
        !employee.designation
      ) {
        throw new Error(
          "Missing employee.designation"
        );
      }

      if (
        !employee.joining_date
      ) {
        throw new Error(
          "Missing employee.joining_date"
        );
      }

      // ================= TEMPLATE =================
      console.log(
        "🧩 STEP A: TEMPLATE START"
      );

      const rawTemplate =
        selectTemplateByName(
          templateName
        ) ||
        (offerTemplates as any)[
          "generateOfferContent"
        ];

      const templateFn =
        resolveTemplateToFn(
          rawTemplate
        );

      if (!templateFn) {
        throw new Error(
          `Invalid template "${templateName}"`
        );
      }

      // ================= DATE =================
      let joiningDateStr =
        "";

      try {

        if (
          employee.joining_date instanceof
          Date
        ) {

          joiningDateStr =
            employee.joining_date
              .toISOString()
              .split("T")[0];

        } else {

          joiningDateStr =
            new Date(
              employee.joining_date
            )
              .toISOString()
              .split("T")[0];
        }

      } catch {

        joiningDateStr =
          String(
            employee.joining_date
          );
      }

      // ================= CONTENT =================
      const content =
        templateFn({
          name:
            employee.name ||
            "Unknown",

          designation:
            employee.designation,

          department:
            employee.department,

          joining_date:
            joiningDateStr,

          probation_period:
            employee.probation_period ||
            "3 months",

          company_name,
        });

      console.log(
        "✅ TEMPLATE GENERATED"
      );

      console.log(
        "📝 CONTENT LENGTH:",
        content?.length
      );

      // ================= PDF =================
      try {

        console.log(
          "📄 GENERATING PDF..."
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
                  "✅ PDF GENERATED"
                );

                resolve();
              }
            );

            pdfStream.on(
              "error",
              (err) => {

                console.log(
                  "❌ PDF STREAM ERROR"
                );

                reject(
                  err
                );
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
          "📄 GENERATING DOCX..."
        );

        const doc =
          new Document({
            sections: [
              {
                properties:
                  {},

                children: [
                  new Paragraph({
                    children:
                      [
                        new TextRun(
                          {
                            text:
                              content,

                            size:
                              24,
                          }
                        ),
                      ],
                  }),
                ],
              },
            ],
          });

        const docxBuffer =
          await Packer.toBuffer(
            doc
          );

        fs.writeFileSync(
          docxPath,
          docxBuffer
        );

        console.log(
          "✅ DOCX GENERATED"
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

      // ================= URLS =================
      const urls: {
        pdf?: string;
        docx?: string;
      } = {};

      // ================= UPLOAD PDF =================
      try {

        console.log(
          "☁️ UPLOADING PDF..."
        );

        const fileBuffer =
          fs.readFileSync(
            pdfPath
          );

        console.log(
          "📦 PDF BUFFER SIZE:",
          fileBuffer.length
        );

        const uploadedPdf =
          await uploadToCentralStorage(
            {
              buffer:
                fileBuffer,

              originalname:
                `${filename}.pdf`,

              mimetype:
                "application/pdf",
            } as any
          );

        console.log(
          "✅ PDF UPLOADED:",
          uploadedPdf
        );

        urls.pdf =
          encrypt(
            uploadedPdf.fileId
          );

        console.log(
          "🔐 ENCRYPTED PDF FILE ID SAVED"
        );

      } catch (err: any) {

        console.log(
          "❌ PDF UPLOAD ERROR"
        );

        console.log(
          err
        );

        throw new Error(
          "PDF upload failed: " +
            err.message
        );
      }

      // ================= UPLOAD DOCX =================
      try {

        console.log(
          "☁️ UPLOADING DOCX..."
        );

        const docxBuffer =
          fs.readFileSync(
            docxPath
          );

        console.log(
          "📦 DOCX BUFFER SIZE:",
          docxBuffer.length
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
          "✅ DOCX UPLOADED:",
          uploadedDocx
        );

        urls.docx =
          encrypt(
            uploadedDocx.fileId
          );

        console.log(
          "🔐 ENCRYPTED DOCX FILE ID SAVED"
        );

      } catch (err: any) {

        console.log(
          "❌ DOCX UPLOAD ERROR"
        );

        console.log(
          err
        );

        throw new Error(
          "DOCX upload failed: " +
            err.message
        );
      }

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

          console.log(
            "🗑️ TEMP PDF DELETED"
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

          console.log(
            "🗑️ TEMP DOCX DELETED"
          );
        }

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
        "✅ OFFER LETTER UPLOAD DONE"
      );

      console.log(
        "🎉 createOfferLetter FINISHED"
      );

      return urls;

    } catch (
      mainError: any
    ) {

      console.log(
        "❌ MAIN createOfferLetter ERROR"
      );

      console.log(
        mainError
      );

      throw mainError;
    }
  };

export default createOfferLetter;