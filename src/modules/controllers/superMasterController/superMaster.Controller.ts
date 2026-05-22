// // src/modules/users/controllers/SuperMaster.Controller.ts

// import { Request, Response, NextFunction } from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// // import { SuperMaster } from "../models/SuperMaster.model";
// import { CompanySettings, Onboarding, SuperMaster } from "../../models/index";
// import { Company } from "../../models/index";
// import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
// import { PERMISSION_REGISTRY } from "../../../middlewares/checkPermission";


// const signupSuperMaster = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<any> => {
//   const { name, email, password } = req.body;

//   try {
//     const existing = await SuperMaster.findOne({ where: { email } });

//     if (existing) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // const newUser = await SuperMaster.create({
//     //   name,
//     //   email,
//     //   password: hashedPassword,
//     // });

//     const newUser = await SuperMaster.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     const plainUser = newUser.get({ plain: true });

//     return res.status(201).json({
//       message: "Super master registered successfully",
//       user: { id: plainUser.id, name: plainUser.name, email: plainUser.email },
//     });
//   } catch (err) {
//     console.error("Signup Error:", err);
//     return res.status(500).json({ message: "Server error", error: err });
//   }
//   return console.log("test api");
// };

// // import { Request, Response } from "express";
// // import bcrypt from "bcrypt";
// // import jwt from "jsonwebtoken";
// // import { SuperMaster } from "../models/SuperMaster.model";

// const loginSuperMaster = async (req: Request, res: Response): Promise<any> => {
//   const { email, password } = req.body;

//   try {
//     const user = await SuperMaster.findOne({ where: { email } });

//     if (!user) {
//       return res.status(404).json({ message: "Super master not found" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password); 

//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: "super_master" }, 
//       process.env.JWT_SECRET || "your-secret-key",
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({ token });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// const getAllCompanies = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const companies = await Company.findAll({
//       attributes: { exclude: ["password"] }, 
//     });
//     return res.status(200).json({ companies });
//   } catch (err) {
//     console.error("Error fetching companies:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// const getEmployeesByCompanyCode = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { company_code } = req.params;

//   try {
//     // Check if the company exists
//     const company = await Company.findOne({ where: { company_code } });
//     if (!company) {
//       return res.status(404).json({ message: "Company not found" });
//     }

//     const employees = await Onboarding.findAll({
//       where: { company_code },
//       attributes: { exclude: ["auto_password", "presigned_url_cache"] }, 
//     });

//     return res.status(200).json({ company: company.name, employees });
//   } catch (error) {
//     console.error("Error fetching employees:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// };



// // const upsertCompanySettings = async (
// //   req: Request,
// //   res: Response
// // ): Promise<any> => {
// //   try {
// //     const {
// //       company_code,
// //       company_name,
// //       brand_color,
// //       language,
// //       module_access,
// //     } = req.body;

// //     const file = (req as any).file;

// //     //  logo URL from Wasabi
// //     const company_logo = file?.location || null;


// //     if (!company_code || !company_name) {
// //       return res
// //         .status(400)
// //         .json({ message: "company_code and company_name are required" });
// //     }

// //     const company = await Company.findOne({ where: { company_code } });
// //     if (!company) {
// //       return res.status(404).json({ message: "Company not found" });
// //     }

// //     const [settings, created] = await CompanySettings.upsert({
// //       company_code,
// //       company_name,
// //       brand_color,
// //       language,
// //       module_access,
// //            company_logo,
// //     });

// //     return res.status(200).json({
// //       message: created ? "Settings created" : "Settings updated",
// //       data: settings,
// //     });
// //   } catch (err: any) {
// //     return res.status(500).json({
// //       message: "Error saving settings",
// //       error: err.message,
// //     });
// //   }
// // };

// // const upsertCompanySettings = async (
// //   req: Request,
// //   res: Response
// // ): Promise<any> => {
// //   try {
// //     const {
// //       company_code,
// //       company_name,
// //       brand_color,
// //       language,
// //       permissions,
// //     } = req.body;



// //     const file = (req as any).file;
// //     const company_logo = file?.location ;

// //     if (!company_code || !company_name) {
// //       return res.status(400).json({
// //         message: "company_code and company_name are required",
// //       });
// //     }

// //     const company = await Company.findOne({ where: { company_code } });
// //     if (!company) {
// //       return res.status(404).json({ message: "Company not found" });
// //     }

// //     const [settings] = await CompanySettings.upsert({
// //       company_code,
// //       company_name,
// //       brand_color,
// //       language,
// //       permissions,     // 🔥 raw, same as Role
// //       company_logo,
// //     });

// //     return res.status(200).json({
// //       message: "Company settings saved",
// //       data: settings,
// //     });
// //   } catch (err: any) {
// //     return res.status(500).json({
// //       message: "Error saving settings",
// //       error: err.message,
// //     });
// //   }
// // };
// // const upsertCompanySettings = async (
// //   req: Request,
// //   res: Response
// // ): Promise<any> => {
// //   try {
// //     const {
// //       company_code,
// //       company_name,
// //       brand_color,
// //       language,
// //       permissions,
// //     } = req.body;

// //     const file = (req as any).file;

// //     if (!company_code || !company_name) {
// //       return res.status(400).json({
// //         message: "company_code and company_name are required",
// //       });
// //     }

// //     const company = await Company.findOne({ where: { company_code } });
// //     if (!company) {
// //       return res.status(404).json({ message: "Company not found" });
// //     }

// //     // 🔥 existing settings fetch
// //     const existingSettings = await CompanySettings.findOne({
// //       where: { company_code },
// //     });

// //     // 🔥 logo only update if new file uploaded
// //     const company_logo = file?.location
// //       ? file.location
// //       : existingSettings?.company_logo;

// //     const [settings] = await CompanySettings.upsert({
// //       company_code,
// //       company_name,
// //       brand_color,
// //       language,
// //       permissions,
// //       company_logo,
// //     });

// //     return res.status(200).json({
// //       message: "Company settings saved",
// //       data: settings,
// //     });
// //   } catch (err: any) {
// //     return res.status(500).json({
// //       message: "Error saving settings",
// //       error: err.message,
// //     });
// //   }
// // };


// const upsertCompanySettings = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const {
//       company_code,
//       company_name,
//       brand_color,
//       language,
//       permissions,
//     } = req.body;

//     const file = (req as any).file;

//     if (!company_code || !company_name) {
//       return res.status(400).json({
//         message: "company_code and company_name are required",
//       });
//     }

//     const company = await Company.findOne({ where: { company_code } });
//     if (!company) {
//       return res.status(404).json({ message: "Company not found" });
//     }

//     const existingSettings = await CompanySettings.findOne({
//       where: { company_code },
//     });

//     const company_logo = file?.location
//       ? file.location
//       : existingSettings?.company_logo;

//     const parsedPermissions =
//       typeof permissions === "string"
//         ? JSON.parse(permissions)
//         : permissions;

//     const [settings] = await CompanySettings.upsert({
//       company_code,
//       company_name,
//       brand_color,
//       language,
//       permissions: parsedPermissions, 
//       company_logo,
//     });

//     return res.status(200).json({
//       message: "Company settings saved",
//       data: settings,
//     });
//   } catch (err: any) {
//     return res.status(500).json({
//       message: "Error saving settings",
//       error: err.message,
//     });
//   }
// };

// const getCompanySettings = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { company_code } = req.params;

//     const settings: any = await CompanySettings.findOne({
//       where: { company_code },
//       raw: true,
//     });

//     if (!settings) {
//       return res.status(404).json({ message: "Settings not found" });
//     }

//     if (settings.company_logo) {
//       const bucket = process.env.WASABI_BUCKET_NAME!;
//       const endpoint = process.env.WASABI_ENDPOINT!.replace(/\/+$/, "");

//       const key = settings.company_logo.replace(
//         `${endpoint}/${bucket}/`,
//         ""
//       );

//       settings.company_logo_signed_url = await generatePresignedGetUrl(key, 300);
//     } else {
//       settings.company_logo_signed_url = null;
//     }

//     return res.status(200).json({ data: settings });
//   } catch (err: any) {
//     return res.status(500).json({
//       message: "Error fetching settings",
//       error: err.message,
//     });
//   }
// };


// // const getCompanySettings = async (
// //   req: Request,
// //   res: Response
// // ): Promise<any> => {
// //   try {
// //     const { company_code } = req.params;

// //     const settings = await CompanySettings.findOne({
// //       where: { company_code },
// //     });

// //     if (!settings) {
// //       return res.status(404).json({ message: "Settings not found" });
// //     }

// //     return res.status(200).json({ data: settings });
// //   } catch (err: any) {
// //     return res.status(500).json({
// //       message: "Error fetching settings",
// //       error: err.message,
// //     });
// //   }
// // };



// // const getCompanySettings = async (
// //   req: Request,
// //   res: Response
// // ): Promise<any> => {
// //   try {
// //     const { company_code } = req.params;

// //     const settings: any = await CompanySettings.findOne({
// //       where: { company_code },
// //       raw: true,
// //     });

// //     if (!settings) {
// //       return res.status(404).json({ message: "Settings not found" });
// //     }

// //     // 🔥 logo ke liye presigned url add karo (if exists)
// //     if (settings.company_logo) {
// //       const bucket = process.env.WASABI_BUCKET_NAME!;
// //       const endpoint = process.env.WASABI_ENDPOINT!.replace(/\/+$/, "");

// //       // full url → key
// //       const key = settings.company_logo.replace(
// //         `${endpoint}/${bucket}/`,
// //         ""
// //       );

// //       settings.company_logo_signed_url = await generatePresignedGetUrl(
// //         key,
// //         300 // 5 minutes
// //       );
// //     } else {
// //       settings.company_logo_signed_url = null;
// //     }

// //     return res.status(200).json({ data: settings });
// //   } catch (err: any) {
// //     return res.status(500).json({
// //       message: "Error fetching settings",
// //       error: err.message,
// //     });
// //   }
// // };


// const deleteCompanySettings = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { company_code } = req.params;

//     const settings = await CompanySettings.findOne({
//       where: { company_code },
//     });

//     if (!settings) {
//       return res.status(404).json({ message: "Settings not found" });
//     }

//     await settings.destroy();

//     return res.status(200).json({
//       message: "Company settings deleted successfully",
//     });
//   } catch (err: any) {
//     return res.status(500).json({
//       message: "Error deleting settings",
//       error: err.message,
//     });
//   }
// };

// export {
//   signupSuperMaster,
//   loginSuperMaster,
//   getAllCompanies,
//   getEmployeesByCompanyCode,
//   upsertCompanySettings,getCompanySettings,deleteCompanySettings
// };
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CompanySettings, Onboarding, SuperMaster } from "../../models/index";
import { Company } from "../../models/index";
import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
import { PERMISSION_REGISTRY } from "../../../middlewares/checkPermission";
import { audit } from "../../../helpers/audit.helper"; // 🔥 ADDED


const signupSuperMaster = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { name, email, password } = req.body;

  try {
    const existing = await SuperMaster.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await SuperMaster.create({
      name,
      email,
      password: hashedPassword,
    });

    // 🔥 AUDIT
    await audit(req, {
      module: "super_master",
      action: "create",
      record_id: newUser.id,
      new_value: newUser.get({ plain: true }),
    });

    const plainUser = newUser.get({ plain: true });

    return res.status(201).json({
      message: "Super master registered successfully",
      user: { id: plainUser.id, name: plainUser.name, email: plainUser.email },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};


const loginSuperMaster = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await SuperMaster.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Super master not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: "super_master" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllCompanies = async (req: Request, res: Response): Promise<any> => {
  try {
    const companies = await Company.findAll({
      attributes: { exclude: ["password"] },
    });
    return res.status(200).json({ companies });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getEmployeesByCompanyCode = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { company_code } = req.params;

  try {
    const company = await Company.findOne({ where: { company_code } });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const employees = await Onboarding.findAll({
      where: { company_code },
      attributes: { exclude: ["auto_password", "presigned_url_cache"] },
    });

    return res.status(200).json({ company: company.name, employees });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};


// ================= SETTINGS =================
const upsertCompanySettings = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      company_code,
      company_name,
      brand_color,
      language,
      permissions,
    } = req.body;

    const file = (req as any).file;

    if (!company_code || !company_name) {
      return res.status(400).json({
        message: "company_code and company_name are required",
      });
    }

    const company = await Company.findOne({ where: { company_code } });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const existingSettings = await CompanySettings.findOne({
      where: { company_code },
    });

    const company_logo = file?.location
      ? file.location
      : existingSettings?.company_logo;

    const parsedPermissions =
      typeof permissions === "string"
        ? JSON.parse(permissions)
        : permissions;

    const [settings] = await CompanySettings.upsert({
      company_code,
      company_name,
      brand_color,
      language,
      permissions: parsedPermissions,
      company_logo,
    });

    // 🔥 AUDIT
    await audit(req, {
      module: "company_settings",
      action: "update",
      record_id: company_code,
      new_value: settings,
    });

    return res.status(200).json({
      message: "Company settings saved",
      data: settings,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error saving settings",
      error: err.message,
    });
  }
};


const getCompanySettings = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { company_code } = req.params;

    const settings: any = await CompanySettings.findOne({
      where: { company_code },
      raw: true,
    });

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    if (settings.company_logo) {
      const bucket = process.env.WASABI_BUCKET_NAME!;
      const endpoint = process.env.WASABI_ENDPOINT!.replace(/\/+$/, "");

      const key = settings.company_logo.replace(
        `${endpoint}/${bucket}/`,
        ""
      );

      settings.company_logo_signed_url = await generatePresignedGetUrl(key, 300);
    } else {
      settings.company_logo_signed_url = null;
    }

    return res.status(200).json({ data: settings });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error fetching settings",
      error: err.message,
    });
  }
};


const deleteCompanySettings = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { company_code } = req.params;

    const settings = await CompanySettings.findOne({
      where: { company_code },
    });

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    const oldData = settings.toJSON(); // 🔥

    await settings.destroy();

    // 🔥 AUDIT
    await audit(req, {
      module: "company_settings",
      action: "delete",
      record_id: oldData.company_code,
      old_value: oldData,
    });

    return res.status(200).json({
      message: "Company settings deleted successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error deleting settings",
      error: err.message,
    });
  }
};

export {
  signupSuperMaster,
  loginSuperMaster,
  getAllCompanies,
  getEmployeesByCompanyCode,
  upsertCompanySettings,
  getCompanySettings,
  deleteCompanySettings,
};