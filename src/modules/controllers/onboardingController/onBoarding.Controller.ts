import { Request, Response } from "express";
import { Onboarding, Role } from "../../models/index";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import XLSX from "xlsx";

import { CompanyRequest } from "../../../middlewares/authMiddleware";

import { encrypt, decrypt } from "../../../utils/encryption";

import templates from "../../../../templates/index";

import { createOfferLetter } from "../../../services/generateOfferLetter";

import {
  uploadToCentralStorage,
  getSignedUrl,
} from "../../../services/uploadfileService";

import { audit } from "../../../helpers/audit.helper";

// ================= PASSWORD =================
const generateStrongPassword = (): string => {
  return crypto.randomBytes(10).toString("base64url");
};

// ================= FILE UPLOAD HELPER =================
const uploadField = async (
  files?: Express.Multer.File[]
): Promise<string | undefined> => {
  if (!files?.length) {
    return undefined;
  }

  const uploadedFile = await uploadToCentralStorage(
    files[0]
  );

  console.log(
    "Uploaded File:",
    uploadedFile
  );

  return encrypt(
    uploadedFile.fileId
  );
};

// ================= CREATE =================
const createOnboarding =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const file =
        req.files as any;

      const passport_photo =
        await uploadField(
          file?.passport_photo
        );

      const aadhar_photo =
        await uploadField(
          file?.aadhar_photo
        );

      const pan_photo =
        await uploadField(
          file?.pan_photo
        );

      const resume =
        await uploadField(
          file?.resume
        );

      const offer_letter =
        await uploadField(
          file?.offer_letter
        );

      const joining_letter =
        await uploadField(
          file?.joining_letter
        );

      const experience_letter =
        await uploadField(
          file?.experience_letter
        );

      const {
        name,
        email,
        contact,
        role_id,
        designation,
        department,
        reporting_manager,
        joining_date,
        probation_period,
        pan_card,
        aadhar_card,
      } = req.body;

      const company_code =
        req.user.company_code;

      // ================= EXISTING =================
      const existingEmployee =
        await Onboarding.findOne(
          {
            where: {
              email,
              company_code,
            },
          }
        );

      if (existingEmployee) {
        return res.status(400).json(
          {
            message:
              "Employee with this email already exists",
          }
        );
      }

      // ================= ROLE =================
      const role =
        await Role.findOne({
          where: {
            id: role_id,
            company_code,
          },
        });

      if (!role) {
        return res.status(400).json(
          {
            message:
              "Invalid role",
          }
        );
      }

      // ================= PASSWORD =================
      const auto_password =
        generateStrongPassword();

      // ================= CREATE =================
      const newEmployee =
        await Onboarding.create(
          {
            name,
            email,
            contact,
            role_id,
            designation,
            department,
            reporting_manager,
            joining_date,
            probation_period,
            company_code,
            auto_password,
            pan_card,
            aadhar_card,

            passport_photo,
            aadhar_photo,
            pan_photo,
            resume,
            offer_letter,
            joining_letter,
            experience_letter,
          }
        );

      // ================= AUDIT =================
      await audit(req, {
        module:
          "onboarding",
        action:
          "create",
        record_id:
          newEmployee.id,
        new_value:
          newEmployee,
      });

      return res.status(201).json(
        {
          message:
            "Onboarding created successfully",
          data:
            newEmployee,
        }
      );
    } catch (error: any) {
      console.error(
        "CREATE ONBOARDING ERROR:",
        error
      );

      return res.status(500).json(
        {
          message:
            "Failed to create onboarding",
          error:
            error.message,
        }
      );
    }
  };

// ================= GET ALL =================
const getAllOnboardings =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const data =
        await Onboarding.findAll(
          {
            where: {
              company_code:
                req.user
                  .company_code,
            },
          }
        );

      return res.status(200).json(
        {
          data,
        }
      );
    } catch (error: any) {
      return res.status(500).json(
        {
          message:
            "Failed to fetch onboardings",
          error:
            error.message,
        }
      );
    }
  };

// ================= GET BY ID =================
const getOnboardingById =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const record =
        await Onboarding.findOne(
          {
            where: {
              id:
                req.params.id,
              company_code:
                req.user
                  .company_code,
            },
          }
        );

      if (!record) {
        return res.status(404).json(
          {
            message:
              "Onboarding not found",
          }
        );
      }

      return res.status(200).json(
        {
          data: record,
        }
      );
    } catch (error: any) {
      return res.status(500).json(
        {
          message:
            "Failed to fetch onboarding",
          error:
            error.message,
        }
      );
    }
  };

// ================= UPDATE =================
const updateOnboarding =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { id } =
        req.params;

      const record =
        await Onboarding.findOne(
          {
            where: {
              id,
              company_code:
                req.user
                  .company_code,
            },
          }
        );

      if (!record) {
        return res.status(404).json(
          {
            message:
              "Onboarding not found",
          }
        );
      }

      const oldData =
        record.toJSON();

      const file =
        req.files as any;

      const updates: any =
        {};

      // ================= FILES =================
      if (
        file?.passport_photo
      ) {
        updates.passport_photo =
          await uploadField(
            file.passport_photo
          );
      }

      if (
        file?.aadhar_photo
      ) {
        updates.aadhar_photo =
          await uploadField(
            file.aadhar_photo
          );
      }

      if (
        file?.pan_photo
      ) {
        updates.pan_photo =
          await uploadField(
            file.pan_photo
          );
      }

      if (file?.resume) {
        updates.resume =
          await uploadField(
            file.resume
          );
      }

      if (
        file?.offer_letter
      ) {
        updates.offer_letter =
          await uploadField(
            file.offer_letter
          );
      }

      if (
        file?.joining_letter
      ) {
        updates.joining_letter =
          await uploadField(
            file.joining_letter
          );
      }

      if (
        file?.experience_letter
      ) {
        updates.experience_letter =
          await uploadField(
            file.experience_letter
          );
      }

      // ================= ROLE =================
      if (
        req.body.role_id
      ) {
        const role =
          await Role.findOne(
            {
              where: {
                id:
                  req.body
                    .role_id,
                company_code:
                  req.user
                    .company_code,
              },
            }
          );

        if (!role) {
          return res.status(400).json(
            {
              message:
                "Invalid role",
            }
          );
        }
      }

      // ================= UPDATE =================
      await record.update({
        ...req.body,
        ...updates,
      });

      await record.reload();

      // ================= AUDIT =================
      await audit(req, {
        module:
          "onboarding",
        action:
          "update",
        record_id:
          record.id,
        old_value:
          oldData,
        new_value:
          record,
      });

      return res.status(200).json(
        {
          message:
            "Onboarding updated successfully",
          data: record,
        }
      );
    } catch (error: any) {
      console.error(
        "UPDATE ONBOARDING ERROR:",
        error
      );

      return res.status(500).json(
        {
          message:
            "Failed to update onboarding",
          error:
            error.message,
        }
      );
    }
  };

// ================= DELETE =================
const deleteOnboarding =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const record =
        await Onboarding.findOne(
          {
            where: {
              id:
                req.params.id,
              company_code:
                req.user
                  .company_code,
            },
          }
        );

      if (!record) {
        return res.status(404).json(
          {
            message:
              "Onboarding not found",
          }
        );
      }

      const oldData =
        record.toJSON();

      await record.destroy();

      await audit(req, {
        module:
          "onboarding",
        action:
          "delete",
        record_id:
          oldData.id,
        old_value:
          oldData,
      });

      return res.status(200).json(
        {
          message:
            "Onboarding deleted successfully",
        }
      );
    } catch (error: any) {
      return res.status(500).json(
        {
          message:
            "Failed to delete onboarding",
          error:
            error.message,
        }
      );
    }
  };

// ================= GET SIGNED URLS =================
const getAllPresignedUrls =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const record: any =
        await Onboarding.findOne(
          {
            where: {
              id:
                req.params.id,
              company_code:
                req.user
                  .company_code,
            },
          }
        );

      if (!record) {
        return res.status(404).json(
          {
            message:
              "Employee not found",
          }
        );
      }

      const fileFields =
        [
          "passport_photo",
          "aadhar_photo",
          "pan_photo",
          "resume",
          "offer_letter",
          "joining_letter",
          "experience_letter",
        ];

      const urls: any =
        {};

      for (const field of fileFields) {
        const storedValue =
          record[field];

        if (
          !storedValue
        ) {
          urls[field] =
            null;
          continue;
        }

        try {
          let encryptedFileId =
            storedValue;

          // 🔥 handle offer_letter JSON
          if (
            field ===
            "offer_letter"
          ) {
            try {
              const parsed =
                JSON.parse(
                  storedValue
                );

              encryptedFileId =
                parsed.pdf ||
                "";
            } catch {
              encryptedFileId =
                storedValue;
            }
          }

          if (
            !encryptedFileId
          ) {
            urls[field] =
              null;
            continue;
          }

          const fileId =
            decrypt(
              encryptedFileId
            );

          const signedUrl =
            await getSignedUrl(
              fileId
            );

          urls[field] =
            signedUrl;
        } catch (err) {
          console.error(
            `SIGNED URL ERROR (${field})`,
            err
          );

          urls[field] =
            null;
        }
      }

      return res.status(200).json(
        {
          message:
            "Signed URLs generated successfully",
          data: urls,
        }
      );
    } catch (error: any) {
      console.error(
        "SIGNED URL ERROR:",
        error
      );

      return res.status(500).json(
        {
          message:
            "Failed to generate signed URLs",
          error:
            error.message,
        }
      );
    }
  };

// ================= GENERATE OFFER LETTER =================
const generateOfferLetterById =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      // ================= FIND EMPLOYEE =================
      const employee: any =
        await Onboarding.findOne(
          {
            where: {
              id:
                req.params.id,
              company_code:
                req.user
                  .company_code,
            },
          }
        );

      if (!employee) {
        return res.status(404).json(
          {
            message:
              "Employee not found",
          }
        );
      }

      // ================= TEMPLATE =================
      const template =
        req.body.template ||
        "standard";

      const allowedTemplates =
        [
          "standard",
          "executive",
          "basic",
        ];

      if (
        !allowedTemplates.includes(
          template
        )
      ) {
        return res.status(400).json(
          {
            message:
              "Invalid template selected",

            allowedTemplates,
          }
        );
      }

      // ================= COMPANY NAME =================
      const companyName =
        req.user.company_name ||
        req.user.company_code ||
        "Your Company";

      // ================= GENERATE OFFER LETTER =================
      const urls: {
        pdf?: string;
        docx?: string;
      } =
        await createOfferLetter(
          employee,
          companyName,
          template
        );

      console.log(
        "GENERATED URLS:",
        urls
      );

      // ================= SAVE FILE IDS =================
        const oldData = employee.toJSON();

      employee.offer_letter =
        JSON.stringify({
          pdf:
            urls.pdf ||
            null,

          docx:
            urls.docx ||
            null,
        });

      await employee.save();

      // ================= AUDIT =================
   

await audit(req, {
  module: "onboarding",
  action: "update",
  record_id: employee.id,
  old_value: oldData,
  new_value: employee.toJSON(),
});

      return res.status(200).json(
        {
          message:
            "Offer letter generated successfully",

          selectedTemplate:
            template,

          data: {
            pdf:
              urls.pdf ||
              "",

            docx:
              urls.docx ||
              "",
          },
        }
      );
    } catch (error: any) {
      console.error(
        "GENERATE OFFER LETTER ERROR:",
        error
      );

      return res.status(500).json(
        {
          message:
            "Failed to generate offer letter",

          error:
            error.message,
        }
      );
    }
  };

// ================= DOWNLOAD OFFER LETTER =================
const downloadOfferLetter =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const id =
        req.params.id;

      const format =
        req.params.format?.toLowerCase();

      // ================= VALIDATE FORMAT =================
      if (
        ![
          "pdf",
          "docx",
        ].includes(format)
      ) {
        return res.status(400).json(
          {
            message:
              "Invalid format",
          }
        );
      }

      // ================= FIND EMPLOYEE =================
      const employee: any =
        await Onboarding.findOne(
          {
            where: {
              id,
              company_code:
                req.user
                  .company_code,
            },
          }
        );

      if (!employee) {
        return res.status(404).json(
          {
            message:
              "Employee not found",
          }
        );
      }

      if (
        !employee.offer_letter
      ) {
        return res.status(404).json(
          {
            message:
              "Offer letter not found",
          }
        );
      }

      console.log(
        "STORED OFFER LETTER:",
        employee.offer_letter
      );

      // ================= PARSE JSON =================
      const parsed: {
        pdf?: string | null;
        docx?: string | null;
      } = (() => {
        try {
          return JSON.parse(
            employee.offer_letter
          );
        } catch {
          return {
            pdf:
              employee.offer_letter,
            docx:
              null,
          };
        }
      })();

      // ================= GET ENCRYPTED FILE ID =================
      let encryptedFileId =
        "";

      if (
        format ===
        "pdf"
      ) {
        encryptedFileId =
          parsed.pdf ||
          "";
      }

      if (
        format ===
        "docx"
      ) {
        encryptedFileId =
          parsed.docx ||
          "";
      }

      if (
        !encryptedFileId
      ) {
        return res.status(404).json(
          {
            message:
              `${format} file not found`,
          }
        );
      }

      console.log(
        "ENCRYPTED FILE ID:",
        encryptedFileId
      );

      // ================= DECRYPT FILE ID =================
      let decryptedFileId =
        "";

      try {
        decryptedFileId =
          decrypt(
            encryptedFileId
          );

        console.log(
          "DECRYPTED FILE ID:",
          decryptedFileId
        );
      } catch (
        decryptError: any
      ) {
        console.log(
          "DECRYPT ERROR:",
          decryptError.message
        );

        return res.status(500).json(
          {
            message:
              "Failed to decrypt file ID",
          }
        );
      }

      // ================= GENERATE SIGNED URL =================
      const signedUrl =
        await getSignedUrl(
          decryptedFileId
        );

      return res.status(200).json(
        {
          url:
            signedUrl,
        }
      );
    } catch (error: any) {
      console.error(
        "DOWNLOAD OFFER LETTER ERROR:",
        error
      );

      return res.status(500).json(
        {
          message:
            "Failed to download offer letter",
          error:
            error.message,
        }
      );
    }
  };

// ================= TEMPLATES =================
const getAllTemplates =
  async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      return res.status(200).json(
        {
          templates:
            Object.keys(
              templates
            ),
        }
      );
    } catch (error: any) {
      return res.status(500).json(
        {
          message:
            "Failed to fetch templates",
          error:
            error.message,
        }
      );
    }
  };

// ================= BULK =================
const bulkCreateOnboarding =
  async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json(
          {
            message:
              "Excel file required",
          }
        );
      }

      const workbook =
        XLSX.read(
          req.file.buffer
        );

      const sheetName =
        workbook
          .SheetNames[0];

      const data =
        XLSX.utils.sheet_to_json(
          workbook.Sheets[
            sheetName
          ]
        );

      return res.status(200).json(
        {
          message:
            "Bulk onboarding processed",
          data,
        }
      );
    } catch (error: any) {
      return res.status(500).json(
        {
          message:
            "Bulk upload failed",
          error:
            error.message,
        }
      );
    }
  };

// ================= LOGIN =================
const employeeLogin =
  async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const {
        email,
        password,
      } = req.body;

      const user: any =
        await Onboarding.findOne(
          {
            where: {
              email,
              auto_password:
                password,
            },
          }
        );

      if (!user) {
        return res.status(401).json(
          {
            message:
              "Invalid credentials",
          }
        );
      }

      const role: any =
        await Role.findOne({
          where: {
            id:
              user.role_id,
            company_code:
              user.company_code,
          },
          raw: true,
        });

      const permissions =
        typeof role.permissions ===
        "string"
          ? JSON.parse(
              role.permissions
            )
          : role.permissions;

      const token =
        jwt.sign(
          {
            id:
              user.id,
            company_code:
              user.company_code,
            role_id:
              role.id,
            permissions,
          },
          process.env
            .JWT_SECRET ||
            "secret",
          {
            expiresIn:
              "1d",
          }
        );

      return res.status(200).json(
        {
          token,
          user,
        }
      );
    } catch (error: any) {
      return res.status(500).json(
        {
          message:
            "Login failed",
          error:
            error.message,
        }
      );
    }
  };

export {
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
  getAllPresignedUrls,
  generateOfferLetterById,
  downloadOfferLetter,
  getAllTemplates,
  bulkCreateOnboarding,
  employeeLogin,
};