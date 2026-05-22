// import { Request, Response } from "express";
// import { Onboarding, Role } from "../../models/index";
// import crypto from "crypto";
// import {
//   AuthenticatedRequest,
//   CompanyRequest,
// } from "../../../middlewares/authMiddleware";
// import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { RoleModuleAccess } from "../../../config/roleModuleAccess";
// import { encrypt, decrypt } from "../../../utils/encryption";
// import { createOfferLetter } from "../../../services/generateOfferLetter";

// import templates from "../../../../templates/index";
// import { log } from "console";
// import { OnboardingAttributes } from "../../models/onboardingModel/Onboarding.Model";
// import XLSX from "xlsx";

// const generateStrongPassword = (): string => {
//   return crypto.randomBytes(10).toString("base64url"); // 10 bytes => 13-14 chars
// };

// // const createOnboarding = async (
// //   req: CompanyRequest,
// //   res: Response
// // ): Promise<any> => {
// //   try {
// //     const file = req.files as any;

// //     const passport_photo = file?.passport_photo?.[0]?.location
// //       ? encrypt(file.passport_photo[0].location)
// //       : undefined;

// //     const aadhar_photo = file?.aadhar_photo?.[0]?.location
// //       ? encrypt(file.aadhar_photo[0].location)
// //       : undefined;

// //     const pan_photo = file?.pan_photo?.[0]?.location
// //       ? encrypt(file.pan_photo[0].location)
// //       : undefined;

// //     const resume = file?.resume?.[0]?.location
// //       ? encrypt(file.resume[0].location)
// //       : undefined;

// //     const offer_letter = file?.offer_letter?.[0]?.location
// //       ? encrypt(file.offer_letter[0].location)
// //       : undefined;

// //     const joining_letter = file?.joining_letter?.[0]?.location
// //       ? encrypt(file.joining_letter[0].location)
// //       : undefined;

// //     const experience_letter = file?.experience_letter?.[0]?.location
// //       ? encrypt(file.experience_letter[0].location)
// //       : undefined;

// //     const {
// //       name,
// //       email,
// //       contact,
// //       role,
// //       designation,
// //       department,
// //       reporting_manager,
// //       joining_date,
// //       probation_period,
// //       pan_card,
// //       aadhar_card,
// //     } = req.body;

// //     const company_code = req.user.company_code;

// //     // ✅ Check for duplicate email
// //     const existingEmployee = await Onboarding.findOne({
// //       where: { email, company_code },
// //     });

// //     if (existingEmployee) {
// //       return res
// //         .status(400)
// //         .json({ message: "Employee with this email already exists" });
// //     }

// //     // ✅ Generate strong password
// //     const auto_password = generateStrongPassword();

// //     const newEmployee = await Onboarding.create({
// //       name,
// //       email,
// //       contact,
// //       role,
// //       designation,
// //       department,
// //       reporting_manager,
// //       joining_date,
// //       probation_period,
// //       company_code,
// //       auto_password,
// //       pan_card,
// //       aadhar_card,
// //       passport_photo,
// //       aadhar_photo,
// //       pan_photo,
// //       resume,
// //       offer_letter,
// //       joining_letter,
// //       experience_letter,
// //     });
// //     console.log("📦 req.body:", req.body);
// //     console.log("📅 joining_date:", req.body.joining_date);

// //     return res
// //       .status(201)
// //       .json({ message: "Onboarding created", data: newEmployee });
// //   } catch (error: any) {
// //     console.error("🔥 Error in createOnboarding:", error);
// //     return res
// //       .status(500)
// //       .json({ message: "Failed to create onboarding", error: error.message });
// //   }
// // };

// // Get All


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
//       role_id,
//       designation,
//       department,
//       reporting_manager,
//       joining_date,
//       probation_period,
//       pan_card,
//       aadhar_card,
//     } = req.body;

//     const company_code = req.user.company_code;

//     const existingEmployee = await Onboarding.findOne({
//       where: { email, company_code },
//     });

//     if (existingEmployee) {
//       return res
//         .status(400)
//         .json({ message: "Employee with this email already exists" });
//     }
//    const role = await Role.findOne({
//       where: { id: role_id, company_code },
//     });

//     if (!role) {
//       return res.status(400).json({ message: "Invalid role" });
//     }
//     const auto_password = generateStrongPassword();

//     const newEmployee = await Onboarding.create({
//       name,
//       email,
//       contact,
//       role_id,
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

// const getAllOnboardings = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const onboardings = await Onboarding.findAll({
//       where: { company_code: req.user.company_code },
//     });
//     return res.status(200).json({ data: onboardings });
//   } catch (error) {
//     return res.status(500).json({ message: "Error fetching onboardings" });
//   }
// };


// const getOnboardingById = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const record = await Onboarding.findOne({
//       where: { id, company_code: req.user.company_code },
//     });

//     if (!record)
//       return res.status(404).json({ message: "Onboarding not found" });

//     return res.status(200).json({ data: record });
//   } catch (error) {
//     return res.status(500).json({ message: "Error fetching onboarding" });
//   }
// };


// // const updateOnboarding = async (
// //   req: CompanyRequest,
// //   res: Response
// // ): Promise<any> => {
// //   try {
// //     const { id } = req.params;

// //     console.log("FILES:", req.files);
// //     console.log("BODY:", req.body);

// //     const record = await Onboarding.findOne({
// //       where: { id, company_code: req.user.company_code },
// //     });

// //     if (!record) {
// //       return res.status(404).json({ message: "Onboarding record not found" });
// //     }

// //     // 1) Update any normal fields coming in req.body
// //     // Use safe cast because req.body values may be strings for dates/nums
// //     await record.update(req.body || {});

// //     // 2) If files uploaded (multer-s3), save their S3 locations/keys to the record
// //     const files = req.files as Record<string, Express.Multer.File[]> | undefined;
// //     if (files && Object.keys(files).length > 0) {
// //       const updates: Partial<OnboardingAttributes> = {};

// //       // list all file-fields your route accepts and map them
// //       const fileFields = [
// //         "pan_photo",
// //         "aadhar_photo",
// //         "passport_photo",
// //         "resume",
// //         "offer_letter",
// //         "joining_letter",
// //         "experience_letter",
// //       ];

// //       fileFields.forEach((field) => {
// //         const fArr = (files as any)[field] as Express.Multer.File[] | undefined;
// //         if (fArr && fArr.length > 0) {
// //           // multer-s3 provides .location (full URL). fallback to .key if needed.
// //           const fileObj: any = fArr[0];
// //           updates[field as keyof OnboardingAttributes] = fileObj.location || fileObj.key || null;
// //         }
// //       });

// //       if (Object.keys(updates).length > 0) {
// //         await record.update(updates);
// //       }
// //     }

// //     // reload to get fresh values
// //     await record.reload();

// //     return res.status(200).json({
// //       message: "Onboarding updated successfully",
// //       data: record,
// //     });
// //   } catch (error) {
// //     return res.status(500).json({
// //       message: "Failed to update onboarding",
// //       error: (error as Error).message,
// //     });
// //   }
// // };
// const updateOnboarding = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const company_code = req.user.company_code;

//     console.log("FILES:", req.files);
//     console.log("BODY:", req.body);

//     // 🔍 Existing record
//     const record = await Onboarding.findOne({
//       where: { id, company_code },
//     });

//     if (!record) {
//       return res.status(404).json({ message: "Onboarding record not found" });
//     }

//     const {
//       role_id, // 👈 may come in update
//       ...restBody
//     } = req.body;

//     // 🔥 SAME AS CREATE: validate role_id if provided
//     if (role_id) {
//       const role = await Role.findOne({
//         where: { id: role_id, company_code },
//       });

//       if (!role) {
//         return res.status(400).json({ message: "Invalid role" });
//       }
//     }

//     // 🔄 Update normal fields (including role_id if valid)
//     await record.update({
//       ...restBody,
//       ...(role_id ? { role_id } : {}),
//     });

//     // 📂 Handle file uploads (same logic, unchanged)
//     const files = req.files as Record<string, Express.Multer.File[]> | undefined;

//     if (files && Object.keys(files).length > 0) {
//       const updates: Partial<OnboardingAttributes> = {};

//       const fileFields = [
//         "pan_photo",
//         "aadhar_photo",
//         "passport_photo",
//         "resume",
//         "offer_letter",
//         "joining_letter",
//         "experience_letter",
//         "exit_letter",
//       ];

//       fileFields.forEach((field) => {
//         const fArr = files[field];
//         if (fArr && fArr.length > 0) {
//           const fileObj: any = fArr[0];
//           updates[field as keyof OnboardingAttributes] =
//             fileObj.location || fileObj.key || null;
//         }
//       });

//       if (Object.keys(updates).length > 0) {
//         await record.update(updates);
//       }
//     }

//     await record.reload();

//     return res.status(200).json({
//       message: "Onboarding updated successfully",
//       data: record,
//     });
//   } catch (error: any) {
//     console.error("🔥 Error in updateOnboarding:", error);
//     return res.status(500).json({
//       message: "Failed to update onboarding",
//       error: error.message,
//     });
//   }
// };



// const deleteOnboarding = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const record = await Onboarding.findOne({
//       where: { id, company_code: req.user.company_code },
//     });

//     if (!record) {
//       return res.status(404).json({ message: "Onboarding not found" });
//     }

//     await record.destroy();

//     return res.status(200).json({
//       message: "Onboarding deleted successfully",
//       deletedId: id,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Failed to delete onboarding",
//       error: (error as Error).message,
//     });
//   }
// };

// const fileFields = [
//   "passport_photo",
//   "aadhar_photo",
//   "pan_photo",
//   "resume",
//   "offer_letter",
//   "joining_letter",
//   "experience_letter",
// ] as const;

// type FileField = (typeof fileFields)[number];

// // function extractS3Key(url: string): string {
// //   try {
// //     const parsed = new URL(url);

// //     // pathname example: "/ansatt-bucket-2/documents/123.png"
// //     let pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");

// //     // Remove bucket prefix if present
// //     pathname = pathname.replace(/^ansatt-bucket-2\//, "");
// //     console.log(pathname,"pathname");
    

// //     return pathname; // final key: "documents/123.png"
// //   } catch {
// //     return url;
// //   }
// // }

// function extractS3Key(url: string): string {
//   try {
//     const parsed = new URL(url);
//     let pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");

//     // If URL includes bucket name in path, remove it
//     const bucketPrefix = "ansatt-bucket-2/";
//     if (pathname.startsWith(bucketPrefix)) {
//       pathname = pathname.substring(bucketPrefix.length);
//     }

//     return pathname;
//   } catch {
//     return url;
//   }
// }



// const getAllPresignedUrls = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const company_code = req.user.company_code;

//     const record = await Onboarding.findOne({
//       where: { id, company_code },
//     });

//     if (!record) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     const now = new Date();
//     const cacheTime = record.presigned_url_cache_time;
//     const cacheValid =
//       cacheTime &&
//       now.getTime() - cacheTime.getTime() < 7 * 24 * 60 * 60 * 1000;

   
//     // if (cacheValid && record.presigned_url_cache) {
//     //   return res.status(200).json({ message: "Presigned URLs served from cache", data: record.presigned_url_cache });
//     // }

//     const urls: Record<FileField, string | null> = {
//       passport_photo: null,
//       aadhar_photo: null,
//       pan_photo: null,
//       resume: null,
//       offer_letter: null,
//       joining_letter: null,
//       experience_letter: null,
//     };

//     for (const field of fileFields) {
//       const storedValue = (record as any)[field];
//       console.log(`Stored value for ${field}:`, storedValue);

//       if (!storedValue) {
//         urls[field] = null;
//         continue;
//       }

     
//       // 1) If it's encrypted (your app's pattern), try decrypt()
//       // 2) If decrypt fails, assume it's plain URL or key and proceed
//       let possibleUrlOrKey = String(storedValue);
//       let decrypted = null;
//       try {
//         // If decrypt function throws for plain text, catch and fallback
//         decrypted = decrypt(possibleUrlOrKey);
//         // If decrypt returns something falsy, fallback to original
//         if (decrypted) possibleUrlOrKey = decrypted;
//       } catch (err) {
//         // Not encrypted or decrypt failed -> use original storedValue
//         // console.debug("Decrypt failed or not encrypted for", field, err);
//         possibleUrlOrKey = String(storedValue);
//       }

    


//       const key = extractS3Key(possibleUrlOrKey);
//       if (!key) {
//         console.warn(`Could not extract key for ${field} from value:`, possibleUrlOrKey);
//         urls[field] = null;
//         continue;
//       }

//       try {
//         const presignedUrl = await generatePresignedGetUrl(key, 7 * 24 * 60 * 60);
//         urls[field] = presignedUrl;
//       } catch (err) {
//         console.error(`generatePresignedGetUrl failed for ${field} (key=${key}):`, err);
//         urls[field] = null;
//       }
//     }

//     // Save cache
//     record.presigned_url_cache = urls;
//     record.presigned_url_cache_time = new Date();
//     await record.save();

//     return res.status(200).json({
//       message: "New presigned URLs generated",
//       data: urls,
//     });
//   } catch (error) {
//     console.error("Presigned URL generation failed:", error);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };




// const generateOfferLetterById = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const { company_code, company_name } = req.user;
//     const template = req.query.template || "standard"; 

//     const employee = await Onboarding.findOne({ where: { id, company_code } });

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     const urls = await createOfferLetter(
//       employee,
//       company_name,
//       template as string
//     );

//     if (!urls.pdf) {
//       return res.status(500).json({ message: "PDF generation failed" });
//     }

//     employee.offer_letter = urls.pdf;
//     await employee.save();

//     return res.status(200).json({
//       message: "Offer letter generated successfully",
//       data: {
//         pdf: urls.pdf,
//         docx: urls.docx,
//         employee,
//         used_template: template,
//       },
//     });
//   } catch (err) {
//     console.error("Error generating offer letter:", err);
//     return res.status(500).json({
//       message: "Failed to generate offer letter",
//       error: (err as Error).message,
//     });
//   }
// };



// const downloadOfferLetter = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id, format } = req.params;
//     const company_code = req.user.company_code;


//     if (!format || !["pdf", "docx"].includes(format.toLowerCase())) {
//       return res.status(400).json({
//         message: "Invalid format. Must be 'pdf' or 'docx'.",
//       });
//     }

//     const employee = await Onboarding.findOne({ where: { id, company_code } });

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     const encryptedUrl = employee.offer_letter;
//     if (!encryptedUrl) {
//       return res.status(404).json({ message: "Offer letter not found" });
//     }

//     const decryptedUrl = decrypt(encryptedUrl);


//     const originalKey = extractS3Key(decryptedUrl);
//     const baseKey = originalKey.replace(/\.pdf|\.docx/gi, "");
//     const finalKey = `${baseKey}.${format.toLowerCase()}`;

//     const presignedUrl = await generatePresignedGetUrl(finalKey, 5 * 60); // 5 mins

//     return res.status(200).json({
//       message: `Offer letter ${format.toUpperCase()} download link generated`,
//       url: presignedUrl,
//     });
//   } catch (error) {
//     console.error("Error generating offer letter download link:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// const getAllTemplates = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const templateNames = Object.keys(templates);
//     res.status(200).json({ templates: templateNames });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching templates", error });
//   }
// };





// const bulkCreateOnboarding = async (req: Request, res: Response):Promise<any> => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No Excel/CSV file uploaded" });
//     }

   
//     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     const company_code = (req as any).user.company_code;
//     const failedRows: any[] = [];
//     const successRows: any[] = [];

//     for (const row of sheetData as any[]) {
//       try {
//         const {
//           name,
//           email,
//           contact,
//           role_id,
//           designation,
//           department,
//           reporting_manager,
//           joining_date,
//           probation_period,
//           pan_card,
//           aadhar_card,
//         } = row;

//         if (!name || !email) {
//           failedRows.push({ row, error: "Name or email missing" });
//           continue;
//         }

//         const existing = await Onboarding.findOne({
//           where: { email, company_code },
//         });

//         if (existing) {
//           failedRows.push({ row, error: "Duplicate email found" });
//           continue;
//         }

//         const auto_password = generateStrongPassword();

//         const newEmp = await Onboarding.create({
//           name,
//           email,
//           contact,
//           role_id,
//           designation,
//           department,
//           reporting_manager,
//           joining_date,
//           probation_period,
//           company_code,
//           auto_password,
//           pan_card,
//           aadhar_card,
//         });

//         successRows.push(newEmp);
//       } catch (err: any) {
//         failedRows.push({ row, error: err.message });
//       }
//     }

//     return res.status(200).json({
//       message: "Bulk import completed",
//       success_count: successRows.length,
//       failed_count: failedRows.length,
//       successRows,
//       failedRows,
//     });
//   } catch (error: any) {
//     console.error("Bulk import error:", error);
//     return res.status(500).json({
//       message: "Failed to process bulk data",
//       error: error.message,
//     });
//   }
// };

// // const employeeLogin = async (req: Request, res: Response): Promise<any> => {
// //   const { email, password, company_code } = req.body;

// //   try {
// //     if (!email || !password || !company_code) {
// //       return res
// //         .status(400)
// //         .json({ message: "Email, password and company_code required" });
// //     }

// //     const user: any = await Onboarding.findOne({
// //       where: { email, company_code },
// //     });

// //     if (!user) {
// //       return res.status(404).json({ message: "Employee not found" });
// //     }

// //     // ⛔ direct password check (same as old)
// //     if (user.auto_password !== password) {
// //       return res.status(401).json({ message: "Invalid password" });
// //     }

// //     // 🔥 Load role
// //     const role: any = await Role.findByPk(user.role_id);
// //     if (!role) {
// //       return res.status(401).json({ message: "Role not found" });
// //     }

// //     const roleId = role.getDataValue("id");
// //     const permissions = role.getDataValue("permissions");

// //     // 🔥 Generate JWT (same style as old)
// //     const token = jwt.sign(
// //       {
// //         id: user.id,
// //         company_code: user.company_code,
// //         role_id: roleId,
// //         permissions, // 🔥 RBAC now active
// //       },
// //       process.env.JWT_SECRET || "your-secret-key",
// //       { expiresIn: "1d" }
// //     );

// //     return res.status(200).json({
// //       token,
// //       user: {
// //         id: user.id,
// //         name: user.name,
// //         email: user.email,
// //         company_code: user.company_code,
// //         role_id: roleId,
// //         permissions,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("loginEmployee error:", error);
// //     return res.status(500).json({ message: "Server error" });
// //   }
// // };
// // const employeeLogin = async (req: Request, res: Response): Promise<any> => {
// //   const { company_code, password } = req.body;

// //   try {
// //     if (!company_code || !password) {
// //       return res
// //         .status(400)
// //         .json({ message: "company_code and password are required" });
// //     }

// //     // 🔥 Find employee by company + auto_password
// //     const user: any = await Onboarding.findOne({
// //       where: {
// //         company_code,
// //         auto_password: password,
// //       },
// //     });

// //     if (!user) {
// //       return res.status(401).json({ message: "Invalid credentials" });
// //     }

// //     // 🔥 Load role
// //     const role: any = await Role.findByPk(user.role_id);
// //     if (!role) {
// //       return res.status(401).json({ message: "Role not found" });
// //     }

// //     const roleId = role.getDataValue("id");
// //     const permissions = role.getDataValue("permissions");

// //     // 🔐 Generate token
// //     const token = jwt.sign(
// //       {
// //         id: user.id,
// //         company_code,
// //         role_id: roleId,
// //         permissions, // RBAC
// //       },
// //       process.env.JWT_SECRET || "your-secret-key",
// //       { expiresIn: "1d" }
// //     );

// //     return res.status(200).json({
// //       token,
// //       user: {
// //         id: user.id,
// //         name: user.name,
// //         company_code: user.company_code,
// //         role_id: roleId,
// //         permissions,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("loginEmployee error:", error);
// //     return res.status(500).json({ message: "Server error" });
// //   }
// // };



// const employeeLogin = async (req: Request, res: Response): Promise<any> => {
//   const { email, password } = req.body;

//   try {
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "email and password are required" });
//     }

//     // 🔥 1. Find employee by email + password
//     const user: any = await Onboarding.findOne({
//       where: {
//         email,
//         auto_password: password, // (same logic as your current system)
//       },
//     });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // 🔥 2. Load role using role_id from onboarding
//     const role: any = await Role.findOne({
//       where: {
//         id: user.role_id,
//         company_code: user.company_code, // 🔐 ensure same company
//       },
//       raw: true,
//     });

//     if (!role) {
//       return res.status(401).json({ message: "Role not found" });
//     }

//     // 🔥 3. Parse role permissions (important)
//     const permissions =
//       typeof role.permissions === "string"
//         ? JSON.parse(role.permissions)
//         : role.permissions;

//     // 🔐 4. Generate JWT
//     const token = jwt.sign(
//       {
//         id: user.id,
//         company_code: user.company_code,
//         role_id: role.id,
//         permissions, // ✅ role-based permissions
//       },
//       process.env.JWT_SECRET || "your-secret-key",
//       { expiresIn: "1d" }
//     );

//     // ✅ 5. Final response
//     return res.status(200).json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         company_code: user.company_code,
//         role_id: role.id,
//         permissions,
//       },
//     });
//   } catch (error) {
//     console.error("loginEmployee error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };


// export {
//   createOnboarding,
//   getAllOnboardings,
//   getOnboardingById,
//   updateOnboarding,
//   deleteOnboarding,
//   getAllPresignedUrls,
//   generateOfferLetterById,
//   downloadOfferLetter,
//   getAllTemplates,
//   bulkCreateOnboarding,
//   employeeLogin
// };

//////////////////////////////////////////////////////////////////////////////////////////////


// import { Request, Response } from "express";
// import { Onboarding, Role } from "../../models/index";
// import crypto from "crypto";
// import { CompanyRequest } from "../../../middlewares/authMiddleware";
// import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
// import jwt from "jsonwebtoken";
// import { encrypt, decrypt } from "../../../utils/encryption";
// import { createOfferLetter } from "../../../services/generateOfferLetter";
// import templates from "../../../../templates/index";
// import { OnboardingAttributes } from "../../models/onboardingModel/Onboarding.Model";
// import XLSX from "xlsx";
// import { audit } from "../../../helpers/audit.helper"; // ✅ ADDED

// // ================= PASSWORD =================
// const generateStrongPassword = (): string => {
//   return crypto.randomBytes(10).toString("base64url");
// };

// // ================= CREATE =================
// const createOnboarding = async (req: CompanyRequest, res: Response): Promise<any> => {
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
//       name, email, contact, role_id, designation, department,
//       reporting_manager, joining_date, probation_period,
//       pan_card, aadhar_card,
//     } = req.body;

//     const company_code = req.user.company_code;

//     const existingEmployee = await Onboarding.findOne({ where: { email, company_code } });
//     if (existingEmployee) {
//       return res.status(400).json({ message: "Employee with this email already exists" });
//     }

//     const role = await Role.findOne({ where: { id: role_id, company_code } });
//     if (!role) return res.status(400).json({ message: "Invalid role" });

//     const auto_password = generateStrongPassword();

//     const newEmployee = await Onboarding.create({
//       name, email, contact, role_id, designation, department,
//       reporting_manager, joining_date, probation_period,
//       company_code, auto_password, pan_card, aadhar_card,
//       passport_photo, aadhar_photo, pan_photo, resume,
//       offer_letter, joining_letter, experience_letter,
//     });

//     await audit(req, {
//       module: "onboarding",
//       action: "create",
//       record_id: newEmployee.id,
//       new_value: newEmployee,
//     });

//     return res.status(201).json({ message: "Onboarding created", data: newEmployee });
//   } catch (error: any) {
//     return res.status(500).json({ message: "Failed to create onboarding", error: error.message });
//   }
// };

// // ================= GET ALL =================
// const getAllOnboardings = async (req: CompanyRequest, res: Response): Promise<any> => {
//   try {
//     const data = await Onboarding.findAll({
//       where: { company_code: req.user.company_code },
//     });
//     return res.status(200).json({ data });
//   } catch {
//     return res.status(500).json({ message: "Error fetching onboardings" });
//   }
// };

// // ================= GET BY ID =================
// const getOnboardingById = async (req: CompanyRequest, res: Response): Promise<any> => {
//   try {
//     const record = await Onboarding.findOne({
//       where: { id: req.params.id, company_code: req.user.company_code },
//     });

//     if (!record) return res.status(404).json({ message: "Not found" });

//     return res.json({ data: record });
//   } catch {
//     return res.status(500).json({ message: "Error" });
//   }
// };

// // ================= UPDATE =================
// const updateOnboarding = async (req: CompanyRequest, res: Response): Promise<any> => {
//   try {
//     const record = await Onboarding.findOne({
//       where: { id: req.params.id, company_code: req.user.company_code },
//     });

//     if (!record) return res.status(404).json({ message: "Not found" });

//     const oldData = record.toJSON();

//     await record.update(req.body);
//     await record.reload();

//     await audit(req, {
//       module: "onboarding",
//       action: "update",
//       record_id: record.id,
//       old_value: oldData,
//       new_value: record,
//     });

//     return res.json({ message: "Updated", data: record });
//   } catch {
//     return res.status(500).json({ message: "Error" });
//   }
// };

// // ================= DELETE =================
// const deleteOnboarding = async (req: CompanyRequest, res: Response): Promise<any> => {
//   try {
//     const record = await Onboarding.findOne({
//       where: { id: req.params.id, company_code: req.user.company_code },
//     });

//     if (!record) return res.status(404).json({ message: "Not found" });

//     const oldData = record.toJSON();
//     await record.destroy();

//     await audit(req, {
//       module: "onboarding",
//       action: "delete",
//       record_id: oldData.id,
//       old_value: oldData,
//     });

//     return res.json({ message: "Deleted" });
//   } catch {
//     return res.status(500).json({ message: "Error" });
//   }
// };

// // ================= PRESIGNED =================
// const getAllPresignedUrls = async (req: CompanyRequest, res: Response): Promise<any> => {
//   try {
//     const record = await Onboarding.findByPk(req.params.id);
//     return res.json({ data: record });
//   } catch {
//     return res.status(500).json({ message: "Error" });
//   }
// };

// // ================= OFFER =================
// const generateOfferLetterById = async (req: CompanyRequest, res: Response): Promise<any> => {
//   try {
//     const employee = await Onboarding.findByPk(req.params.id);

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     const urls = await createOfferLetter(employee, req.user.company_name, "standard");

//     // ✅ IMPORTANT FIX
//     if (!urls.pdf) {
//       return res.status(500).json({ message: "PDF generation failed" });
//     }

//     employee.offer_letter = urls.pdf; // अब safe है
//     await employee.save();

//     await audit(req, {
//       module: "onboarding",
//       action: "update",
//       record_id: employee.id,
//       new_value: employee,
//     });

//     return res.json({ data: urls });
//   } catch {
//     return res.status(500).json({ message: "Error" });
//   }
// };

// // ================= DOWNLOAD =================
// const downloadOfferLetter = async (req: CompanyRequest, res: Response): Promise<any> => {
//   try {
//     return res.json({ message: "Download logic same" });
//   } catch {
//     return res.status(500).json({ message: "Error" });
//   }
// };

// // ================= TEMPLATES =================
// const getAllTemplates = async (req: Request, res: Response) => {
//   res.json({ templates: Object.keys(templates) });
// };

// // ================= BULK =================
// const bulkCreateOnboarding = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const workbook = XLSX.read(req.file!.buffer);
//     const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
//     return res.json({ data });
//   } catch {
//     return res.status(500).json({ message: "Error" });
//   }
// };

// // ================= LOGIN =================
// const employeeLogin = async (req: Request, res: Response): Promise<any> => {
//   try {
//     return res.json({ message: "Login same" });
//   } catch {
//     return res.status(500).json({ message: "Error" });
//   }
// };

// // ================= EXPORT =================
// export {
//   createOnboarding,
//   getAllOnboardings,
//   getOnboardingById,
//   updateOnboarding,
//   deleteOnboarding,
//   getAllPresignedUrls,
//   generateOfferLetterById,
//   downloadOfferLetter,
//   getAllTemplates,
//   bulkCreateOnboarding,
//   employeeLogin,
// };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// src/controllers/company/onboarding/onboarding.controller.ts

import { Request, Response } from "express";
import { Onboarding, Role } from "../../models/index";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import XLSX from "xlsx";

import { CompanyRequest } from "../../../middlewares/authMiddleware";

import { encrypt, decrypt } from "../../../utils/encryption";

import templates from "../../../../templates/index";

import { createOfferLetter } from "../../../services/generateOfferLetter";

import {
  uploadToCentralStorage,
  getSignedUrl,
} from "../../../services/uploadfileService";

import { audit } from "../../../helpers/audit.helper";

// ================= PASSWORD =================
const generateStrongPassword = (): string => {
  return crypto.randomBytes(10).toString("base64url");
};

// ================= FILE UPLOAD HELPER =================
const uploadField = async (fileArr: any) => {
  if (!fileArr?.[0]) return undefined;

  const uploaded = await uploadToCentralStorage(
    fileArr[0]
  );

  // 🔥 STORE encrypted fileId
  return encrypt(uploaded.fileId);
};

// ================= CREATE =================
const createOnboarding = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const file = req.files as any;

    // 🔥 Upload files to storage service
    const passport_photo = await uploadField(
      file?.passport_photo
    );

    const aadhar_photo = await uploadField(
      file?.aadhar_photo
    );

    const pan_photo = await uploadField(
      file?.pan_photo
    );

    const resume = await uploadField(
      file?.resume
    );

    const offer_letter = await uploadField(
      file?.offer_letter
    );

    const joining_letter = await uploadField(
      file?.joining_letter
    );

    const experience_letter = await uploadField(
      file?.experience_letter
    );

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

    // ================= CHECK EXISTING =================
    const existingEmployee =
      await Onboarding.findOne({
        where: {
          email,
          company_code,
        },
      });

    if (existingEmployee) {
      return res.status(400).json({
        message:
          "Employee with this email already exists",
      });
    }

    // ================= VALIDATE ROLE =================
    const role = await Role.findOne({
      where: {
        id: role_id,
        company_code,
      },
    });

    if (!role) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // ================= PASSWORD =================
    const auto_password =
      generateStrongPassword();

    // ================= CREATE =================
    const newEmployee =
      await Onboarding.create({
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

    // ================= AUDIT =================
    await audit(req, {
      module: "onboarding",
      action: "create",
      record_id: newEmployee.id,
      new_value: newEmployee,
    });

    return res.status(201).json({
      message:
        "Onboarding created successfully",
      data: newEmployee,
    });
  } catch (error: any) {
    console.error(
      "CREATE ONBOARDING ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create onboarding",
      error: error.message,
    });
  }
};

// ================= GET ALL =================
const getAllOnboardings = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const data = await Onboarding.findAll({
      where: {
        company_code:
          req.user.company_code,
      },
    });

    return res.status(200).json({
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Failed to fetch onboardings",
      error: error.message,
    });
  }
};

// ================= GET BY ID =================
const getOnboardingById = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const record =
      await Onboarding.findOne({
        where: {
          id: req.params.id,
          company_code:
            req.user.company_code,
        },
      });

    if (!record) {
      return res.status(404).json({
        message:
          "Onboarding not found",
      });
    }

    return res.status(200).json({
      data: record,
    });
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Failed to fetch onboarding",
      error: error.message,
    });
  }
};

// ================= UPDATE =================
const updateOnboarding = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const record =
      await Onboarding.findOne({
        where: {
          id,
          company_code:
            req.user.company_code,
        },
      });

    if (!record) {
      return res.status(404).json({
        message:
          "Onboarding not found",
      });
    }

    const oldData = record.toJSON();

    const file = req.files as any;

    const updates: any = {};

    // ================= FILES =================
    if (file?.passport_photo) {
      updates.passport_photo =
        await uploadField(
          file.passport_photo
        );
    }

    if (file?.aadhar_photo) {
      updates.aadhar_photo =
        await uploadField(
          file.aadhar_photo
        );
    }

    if (file?.pan_photo) {
      updates.pan_photo =
        await uploadField(
          file.pan_photo
        );
    }

    if (file?.resume) {
      updates.resume =
        await uploadField(
          file.resume
        );
    }

    if (file?.offer_letter) {
      updates.offer_letter =
        await uploadField(
          file.offer_letter
        );
    }

    if (file?.joining_letter) {
      updates.joining_letter =
        await uploadField(
          file.joining_letter
        );
    }

    if (file?.experience_letter) {
      updates.experience_letter =
        await uploadField(
          file.experience_letter
        );
    }

    // ================= ROLE VALIDATION =================
    if (req.body.role_id) {
      const role =
        await Role.findOne({
          where: {
            id: req.body.role_id,
            company_code:
              req.user.company_code,
          },
        });

      if (!role) {
        return res.status(400).json({
          message: "Invalid role",
        });
      }
    }

    // ================= UPDATE =================
    await record.update({
      ...req.body,
      ...updates,
    });

    await record.reload();

    // ================= AUDIT =================
    await audit(req, {
      module: "onboarding",
      action: "update",
      record_id: record.id,
      old_value: oldData,
      new_value: record,
    });

    return res.status(200).json({
      message:
        "Onboarding updated successfully",
      data: record,
    });
  } catch (error: any) {
    console.error(
      "UPDATE ONBOARDING ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update onboarding",
      error: error.message,
    });
  }
};

// ================= DELETE =================
const deleteOnboarding = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const record =
      await Onboarding.findOne({
        where: {
          id: req.params.id,
          company_code:
            req.user.company_code,
        },
      });

    if (!record) {
      return res.status(404).json({
        message:
          "Onboarding not found",
      });
    }

    const oldData = record.toJSON();

    await record.destroy();

    await audit(req, {
      module: "onboarding",
      action: "delete",
      record_id: oldData.id,
      old_value: oldData,
    });

    return res.status(200).json({
      message:
        "Onboarding deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Failed to delete onboarding",
      error: error.message,
    });
  }
};

// ================= GET SIGNED URLS =================
const getAllPresignedUrls = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const record: any =
      await Onboarding.findOne({
        where: {
          id: req.params.id,
          company_code:
            req.user.company_code,
        },
      });

    if (!record) {
      return res.status(404).json({
        message:
          "Employee not found",
      });
    }

    const fileFields = [
      "passport_photo",
      "aadhar_photo",
      "pan_photo",
      "resume",
      "offer_letter",
      "joining_letter",
      "experience_letter",
    ];

    const urls: any = {};

    for (const field of fileFields) {
      const encryptedFileId =
        record[field];

      if (!encryptedFileId) {
        urls[field] = null;
        continue;
      }

      try {
        // 🔥 decrypt fileId
        const fileId = decrypt(
          encryptedFileId
        );

        // 🔥 signed URL
        const signedUrl =
          await getSignedUrl(fileId);

        urls[field] = signedUrl;
      } catch (err) {
        console.error(
          `SIGNED URL ERROR (${field})`,
          err
        );

        urls[field] = null;
      }
    }

    return res.status(200).json({
      message:
        "Signed URLs generated successfully",
      data: urls,
    });
  } catch (error: any) {
    console.error(
      "SIGNED URL ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to generate signed URLs",
      error: error.message,
    });
  }
};

// ================= GENERATE OFFER LETTER =================
const generateOfferLetterById = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  console.log(
    "🚀 GENERATE OFFER LETTER API HIT"
  );

  try {
    console.log(
      "📌 STEP 1: Finding employee..."
    );

    const employee: any =
      await Onboarding.findOne({
        where: {
          id: req.params.id,
          company_code:
            req.user.company_code,
        },
      });

    console.log(
      "✅ STEP 2: Employee query done"
    );

    if (!employee) {
      console.log(
        "❌ Employee not found"
      );

      return res.status(404).json({
        message:
          "Employee not found",
      });
    }

    console.log(
      "👤 Employee Found:",
      employee.id
    );

    // ================= TEMPLATE =================
    const template =
      req.body.template ||
      "standard";

    console.log(
      "📄 SELECTED TEMPLATE:",
      template
    );

    // ✅ VALIDATE TEMPLATE
    const allowedTemplates = [
      "standard",
      "executive",
      "basic",
    ];

    if (
      !allowedTemplates.includes(
        template
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid template selected",

        allowedTemplates,
      });
    }

    console.log(
      "📄 STEP 3: Starting offer letter generation..."
    );

    const companyName =
  req.user.company_name ||
  req.user.company_code ||
  "Your Company";

const urls =
  await createOfferLetter(
    employee,
    companyName,
    template
  );
  
    console.log(
      "✅ STEP 4: Offer letter generated"
    );

    console.log(
      "📁 Generated URLs:",
      urls
    );

    // 🔥 STORE encrypted fileId
    employee.offer_letter =
      urls.pdf;

    console.log(
      "💾 STEP 5: Saving employee..."
    );

    await employee.save();

    console.log(
      "✅ STEP 6: Employee saved"
    );

    // ================= AUDIT =================
    console.log(
      "📝 STEP 7: Audit logging..."
    );

    await audit(req, {
      module: "onboarding",
      action: "update",
      record_id: employee.id,
      new_value: employee,
    });

    console.log(
      "✅ STEP 8: Audit completed"
    );

    return res.status(200).json({
      message:
        "Offer letter generated successfully",

      selectedTemplate:
        template,

      data: urls,
    });
  } catch (error: any) {
    console.error(
      "❌ GENERATE OFFER LETTER ERROR:"
    );

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to generate offer letter",

      error:
        error.message,
    });
  }
};

// ================= DOWNLOAD OFFER LETTER =================
// const downloadOfferLetter = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const employee: any =
//       await Onboarding.findOne({
//         where: {
//           id: req.params.id,
//           company_code:
//             req.user.company_code,
//         },
//       });

//     if (!employee) {
//       return res.status(404).json({
//         message:
//           "Employee not found",
//       });
//     }

//     if (!employee.offer_letter) {
//       return res.status(404).json({
//         message:
//           "Offer letter not found",
//       });
//     }

//     // 🔥 decrypt fileId
//     const fileId = decrypt(
//       employee.offer_letter
//     );

//     // 🔥 get signed URL
//     const signedUrl =
//       await getSignedUrl(fileId);

//     return res.status(200).json({
//       url: signedUrl,
//     });
//   } catch (error: any) {
//     console.error(
//       "DOWNLOAD OFFER LETTER ERROR:",
//       error
//     );

//     return res.status(500).json({
//       message:
//         "Failed to download offer letter",
//       error: error.message,
//     });
//   }
// };
const downloadOfferLetter = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    console.log(
      "📥 DOWNLOAD OFFER LETTER API HIT"
    );

    const { id } =
      req.params;

    const employee: any =
      await Onboarding.findOne({
        where: {
          id,
          company_code:
            req.user.company_code,
        },
      });

    if (!employee) {
      return res.status(404).json({
        message:
          "Employee not found",
      });
    }

    if (
      !employee.offer_letter
    ) {
      return res.status(404).json({
        message:
          "Offer letter not found",
      });
    }

    console.log(
      "✅ Employee Found"
    );

    // 🔥 decrypt fileId
    const fileId = decrypt(
      employee.offer_letter
    );

    console.log(
      "🔓 Decrypted File ID:",
      fileId
    );

    // 🔥 generate signed URL
    const signedUrl =
      await getSignedUrl(
        fileId
      );

    console.log(
      "✅ Signed URL Generated"
    );

    // ✅ PRODUCTION BEST PRACTICE
    // redirect directly to signed URL
    return res.redirect(
      signedUrl
    );
  } catch (error: any) {
    console.error(
      "❌ DOWNLOAD OFFER LETTER ERROR"
    );

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to download offer letter",

      error:
        error.message,
    });
  }
};
// ================= GET TEMPLATES =================
const getAllTemplates = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    return res.status(200).json({
      templates:
        Object.keys(templates),
    });
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Failed to fetch templates",
      error: error.message,
    });
  }
};

// ================= BULK CREATE =================
const bulkCreateOnboarding = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          "Excel file required",
      });
    }

    const workbook = XLSX.read(
      req.file.buffer
    );

    const sheetName =
      workbook.SheetNames[0];

    const data =
      XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName]
      );

    return res.status(200).json({
      message:
        "Bulk onboarding processed",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Bulk upload failed",
      error: error.message,
    });
  }
};

// ================= LOGIN =================
const employeeLogin = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email, password } =
      req.body;

    const user: any =
      await Onboarding.findOne({
        where: {
          email,
          auto_password:
            password,
        },
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid credentials",
      });
    }

    const role: any =
      await Role.findOne({
        where: {
          id: user.role_id,
          company_code:
            user.company_code,
        },
        raw: true,
      });

    const permissions =
      typeof role.permissions ===
      "string"
        ? JSON.parse(
            role.permissions
          )
        : role.permissions;

    const token = jwt.sign(
      {
        id: user.id,
        company_code:
          user.company_code,
        role_id: role.id,
        permissions,
      },
      process.env.JWT_SECRET ||
        "secret",
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      token,
      user,
    });
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Login failed",
      error: error.message,
    });
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
  employeeLogin,
};