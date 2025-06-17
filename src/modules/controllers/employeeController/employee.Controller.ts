import { Request, Response } from "express";
import { Employee } from "../../models/index";
import { CompanyRequest } from "../../../middlewares/authMiddleware";

const createEmployee = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { name, email, contact, role } = req.body;
    const company_code = req.user.company_code;

    const employee = await Employee.create({
      name,
      email,
      contact,
      role,
      company_code,
    });

    return res.status(201).json({ employee });
  } catch (err) {
    console.error(err);
    console.log("Request body:", req.body);
    return res.status(500).json({ message: "Error creating employee" });
  }
};

const getEmployees = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const company_code = req.user.company_code;

    const employees = await Employee.findAll({ where: { company_code } });

    return res.status(200).json({ employees });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching employees" });
  }
};

const updateEmployee = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const updated = await Employee.update(req.body, {
      where: { id, company_code },
    });

    return res.status(200).json({ message: "Employee updated", updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating employee" });
  }
};

const deleteEmployee = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const deleted = await Employee.destroy({ where: { id, company_code } });

    return res.status(200).json({ message: "Employee deleted", deleted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting employee" });
  }
};

export { createEmployee, getEmployees, updateEmployee, deleteEmployee };
