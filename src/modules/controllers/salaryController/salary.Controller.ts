import { Request, Response } from "express";
import { Salary, Onboarding } from "../../models/index";
import { CompanyRequest } from "../../../middlewares/authMiddleware";
import { createSalarySlip } from "../../../services/generateSalarySlip";
import XLSX from "xlsx";
import { audit } from "../../../helpers/audit.helper";
import { getSignedUrl } from "../../../services/uploadfileService";
import { decrypt } from "../../../utils/encryption";

const getEmployeeSlips = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { employee_id } = req.params;

    const { company_code } = req.user;

    const salaries = await Salary.findAll({
      where: {
        employee_id,
        company_code,
      },
    });

    return res.status(200).json({
      data: salaries,
    });
  } catch {
    return res.status(500).json({
      message: "Error fetching salary slips",
    });
  }
};

const downloadSlip = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id, format } = req.params;

    const { company_code } = req.user;

    // ================= VALIDATE FORMAT =================
    if (!["pdf", "docx"].includes(format)) {
      return res.status(400).json({
        message: "Invalid format",
      });
    }

    // ================= FIND SALARY =================
    const salary = await Salary.findOne({
      where: {
        id,
        company_code,
      },
    });

    if (!salary || !salary.salary_slip) {
      return res.status(404).json({
        message: "Salary slip not found",
      });
    }

    // ================= PARSE STORED JSON =================
    let parsed: any;

    try {
      parsed = JSON.parse(salary.salary_slip);
    } catch {
      parsed = {
        pdf: salary.salary_slip,
      };
    }

    // ================= GET ENCRYPTED FILE ID =================
    let encryptedFileId = "";

    if (format === "pdf") {
      encryptedFileId = parsed.pdf;
    }

    if (format === "docx") {
      encryptedFileId = parsed.docx;
    }

    if (!encryptedFileId) {
      return res.status(404).json({
        message: `${format} file not found`,
      });
    }

    console.log(
      "ENCRYPTED FILE ID:",
      encryptedFileId
    );

    // ================= DECRYPT FILE ID =================
    let decryptedFileId = "";

    try {
      decryptedFileId =
        decrypt(encryptedFileId);

      console.log(
        "DECRYPTED FILE ID:",
        decryptedFileId
      );
    } catch (decryptError: any) {
      console.log(
        "DECRYPT ERROR:",
        decryptError.message
      );

      return res.status(500).json({
        message:
          "Failed to decrypt file ID",
      });
    }

    // ================= GET SIGNED URL =================
    const signedUrl =
      await getSignedUrl(
        decryptedFileId
      );

    return res.status(200).json({
      url: signedUrl,
    });
  } catch (err: any) {
    console.log(err);

    return res.status(500).json({
      message:
        "Error downloading slip",
      error: err.message,
    });
  }
};

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
      pf_esic_pt = 0,
      employer_pf = 0,
    } = req.body;

    const company_code =
      req.user.company_code;

    const employee =
      await Onboarding.findOne({
        where: {
          id: employee_id,
          company_code,
        },
      });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const numBasic =
      Number(basic);

    const numHra =
      Number(hra || 0);

    const numAllow =
      Number(allowances || 0);

    const numBonus =
      Number(bonus || 0);

    const numDed =
      Number(deductions || 0);

    const numPfEmp =
      Number(pf_esic_pt || 0);

    const numEmployerPf =
      Number(employer_pf || 0);

    const gross =
      numBasic +
      numHra +
      numAllow +
      numBonus;

    const net_salary =
      gross -
      (numDed + numPfEmp);

    const ctc =
      gross + numEmployerPf;

    const salary =
      await Salary.create({
        employee_id,
        company_code,
        month,

        basic: numBasic,

        hra: numHra,

        allowances: numAllow,

        deductions: numDed,

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

    const template =
      (req.query
        .template as string) ||
      "standard";

    const urls =
      await createSalarySlip(
        salary,
        employee,
        template
      );

    console.log(
      "SALARY URLS:",
      urls
    );

    salary.salary_slip =
      JSON.stringify({
        pdf:
          urls.pdf || "",

        docx:
          urls.docx || "",
      });

    await salary.save();

    await audit(req, {
      module: "salary",
      action: "create",
      record_id:
        salary.id,
      new_value:
        salary.toJSON(),
    });

    return res.status(201).json({
      message:
        "Salary created & slip generated successfully",

      selectedTemplate:
        template,

      data: salary,

      urls,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      message:
        "Error creating salary",

      error:
        error.message,
    });
  }
};

const updateSalary = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const company_code =
      req.user.company_code;

    const salary =
      await Salary.findOne({
        where: {
          id,
          company_code,
        },
      });

    if (!salary) {
      return res.status(404).json({
        message:
          "Salary record not found",
      });
    }

    const oldData =
      salary.toJSON();

    await salary.update(
      req.body
    );

    await audit(req, {
      module: "salary",
      action: "update",
      record_id:
        salary.id,
      old_value:
        oldData,
      new_value:
        salary.toJSON(),
    });

    return res.status(200).json({
      message:
        "Salary updated",
      data: salary,
    });
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Error updating salary",
      error:
        error.message,
    });
  }
};

const deleteSalary = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const company_code =
      req.user.company_code;

    const salary =
      await Salary.findOne({
        where: {
          id,
          company_code,
        },
      });

    if (!salary) {
      return res.status(404).json({
        message:
          "Salary record not found",
      });
    }

    const oldData =
      salary.toJSON();

    await salary.destroy();

    await audit(req, {
      module: "salary",
      action: "delete",
      record_id:
        oldData.id,
      old_value:
        oldData,
    });

    return res.status(200).json({
      message:
        "Salary deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Error deleting salary",
      error:
        error.message,
    });
  }
};

const getAllSalaries = async (
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
      });

    return res.status(200).json({
      data: salaries,
    });
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Error fetching salaries",
      error:
        error.message,
    });
  }
};

const bulkUploadSalaryAdvanced =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            "Excel file required",
        });
      }

      const workbook =
        XLSX.read(
          req.file.buffer
        );

      const sheetName =
        workbook.SheetNames[0];

      const data =
        XLSX.utils.sheet_to_json(
          workbook.Sheets[
            sheetName
          ]
        );

      return res.status(200).json({
        message:
          "Bulk salary upload processed successfully",

        total:
          data.length,

        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        message:
          "Bulk upload failed",

        error:
          error.message,
      });
    }
  };

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

    const buffer =
      XLSX.write(
        workbook,
        {
          type: "buffer",
          bookType:
            "xlsx",
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

    return res.send(
      buffer
    );
  } catch (error: any) {
    return res.status(500).json({
      message:
        "Export failed",

      error:
        error.message,
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
  exportSalaryData,
};