// import { Request, Response } from "express";
// import bcrypt from "bcrypt";
// import { Company } from "../../models/index";

// export const createCompany = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { name, address, contact, company_code, password } = req.body;

//   try {
//     const existing = await Company.findOne({ where: { company_code } });
//     if (existing)
//       return res.status(400).json({ message: "Company code already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newCompany = await Company.create({
//       name,
//       address,
//       contact,
//       company_code,
//       password: hashedPassword,
//     });

//     return res
//       .status(201)
//       .json({ message: "Company created successfully", company: newCompany });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// export default { createCompany };

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Company ,CompanySettings} from "../../models/index";
import {
  AuthenticatedRequest,
  CompanyRequest,
} from "../../../middlewares/authMiddleware";
import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
import { audit } from "../../../helpers/audit.helper";
import { getSignedUrl } from "../../../services/uploadfileService";
import { decrypt } from "../../../utils/encryption";





function generateCompanyCode(name: string): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${name.toLowerCase().replace(/\s+/g, "")}_${randomNum}`;
}

const createCompany = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { name, address, contact, password } = req.body;

  try {
    const company_code = generateCompanyCode(name);

    const existing = await Company.findOne({ where: { company_code } });
    if (existing)
      return res
        .status(400)
        .json({ message: "Company code already exists. Try again." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCompany = await Company.create({
      name,
      address,
      contact,
      company_code,
      password: hashedPassword,
    });
    const { password: _, ...auditData } = newCompany.get({ plain: true });

await audit(req, {
  module: "company",
  action: "create",
  record_id: newCompany.id,
  new_value: auditData,
});

    return res.status(201).json({
      message: "Company created successfully",
      company: {
        name: newCompany.name,
        company_code: newCompany.company_code,
        created_at: newCompany.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const loginCompany = async (req: Request, res: Response): Promise<any> => {
  const { company_code, password } = req.body;

  try {
    const company = await Company.findOne({ where: { company_code } });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: company.id,
        role: "company_master",
        company_name: company.name,
        company_code: company.company_code,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getCompanyDashboard = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const companyCode = req.user?.company_code;

    const company = await Company.findOne({
      where: { company_code: companyCode },
      attributes: { exclude: ["password"] },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    return res.status(200).json({ company });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// const getMyCompanySettings = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const user: any = (req as any).user;
//     const company_code = user.company_code;

//     const settings = await CompanySettings.findOne({
//       where: { company_code },
//     });

//     if (!settings) {
//       return res.status(404).json({
//         message: "Company settings not configured yet",
//       });
//     }

//     return res.status(200).json({
//       data: settings,
//     });
//   } catch (err: any) {
//     return res.status(500).json({
//       message: "Error fetching company settings",
//       error: err.message,
//     });
//   }
// };

// const getMyCompanySettings = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const user: any = (req as any).user;
//     const company_code = user.company_code;

//     const settings: any = await CompanySettings.findOne({
//       where: { company_code },
//       raw: true,
//     });

//     if (!settings) {
//       return res.status(404).json({
//         message: "Company settings not configured yet",
//       });
//     }

    
//     if (settings.company_logo) {
//       const bucket = process.env.WASABI_BUCKET_NAME!;
//       const endpoint = process.env.WASABI_ENDPOINT!.replace(/\/+$/, "");

//       // full url → key
//       const key = settings.company_logo.replace(
//         `${endpoint}/${bucket}/`,
//         ""
//       );

//       settings.company_logo_signed_url = await generatePresignedGetUrl(
//         key,
//         300 
//       );
//     } else {
//       settings.company_logo_signed_url = null;
//     }

//     return res.status(200).json({
//       data: settings,
//     });
//   } catch (err: any) {
//     return res.status(500).json({
//       message: "Error fetching company settings",
//       error: err.message,
//     });
//   }
// };

const getMyCompanySettings = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const user: any = (req as any).user;
    const company_code = user.company_code;

    const settings: any = await CompanySettings.findOne({
      where: { company_code },
      raw: true,
    });

    if (!settings) {
      return res.status(404).json({
        message: "Company settings not configured yet",
      });
    }

    if (settings.company_logo) {
      try {
        const fileId = decrypt(settings.company_logo);

        settings.company_logo_signed_url =
          await getSignedUrl(fileId);
      } catch (error) {
        console.error(
          "Failed to generate company logo URL:",
          error
        );

        settings.company_logo_signed_url = null;
      }
    } else {
      settings.company_logo_signed_url = null;
    }

    return res.status(200).json({
      data: settings,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error fetching company settings",
      error: err.message,
    });
  }
};

// company setings




export { createCompany, loginCompany, getCompanyDashboard ,getMyCompanySettings,};
