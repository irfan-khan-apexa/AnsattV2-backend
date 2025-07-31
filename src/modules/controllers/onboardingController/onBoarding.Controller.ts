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

const generateStrongPassword = (): string => {
  return crypto.randomBytes(10).toString("base64url"); // 10 bytes => 13-14 chars
};

const createOnboarding = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const file = req.files as any;

    const passport_photo = file?.passport_photo?.[0]?.location || null;
    const aadhar_photo = file?.aadhar_photo?.[0]?.location || null;
    const pan_photo = file?.pan_photo?.[0]?.location || null;
    const resume = file?.resume?.[0]?.location || null;
    const offer_letter = file?.offer_letter?.[0]?.location || null;
    const joining_letter = file?.joining_letter?.[0]?.location || null;
    const experience_letter = file?.experience_letter?.[0]?.location || null;

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

    return res
      .status(201)
      .json({ message: "Onboarding created", data: newEmployee });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create onboarding" });
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

// Extract the object key from a full Wasabi URL
function extractS3Key(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, ""); // remove leading slash // Wasabi URLs are like: /ansatt-bucket/documents/filename.png // So remove 'ansatt-bucket/' from path
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

    const urls: Record<FileField, string | null> = {
      passport_photo: null,
      aadhar_photo: null,
      pan_photo: null,
      resume: null,
      offer_letter: null,
      joining_letter: null,
      experience_letter: null,
    };

    console.log("DEBUG KEYS GENERATING PRESIGNED URLS FOR:");
    for (const field of fileFields) {
      const filePath = record[field];
      console.log(`Field: ${field}, FilePath: ${filePath}`); // 👈 ADD THIS

      if (typeof filePath === "string" && filePath) {
        const key = extractS3Key(filePath);
        console.log(`✅ Field: ${field}, Key: ${key}`);
        const url = await generatePresignedGetUrl(key, 120); // 2 mins
        urls[field] = url;
      } else {
        console.log(`❌ Skipping ${field}, value is not string or empty`);
      }
    }

    return res.status(200).json({
      message: "Presigned URLs generated",
      data: urls,
    });
  } catch (error) {
    console.error("Presigned URL generation failed:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export {
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
  getAllPresignedUrls,
};
