import { Request, Response } from "express";
import { Policy } from "../../models/index";

// Create Policy
const createPolicy = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, content, department, role } = req.body;

    if (!title || !content || !department || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const policy = await Policy.create({ title, content, department, role });
    res.status(201).json({ message: "Policy created", policy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating policy" });
  }
};

// Get All Policies
const getAllPolicies = async (req: Request, res: Response): Promise<any> => {
  try {
    const policies = await Policy.findAll();
    res.status(200).json(policies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching policies" });
  }
};

// Get Single Policy
const getPolicyById = async (req: Request, res: Response): Promise<any> => {
  try {
    const policy = await Policy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.status(200).json(policy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching policy" });
  }
};

// Update Policy
const updatePolicy = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, content, department, role } = req.body;
    const policy = await Policy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    await policy.update({ title, content, department, role });
    res.status(200).json({ message: "Policy updated", policy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating policy" });
  }
};

// Delete Policy
const deletePolicy = async (req: Request, res: Response): Promise<any> => {
  try {
    const policy = await Policy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    await policy.destroy();
    res.status(200).json({ message: "Policy deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting policy" });
  }
};
export {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
};
