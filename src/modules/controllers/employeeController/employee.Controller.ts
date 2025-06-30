import { Request, Response } from "express";
import { Employee } from "../../models/index";
import {
  AuthenticatedRequest,
  CompanyRequest,
} from "../../../middlewares/authMiddleware";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RoleModuleAccess } from "../../../config/roleModuleAccess";

const createEmployee = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { name, email, contact, role, password } = req.body;

    const company_code = req.user.company_code;
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Check required fields
    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const employee = await Employee.create({
      name,
      email,
      contact,
      role,
      company_code,
      password: hashedPassword,
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

const loginEmployee = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await Employee.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: "employee", company_code: user.company_code },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
const getEmployeeModules = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userRole = req.user.role;

    // Normalize role (e.g., developer -> Developer)
    const normalizedRole =
      userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase();

    const modules = RoleModuleAccess[normalizedRole];

    if (!modules) {
      return res
        .status(404)
        .json({ message: "Role not found or has no modules" });
    }

    return res.status(200).json({ role: normalizedRole, modules });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching modules" });
  }
};

export {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  getEmployeeModules,
};
