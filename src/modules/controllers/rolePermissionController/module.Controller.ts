import { Request, Response } from "express";
import { Module } from "../../models/index";

const createModule = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Module name is required" });
    }

    const module = await Module.create({ name });

    res.status(201).json({ message: "Module created", module });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating module" });
  }
};
export { createModule };
