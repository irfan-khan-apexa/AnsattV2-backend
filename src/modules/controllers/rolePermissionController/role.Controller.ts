import { Request, Response } from "express";
import { Role } from "../../models/index";

const createRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Role name (string) is required" });
    }

    const existing = await Role.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: "Role name already exists" });
    }

    const role = await Role.create({ name, description });

    res.status(201).json({ message: "Role created successfully", role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating role" });
  }
};
// ✅ Get All Roles
const getAllRoles = async (req: Request, res: Response): Promise<any> => {
  try {
    const roles = await Role.findAll();
    res.status(200).json({ roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching roles" });
  }
};

const updateRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (name) role.name = name;
    if (description) role.description = description;

    await role.save();

    res.status(200).json({ message: "Role updated successfully", role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating role" });
  }
};

const deleteRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const deleted = await Role.destroy({ where: { id } });

    res.status(200).json({ message: "Role deleted", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting role" });
  }
};

export { createRole, getAllRoles, updateRole, deleteRole };
