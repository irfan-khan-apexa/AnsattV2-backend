// import { Request, Response } from "express";
// import { Salary, Onboarding } from "../../models/index";
// import { CompanyRequest } from "../../../middlewares/authMiddleware";
// import { createSalarySlip } from "../../../services/generateSalarySlip";
// import { decrypt } from "../../../utils/encryption";
// import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
// import XLSX from "xlsx";

// // const createSalary = async (
// //   req: CompanyRequest,
// //   res: Response
// // ): Promise<any> => {
// //   try {
// //     const { employee_id, month, basic, hra, allowances, deductions, bonus } =
// //       req.body;
// //     const company_code = req.user.company_code;

// //     const employee = await Onboarding.findOne({
// //       where: { id: employee_id, company_code },
// //     });
// //     if (!employee)
// //       return res.status(404).json({ message: "Employee not found" });

// //     const net_salary =
// //       basic + (hra || 0) + (allowances || 0) + (bonus || 0) - (deductions || 0);

// //     const salary = await Salary.create({
// //       employee_id,
// //       company_code,
// //       month,
// //       basic,
// //       hra,
// //       allowances,
// //       deductions,
// //       bonus,
// //       net_salary,
// //       generated_by: req.user.id,
// //     });

// //  
// //     const urls = await createSalarySlip(
// //       salary,
// //       employee,
// //       (req.query.template as string) || "standard"
// //     );
// //     salary.salary_slip = urls.pdf ?? null;
// //     await salary.save();

// //     return res
// //       .status(201)
// //       .json({ message: "Salary created & slip generated", data: salary, urls });
// //   } catch (error: any) {
// //     return res
// //       .status(500)
// //       .json({ message: "Error creating salary", error: error.message });
// //   }
// // };

// const getEmployeeSlips = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { employee_id } = req.params;
//     const { company_code } = req.user;
//     const salaries = await Salary.findAll({
//       where: { employee_id, company_code },
//     });
//     return res.status(200).json({ data: salaries });
//   } catch {
//     return res.status(500).json({ message: "Error fetching salary slips" });
//   }
// };

// const downloadSlip = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id, format } = req.params;
//     const { company_code } = req.user;

//     if (!["pdf", "docx"].includes(format)) {
//       return res.status(400).json({ message: "Invalid format" });
//     }

//     const salary = await Salary.findOne({ where: { id, company_code } });
//     if (!salary || !salary.salary_slip) {
//       return res.status(404).json({ message: "Salary slip not found" });
//     }

//     const decryptedUrl = decrypt(salary.salary_slip);
//     const key = decryptedUrl.split(`${process.env.WASABI_BUCKET_NAME}/`)[1];
//     const baseKey = key.replace(/\.pdf|\.docx/gi, "");
//     const finalKey = `${baseKey}.${format}`;

//     const presignedUrl = await generatePresignedGetUrl(finalKey, 5 * 60);
//     return res.status(200).json({ url: presignedUrl });
//   } catch (err) {
//     return res.status(500).json({ message: "Error downloading slip" });
//   }
// };

// // interface ColumnMapping {
// //   [key: string]: string; // file column name → model field
// // }

// // const bulkUploadSalaryAdvanced = async (
// //   req: CompanyRequest,
// //   res: Response
// // ): Promise<any> => {
// //   try {
// //     if (!req.file) {
// //       return res.status(400).json({ message: "No file uploaded" });
// //     }

// //     const company_code = req.user.company_code;
// //     const buffer = req.file.buffer;

// //     // Optional: column mapping from query
// //     // Example: ?mapping[EmployeeID]=employee_id&mapping[Month]=month

// //     // const mapping: ColumnMapping = req.body.mapping || {};

// //     // bulkUploadSalaryAdvanced function ke andar
// //     let mapping: ColumnMapping = {};
// //     if (req.body.mapping) {
// //       try {
// //         mapping = JSON.parse(req.body.mapping);
// //       } catch (err) {
// //         console.error("Invalid mapping JSON:", req.body.mapping);
// //       }
// //     }

// //     // Read Excel/CSV file
// //     const workbook = XLSX.read(buffer, { type: "buffer" });
// //     const sheetName = workbook.SheetNames[0];
// //     const sheet = workbook.Sheets[sheetName];
// //     let data: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

// //     // Apply column mapping
// //     if (Object.keys(mapping).length > 0) {
// //       data = data.map((row) => {
// //         const newRow: any = {};
// //         for (const [fileCol, modelCol] of Object.entries(mapping)) {
// //           newRow[modelCol] = row[fileCol] ?? null;
// //         }
// //         return newRow;
// //       });
// //     }

// //     const results: any[] = [];

// //     for (const row of data) {
// //       const {
// //         employee_id,
// //         month,
// //         basic,
// //         hra = 0,
// //         allowances = 0,
// //         deductions = 0,
// //         bonus = 0,
// //       } = row;

// //       // Validate required fields
// //       if (!employee_id || !month || !basic) {
// //         results.push({
// //           employee_id,
// //           month,
// //           status: "failed",
// //           reason: "Missing required fields",
// //         });
// //         continue;
// //       }

// //       const employee = await Onboarding.findOne({
// //         where: { id: employee_id, company_code },
// //       });

// //       if (!employee) {
// //         results.push({
// //           employee_id,
// //           month,
// //           status: "failed",
// //           reason: "Employee not found",
// //         });
// //         continue;
// //       }

// //       const net_salary =
// //         Number(basic) +
// //         Number(hra) +
// //         Number(allowances) +
// //         Number(bonus) -
// //         Number(deductions);

// //       // Create or update salary
// //       const [salary] = await Salary.upsert(
// //         {
// //           employee_id,
// //           company_code,
// //           month,
// //           basic,
// //           hra,
// //           allowances,
// //           deductions,
// //           bonus,
// //           net_salary,
// //           generated_by: req.user.id,
// //         },
// //         { returning: true }
// //       );

// //       // Generate salary slip
// //       const urls = await createSalarySlip(
// //         salary,
// //         employee,
// //         (req.query.template as string) || "standard"
// //       );
// //       salary.salary_slip = urls.pdf ?? null;
// //       await salary.save();

// //       results.push({
// //         employee_id,
// //         month,
// //         status: "success",
// //         salary_id: salary.id,
// //       });
// //     }
// //     console.log("Parsed Data:", data[0]);
// //     console.log("Mapping:", mapping);

// //     return res.status(200).json({ message: "Bulk upload processed", results });
// //   } catch (error: any) {
// //     return res
// //       .status(500)
// //       .json({ message: "Error in bulk upload", error: error.message });
// //   }
// // };

// // const exportSalaryData = async (
// //   req: CompanyRequest,
// //   res: Response
// // ): Promise<any> => {
// //   try {
// //     const company_code = req.user.company_code;

// //     console.log("Token Company Code:", company_code);

// //     if (!company_code) {
// //       return res.status(400).json({ message: "Company code missing in token" });
// //     }

// //     console.log("📡 Fetching salaries for company_code:", company_code);

// //     const salaries = await Salary.findAll({
// //       where: { company_code },
// //       raw: true,
// //     });

// //     console.log("Salaries Fetched:", salaries);

// //     if (!salaries || salaries.length === 0) {
// //       return res
// //         .status(404)
// //         .json({ message: "No salary records found for this company" });
// //     }

// //     const worksheet = XLSX.utils.json_to_sheet(salaries);
// //     const workbook = XLSX.utils.book_new();
// //     XLSX.utils.book_append_sheet(workbook, worksheet, "Salaries");

// //     const excelBuffer = XLSX.write(workbook, {
// //       bookType: "xlsx",
// //       type: "buffer",
// //     });

// //     res.setHeader(
// //       "Content-Disposition",
// //       `attachment; filename="salary_export_${company_code}.xlsx"`
// //     );
// //     res.setHeader(
// //       "Content-Type",
// //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
// //     );

// //     return res.send(excelBuffer);
// //   } catch (error: any) {
// //     console.error( Export Error:", error);
// //     return res.status(500).json({
// //       message: "Error exporting salary data",
// //       error: error.message,
// //     });
// //   }
// // };


// const createSalary = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const {
//       employee_id,
//       month,
//       basic,
//       hra = 0,
//       allowances = 0,
//       deductions = 0,
//       bonus = 0,
//       // optional incoming fields: pf_esic_pt, employer_pf (may be passed or left to calculate externally)
//       pf_esic_pt = 0,
//       employer_pf = 0,
//     } = req.body;
//     const company_code = req.user.company_code;

//     const employee = await Onboarding.findOne({
//       where: { id: employee_id, company_code },
//     });
//     if (!employee)
//       return res.status(404).json({ message: "Employee not found" });

//     // Compute sums
//     const numBasic = Number(basic);
//     const numHra = Number(hra || 0);
//     const numAllow = Number(allowances || 0);
//     const numBonus = Number(bonus || 0);
//     const numDed = Number(deductions || 0);
//     const numPfEmp = Number(pf_esic_pt || 0);
//     const numEmployerPf = Number(employer_pf || 0);

//     // Gross = basic + hra + allowances + bonus
//     const gross = numBasic + numHra + numAllow + numBonus;

//     // Net salary = gross - (deductions + employee PF/ESIC/PT)
//     const net_salary = gross - (numDed + numPfEmp);

//     // CTC = gross + employer contributions (like employer_pf)
//     const ctc = gross + numEmployerPf;

//     const salary = await Salary.create({
//       employee_id,
//       company_code,
//       month,
//       basic: numBasic,
//       hra: numHra,
//       allowances: numAllow,
//       deductions: numDed,
//       bonus: numBonus,
//       gross,
//       pf_esic_pt: numPfEmp,
//       employer_pf: numEmployerPf,
//       ctc,
//       net_salary,
//       generated_by: req.user.id,
//     });

//     // Generate Salary Slip
//     const urls = await createSalarySlip(
//       salary,
//       employee,
//       (req.query.template as string) || "standard"
//     );
//     salary.salary_slip = urls.pdf ?? null;
//     await salary.save();

//     return res
//       .status(201)
//       .json({ message: "Salary created & slip generated", data: salary, urls });
//   } catch (error: any) {
//     return res
//       .status(500)
//       .json({ message: "Error creating salary", error: error.message });
//   }
// };

// interface ColumnMapping {
//   [key: string]: string;
// }

// // Check if month is valid YYYY-MM
// const isValidMonthFormat = (value: string): boolean => {
//   return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
// };

// // Convert Excel Serial Number → YYYY-MM 
// const parseMonthValue = (monthVal: any): string => {
//   if (!monthVal) return "";

//   // If already correct string format
//   if (typeof monthVal === "string" && isValidMonthFormat(monthVal)) {
//     return monthVal;
//   }

//   // If Excel serial number (e.g. 45962)
//   if (typeof monthVal === "number") {
//     const excelDate = new Date((monthVal - 25569) * 86400 * 1000);
//     const year = excelDate.getFullYear();
//     const month = String(excelDate.getMonth() + 1).padStart(2, "0");
//     return `${year}-${month}`;
//   }

//   return "";
// };

// const bulkUploadSalaryAdvanced = async (req: CompanyRequest, res: Response): Promise<any> => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const company_code = req.user.company_code;
//     const buffer = req.file.buffer;

//     let mapping: ColumnMapping = {};
//     if (req.body.mapping) {
//       try {
//         mapping = JSON.parse(req.body.mapping);
//       } catch (err) {
//         console.error("Invalid mapping JSON:", req.body.mapping);
//       }
//     }

//     // Read Excel
//     const workbook = XLSX.read(buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     let data: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

//     // Apply Column Mapping (if provided)
//     if (Object.keys(mapping).length > 0) {
//       data = data.map((row) => {
//         const newRow: any = {};
//         for (const [fileCol, modelCol] of Object.entries(mapping)) {
//           newRow[modelCol] = row[fileCol] ?? null;
//         }
//         return newRow;
//       });
//     }

//     const results: any[] = [];

//     for (const row of data) {
//       const {
//         employee_id,
//         month,
//         basic,
//         hra = 0,
//         allowances = 0,
//         deductions = 0,
//         bonus = 0,
//         pf_esic_pt = 0,
//         employer_pf = 0,
//       } = row;

//       // ✔ FIX: Convert any month value to YYYY-MM
//       const formattedMonth = parseMonthValue(month);

//       if (!employee_id || !basic || !formattedMonth) {
//         results.push({
//           employee_id,
//           month,
//           status: "failed",
//           reason: "Invalid row: Required fields missing OR invalid month format",
//         });
//         continue;
//       }

//       const employee = await Onboarding.findOne({
//         where: { id: employee_id, company_code },
//       });

//       if (!employee) {
//         results.push({
//           employee_id,
//           month: formattedMonth,
//           status: "failed",
//           reason: "Employee not found",
//         });
//         continue;
//       }

//       // Convert numeric values
//       const numBasic = Number(basic);
//       const numHra = Number(hra);
//       const numAllow = Number(allowances);
//       const numBonus = Number(bonus);
//       const numDed = Number(deductions);
//       const numPfEmp = Number(pf_esic_pt);
//       const numEmployerPf = Number(employer_pf);

//       const gross = numBasic + numHra + numAllow + numBonus;
//       const net_salary = gross - (numDed + numPfEmp);
//       const ctc = gross + numEmployerPf;

//       // Save/Upsert salary
//       const [salary] = await Salary.upsert(
//         {
//           employee_id,
//           company_code,
//           month: formattedMonth,
//           basic: numBasic,
//           hra: numHra,
//           allowances: numAllow,
//           deductions: numDed,
//           bonus: numBonus,
//           gross,
//           pf_esic_pt: numPfEmp,
//           employer_pf: numEmployerPf,
//           ctc,
//           net_salary,
//           generated_by: req.user.id,
//         },
//         { returning: true }
//       );

//       // Generate salary slip PDF
//       const urls = await createSalarySlip(
//         salary,
//         employee,
//         (req.query.template as string) || "standard"
//       );

//       salary.salary_slip = urls.pdf ?? null;
//       await salary.save();

//       results.push({
//         employee_id,
//         month: formattedMonth,
//         status: "success",
//         salary_id: salary.id,
//       });
//     }

//     return res.status(200).json({ message: "Bulk upload processed", results });
//   } catch (error: any) {
//     return res.status(500).json({
//       message: "Error in bulk upload",
//       error: error.message,
//     });
//   }
// };


// const exportSalaryData = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const company_code = req.user.company_code;
//     console.log("🔑 Token Company Code:", company_code);

//     if (!company_code) {
//       return res.status(400).json({ message: "Company code missing in token" });
//     }

//     console.log("📡 Fetching salaries for company_code:", company_code);

//     const salaries = await Salary.findAll({
//       where: { company_code },
//       raw: true,
//     });

//     console.log(" Salaries Fetched:", salaries?.length);

//     if (!salaries || salaries.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No salary records found for this company" });
//     }

//     // The model now contains new fields; json_to_sheet will include them automatically
//     const worksheet = XLSX.utils.json_to_sheet(salaries);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Salaries");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "buffer",
//     });

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="salary_export_${company_code}.xlsx"`
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     return res.send(excelBuffer);
//   } catch (error: any) {
//     console.error("Export Error:", error);
//     return res.status(500).json({
//       message: "Error exporting salary data",
//       error: error.message,
//     });
//   }
// };


// const getCurrentMonth = (): string => {
//   const d = new Date();
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   return `${yyyy}-${mm}`;
// };

// /**
//  * Update salary (only for current month)
//  * URL: PUT /api/salary/:id
//  * Body: any of the numeric fields (basic, hra, allowances, deductions, bonus, pf_esic_pt, employer_pf)
//  */
// const updateSalary = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const company_code = req.user.company_code;
//     const updates = req.body;

//     // Find salary and ensure it belongs to the company
//     const salary = await Salary.findOne({ where: { id, company_code } });
//     if (!salary) {
//       return res.status(404).json({ message: "Salary record not found" });
//     }

//     // Allow update only if salary.month === current month
//     const currentMonth = getCurrentMonth();
//     if (salary.month !== currentMonth) {
//       return res.status(403).json({
//         message:
//           "Only current month's salary can be updated. Operation denied for past months.",
//       });
//     }

//     // Allowed fields to update
//     const allowedFields = [
//       "basic",
//       "hra",
//       "allowances",
//       "deductions",
//       "bonus",
//       "pf_esic_pt",
//       "employer_pf",
//     ];

//     // Apply numeric conversions and assign
//     for (const key of allowedFields) {
//       if (updates[key] !== undefined) {
//         // If client sends null intentionally, treat as 0
//         const val = updates[key] === null ? 0 : Number(updates[key]);
//         (salary as any)[key] = isNaN(val) ? 0 : val;
//       }
//     }

//     // Recalculate computed fields
//     const numBasic = Number(salary.basic || 0);
//     const numHra = Number(salary.hra || 0);
//     const numAllow = Number(salary.allowances || 0);
//     const numBonus = Number(salary.bonus || 0);
//     const numDed = Number(salary.deductions || 0);
//     const numPfEmp = Number(salary.pf_esic_pt || 0);
//     const numEmployerPf = Number(salary.employer_pf || 0);

//     const gross = numBasic + numHra + numAllow + numBonus;
//     const net_salary = gross - (numDed + numPfEmp);
//     const ctc = gross + numEmployerPf;

//     salary.gross = gross;
//     salary.net_salary = net_salary;
//     salary.ctc = ctc;

//     await salary.save();

//     // Optionally regenerate slip if you want up-to-date PDF
//     // If you want to always regenerate slip on update, uncomment below:
//     // const employee = await Onboarding.findOne({ where: { id: salary.employee_id, company_code }});
//     // const urls = await createSalarySlip(salary, employee, (req.query.template as string) || "standard");
//     // salary.salary_slip = urls.pdf ?? null;
//     // await salary.save();

//     return res
//       .status(200)
//       .json({ message: "Salary updated", data: salary });
//   } catch (error: any) {
//     console.error("updateSalary error:", error);
//     return res
//       .status(500)
//       .json({ message: "Error updating salary", error: error.message });
//   }
// };

// /**
//  * Delete salary (only for current month)
//  * URL: DELETE /api/salary/:id
//  */
// const deleteSalary = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;
//     const company_code = req.user.company_code;

//     const salary = await Salary.findOne({ where: { id, company_code } });
//     if (!salary) {
//       return res.status(404).json({ message: "Salary record not found" });
//     }

//     const currentMonth = getCurrentMonth();
//     if (salary.month !== currentMonth) {
//       return res.status(403).json({
//         message:
//           "Only current month's salary can be deleted. Deleting past months is not allowed.",
//       });
//     }

//     // Hard delete
//     await salary.destroy();

//     // If you prefer soft-delete, replace above with salary.update({ deletedAt: new Date() }) and enable paranoid model

//     return res.status(200).json({ message: "Salary deleted successfully" });
//   } catch (error: any) {
//     console.error("❌deleteSalary error:", error);
//     return res
//       .status(500)
//       .json({ message: "Error deleting salary", error: error.message });
//   }
// };

// const getAllSalaries = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const company_code = req.user.company_code;
//     if (!company_code) {
//       return res.status(400).json({ message: "Company code missing in token" });
//     }

//     // Optional query filters
//     const {
//       month, // e.g., "2025-11"
//       employee_id, // optional
//       page = "1",
//       limit = "50",
//       sortBy = "createdAt", // or "month" or "employee_id"
//       order = "DESC", // ASC or DESC
//     } = req.query as any;

//     const where: any = { company_code };

//     if (month) where.month = month;
//     if (employee_id) where.employee_id = employee_id;

//     // Parse pagination
//     const pageNum = Math.max(Number(page) || 1, 1);
//     const pageSize = Math.max(Math.min(Number(limit) || 50, 1000), 1);
//     const offset = (pageNum - 1) * pageSize;

//     // Safe sort column mapping (prevent raw injection)
//     const allowedSortFields = ["createdAt", "month", "employee_id", "gross", "net_salary"];
//     const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
//     const sortOrder = (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

//     // Use findAndCountAll for pagination metadata
//    const { rows: salaries, count } = await Salary.findAndCountAll({
//   where,
//   order: [[sortField, sortOrder]],
//   offset,
//   limit: pageSize,
//   raw: true,
// });


//     return res.status(200).json({
//       data: salaries,
//       meta: {
//         total: count,
//         page: pageNum,
//         limit: pageSize,
//         pages: Math.ceil(count / pageSize),
//       },
//     });
//   } catch (error: any) {
//     console.error("getAllSalaries error:", error);
//     return res
//       .status(500)
//       .json({ message: "Error fetching salaries", error: error.message });
//   }
// };

// export {
//   createSalary,
//   getEmployeeSlips,
//   downloadSlip,
//   bulkUploadSalaryAdvanced,
//   exportSalaryData,
//   updateSalary,
//   deleteSalary,
//   getAllSalaries
// };
import { Request, Response } from "express";
import { Salary, Onboarding } from "../../models/index";
import { CompanyRequest } from "../../../middlewares/authMiddleware";
import { createSalarySlip } from "../../../services/generateSalarySlip";
import { decrypt } from "../../../utils/encryption";
import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
import XLSX from "xlsx";
import { audit } from "../../../helpers/audit.helper"; // 🔥 ADDED
import { getSignedUrl } from "../../../services/uploadfileService";


const getEmployeeSlips = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { employee_id } = req.params;
    const { company_code } = req.user;
    const salaries = await Salary.findAll({
      where: { employee_id, company_code },
    });
    return res.status(200).json({ data: salaries });
  } catch {
    return res.status(500).json({ message: "Error fetching salary slips" });
  }
};

const downloadSlip = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    console.log(
      "📥 DOWNLOAD SALARY SLIP API HIT"
    );

    const { id } =
      req.params;

    console.log(
      "🆔 Salary ID:",
      id
    );

    const { company_code } =
      req.user;

    console.log(
      "🏢 Company Code:",
      company_code
    );

    // ================= FIND SALARY =================
    console.log(
      "📌 Finding salary..."
    );

    const salary =
      await Salary.findOne({
        where: {
          id,
          company_code,
        },
      });

    console.log(
      "✅ Salary Query Done"
    );

    if (!salary) {
      console.log(
        "❌ Salary not found"
      );

      return res.status(404).json({
        message:
          "Salary not found",
      });
    }

    console.log(
      "✅ Salary Found:",
      salary.id
    );

    console.log(
      "📄 Stored salary_slip:",
      salary.salary_slip
    );

    if (
      !salary.salary_slip
    ) {
      console.log(
        "❌ Salary slip missing"
      );

      return res.status(404).json({
        message:
          "Salary slip not found",
      });
    }

    // ================= DECRYPT =================
    console.log(
      "🔓 Decrypting..."
    );

    const fileId =
      decrypt(
        salary.salary_slip
      );

    console.log(
      "✅ FILE ID:",
      fileId
    );

    // ================= GENERATE URL =================
    console.log(
      "🔗 Generating signed URL..."
    );

    const signedUrl =
      await getSignedUrl(
        fileId
      );

    console.log(
      "✅ Signed URL:",
      signedUrl
    );

    // ================= REDIRECT =================
    console.log(
      "🚀 Redirecting..."
    );

    return res.redirect(
      signedUrl
    );
  } catch (err: any) {
    console.log(
      "❌ DOWNLOAD SLIP ERROR"
    );

    console.log(
      "MESSAGE:",
      err.message
    );

    console.log(
      "STACK:",
      err.stack
    );

    console.log(
      "FULL ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Error downloading slip",

      error:
        err.message,
    });
  }
};

// ================= CREATE =================
// ================= CREATE SALARY =================
const createSalary = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  console.log(
    "🚀 CREATE SALARY API HIT"
  );

  try {
    console.log(
      "📌 STEP 1: Extracting body..."
    );

    const {
      employee_id,
      month,
      basic,
      hra = 0,
      allowances = 0,
      deductions = 0,
      bonus = 0,
      pf_esic_pt = 0,
      employer_pf = 0,
    } = req.body;

    const company_code =
      req.user.company_code;

    console.log(
      "🏢 Company Code:",
      company_code
    );

    console.log(
      "👤 Employee ID:",
      employee_id
    );

    // ================= FIND EMPLOYEE =================
    console.log(
      "📌 STEP 2: Finding employee..."
    );

    const employee =
      await Onboarding.findOne({
        where: {
          id: employee_id,
          company_code,
        },
      });

    console.log(
      "✅ STEP 3: Employee query completed"
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
      "✅ Employee Found:",
      employee.id
    );

    // ================= CALCULATIONS =================
    console.log(
      "📌 STEP 4: Calculating salary..."
    );

    const numBasic =
      Number(basic);

    const numHra =
      Number(hra || 0);

    const numAllow =
      Number(
        allowances || 0
      );

    const numBonus =
      Number(bonus || 0);

    const numDed =
      Number(
        deductions || 0
      );

    const numPfEmp =
      Number(
        pf_esic_pt || 0
      );

    const numEmployerPf =
      Number(
        employer_pf || 0
      );

    const gross =
      numBasic +
      numHra +
      numAllow +
      numBonus;

    const net_salary =
      gross -
      (numDed + numPfEmp);

    const ctc =
      gross +
      numEmployerPf;

    console.log(
      "💰 Gross:",
      gross
    );

    console.log(
      "💰 Net Salary:",
      net_salary
    );

    // ================= CREATE SALARY =================
    console.log(
      "📌 STEP 5: Creating salary..."
    );

    const salary =
      await Salary.create({
        employee_id,
        company_code,
        month,

        basic: numBasic,

        hra: numHra,

        allowances:
          numAllow,

        deductions:
          numDed,

        bonus: numBonus,

        gross,

        pf_esic_pt:
          numPfEmp,

        employer_pf:
          numEmployerPf,

        ctc,

        net_salary,

        generated_by:
          req.user.id,
      });

    console.log(
      "✅ STEP 6: Salary created"
    );

    console.log(
      "🧾 Salary ID:",
      salary.id
    );

    // ================= TEMPLATE =================
    const template =
      (req.query
        .template as string) ||
      "standard";

    console.log(
      "📄 Selected Template:",
      template
    );

    // ================= GENERATE SALARY SLIP =================
    console.log(
      "📌 STEP 7: Generating salary slip..."
    );

    const urls =
      await createSalarySlip(
        salary,
        employee,
        template
      );

    console.log(
      "✅ STEP 8: Salary slip generated"
    );

    console.log(
      "📁 Generated URLs:",
      urls
    );

    // ================= SAVE FILE =================
    console.log(
      "📌 STEP 9: Saving salary slip..."
    );

    salary.salary_slip =
      urls.pdf ?? null;

    await salary.save();

    console.log(
      "✅ STEP 10: Salary saved"
    );

    // ================= AUDIT =================
    console.log(
      "📌 STEP 11: Audit logging..."
    );

    await audit(req, {
      module: "salary",
      action: "create",
      record_id: salary.id,
      new_value:
        salary.toJSON(),
    });

    console.log(
      "✅ STEP 12: Audit completed"
    );

    return res.status(201).json({
      message:
        "Salary created & slip generated successfully",

      selectedTemplate:
        template,

      data: salary,

      urls,
    });

  } catch (error: any) {
    console.error(
      "❌ CREATE SALARY ERROR"
    );

    console.error(error);

    return res.status(500).json({
      message:
        "Error creating salary",

      error:
        error.message,
    });
  }
};

// ================= UPDATE =================
const updateSalary = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const salary = await Salary.findOne({ where: { id, company_code } });
    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    const oldData = salary.toJSON(); // 🔥

    await salary.update(req.body);

    // 🔥 AUDIT
    await audit(req, {
      module: "salary",
      action: "update",
      record_id: salary.id,
      old_value: oldData,
      new_value: salary.toJSON(),
    });

    return res.status(200).json({
      message: "Salary updated",
      data: salary,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error updating salary",
      error: error.message,
    });
  }
};


// ================= DELETE =================
const deleteSalary = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const salary = await Salary.findOne({ where: { id, company_code } });
    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    const oldData = salary.toJSON(); // 🔥

    await salary.destroy();

    // 🔥 AUDIT
    await audit(req, {
      module: "salary",
      action: "delete",
      record_id: oldData.id,
      old_value: oldData,
    });

    return res.status(200).json({ message: "Salary deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error deleting salary",
      error: error.message,
    });
  }
};


// ================= GET =================
const getAllSalaries = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const company_code = req.user.company_code;

    const salaries = await Salary.findAll({
      where: { company_code },
    });

    return res.status(200).json({ data: salaries });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching salaries",
      error: error.message,
    });
  }
};


// ================= BULK UPLOAD =================
const bulkUploadSalaryAdvanced = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Excel file required",
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

    // 🔥 Yaha future me DB insert logic add kar sakte ho

    return res.status(200).json({
      message:
        "Bulk salary upload processed successfully",
      total: data.length,
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

// ================= EXPORT SALARY =================
const exportSalaryData = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const company_code =
      req.user.company_code;

    const salaries =
      await Salary.findAll({
        where: {
          company_code,
        },
        raw: true,
      });

    const worksheet =
      XLSX.utils.json_to_sheet(
        salaries
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Salaries"
    );

    const buffer = XLSX.write(
      workbook,
      {
        type: "buffer",
        bookType: "xlsx",
      }
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=salaries.xlsx"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Export failed",
      error: error.message,
    });
  }
};

export {
  createSalary,
  getEmployeeSlips,
  downloadSlip,
  updateSalary,
  deleteSalary,
  getAllSalaries,
  bulkUploadSalaryAdvanced,
  exportSalaryData
};