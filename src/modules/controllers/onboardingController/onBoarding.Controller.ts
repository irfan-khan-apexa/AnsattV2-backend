import { Request, Response } from "express";
import { Onboarding } from "../../models/index";
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

const generateStrongPassword = (): string => {
  return crypto.randomBytes(10).toString("base64url"); // 10 bytes => 13-14 chars
};

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
      role,
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

    // ✅ Generate strong password
    const auto_password = generateStrongPassword();

    const newEmployee = await Onboarding.create({
      name,
      email,
      contact,
      role,
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

// Get All
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

    const record = await Onboarding.findOne({
      where: { id, company_code: req.user.company_code },
    });

    if (!record) {
      return res.status(404).json({ message: "Onboarding record not found" });
    }

    await record.update(req.body);

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

function extractS3Key(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
    return pathname.replace(/^ansatt-bucket\//, "");
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

    if (cacheValid && record.presigned_url_cache) {
      return res.status(200).json({
        message: "Presigned URLs served from cache",
        data: record.presigned_url_cache,
      });
    }

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
      const encryptedValue = record[field];

      if (typeof encryptedValue === "string" && encryptedValue) {
        try {
          const decryptedUrl = decrypt(encryptedValue);
          const key = extractS3Key(decryptedUrl);
          const presignedUrl = await generatePresignedGetUrl(
            key,
            7 * 24 * 60 * 60 // 7 days
          );
          urls[field] = presignedUrl;
        } catch (err) {
          console.error(`Error in ${field}:`, err);
          urls[field] = null;
        }
      }
    }

    // Save new cache
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

const generateOfferLetterById = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { company_code, company_name } = req.user; // ✅ extract from token

    const employee = await Onboarding.findOne({ where: { id, company_code } });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const urls = await createOfferLetter(employee, company_name); // ✅ pass name here

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

export {
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
  getAllPresignedUrls,
  generateOfferLetterById,
  downloadOfferLetter,
};
