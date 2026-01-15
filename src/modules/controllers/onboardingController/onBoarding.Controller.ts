import { Request, Response } from "express";
import { Onboarding, Role } from "../../models/index";
import crypto from "crypto";
import {
  AuthenticatedRequest,
  CompanyRequest,
} from "../../../middlewares/authMiddleware";
import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RoleModuleAccess } from "../../../config/roleModuleAccess";
import { encrypt, decrypt } from "../../../utils/encryption";
import { createOfferLetter } from "../../../services/generateOfferLetter";

import templates from "../../../../templates/index";
import { log } from "console";
import { OnboardingAttributes } from "../../models/onboardingModel/Onboarding.Model";
import XLSX from "xlsx";

const generateStrongPassword = (): string => {
  return crypto.randomBytes(10).toString("base64url"); // 10 bytes => 13-14 chars
};

// const createOnboarding = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const file = req.files as any;

//     const passport_photo = file?.passport_photo?.[0]?.location
//       ? encrypt(file.passport_photo[0].location)
//       : undefined;

//     const aadhar_photo = file?.aadhar_photo?.[0]?.location
//       ? encrypt(file.aadhar_photo[0].location)
//       : undefined;

//     const pan_photo = file?.pan_photo?.[0]?.location
//       ? encrypt(file.pan_photo[0].location)
//       : undefined;

//     const resume = file?.resume?.[0]?.location
//       ? encrypt(file.resume[0].location)
//       : undefined;

//     const offer_letter = file?.offer_letter?.[0]?.location
//       ? encrypt(file.offer_letter[0].location)
//       : undefined;

//     const joining_letter = file?.joining_letter?.[0]?.location
//       ? encrypt(file.joining_letter[0].location)
//       : undefined;

//     const experience_letter = file?.experience_letter?.[0]?.location
//       ? encrypt(file.experience_letter[0].location)
//       : undefined;

//     const {
//       name,
//       email,
//       contact,
//       role,
//       designation,
//       department,
//       reporting_manager,
//       joining_date,
//       probation_period,
//       pan_card,
//       aadhar_card,
//     } = req.body;

//     const company_code = req.user.company_code;

//     // ✅ Check for duplicate email
//     const existingEmployee = await Onboarding.findOne({
//       where: { email, company_code },
//     });

//     if (existingEmployee) {
//       return res
//         .status(400)
//         .json({ message: "Employee with this email already exists" });
//     }

//     // ✅ Generate strong password
//     const auto_password = generateStrongPassword();

//     const newEmployee = await Onboarding.create({
//       name,
//       email,
//       contact,
//       role,
//       designation,
//       department,
//       reporting_manager,
//       joining_date,
//       probation_period,
//       company_code,
//       auto_password,
//       pan_card,
//       aadhar_card,
//       passport_photo,
//       aadhar_photo,
//       pan_photo,
//       resume,
//       offer_letter,
//       joining_letter,
//       experience_letter,
//     });
//     console.log("📦 req.body:", req.body);
//     console.log("📅 joining_date:", req.body.joining_date);

//     return res
//       .status(201)
//       .json({ message: "Onboarding created", data: newEmployee });
//   } catch (error: any) {
//     console.error("🔥 Error in createOnboarding:", error);
//     return res
//       .status(500)
//       .json({ message: "Failed to create onboarding", error: error.message });
//   }
// };

// Get All


const createOnboarding = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const file = req.files as any;

    const passport_photo = file?.passport_photo?.[0]?.location
      ? encrypt(file.passport_photo[0].location)
      : undefined;

    const aadhar_photo = file?.aadhar_photo?.[0]?.location
      ? encrypt(file.aadhar_photo[0].location)
      : undefined;

    const pan_photo = file?.pan_photo?.[0]?.location
      ? encrypt(file.pan_photo[0].location)
      : undefined;

    const resume = file?.resume?.[0]?.location
      ? encrypt(file.resume[0].location)
      : undefined;

    const offer_letter = file?.offer_letter?.[0]?.location
      ? encrypt(file.offer_letter[0].location)
      : undefined;

    const joining_letter = file?.joining_letter?.[0]?.location
      ? encrypt(file.joining_letter[0].location)
      : undefined;

    const experience_letter = file?.experience_letter?.[0]?.location
      ? encrypt(file.experience_letter[0].location)
      : undefined;

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

    const company_code = req.user.company_code;

    // ✅ Check for duplicate email
    const existingEmployee = await Onboarding.findOne({
      where: { email, company_code },
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ message: "Employee with this email already exists" });
    }
   const role = await Role.findOne({
      where: { id: role_id, company_code },
    });

    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }
    // ✅ Generate strong password
    const auto_password = generateStrongPassword();

    const newEmployee = await Onboarding.create({
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
    });
    console.log("📦 req.body:", req.body);
    console.log("📅 joining_date:", req.body.joining_date);

    return res
      .status(201)
      .json({ message: "Onboarding created", data: newEmployee });
  } catch (error: any) {
    console.error("🔥 Error in createOnboarding:", error);
    return res
      .status(500)
      .json({ message: "Failed to create onboarding", error: error.message });
  }
};

const getAllOnboardings = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const onboardings = await Onboarding.findAll({
      where: { company_code: req.user.company_code },
    });
    return res.status(200).json({ data: onboardings });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching onboardings" });
  }
};

// Get by ID
const getOnboardingById = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const record = await Onboarding.findOne({
      where: { id, company_code: req.user.company_code },
    });

    if (!record)
      return res.status(404).json({ message: "Onboarding not found" });

    return res.status(200).json({ data: record });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching onboarding" });
  }
};

// Update
const updateOnboarding = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    const record = await Onboarding.findOne({
      where: { id, company_code: req.user.company_code },
    });

    if (!record) {
      return res.status(404).json({ message: "Onboarding record not found" });
    }

    // 1) Update any normal fields coming in req.body
    // Use safe cast because req.body values may be strings for dates/nums
    await record.update(req.body || {});

    // 2) If files uploaded (multer-s3), save their S3 locations/keys to the record
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    if (files && Object.keys(files).length > 0) {
      const updates: Partial<OnboardingAttributes> = {};

      // list all file-fields your route accepts and map them
      const fileFields = [
        "pan_photo",
        "aadhar_photo",
        "passport_photo",
        "resume",
        "offer_letter",
        "joining_letter",
        "experience_letter",
      ];

      fileFields.forEach((field) => {
        const fArr = (files as any)[field] as Express.Multer.File[] | undefined;
        if (fArr && fArr.length > 0) {
          // multer-s3 provides .location (full URL). fallback to .key if needed.
          const fileObj: any = fArr[0];
          updates[field as keyof OnboardingAttributes] = fileObj.location || fileObj.key || null;
        }
      });

      if (Object.keys(updates).length > 0) {
        await record.update(updates);
      }
    }

    // reload to get fresh values
    await record.reload();

    return res.status(200).json({
      message: "Onboarding updated successfully",
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update onboarding",
      error: (error as Error).message,
    });
  }
};


// Delete
const deleteOnboarding = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const record = await Onboarding.findOne({
      where: { id, company_code: req.user.company_code },
    });

    if (!record) {
      return res.status(404).json({ message: "Onboarding not found" });
    }

    await record.destroy();

    return res.status(200).json({
      message: "Onboarding deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete onboarding",
      error: (error as Error).message,
    });
  }
};

const fileFields = [
  "passport_photo",
  "aadhar_photo",
  "pan_photo",
  "resume",
  "offer_letter",
  "joining_letter",
  "experience_letter",
] as const;

type FileField = (typeof fileFields)[number];

// function extractS3Key(url: string): string {
//   try {
//     const parsed = new URL(url);

//     // pathname example: "/ansatt-bucket-2/documents/123.png"
//     let pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");

//     // Remove bucket prefix if present
//     pathname = pathname.replace(/^ansatt-bucket-2\//, "");
//     console.log(pathname,"pathname");
    

//     return pathname; // final key: "documents/123.png"
//   } catch {
//     return url;
//   }
// }

function extractS3Key(url: string): string {
  try {
    const parsed = new URL(url);
    let pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");

    // If URL includes bucket name in path, remove it
    const bucketPrefix = "ansatt-bucket-2/";
    if (pathname.startsWith(bucketPrefix)) {
      pathname = pathname.substring(bucketPrefix.length);
    }

    return pathname;
  } catch {
    return url;
  }
}



const getAllPresignedUrls = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const record = await Onboarding.findOne({
      where: { id, company_code },
    });

    if (!record) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const now = new Date();
    const cacheTime = record.presigned_url_cache_time;
    const cacheValid =
      cacheTime &&
      now.getTime() - cacheTime.getTime() < 7 * 24 * 60 * 60 * 1000;

    // Optional: you can return cached if still valid
    // if (cacheValid && record.presigned_url_cache) {
    //   return res.status(200).json({ message: "Presigned URLs served from cache", data: record.presigned_url_cache });
    // }

    const urls: Record<FileField, string | null> = {
      passport_photo: null,
      aadhar_photo: null,
      pan_photo: null,
      resume: null,
      offer_letter: null,
      joining_letter: null,
      experience_letter: null,
    };

    for (const field of fileFields) {
      const storedValue = (record as any)[field];
      console.log(`Stored value for ${field}:`, storedValue);

      if (!storedValue) {
        urls[field] = null;
        continue;
      }

      // Try to interpret storedValue:
      // 1) If it's encrypted (your app's pattern), try decrypt()
      // 2) If decrypt fails, assume it's plain URL or key and proceed
      let possibleUrlOrKey = String(storedValue);
      let decrypted = null;
      try {
        // If decrypt function throws for plain text, catch and fallback
        decrypted = decrypt(possibleUrlOrKey);
        // If decrypt returns something falsy, fallback to original
        if (decrypted) possibleUrlOrKey = decrypted;
      } catch (err) {
        // Not encrypted or decrypt failed -> use original storedValue
        // console.debug("Decrypt failed or not encrypted for", field, err);
        possibleUrlOrKey = String(storedValue);
      }

      // Now possibleUrlOrKey may be:
      // - a full public URL (https://s3.../bucket/documents/...)
      // - an s3 key (documents/123.png or ansatt-bucket-2/documents/123.png)
      // - something else (handle defensively)

      // Extract key robustly:
      const key = extractS3Key(possibleUrlOrKey);
      if (!key) {
        console.warn(`Could not extract key for ${field} from value:`, possibleUrlOrKey);
        urls[field] = null;
        continue;
      }

      try {
        const presignedUrl = await generatePresignedGetUrl(key, 7 * 24 * 60 * 60);
        urls[field] = presignedUrl;
      } catch (err) {
        console.error(`generatePresignedGetUrl failed for ${field} (key=${key}):`, err);
        urls[field] = null;
      }
    }

    // Save cache
    record.presigned_url_cache = urls;
    record.presigned_url_cache_time = new Date();
    await record.save();

    return res.status(200).json({
      message: "New presigned URLs generated",
      data: urls,
    });
  } catch (error) {
    console.error("Presigned URL generation failed:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


// src/controllers/onboardingController.ts

// Inside your controller file

const generateOfferLetterById = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { company_code, company_name } = req.user;
    const template = req.query.template || "standard"; // ✅ fallback to "standard"

    const employee = await Onboarding.findOne({ where: { id, company_code } });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const urls = await createOfferLetter(
      employee,
      company_name,
      template as string
    );

    if (!urls.pdf) {
      return res.status(500).json({ message: "PDF generation failed" });
    }

    employee.offer_letter = urls.pdf;
    await employee.save();

    return res.status(200).json({
      message: "Offer letter generated successfully",
      data: {
        pdf: urls.pdf,
        docx: urls.docx,
        employee,
        used_template: template,
      },
    });
  } catch (err) {
    console.error("Error generating offer letter:", err);
    return res.status(500).json({
      message: "Failed to generate offer letter",
      error: (err as Error).message,
    });
  }
};

// controllers/onboardingController.ts (Add this function)

const downloadOfferLetter = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id, format } = req.params;
    const company_code = req.user.company_code;

    // ✅ Validate format
    if (!format || !["pdf", "docx"].includes(format.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid format. Must be 'pdf' or 'docx'.",
      });
    }

    const employee = await Onboarding.findOne({ where: { id, company_code } });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const encryptedUrl = employee.offer_letter;
    if (!encryptedUrl) {
      return res.status(404).json({ message: "Offer letter not found" });
    }

    const decryptedUrl = decrypt(encryptedUrl);

    // ✅ Derive correct key based on requested format
    const originalKey = extractS3Key(decryptedUrl);
    const baseKey = originalKey.replace(/\.pdf|\.docx/gi, "");
    const finalKey = `${baseKey}.${format.toLowerCase()}`;

    const presignedUrl = await generatePresignedGetUrl(finalKey, 5 * 60); // 5 mins

    return res.status(200).json({
      message: `Offer letter ${format.toUpperCase()} download link generated`,
      url: presignedUrl,
    });
  } catch (error) {
    console.error("Error generating offer letter download link:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllTemplates = async (req: Request, res: Response): Promise<any> => {
  try {
    const templateNames = Object.keys(templates);
    res.status(200).json({ templates: templateNames });
  } catch (error) {
    res.status(500).json({ message: "Error fetching templates", error });
  }
};





const bulkCreateOnboarding = async (req: Request, res: Response):Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No Excel/CSV file uploaded" });
    }

    // Read uploaded file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const company_code = (req as any).user.company_code;
    const failedRows: any[] = [];
    const successRows: any[] = [];

    for (const row of sheetData as any[]) {
      try {
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
        } = row;

        if (!name || !email) {
          failedRows.push({ row, error: "Name or email missing" });
          continue;
        }

        // Duplicate check
        const existing = await Onboarding.findOne({
          where: { email, company_code },
        });

        if (existing) {
          failedRows.push({ row, error: "Duplicate email found" });
          continue;
        }

        const auto_password = generateStrongPassword();

        const newEmp = await Onboarding.create({
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
        });

        successRows.push(newEmp);
      } catch (err: any) {
        failedRows.push({ row, error: err.message });
      }
    }

    return res.status(200).json({
      message: "Bulk import completed",
      success_count: successRows.length,
      failed_count: failedRows.length,
      successRows,
      failedRows,
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return res.status(500).json({
      message: "Failed to process bulk data",
      error: error.message,
    });
  }
};

// const employeeLogin = async (req: Request, res: Response): Promise<any> => {
//   const { email, password, company_code } = req.body;

//   try {
//     if (!email || !password || !company_code) {
//       return res
//         .status(400)
//         .json({ message: "Email, password and company_code required" });
//     }

//     const user: any = await Onboarding.findOne({
//       where: { email, company_code },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // ⛔ direct password check (same as old)
//     if (user.auto_password !== password) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     // 🔥 Load role
//     const role: any = await Role.findByPk(user.role_id);
//     if (!role) {
//       return res.status(401).json({ message: "Role not found" });
//     }

//     const roleId = role.getDataValue("id");
//     const permissions = role.getDataValue("permissions");

//     // 🔥 Generate JWT (same style as old)
//     const token = jwt.sign(
//       {
//         id: user.id,
//         company_code: user.company_code,
//         role_id: roleId,
//         permissions, // 🔥 RBAC now active
//       },
//       process.env.JWT_SECRET || "your-secret-key",
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         company_code: user.company_code,
//         role_id: roleId,
//         permissions,
//       },
//     });
//   } catch (error) {
//     console.error("loginEmployee error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };
const employeeLogin = async (req: Request, res: Response): Promise<any> => {
  const { company_code, password } = req.body;

  try {
    if (!company_code || !password) {
      return res
        .status(400)
        .json({ message: "company_code and password are required" });
    }

    // 🔥 Find employee by company + auto_password
    const user: any = await Onboarding.findOne({
      where: {
        company_code,
        auto_password: password,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔥 Load role
    const role: any = await Role.findByPk(user.role_id);
    if (!role) {
      return res.status(401).json({ message: "Role not found" });
    }

    const roleId = role.getDataValue("id");
    const permissions = role.getDataValue("permissions");

    // 🔐 Generate token
    const token = jwt.sign(
      {
        id: user.id,
        company_code,
        role_id: roleId,
        permissions, // RBAC
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        company_code: user.company_code,
        role_id: roleId,
        permissions,
      },
    });
  } catch (error) {
    console.error("loginEmployee error:", error);
    return res.status(500).json({ message: "Server error" });
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
  employeeLogin
};
