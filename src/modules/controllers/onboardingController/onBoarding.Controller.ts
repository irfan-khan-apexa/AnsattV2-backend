import { Request, Response } from "express";
import { Onboarding } from "../../models/index";
import crypto from "crypto";
import {
  AuthenticatedRequest,
  CompanyRequest,
} from "../../../middlewares/authMiddleware";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RoleModuleAccess } from "../../../config/roleModuleAccess";

// Create Onboarding
// const createOnboarding = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
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
//     } = req.body;

//     const company_code = req.user.company_code;

//     if (
//       !name ||
//       !email ||
//       !role ||
//       !designation ||
//       !department ||
//       !reporting_manager ||
//       !joining_date ||
//       !probation_period
//     ) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const plainPassword = `${name.toLowerCase().split(" ")[0]}@123`; // e.g., rahul@123
//     const hashedPassword = await bcrypt.hash(plainPassword, 10);

//     const onboarding = await Onboarding.create({
//       name,
//       email,
//       contact,
//       role,
//       password: hashedPassword,
//       company_code,
//       designation,
//       department,
//       reporting_manager,
//       joining_date,
//       probation_period,
//       status: "pending",
//     });

//     return res.status(201).json({
//       message: "Onboarding created successfully",
//       generated_password: plainPassword,
//       onboarding,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error creating onboarding" });
//   }
// };

// // Get All Onboardings
// const getAllOnboardings = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const company_code = req.user.company_code;

//     const onboardings = await Onboarding.findAll({
//       where: { company_code },
//     });

//     return res.status(200).json({
//       message: "All onboardings fetched",
//       data: onboardings,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching onboardings" });
//   }
// };

// // Get Onboarding by ID
// const getOnboardingById = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const company_code = req.user.company_code;

//     const onboarding = await Onboarding.findOne({
//       where: { id, company_code },
//     });

//     if (!onboarding) {
//       return res.status(404).json({ message: "Onboarding not found" });
//     }

//     return res.status(200).json({
//       message: "Onboarding found",
//       data: onboarding,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching onboarding" });
//   }
// };

// // Update Onboarding
// const updateOnboarding = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       email,
//       contact,
//       role,
//       designation,
//       department,
//       reporting_manager,
//       status,
//       joining_date,
//       probation_period,
//     } = req.body;

//     const company_code = req.user.company_code;

//     const onboarding = await Onboarding.findOne({
//       where: { id, company_code },
//     });

//     if (!onboarding) {
//       return res.status(404).json({ message: "Onboarding not found" });
//     }

//     await onboarding.update({
//       name,
//       email,
//       contact,
//       role,
//       designation,
//       department,
//       reporting_manager,
//       status,
//       joining_date,
//       probation_period,
//     });

//     return res.status(200).json({
//       message: "Onboarding updated successfully",
//       data: onboarding,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error updating onboarding" });
//   }
// };

// // Delete Onboarding
// const deleteOnboarding = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const company_code = req.user.company_code;

//     const onboarding = await Onboarding.findOne({
//       where: { id, company_code },
//     });

//     if (!onboarding) {
//       return res.status(404).json({ message: "Onboarding not found" });
//     }

//     await onboarding.update({ deleted_at: new Date() });

//     return res.status(200).json({ message: "Onboarding deleted (soft)" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error deleting onboarding" });
//   }
// };

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

export {
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
};
