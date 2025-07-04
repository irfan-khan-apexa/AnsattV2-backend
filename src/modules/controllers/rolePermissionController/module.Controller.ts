import { Request, Response } from "express";
import Module from "../../models/rolePermission/module.model";

//  Create Module
const createModule = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Module name (string) is required" });
    }

    const existing = await Module.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: "Module name already exists" });
    }

    const module = await Module.create({ name, description });

    res.status(201).json({ message: "Module created successfully", module });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating module" });
  }
};

//  Get All Modules
const getAllModules = async (req: Request, res: Response): Promise<any> => {
  try {
    const modules = await Module.findAll();
    res.status(200).json({ modules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching modules" });
  }
};

//  Update Module
const updateModule = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const module = await Module.findByPk(id);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    if (name) module.name = name;
    if (description) module.description = description;

    await module.save();

    res.status(200).json({ message: "Module updated successfully", module });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating module" });
  }
};

//  Delete Module
const deleteModule = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const module = await Module.findByPk(id);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    await module.destroy();

    res.status(200).json({ message: "Module deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting module" });
  }
};

export { createModule, getAllModules, updateModule, deleteModule };
