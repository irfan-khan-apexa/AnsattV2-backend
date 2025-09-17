// controllers/department.controller.ts
import { Request, Response } from "express";
import { Department,Onboarding } from "../../models/index";

 const createDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, managerId } = req.body;
    const companyCode = (req as any).user.company_code;

    if (!name || !managerId) {
      return res.status(400).json({ message: "Name and Manager are required" });
    }

    // check manager exists in same company
    const manager = await Onboarding.findOne({
      where: { id: managerId, company_code: companyCode },
    });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found in this company" });
    }

    const dept = await Department.create({
      name,
      managerId,
      companyCode,
    });

    res.status(201).json({ message: "Department created", department: dept });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

 const getDepartments = async (req: Request, res: Response): Promise<any> => {
  try {
    const companyCode = (req as any).user.company_code;

    const depts = await Department.findAll({
      where: { companyCode },
      include: [{ model: Onboarding, as: "manager", attributes: ["id", "name", "email"] }],
    });

    res.status(200).json(depts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

 const updateDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, managerId } = req.body;
    const companyCode = (req as any).user.company_code;

    const dept = await Department.findOne({ where: { id, companyCode } });
    if (!dept) return res.status(404).json({ message: "Department not found" });

    if (managerId) {
      const manager = await Onboarding.findOne({
        where: { id: managerId, company_code: companyCode },
      });
      if (!manager) {
        return res.status(404).json({ message: "Manager not found in this company" });
      }
    }

    await dept.update({ name, managerId });
    res.status(200).json({ message: "Department updated", department: dept });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

 const deleteDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const companyCode = (req as any).user.company_code;

    const dept = await Department.findOne({ where: { id, companyCode } });
    if (!dept) return res.status(404).json({ message: "Department not found" });

    await dept.destroy();
    res.status(200).json({ message: "Department deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export {createDepartment,getDepartments,updateDepartment,deleteDepartment };