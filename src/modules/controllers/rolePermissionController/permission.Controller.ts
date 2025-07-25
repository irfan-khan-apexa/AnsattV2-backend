import { Request, Response } from "express";
import { Permission } from "../../models/index";

const createPermission = async (req: Request, res: Response): Promise<any> => {
  try {
    const { field, allowed } = req.body;

    if (!field) return res.status(400).json({ message: "Field is required" });

    const existing = await Permission.findOne({ where: { field } });
    if (existing)
      return res.status(409).json({ message: "Permission already exists" });

    const permission = await Permission.create({
      field,
      allowed: allowed ?? false,
    });

    res.status(201).json({ message: "Permission created", permission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating permission" });
  }
};

const getAllPermissions = async (
  _req: Request,
  res: Response
): Promise<any> => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json({ permissions });
  } catch (err) {
    res.status(500).json({ message: "Error fetching permissions" });
  }
};

export { createPermission, getAllPermissions };
