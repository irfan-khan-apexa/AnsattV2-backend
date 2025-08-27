import { Request, Response } from "express";
import { Salary, Onboarding } from "../../models/index";
import { CompanyRequest } from "../../../middlewares/authMiddleware";
import { createSalarySlip } from "../../../services/generateSalarySlip";
import { decrypt } from "../../../utils/encryption";
import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
import XLSX from "xlsx";

const createSalary = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { employee_id, month, basic, hra, allowances, deductions, bonus } =
      req.body;
    const company_code = req.user.company_code;

    const employee = await Onboarding.findOne({
      where: { id: employee_id, company_code },
    });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const net_salary =
      basic + (hra || 0) + (allowances || 0) + (bonus || 0) - (deductions || 0);

    const salary = await Salary.create({
      employee_id,
      company_code,
      month,
      basic,
      hra,
      allowances,
      deductions,
      bonus,
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

    // Optional: column mapping from query
    // Example: ?mapping[EmployeeID]=employee_id&mapping[Month]=month

    // const mapping: ColumnMapping = req.body.mapping || {};

    // bulkUploadSalaryAdvanced function ke andar
    let mapping: ColumnMapping = {};
    if (req.body.mapping) {
      try {
        mapping = JSON.parse(req.body.mapping); // 👈 yeh line add karo
      } catch (err) {
        console.error("Invalid mapping JSON:", req.body.mapping);
      }
    }

    // Read Excel/CSV file
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    let data: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    // Apply column mapping
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
      } = row;

      // Validate required fields
      if (!employee_id || !month || !basic) {
        results.push({
          employee_id,
          month,
          status: "failed",
          reason: "Missing required fields",
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

      const net_salary =
        Number(basic) +
        Number(hra) +
        Number(allowances) +
        Number(bonus) -
        Number(deductions);

      // Create or update salary
      const [salary] = await Salary.upsert(
        {
          employee_id,
          company_code,
          month,
          basic,
          hra,
          allowances,
          deductions,
          bonus,
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
    console.log("Parsed Data:", data[0]);
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

    // ✅ Step 1: Token se jo company_code aa raha hai usko log karo
    console.log("🔑 Token Company Code:", company_code);

    if (!company_code) {
      return res.status(400).json({ message: "Company code missing in token" });
    }

    // ✅ Step 2: DB query chalane se pehle log karo
    console.log("📡 Fetching salaries for company_code:", company_code);

    const salaries = await Salary.findAll({
      where: { company_code },
      raw: true,
    });

    // ✅ Step 3: DB se kya result aa raha hai wo log karo
    console.log("🗂️ Salaries Fetched:", salaries);

    if (!salaries || salaries.length === 0) {
      return res
        .status(404)
        .json({ message: "No salary records found for this company" });
    }

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

export {
  createSalary,
  getEmployeeSlips,
  downloadSlip,
  bulkUploadSalaryAdvanced,
  exportSalaryData
};
