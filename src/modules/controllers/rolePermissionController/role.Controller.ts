import { Request, Response } from "express";
import { Role } from "../../models/index";

const createRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const role = await Role.create({ name });

    res.status(201).json({ message: "Role created", role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating role" });
  }
};

export { createRole };
