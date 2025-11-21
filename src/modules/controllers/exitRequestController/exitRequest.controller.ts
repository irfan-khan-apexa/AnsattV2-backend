import { Request, Response } from "express";
import { ExitRequest, Onboarding, Company, Asset,ExitFeedback } from "../../models/index";
import {
  AuthenticatedRequest,
  CompanyRequest,
} from "../../../middlewares/authMiddleware";
import { createLetter } from "../../../services/generateExitLetter";
import { encrypt, decrypt } from "../../../utils/encryption";
import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
// Create Exit Request
const createExitRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      company_code,
      employee_id,
      exit_type,
      notice_start_date,
      notice_end_date,
      remarks,
    } = req.body;

    // Required fields validation
    if (
      !company_code ||
      !employee_id ||
      !exit_type ||
      !notice_start_date ||
      !notice_end_date
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check employee exist karta hai ya nahi
    const employee = await Onboarding.findOne({
      where: { id: employee_id, company_code },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check agar already request exist karti hai same employee ke liye
    const existingRequest = await ExitRequest.findOne({
      where: { employee_id, company_code },
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Exit request already exists for this employee" });
    }

    // Agar request exist nahi karti to nayi request create karo
    const newExit = await ExitRequest.create({
      company_code,
      employee_id,
      exit_type,
      notice_start_date,
      notice_end_date,
      remarks,
    });

    res.status(201).json({ message: "Exit request created", data: newExit });
  } catch (err) {
    console.error("Error creating exit request:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Get all Exit Requests for a company
// const getAllExitRequests = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     let { company_code } = req.query;

//     if (!company_code || typeof company_code !== "string") {
//       return res
//         .status(400)
//         .json({ message: "company_code is required and must be a string" });
//     }

//     const requests = await ExitRequest.findAll({
//       where: { company_code },
//       include: [
//         {
//           model: Onboarding,
//           attributes: ["name", "email", "department", "designation"],
//         },
//       ],
//     });

//     res.status(200).json({ data: requests });
//   } catch (err) {
//     console.error("Error fetching exit requests:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const getAllExitRequests = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const requests = await ExitRequest.findAll({
      where: { company_code: req.user.company_code },
      include: [
        {
          model: Onboarding,
          attributes: ["name", "email", "department", "designation"],
        },
      ],
    });

    return res.status(200).json({ data: requests });
  } catch (error) {
    console.error("Error fetching exit requests:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Exit Request by ID
const getExitRequestById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const request = await ExitRequest.findByPk(id, {
      include: [
        {
          model: Onboarding,
          attributes: ["name", "email", "department", "designation"],
        },
      ],
    });

    if (!request) {
      return res.status(404).json({ message: "Exit request not found" });
    }

    res.status(200).json({ data: request });
  } catch (err) {
    console.error("Error fetching exit request:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



const updateExitRequestStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { notice_status, overall_status, current_stage } = req.body;

    const request = await ExitRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: "Exit request not found" });
    }

    // Update only the fields provided
    if (notice_status) request.notice_status = notice_status;
    if (overall_status) request.overall_status = overall_status;
    if (current_stage) request.current_stage = current_stage;

    await request.save();

    res
      .status(200)
      .json({ message: "Exit request updated successfully", data: request });
  } catch (err) {
    console.error("Error updating exit request:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// const generateExitLetterById = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const { company_code, company_name } = req.user;
//     const { type = "exit", exit_date } = req.query; // type: exit | experience

//     const employee = await Onboarding.findOne({ where: { id, company_code } });
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     if (exit_date) {
//       employee.exit_date = new Date(exit_date as string);
//       await employee.save();
//     }

//     const urls = await createLetter(
//       type as "exit" | "experience",
//       employee,
//       company_name
//     );

//     if (type === "exit" && urls.pdf) {
//       employee.exit_letter = urls.pdf;
//     } else if (type === "experience" && urls.pdf) {
//       employee.experience_letter = urls.pdf;
//     }

//     await employee.save();

//     return res.status(200).json({
//       message: `${type} letter generated successfully`,
//       data: {
//         pdf: urls.pdf,
//         docx: urls.docx,
//         employee,
//       },
//     });
//   } catch (err) {
//     console.error("Error generating letter:", err);
//     return res.status(500).json({
//       message: "Failed to generate letter",
//       error: (err as Error).message,
//     });
//   }
// };


// replace current generateExitLetterById with this
const generateExitLetterById = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { company_code, company_name } = req.user;

    // Get raw type from multiple places (query, params, body)
    const rawTypeFromQuery = (req.query.type as string) || "";
    const rawTypeFromParams = (req.params.type as string) || "";
    const rawTypeFromBody = (req.body && req.body.type) ? String(req.body.type) : "";

    const rawType = (rawTypeFromQuery || rawTypeFromParams || rawTypeFromBody || "exit").toString();

    // Normalize to canonical 'exit' or 'experience'
    const t = rawType.toLowerCase().replace(/[-_\s]/g, "");
    const type: "exit" | "experience" = t.includes("experienc") ? "experience" : "exit";

    console.log("generateExitLetterById: rawTypeFromQuery=", rawTypeFromQuery, " rawTypeFromParams=", rawTypeFromParams, " rawTypeFromBody=", rawTypeFromBody, " -> canonical type=", type);

    const exit_date = (req.query.exit_date as string) || (req.body && req.body.exit_date) || undefined;

    // Fetch employee
    const employee = await Onboarding.findOne({ where: { id, company_code } });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    if (exit_date) {
      employee.exit_date = new Date(exit_date);
      await employee.save();
    }

    // Explicitly pass canonical type to createLetter
    const urls = await createLetter(type, employee, company_name);

    // Save to correct DB column
    if (type === "exit" && urls.pdf) {
      employee.exit_letter = urls.pdf;
    } else if (type === "experience" && urls.pdf) {
      employee.experience_letter = urls.pdf;
    }

    await employee.save();

    console.log(`Saved letters for employee ${id}: exit_letter=${employee.exit_letter ? "YES" : "NO"}, experience_letter=${employee.experience_letter ? "YES" : "NO"}`);

    return res.status(200).json({
      message: `${type} letter generated successfully`,
      data: {
        pdf: urls.pdf,
        docx: urls.docx,
        employee,
      },
    });
  } catch (err) {
    console.error("Error generating letter:", err);
    return res.status(500).json({
      message: "Failed to generate letter",
      error: (err as Error).message,
    });
  }
};

// robust extractS3Key + very-verbose downloadExitLetter for debugging + production use

function extractS3Key(urlOrKey: string): string {
  try {
    if (/^https?:\/\//i.test(urlOrKey)) {
      const parsed = new URL(urlOrKey);
      let pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
      const bucket = (process.env.WASABI_BUCKET_NAME || "ansatt-bucket-2").replace(/\/+$/, "");
      if (pathname.startsWith(bucket + "/")) pathname = pathname.substring(bucket.length + 1);
      return pathname;
    }
    const bucket = (process.env.WASABI_BUCKET_NAME || "ansatt-bucket-2").replace(/\/+$/, "");
    if (urlOrKey.startsWith(bucket + "/")) return urlOrKey.substring(bucket.length + 1);
    return urlOrKey;
  } catch (err) {
    console.warn("extractS3Key fallback:", err);
    return urlOrKey;
  }
}

const downloadExitLetter = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    // params: /generate-exit-letter/:type/:id/:format
    const { id, format: rawFormat, type: rawType } = req.params as {
      id: string;
      format: string;
      type: string;
    };
    const company_code = req.user.company_code;

    // Normalize type and format
    const normalizedType = (rawType || "").toLowerCase().replace(/[-_]/g, "").includes("experienc")
      ? "experience"
      : "exit";
    const format = (rawFormat || "").toLowerCase();
    if (!["pdf", "docx"].includes(format)) {
      return res.status(400).json({ message: "Invalid format. Must be 'pdf' or 'docx'." });
    }

    // Fetch employee
    const employee = await Onboarding.findOne({ where: { id, company_code } });
    if (!employee) {
      console.log(`downloadExitLetter: Employee not found for id=${id}, company=${company_code}`);
      return res.status(404).json({ message: "Employee not found" });
    }

    // Log the two fields so we can see what is stored
    console.log(`downloadExitLetter: employee.id=${employee.id} exit_letter present=${!!(employee as any).exit_letter} experience_letter present=${!!(employee as any).experience_letter}`);

    // Choose primary field
    let primaryField = normalizedType === "exit" ? "exit_letter" : "experience_letter";
    let encryptedUrl: string | undefined = (employee as any)[primaryField];

    // If primary missing, try fallback and report
    let usedField = primaryField;
    if (!encryptedUrl) {
      const fallbackField = primaryField === "exit_letter" ? "experience_letter" : "exit_letter";
      if ((employee as any)[fallbackField]) {
        encryptedUrl = (employee as any)[fallbackField];
        usedField = fallbackField;
        console.warn(`downloadExitLetter: primary ${primaryField} empty, falling back to ${fallbackField}`);
      }
    }

    if (!encryptedUrl) {
      console.warn(`downloadExitLetter: both fields empty for employee ${id}`);
      return res.status(404).json({ message: `${normalizedType} letter not found for this employee` });
    }

    // Try to decrypt; fallback to raw if decrypt fails (so we can handle either encrypted or plain URLs)
    let decryptedUrl: string;
    try {
      decryptedUrl = decrypt(encryptedUrl);
    } catch (err) {
      console.warn("downloadExitLetter: decrypt() failed, using raw stored value", err);
      decryptedUrl = encryptedUrl;
    }

    console.log("Decrypted letter value:", decryptedUrl);

    // Extract S3 key
    const originalKey = extractS3Key(decryptedUrl);
    if (!originalKey) {
      console.error("downloadExitLetter: Could not extract S3 key from value:", decryptedUrl);
      return res.status(500).json({ message: "Could not resolve stored letter key" });
    }

    // Force extension to requested format
    const baseKey = originalKey.replace(/(\.pdf|\.docx)$/i, "");
    const finalKey = `${baseKey}.${format}`;

    console.log("Final S3 key for presign:", finalKey, " (usedField:", usedField, ")");

    // Generate presigned URL (short expiry)
    const presignedUrl = await generatePresignedGetUrl(finalKey, 5 * 60);

    return res.status(200).json({
      message: `${normalizedType} letter ${format.toUpperCase()} download link generated (usedField=${usedField})`,
      url: presignedUrl,
    });
  } catch (error) {
    console.error("Error generating letter download link:", error);
    return res.status(500).json({ message: "Internal server error", error: (error as Error).message });
  }
};



const createExitFeedback = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const user = (req as any).user; // from authenticateEmployee
    if (!user || !user.id || !user.company_code) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const company_code = user.company_code;
    const created_by = user.id;

    // Force employee_id to be the logged-in user (ignore any client-sent employee_id)
    const employee_id = Number(created_by);

    const {
      improvements,
      problems,
      positives,
      comments,
      rating,
    } = req.body;

    // Basic validation
    if (!Array.isArray(improvements) || improvements.length === 0)
      return res.status(400).json({ message: "improvements array required" });

    if (!Array.isArray(problems) || problems.length === 0)
      return res.status(400).json({ message: "problems array required" });

    if (!Array.isArray(positives) || positives.length === 0)
      return res.status(400).json({ message: "positives array required" });

    // Trim to max 3 items each
    const trimTo3 = (arr: any[]) => arr.slice(0, 3).map(String);

    const payload = {
      company_code,
      employee_id,
      improvements: trimTo3(improvements),
      problems: trimTo3(problems),
      positives: trimTo3(positives),
      comments: comments ?? null,
      rating: rating ? Number(rating) : null,
      created_by,
    };

    const fb = await ExitFeedback.create(payload as any);
    return res.status(201).json({ message: "Feedback saved", data: fb });
  } catch (err: any) {
    console.error("createExitFeedbackByEmployee error:", err);
    return res.status(500).json({ message: "Error saving feedback", error: err.message });
  }
};

const getFeedbacksForEmployee = async (req: CompanyRequest, res: Response): Promise<any> => {
try {
    const company_code = req.user.company_code;
    // accept either /exit/feedback/:employee_id  OR /exit/feedback/:id
    const employee_id = Number(req.params.employee_id ?? req.params.id);
    if (!employee_id) return res.status(400).json({ message: "Invalid employee_id" });

    const feedbacks = await ExitFeedback.findAll({
      where: { company_code, employee_id },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    return res.status(200).json({ data: feedbacks });
  } catch (err: any) {
    console.error("getFeedbacksForEmployee error:", err);
    return res.status(500).json({ message: "Error fetching feedbacks", error: err.message });
  }
};



export {
  createExitRequest,
  getAllExitRequests,
  getExitRequestById,
  updateExitRequestStatus,
  generateExitLetterById,
  downloadExitLetter,
  createExitFeedback,
  getFeedbacksForEmployee
};
