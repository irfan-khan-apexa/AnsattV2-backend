import { Request, Response } from "express";
import { ExitRequest, Onboarding, Company } from "../../models/index";
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

const generateExitLetterById = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { company_code, company_name } = req.user;
    const { type = "exit", exit_date } = req.query; // type: exit | experience

    const employee = await Onboarding.findOne({ where: { id, company_code } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (exit_date) {
      employee.exit_date = new Date(exit_date as string);
      await employee.save();
    }

    const urls = await createLetter(
      type as "exit" | "experience",
      employee,
      company_name
    );

    if (type === "exit" && urls.pdf) {
      employee.exit_letter = urls.pdf;
    } else if (type === "experience" && urls.pdf) {
      employee.experience_letter = urls.pdf;
    }

    await employee.save();

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

function extractS3Key(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
    return pathname.replace(/^ansatt-bucket\//, "");
  } catch {
    return url;
  }
}
const downloadExitLetter = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id, format, type } = req.params;
    const company_code = req.user.company_code;

    // ✅ Validate type
    if (!type || !["exit", "experience"].includes(type.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid letter type. Must be 'exit' or 'experience'.",
      });
    }

    // ✅ Validate format
    if (!format || !["pdf", "docx"].includes(format.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid format. Must be 'pdf' or 'docx'.",
      });
    }

    // ✅ Fetch employee record
    const employee = await Onboarding.findOne({ where: { id, company_code } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // ✅ Pick letter field based on type
    let encryptedUrl: string | undefined;
    if (type.toLowerCase() === "exit") {
      encryptedUrl = employee.exit_letter;
    } else {
      encryptedUrl = employee.experience_letter;
    }

    if (!encryptedUrl) {
      return res.status(404).json({
        message: `${type} letter not found for this employee`,
      });
    }

    // ✅ Decrypt letter URL
    const decryptedUrl = decrypt(encryptedUrl);

    // ✅ Extract S3 key & replace extension based on requested format
    const originalKey = extractS3Key(decryptedUrl);
    const baseKey = originalKey.replace(/\.pdf|\.docx/gi, "");
    const finalKey = `${baseKey}.${format.toLowerCase()}`;

    // ✅ Generate presigned URL for download (valid for 5 mins)
    const presignedUrl = await generatePresignedGetUrl(finalKey, 5 * 60);

    return res.status(200).json({
      message: `${type} letter ${format.toUpperCase()} download link generated`,
      url: presignedUrl,
    });
  } catch (error) {
    console.error("Error generating letter download link:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createExitRequest,
  getAllExitRequests,
  getExitRequestById,
  updateExitRequestStatus,
  generateExitLetterById,
  downloadExitLetter,
};
