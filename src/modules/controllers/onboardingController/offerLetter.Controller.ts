import { Request, Response } from "express";
import { LetterAccessRequest, OfferLetter, Onboarding } from "../../models/index";
import { decrypt } from "../../../utils/encryption";
import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";

const createOfferLetter = async (req: Request, res: Response): Promise<any> => {
  try {
    const { employee_id, terms } = req.body;

    const newOfferLetter = await OfferLetter.create({
      employee_id,
      terms,
      status: "Pending",
    });

    res.status(201).json({
      message: "Offer letter created",
      data: newOfferLetter,
    });
  } catch (error) {
    console.error("Error creating offer letter:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const requestLetterAccess = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { letter_type } = req.body;

    // user middleware se aa raha hai
    const user: any = (req as any).user;
    const employee_id = user.id;
    const company_code = user.company_code;

    if (!letter_type) {
      return res.status(400).json({ message: "letter_type is required" });
    }

    const existing = await LetterAccessRequest.findOne({
      where: { employee_id, company_code, letter_type, status: "Pending" },
    });

    if (existing) {
      return res.status(400).json({ message: "Request already pending" });
    }

    const request = await LetterAccessRequest.create({
      employee_id,
      company_code,
      letter_type,
    });

    return res.status(201).json({
      message: "Letter access request submitted",
      data: request,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error requesting access",
      error: err.message,
    });
  }
};

const getCompanyLetterRequests = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const user: any = (req as any).user;

    // 🔐 optional: role check
    // if (!["HR", "ADMIN"].includes(user.role)) {
    //   return res.status(403).json({ message: "Unauthorized access" });
    // }

    const { status, letter_type, employee_id } = req.query;

    const whereCondition: any = {
      company_code: user.company_code,
    };

    if (status) {
      whereCondition.status = status;
    }

    if (letter_type) {
      whereCondition.letter_type = letter_type;
    }

    if (employee_id) {
      whereCondition.employee_id = employee_id;
    }

    const requests = await LetterAccessRequest.findAll({
      where: whereCondition,
      order: [["requested_at", "DESC"]],
    });

    return res.status(200).json({
      message: "Letter access requests fetched successfully",
      count: requests.length,
      data: requests,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error fetching letter access requests",
      error: err.message,
    });
  }
};
const getEmployeeLetterRequests = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const user: any = (req as any).user;

    const { status, letter_type } = req.query;

    const whereCondition: any = {
      employee_id: user.id,
      company_code: user.company_code,
    };

    if (status) {
      whereCondition.status = status;
    }

    if (letter_type) {
      whereCondition.letter_type = letter_type;
    }

    const requests = await LetterAccessRequest.findAll({
      where: whereCondition,
      order: [["requested_at", "DESC"]],
    });

    return res.status(200).json({
      message: "My letter access requests fetched successfully",
      count: requests.length,
      data: requests,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error fetching my letter requests",
      error: err.message,
    });
  }
};

const actionLetterRequest = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const user: any = (req as any).user;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await LetterAccessRequest.findOne({
      where: { id, company_code: user.company_code },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    request.remarks = remarks;
    request.actioned_at = new Date();
    request.actioned_by = user.id;

    await request.save();

    return res.status(200).json({
      message: `Request ${status}`,
      data: request,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error updating request",
      error: err.message,
    });
  }
};





const downloadLetter = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { letter_type } = req.params;
    const user: any = (req as any).user;

    // 1️⃣ check approval
    const approval = await LetterAccessRequest.findOne({
      where: {
        employee_id: user.id,
        company_code: user.company_code,
        letter_type,
        status: "Approved",
      },
    });

    if (!approval) {
      return res.status(403).json({ message: "Access not approved" });
    }

    // 2️⃣ get employee
    const employee = await Onboarding.findByPk(user.id);
    const encryptedUrl = (employee as any)?.[letter_type];

    if (!encryptedUrl) {
      return res.status(404).json({ message: "Letter not found" });
    }

    // 3️⃣ decrypt full public URL
    const fullUrl = decrypt(encryptedUrl);

    // 4️⃣ 🔑 extract ONLY KEY (this was missing)
    const bucket = process.env.WASABI_BUCKET_NAME!;
    const endpoint = process.env.WASABI_ENDPOINT!.replace(/\/+$/, "");

    // example:
    // https://endpoint/bucket/documents/offer_letters/file.pdf
    // -> documents/offer_letters/file.pdf
    const fileKey = fullUrl.replace(`${endpoint}/${bucket}/`, "");

    // 5️⃣ generate presigned url (your function is correct)
    const presignedUrl = await generatePresignedGetUrl(fileKey);

    return res.status(200).json({ url: presignedUrl });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error downloading letter",
      error: err.message,
    });
  }
};




export { createOfferLetter ,requestLetterAccess,getCompanyLetterRequests,getEmployeeLetterRequests,downloadLetter,actionLetterRequest};
