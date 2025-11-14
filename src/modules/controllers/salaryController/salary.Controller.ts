import { Request, Response } from "express";
import { Salary, Onboarding } from "../../models/index";
import { CompanyRequest } from "../../../middlewares/authMiddleware";
import { createSalarySlip } from "../../../services/generateSalarySlip";
import { decrypt } from "../../../utils/encryption";
import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
import XLSX from "xlsx";

// const createSalary = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { employee_id, month, basic, hra, allowances, deductions, bonus } =
//       req.body;
//     const company_code = req.user.company_code;

//     const employee = await Onboarding.findOne({
//       where: { id: employee_id, company_code },
//     });
//     if (!employee)
//       return res.status(404).json({ message: "Employee not found" });

//     const net_salary =
//       basic + (hra || 0) + (allowances || 0) + (bonus || 0) - (deductions || 0);

//     const salary = await Salary.create({
//       employee_id,
//       company_code,
//       month,
//       basic,
//       hra,
//       allowances,
//       deductions,
//       bonus,
//       net_salary,
//       generated_by: req.user.id,
//     });

//     // ✅ Generate Salary Slip
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
    const { id, format } = req.params;
    const { company_code } = req.user;

    if (!["pdf", "docx"].includes(format)) {
      return res.status(400).json({ message: "Invalid format" });
    }

    const salary = await Salary.findOne({ where: { id, company_code } });
    if (!salary || !salary.salary_slip) {
      return res.status(404).json({ message: "Salary slip not found" });
    }

    const decryptedUrl = decrypt(salary.salary_slip);
    const key = decryptedUrl.split(`${process.env.WASABI_BUCKET_NAME}/`)[1];
    const baseKey = key.replace(/\.pdf|\.docx/gi, "");
    const finalKey = `${baseKey}.${format}`;

    const presignedUrl = await generatePresignedGetUrl(finalKey, 5 * 60);
    return res.status(200).json({ url: presignedUrl });
  } catch (err) {
    return res.status(500).json({ message: "Error downloading slip" });
  }
};

// interface ColumnMapping {
//   [key: string]: string; // file column name → model field
// }

// const bulkUploadSalaryAdvanced = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const company_code = req.user.company_code;
//     const buffer = req.file.buffer;

//     // Optional: column mapping from query
//     // Example: ?mapping[EmployeeID]=employee_id&mapping[Month]=month

//     // const mapping: ColumnMapping = req.body.mapping || {};

//     // bulkUploadSalaryAdvanced function ke andar
//     let mapping: ColumnMapping = {};
//     if (req.body.mapping) {
//       try {
//         mapping = JSON.parse(req.body.mapping); // 👈 yeh line add karo
//       } catch (err) {
//         console.error("Invalid mapping JSON:", req.body.mapping);
//       }
//     }

//     // Read Excel/CSV file
//     const workbook = XLSX.read(buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     let data: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

//     // Apply column mapping
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
//       } = row;

//       // Validate required fields
//       if (!employee_id || !month || !basic) {
//         results.push({
//           employee_id,
//           month,
//           status: "failed",
//           reason: "Missing required fields",
//         });
//         continue;
//       }

//       const employee = await Onboarding.findOne({
//         where: { id: employee_id, company_code },
//       });

//       if (!employee) {
//         results.push({
//           employee_id,
//           month,
//           status: "failed",
//           reason: "Employee not found",
//         });
//         continue;
//       }

//       const net_salary =
//         Number(basic) +
//         Number(hra) +
//         Number(allowances) +
//         Number(bonus) -
//         Number(deductions);

//       // Create or update salary
//       const [salary] = await Salary.upsert(
//         {
//           employee_id,
//           company_code,
//           month,
//           basic,
//           hra,
//           allowances,
//           deductions,
//           bonus,
//           net_salary,
//           generated_by: req.user.id,
//         },
//         { returning: true }
//       );

//       // Generate salary slip
//       const urls = await createSalarySlip(
//         salary,
//         employee,
//         (req.query.template as string) || "standard"
//       );
//       salary.salary_slip = urls.pdf ?? null;
//       await salary.save();

//       results.push({
//         employee_id,
//         month,
//         status: "success",
//         salary_id: salary.id,
//       });
//     }
//     console.log("Parsed Data:", data[0]);
//     console.log("Mapping:", mapping);

//     return res.status(200).json({ message: "Bulk upload processed", results });
//   } catch (error: any) {
//     return res
//       .status(500)
//       .json({ message: "Error in bulk upload", error: error.message });
//   }
// };

// const exportSalaryData = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const company_code = req.user.company_code;

//     // ✅ Step 1: Token se jo company_code aa raha hai usko log karo
//     console.log("🔑 Token Company Code:", company_code);

//     if (!company_code) {
//       return res.status(400).json({ message: "Company code missing in token" });
//     }

//     // ✅ Step 2: DB query chalane se pehle log karo
//     console.log("📡 Fetching salaries for company_code:", company_code);

//     const salaries = await Salary.findAll({
//       where: { company_code },
//       raw: true,
//     });

//     // ✅ Step 3: DB se kya result aa raha hai wo log karo
//     console.log("🗂️ Salaries Fetched:", salaries);

//     if (!salaries || salaries.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No salary records found for this company" });
//     }

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
//     console.error("❌ Export Error:", error);
//     return res.status(500).json({
//       message: "Error exporting salary data",
//       error: error.message,
//     });
//   }
// };


const createSalary = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      employee_id,
      month,
      basic,
      hra = 0,
      allowances = 0,
      deductions = 0,
      bonus = 0,
      // optional incoming fields: pf_esic_pt, employer_pf (may be passed or left to calculate externally)
      pf_esic_pt = 0,
      employer_pf = 0,
    } = req.body;
    const company_code = req.user.company_code;

    const employee = await Onboarding.findOne({
      where: { id: employee_id, company_code },
    });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // Compute sums
    const numBasic = Number(basic);
    const numHra = Number(hra || 0);
    const numAllow = Number(allowances || 0);
    const numBonus = Number(bonus || 0);
    const numDed = Number(deductions || 0);
    const numPfEmp = Number(pf_esic_pt || 0);
    const numEmployerPf = Number(employer_pf || 0);

    // Gross = basic + hra + allowances + bonus
    const gross = numBasic + numHra + numAllow + numBonus;

    // Net salary = gross - (deductions + employee PF/ESIC/PT)
    const net_salary = gross - (numDed + numPfEmp);

    // CTC = gross + employer contributions (like employer_pf)
    const ctc = gross + numEmployerPf;

    const salary = await Salary.create({
      employee_id,
      company_code,
      month,
      basic: numBasic,
      hra: numHra,
      allowances: numAllow,
      deductions: numDed,
      bonus: numBonus,
      gross,
      pf_esic_pt: numPfEmp,
      employer_pf: numEmployerPf,
      ctc,
      net_salary,
      generated_by: req.user.id,
    });

    // ✅ Generate Salary Slip
    const urls = await createSalarySlip(
      salary,
      employee,
      (req.query.template as string) || "standard"
    );
    salary.salary_slip = urls.pdf ?? null;
    await salary.save();

    return res
      .status(201)
      .json({ message: "Salary created & slip generated", data: salary, urls });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Error creating salary", error: error.message });
  }
};

interface ColumnMapping {
  [key: string]: string; // file column name → model field
}

const bulkUploadSalaryAdvanced = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const company_code = req.user.company_code;
    const buffer = req.file.buffer;

    let mapping: ColumnMapping = {};
    if (req.body.mapping) {
      try {
        mapping = JSON.parse(req.body.mapping); // mapping example: {"EmployeeID":"employee_id","Month":"month","Basic":"basic","HRA":"hra","Allowances":"allowances","Deductions":"deductions","Bonus":"bonus","PF/ESIC/PT":"pf_esic_pt","Employer PF":"employer_pf"}
      } catch (err) {
        console.error("Invalid mapping JSON:", req.body.mapping);
      }
    }

    // Read Excel/CSV file
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    let data: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    // Apply column mapping if provided
    if (Object.keys(mapping).length > 0) {
      data = data.map((row) => {
        const newRow: any = {};
        for (const [fileCol, modelCol] of Object.entries(mapping)) {
          newRow[modelCol] = row[fileCol] ?? null;
        }
        return newRow;
      });
    }

    const results: any[] = [];

    for (const row of data) {
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
      } = row;

      // Validate required fields
      if (!employee_id || !month || !basic) {
        results.push({
          employee_id,
          month,
          status: "failed",
          reason: "Missing required fields (employee_id / month / basic)",
        });
        continue;
      }

      const employee = await Onboarding.findOne({
        where: { id: employee_id, company_code },
      });

      if (!employee) {
        results.push({
          employee_id,
          month,
          status: "failed",
          reason: "Employee not found",
        });
        continue;
      }

      const numBasic = Number(basic);
      const numHra = Number(hra || 0);
      const numAllow = Number(allowances || 0);
      const numBonus = Number(bonus || 0);
      const numDed = Number(deductions || 0);
      const numPfEmp = Number(pf_esic_pt || 0);
      const numEmployerPf = Number(employer_pf || 0);

      const gross = numBasic + numHra + numAllow + numBonus;
      const net_salary = gross - (numDed + numPfEmp);
      const ctc = gross + numEmployerPf;

      // Create or update salary
      const [salary] = await Salary.upsert(
        {
          employee_id,
          company_code,
          month,
          basic: numBasic,
          hra: numHra,
          allowances: numAllow,
          deductions: numDed,
          bonus: numBonus,
          gross,
          pf_esic_pt: numPfEmp,
          employer_pf: numEmployerPf,
          ctc,
          net_salary,
          generated_by: req.user.id,
        },
        { returning: true }
      );

      // Generate salary slip
      const urls = await createSalarySlip(
        salary,
        employee,
        (req.query.template as string) || "standard"
      );
      salary.salary_slip = urls.pdf ?? null;
      await salary.save();

      results.push({
        employee_id,
        month,
        status: "success",
        salary_id: salary.id,
      });
    }
    console.log("Parsed Data Sample:", data[0]);
    console.log("Mapping:", mapping);

    return res.status(200).json({ message: "Bulk upload processed", results });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Error in bulk upload", error: error.message });
  }
};

const exportSalaryData = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const company_code = req.user.company_code;
    console.log("🔑 Token Company Code:", company_code);

    if (!company_code) {
      return res.status(400).json({ message: "Company code missing in token" });
    }

    console.log("📡 Fetching salaries for company_code:", company_code);

    const salaries = await Salary.findAll({
      where: { company_code },
      raw: true,
    });

    console.log("🗂️ Salaries Fetched:", salaries?.length);

    if (!salaries || salaries.length === 0) {
      return res
        .status(404)
        .json({ message: "No salary records found for this company" });
    }

    // The model now contains new fields; json_to_sheet will include them automatically
    const worksheet = XLSX.utils.json_to_sheet(salaries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salaries");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="salary_export_${company_code}.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(excelBuffer);
  } catch (error: any) {
    console.error("❌ Export Error:", error);
    return res.status(500).json({
      message: "Error exporting salary data",
      error: error.message,
    });
  }
};


const getCurrentMonth = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
};

/**
 * Update salary (only for current month)
 * URL: PUT /api/salary/:id
 * Body: any of the numeric fields (basic, hra, allowances, deductions, bonus, pf_esic_pt, employer_pf)
 */
const updateSalary = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;
    const updates = req.body;

    // Find salary and ensure it belongs to the company
    const salary = await Salary.findOne({ where: { id, company_code } });
    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    // Allow update only if salary.month === current month
    const currentMonth = getCurrentMonth();
    if (salary.month !== currentMonth) {
      return res.status(403).json({
        message:
          "Only current month's salary can be updated. Operation denied for past months.",
      });
    }

    // Allowed fields to update
    const allowedFields = [
      "basic",
      "hra",
      "allowances",
      "deductions",
      "bonus",
      "pf_esic_pt",
      "employer_pf",
    ];

    // Apply numeric conversions and assign
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        // convert to Number to avoid string issues from Postman/form
        // If client sends null intentionally, treat as 0
        const val = updates[key] === null ? 0 : Number(updates[key]);
        (salary as any)[key] = isNaN(val) ? 0 : val;
      }
    }

    // Recalculate computed fields
    const numBasic = Number(salary.basic || 0);
    const numHra = Number(salary.hra || 0);
    const numAllow = Number(salary.allowances || 0);
    const numBonus = Number(salary.bonus || 0);
    const numDed = Number(salary.deductions || 0);
    const numPfEmp = Number(salary.pf_esic_pt || 0);
    const numEmployerPf = Number(salary.employer_pf || 0);

    const gross = numBasic + numHra + numAllow + numBonus;
    const net_salary = gross - (numDed + numPfEmp);
    const ctc = gross + numEmployerPf;

    salary.gross = gross;
    salary.net_salary = net_salary;
    salary.ctc = ctc;

    await salary.save();

    // Optionally regenerate slip if you want up-to-date PDF
    // If you want to always regenerate slip on update, uncomment below:
    // const employee = await Onboarding.findOne({ where: { id: salary.employee_id, company_code }});
    // const urls = await createSalarySlip(salary, employee, (req.query.template as string) || "standard");
    // salary.salary_slip = urls.pdf ?? null;
    // await salary.save();

    return res
      .status(200)
      .json({ message: "Salary updated", data: salary });
  } catch (error: any) {
    console.error("❌ updateSalary error:", error);
    return res
      .status(500)
      .json({ message: "Error updating salary", error: error.message });
  }
};

/**
 * Delete salary (only for current month)
 * URL: DELETE /api/salary/:id
 */
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

    const currentMonth = getCurrentMonth();
    if (salary.month !== currentMonth) {
      return res.status(403).json({
        message:
          "Only current month's salary can be deleted. Deleting past months is not allowed.",
      });
    }

    // Hard delete
    await salary.destroy();

    // If you prefer soft-delete, replace above with salary.update({ deletedAt: new Date() }) and enable paranoid model

    return res.status(200).json({ message: "Salary deleted successfully" });
  } catch (error: any) {
    console.error("❌ deleteSalary error:", error);
    return res
      .status(500)
      .json({ message: "Error deleting salary", error: error.message });
  }
};

const getAllSalaries = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const company_code = req.user.company_code;
    if (!company_code) {
      return res.status(400).json({ message: "Company code missing in token" });
    }

    // Optional query filters
    const {
      month, // e.g., "2025-11"
      employee_id, // optional
      page = "1",
      limit = "50",
      sortBy = "createdAt", // or "month" or "employee_id"
      order = "DESC", // ASC or DESC
    } = req.query as any;

    const where: any = { company_code };

    if (month) where.month = month;
    if (employee_id) where.employee_id = employee_id;

    // Parse pagination
    const pageNum = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Math.min(Number(limit) || 50, 1000), 1);
    const offset = (pageNum - 1) * pageSize;

    // Safe sort column mapping (prevent raw injection)
    const allowedSortFields = ["createdAt", "month", "employee_id", "gross", "net_salary"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Use findAndCountAll for pagination metadata
   const { rows: salaries, count } = await Salary.findAndCountAll({
  where,
  order: [[sortField, sortOrder]],
  offset,
  limit: pageSize,
  raw: true,
});


    return res.status(200).json({
      data: salaries,
      meta: {
        total: count,
        page: pageNum,
        limit: pageSize,
        pages: Math.ceil(count / pageSize),
      },
    });
  } catch (error: any) {
    console.error("❌ getAllSalaries error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching salaries", error: error.message });
  }
};

export {
  createSalary,
  getEmployeeSlips,
  downloadSlip,
  bulkUploadSalaryAdvanced,
  exportSalaryData,
  updateSalary,
  deleteSalary,
  getAllSalaries
};
