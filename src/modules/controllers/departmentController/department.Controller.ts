import { Request, Response } from "express";
import { Department, Onboarding } from "../../models/index";
import { audit } from "../../../helpers/audit.helper";

/* ================= CREATE DEPARTMENT ================= */
const createDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, HrId } = req.body;
    const companyCode = (req as any).user.company_code;

    if (!name || !HrId) {
      return res.status(400).json({ message: "Name and HrId are required" });
    }

    const existingDept = await Department.findOne({
      where: { name, companyCode },
    });
    if (existingDept) {
      return res.status(400).json({
        message: `Department with name '${name}' already exists in this company`,
      });
    }

    const hrEmployee = await Onboarding.findOne({
      where: { id: HrId, company_code: companyCode },
    });
    if (!hrEmployee) {
      return res
        .status(404)
        .json({ message: "HR Employee not found in this company" });
    }

    const department = await Department.create({
      name,
      HrId,
      companyCode,
    });

    // 🔥 AUDIT
    await audit(req, {
      module: "department",
      action: "create",
      record_id: department.id,
      new_value: department,
    });

    res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (err: any) {
    console.error("Error creating department:", err);
    res.status(500).json({ message: "Error creating department" });
  }
};

/* ================= GET ALL (NO AUDIT) ================= */
const getDepartments = async (req: Request, res: Response): Promise<any> => {
  try {
    const companyCode = (req as any).user.company_code;
    const departments = await Department.findAll({
      where: { companyCode },
    });
    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Error fetching departments" });
  }
};

/* ================= GET BY ID (NO AUDIT) ================= */
const getDepartmentById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const companyCode = (req as any).user.company_code;

    const department = await Department.findOne({
      where: { id, companyCode },
    });

    if (!department) {
      return res
        .status(404)
        .json({ message: "Department not found in this company" });
    }

    res.json(department);
  } catch (err) {
    console.error("Error fetching department:", err);
    res.status(500).json({ message: "Error fetching department" });
  }
};

/* ================= UPDATE DEPARTMENT ================= */
const updateDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, HrId } = req.body;
    const companyCode = (req as any).user.company_code;

    const department = await Department.findOne({ where: { id, companyCode } });
    if (!department) {
      return res
        .status(404)
        .json({ message: "Department not found in this company" });
    }

    const oldDept = department.toJSON();

    if (HrId) {
      const hrEmployee = await Onboarding.findOne({
        where: { id: HrId, company_code: companyCode },
      });
      if (!hrEmployee) {
        return res
          .status(404)
          .json({ message: "HR Employee not found in this company" });
      }
      department.HrId = HrId;
    }

    if (name) {
      department.name = name;
    }

    await department.save();

    //  AUDIT
    await audit(req, {
      module: "department",
      action: "update",
      record_id: department.id,
      old_value: oldDept,
      new_value: department,
    });

    res.json({ message: "Department updated", department });
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ message: "Error updating department" });
  }
};

/* ================= DELETE DEPARTMENT ================= */
const deleteDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const companyCode = (req as any).user.company_code;

    const department = await Department.findOne({
      where: { id, companyCode },
    });

    if (!department) {
      return res
        .status(404)
        .json({ message: "Department not found in this company" });
    }

    const oldDept = department.toJSON();

    await department.destroy();

    // 🔥 AUDIT
    await audit(req, {
      module: "department",
      action: "delete",
      record_id: oldDept.id,
      old_value: oldDept,
    });

    res.json({ message: "Department deleted" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ message: "Error deleting department" });
  }
};

export {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
