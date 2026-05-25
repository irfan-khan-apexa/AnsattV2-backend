// import { Request, Response } from "express";
// import { ExitRequest, Onboarding, Company, Asset,ExitFeedback } from "../../models/index";
// import {
//   AuthenticatedRequest,
//   CompanyRequest,
// } from "../../../middlewares/authMiddleware";
// import { createLetter } from "../../../services/generateExitLetter";
// import { encrypt, decrypt } from "../../../utils/encryption";
// import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";

// // Create Exit Request


// const createExitRequest = async (req: Request, res: Response): Promise<any> => {
//   try {
//     // Token se lena (correct mapping)
//     const { company_code, id } = (req as any).user;
//     const employee_id = id; // 👈 Token ke id ko employee_id manenge

//     const {
//       exit_type,
//       notice_start_date,
//       notice_end_date,
//       remarks,
//     } = req.body;

//     if (!exit_type || !notice_start_date || !notice_end_date) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

  
//     const employee = await Onboarding.findOne({
//       where: { id: employee_id, company_code },
//     });

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

    
//     const existingRequest = await ExitRequest.findOne({
//       where: { employee_id, company_code },
//     });

//     if (existingRequest) {
//       return res.status(400).json({
//         message: "Exit request already exists for this employee",
//       });
//     }

    
//     const newExit = await ExitRequest.create({
//       company_code,
//       employee_id,
//       exit_type,
//       notice_start_date,
//       notice_end_date,
//       remarks,
//     });

//     return res.status(201).json({ message: "Exit request created", data: newExit });
//   } catch (err) {
//     console.error("Error creating exit request:", err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };





// // Get Exit Request of logged-in Employee (using token)
// const getMyExitRequest = async (req: CompanyRequest, res: Response): Promise<any> => {
  
// try {
  
//     const employee_id = req.user.id;        
//     const company_code = req.user.company_code;

//     // console.log("employee_id",employee_id,"company_code",company_code);
    

//     if (!employee_id || !company_code) {
//       return res.status(400).json({
//         message: "Invalid token data",
//       });
//     }

//     const exitRequest = await ExitRequest.findOne({
//       where: {
//         employee_id: employee_id,
//         company_code: company_code,
//       },
//     });

//     if (!exitRequest) {
//       return res.status(200)
//       // .json({ });
//     }

//     return res.status(200).json({
//       message: "Exit request fetched successfully",
//       data: exitRequest,
//     });

//   } catch (error) {
//     console.error("Error fetching exit request:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };





// const getAllExitRequests = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const requests = await ExitRequest.findAll({
//       where: { company_code: req.user.company_code },
//       include: [
//         {
//           model: Onboarding,
//           attributes: ["name", "email", "department", "designation"],
//         },
//       ],
//     });

//     return res.status(200).json({ data: requests });
//   } catch (error) {
//     console.error("Error fetching exit requests:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Get Exit Request by ID
// const getExitRequestById = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;

//     const request = await ExitRequest.findByPk(id, {
//       include: [
//         {
//           model: Onboarding,
//           attributes: ["name", "email", "department", "designation"],
//         },
//       ],
//     });

//     if (!request) {
//       return res.status(404).json({ message: "Exit request not found" });
//     }

//     res.status(200).json({ data: request });
//   } catch (err) {
//     console.error("Error fetching exit request:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };



// const updateExitRequestStatus = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const { notice_status, overall_status, current_stage } = req.body;

//     const request = await ExitRequest.findByPk(id);
//     if (!request) {
//       return res.status(404).json({ message: "Exit request not found" });
//     }

//     // Update only the fields provided
//     if (notice_status) request.notice_status = notice_status;
//     if (overall_status) request.overall_status = overall_status;
//     if (current_stage) request.current_stage = current_stage;

//     await request.save();

//     res
//       .status(200)
//       .json({ message: "Exit request updated successfully", data: request });
//   } catch (err) {
//     console.error("Error updating exit request:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


// const generateExitLetterById = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const { company_code, company_name } = req.user;
//     let { type = "exit", exit_date } = req.query as { type?: string; exit_date?: string };

//     const normalizedType =
//       typeof type === "string" && type.toLowerCase().startsWith("experience")
//         ? "experience"
//         : "exit";

//     // Fetch employee
//     const employee = await Onboarding.findOne({ where: { id, company_code } });
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     const assignedAssets = await Asset.findAll({
//       where: { company_code, assigned_to: id, status: "assigned" },
//       attributes: ["id", "name", "serial_number", "assigned_to", "status"],
//       raw: true,
//     });

//     if (assignedAssets && assignedAssets.length > 0) {
//       return res.status(400).json({
//         message:
//           "Cannot generate exit letter: employee has unreturned assigned assets. Please return them first.",
//         assets: assignedAssets,
//       });
//     }

//     if (exit_date) {
//       employee.exit_date = new Date(exit_date);
//       await employee.save();
//     }

//     const urls = await createLetter(
//       normalizedType as "exit" | "experience",
//       employee,
//       company_name
//     );

//     if (normalizedType === "exit" && urls.pdf) {
//       (employee as any).exit_letter = urls.pdf;
//     } else if (normalizedType === "experience" && urls.pdf) {
//       (employee as any).experience_letter = urls.pdf;
//     }

//     await employee.save();

//     return res.status(200).json({
//       message: `${normalizedType} letter generated successfully`,
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



// function extractS3Key(url: string): string {
//   try {
//     const parsed = new URL(url);
//     const path = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
//     return path.replace(/^ansatt-bucket-2\//, "");
//   } catch {
//     return url;
//   }
// }


// const downloadExitLetter = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id, format, type } = req.params;
//     const company_code = req.user.company_code;

//     const letterType = type.toLowerCase();
//     const fileFormat = format.toLowerCase();

//     if (!["exit", "experience"].includes(letterType)) {
//       return res.status(400).json({ message: "Invalid letter type." });
//     }

//     if (!["pdf", "docx"].includes(fileFormat)) {
//       return res.status(400).json({ message: "Invalid format." });
//     }

//     const employee = await Onboarding.findOne({ where: { id, company_code } });
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     const encryptedKey =
//       letterType === "exit"
//         ? (employee as any).exit_letter
//         : (employee as any).experience_letter;

//     if (!encryptedKey) {
//       return res.status(404).json({ message: `${letterType} letter not found.` });
//     }

    
//     const decryptedValue = decrypt(encryptedKey);

    
//     const rawKey = extractS3Key(decryptedValue);

    
//     const baseKey = rawKey.replace(/\.(pdf|docx)$/i, "");
//     const finalKey = `${baseKey}.${fileFormat}`;

   
//     const presignedUrl = await generatePresignedGetUrl(finalKey, 300);

//     return res.status(200).json({
//       message: `${letterType} letter ${fileFormat.toUpperCase()} download link generated`,
//       url: presignedUrl,
//     });
//   } catch (error) {
//     console.error("Error generating letter download link:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };



// const createExitFeedback = async (req: CompanyRequest, res: Response): Promise<any> => {
//   try {
//     const user = (req as any).user; 
//     if (!user || !user.id || !user.company_code) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     const company_code = user.company_code;
//     const created_by = user.id;

    
//     const employee_id = Number(created_by);

//     const {
//       improvements,
//       problems,
//       positives,
//       comments,
//       rating,
//     } = req.body;

//     // Basic validation
//     if (!Array.isArray(improvements) || improvements.length === 0)
//       return res.status(400).json({ message: "improvements array required" });

//     if (!Array.isArray(problems) || problems.length === 0)
//       return res.status(400).json({ message: "problems array required" });

//     if (!Array.isArray(positives) || positives.length === 0)
//       return res.status(400).json({ message: "positives array required" });

//     // Trim to max 3 items each
//     const trimTo3 = (arr: any[]) => arr.slice(0, 3).map(String);

//     const payload = {
//       company_code,
//       employee_id,
//       improvements: trimTo3(improvements),
//       problems: trimTo3(problems),
//       positives: trimTo3(positives),
//       comments: comments ?? null,
//       rating: rating ? Number(rating) : null,
//       created_by,
//     };

//     const fb = await ExitFeedback.create(payload as any);
//     return res.status(201).json({ message: "Feedback saved", data: fb });
//   } catch (err: any) {
//     console.error("createExitFeedbackByEmployee error:", err);
//     return res.status(500).json({ message: "Error saving feedback", error: err.message });
//   }
// };

// const getFeedbacksForEmployee = async (req: CompanyRequest, res: Response): Promise<any> => {
// try {
//     const company_code = req.user.company_code;
//     // accept either /exit/feedback/:employee_id  OR /exit/feedback/:id
//     const employee_id = Number(req.params.employee_id ?? req.params.id);
//     if (!employee_id) return res.status(400).json({ message: "Invalid employee_id" });

//     const feedbacks = await ExitFeedback.findAll({
//       where: { company_code, employee_id },
//       order: [["createdAt", "DESC"]],
//       raw: true,
//     });

//     return res.status(200).json({ data: feedbacks });
//   } catch (err: any) {
//     console.error("getFeedbacksForEmployee error:", err);
//     return res.status(500).json({ message: "Error fetching feedbacks", error: err.message });
//   }
// };



// export {
//   createExitRequest,
//   getAllExitRequests,
//   getExitRequestById,
//   updateExitRequestStatus,
//   generateExitLetterById,
//   downloadExitLetter,
//   createExitFeedback,
//   getFeedbacksForEmployee,
//   getMyExitRequest
// };

import { Request, Response } from "express";
import { ExitRequest, Onboarding, Company, Asset, ExitFeedback } from "../../models/index";
import {
  AuthenticatedRequest,
  CompanyRequest,
} from "../../../middlewares/authMiddleware";
import { createLetter } from "../../../services/generateExitLetter";
import { encrypt, decrypt } from "../../../utils/encryption";
import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
import { audit } from "../../../helpers/audit.helper"; // 🔥 AUDIT
import { getSignedUrl } from "../../../services/uploadfileService";

// Create Exit Request
const createExitRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const { company_code, id } = (req as any).user;
    const employee_id = id;

    const {
      exit_type,
      notice_start_date,
      notice_end_date,
      remarks,
    } = req.body;

    if (!exit_type || !notice_start_date || !notice_end_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const employee = await Onboarding.findOne({
      where: { id: employee_id, company_code },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const existingRequest = await ExitRequest.findOne({
      where: { employee_id, company_code },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Exit request already exists for this employee",
      });
    }

    const newExit = await ExitRequest.create({
      company_code,
      employee_id,
      exit_type,
      notice_start_date,
      notice_end_date,
      remarks,
    });

    // 🔥 AUDIT
    await audit(req, {
      module: "exitRequest",
      action: "create",
      record_id: newExit.id,
      new_value: newExit,
    });

    return res.status(201).json({ message: "Exit request created", data: newExit });
  } catch (err) {
    console.error("Error creating exit request:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get My Exit Request
const getMyExitRequest = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const employee_id = req.user.id;        
    const company_code = req.user.company_code;

    if (!employee_id || !company_code) {
      return res.status(400).json({
        message: "Invalid token data",
      });
    }

    const exitRequest = await ExitRequest.findOne({
      where: {
        employee_id: employee_id,
        company_code: company_code,
      },
    });

    if (!exitRequest) {
      return res.status(200);
    }

    return res.status(200).json({
      message: "Exit request fetched successfully",
      data: exitRequest,
    });

  } catch (error) {
    console.error("Error fetching exit request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all Exit Requests
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

// Update Exit Request Status
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

    const oldData = request.toJSON(); // 🔥 AUDIT

    if (notice_status) request.notice_status = notice_status;
    if (overall_status) request.overall_status = overall_status;
    if (current_stage) request.current_stage = current_stage;

    await request.save();

    // 🔥 AUDIT
    await audit(req, {
      module: "exitRequest",
      action: "update",
      record_id: request.id,
      old_value: oldData,
      new_value: request,
    });

    res.status(200).json({ message: "Exit request updated successfully", data: request });
  } catch (err) {
    console.error("Error updating exit request:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Generate Exit Letter
const generateExitLetterById = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { company_code, company_name } = req.user;
    let { type = "exit", exit_date } = req.query as { type?: string; exit_date?: string };

    const normalizedType =
      typeof type === "string" && type.toLowerCase().startsWith("experience")
        ? "experience"
        : "exit";

    const employee = await Onboarding.findOne({ where: { id, company_code } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const assignedAssets = await Asset.findAll({
      where: { company_code, assigned_to: id, status: "assigned" },
      attributes: ["id", "name", "serial_number", "assigned_to", "status"],
      raw: true,
    });

    if (assignedAssets && assignedAssets.length > 0) {
      return res.status(400).json({
        message:
          "Cannot generate exit letter: employee has unreturned assigned assets.",
        assets: assignedAssets,
      });
    }

    if (exit_date) {
      employee.exit_date = new Date(exit_date);
      await employee.save();
    }

    const urls = await createLetter(
      normalizedType as "exit" | "experience",
      employee,
      company_name
    );

    if (normalizedType === "exit" && urls.pdf) {
      (employee as any).exit_letter = urls.pdf;
    } else if (normalizedType === "experience" && urls.pdf) {
      (employee as any).experience_letter = urls.pdf;
    }

    await employee.save();

    // 🔥 AUDIT
    await audit(req, {
      module: "exitRequest",
      action: "update",
      record_id: employee.id,
      new_value: employee,
    });

    return res.status(200).json({
      message: `${normalizedType} letter generated successfully`,
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

// Download Exit Letter (no audit - read)
const downloadExitLetter = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    console.log(
      "📥 DOWNLOAD EXIT LETTER API HIT"
    );

    const {
      id,
      type,
    } = req.params;

    const company_code =
      req.user.company_code;

    const letterType =
      type.toLowerCase();

    if (
      ![
        "exit",
        "experience",
      ].includes(letterType)
    ) {
      return res.status(400).json({
        message:
          "Invalid letter type.",
      });
    }

    // ================= FIND EMPLOYEE =================
    const employee =
      await Onboarding.findOne({
        where: {
          id,
          company_code,
        },
      });

    if (!employee) {
      return res.status(404).json({
        message:
          "Employee not found",
      });
    }

    // ================= GET ENCRYPTED FILE =================
    const encryptedFile =
      letterType === "exit"
        ? (employee as any)
            .exit_letter
        : (employee as any)
            .experience_letter;

    if (!encryptedFile) {
      return res.status(404).json({
        message: `${letterType} letter not found.`,
      });
    }

    console.log(
      "🔓 Decrypting..."
    );

    // ✅ NEW STORAGE FLOW
    const fileId =
      decrypt(
        encryptedFile
      );

    console.log(
      "✅ FILE ID:",
      fileId
    );

    // ================= GENERATE SIGNED URL =================
    const signedUrl =
      await getSignedUrl(
        fileId
      );

    console.log(
      "✅ Signed URL Generated"
    );

    // ✅ PRODUCTION FLOW
    return res.json(
      signedUrl
    );
  } catch (error: any) {
    console.error(
      "❌ DOWNLOAD EXIT LETTER ERROR"
    );

    console.error(error);

    return res.status(500).json({
      message:
        "Internal server error",

      error:
        error.message,
    });
  }
};

// Create Feedback
const createExitFeedback = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const user = (req as any).user; 
    if (!user || !user.id || !user.company_code) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const company_code = user.company_code;
    const created_by = user.id;
    const employee_id = Number(created_by);

    const {
      improvements,
      problems,
      positives,
      comments,
      rating,
    } = req.body;

    if (!Array.isArray(improvements) || improvements.length === 0)
      return res.status(400).json({ message: "improvements array required" });

    if (!Array.isArray(problems) || problems.length === 0)
      return res.status(400).json({ message: "problems array required" });

    if (!Array.isArray(positives) || positives.length === 0)
      return res.status(400).json({ message: "positives array required" });

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

    // 🔥 AUDIT
    await audit(req, {
      module: "exitRequest",
      action: "create",
      record_id: fb.id,
      new_value: fb,
    });

    return res.status(201).json({ message: "Feedback saved", data: fb });
  } catch (err: any) {
    console.error("createExitFeedbackByEmployee error:", err);
    return res.status(500).json({ message: "Error saving feedback", error: err.message });
  }
};

// Get Feedbacks (no audit)
const getFeedbacksForEmployee = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const company_code = req.user.company_code;
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
  getFeedbacksForEmployee,
  getMyExitRequest
};
