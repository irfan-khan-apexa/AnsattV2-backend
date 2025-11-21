import { Request, Response } from "express";
import { Policy } from "../../models/index";

// Create Policy
const createPolicy = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, content, department, role } = req.body;
    const company_code = (req as any).user.company_code; // <-- from token

    if (!title || !content || !department || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const policy = await Policy.create({
      title,
      content,
      department,
      role,
      company_code, // <-- save company
    });

    res.status(201).json({ message: "Policy created", policy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating policy" });
  }
};


// Get All Policies
const getAllPolicies = async (req: Request, res: Response): Promise<any> => {
  try {
    const company_code = (req as any).user.company_code;

    const policies = await Policy.findAll({
      where: { company_code },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(policies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching policies" });
  }
};

// Get Single Policy
const getPolicyById = async (req: Request, res: Response): Promise<any> => {
  try {
    const company_code = (req as any).user.company_code;

    const policy = await Policy.findOne({
      where: { id: req.params.id, company_code }, // <-- restrict by company
    });

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
    const company_code = (req as any).user.company_code;
    const { title, content, department, role } = req.body;

    const policy = await Policy.findOne({
      where: { id: req.params.id, company_code }, // ensure correct company
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found or unauthorized" });
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
    const company_code = (req as any).user.company_code;

    const policy = await Policy.findOne({
      where: { id: req.params.id, company_code }, // restrict
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found or unauthorized" });
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
