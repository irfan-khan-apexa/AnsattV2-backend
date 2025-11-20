import { Request, Response } from "express";
import {Permission} from "../../models/index";
import { CompanyRequest } from "../../../middlewares/authMiddleware";
import { Op } from "sequelize";

// CREATE
 const createPermission = async (req: CompanyRequest, res: Response):Promise<any> => {
  try {
    const { key, description } = req.body;
    const company_code = req.user.company_code;

    if (!key) return res.status(400).json({ message: "key required" });

    const exists = await Permission.findOne({ where: { key, company_code } });
    if (exists) return res.status(400).json({ message: "Permission already exists" });

    const perm = await Permission.create({ key, description, company_code });
    return res.status(201).json({ message: "Permission created", data: perm });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// LIST
 const listPermissions = async (req: CompanyRequest, res: Response):Promise<any> => {
  try {
    const company_code = req.user.company_code;

    const perms = await Permission.findAll({
      where: { company_code },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ data: perms });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// GET SINGLE
 const getPermission = async (req: CompanyRequest, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const perm = await Permission.findOne({ where: { id, company_code } });
    if (!perm) return res.status(404).json({ message: "Not found" });

    return res.status(200).json({ data: perm });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE
 const updatePermission = async (req: CompanyRequest, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;
    const updates = req.body;

    const perm = await Permission.findOne({ where: { id, company_code } });
    if (!perm) return res.status(404).json({ message: "Not found" });

    await perm.update(updates);
    return res.status(200).json({ message: "Updated", data: perm });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE
 const deletePermission = async (req: CompanyRequest, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const perm = await Permission.findOne({ where: { id, company_code } });
    if (!perm) return res.status(404).json({ message: "Not found" });

    await perm.destroy();
    return res.status(200).json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


 export {
  createPermission,
  listPermissions,
  getPermission,
  updatePermission,
  deletePermission,
};
