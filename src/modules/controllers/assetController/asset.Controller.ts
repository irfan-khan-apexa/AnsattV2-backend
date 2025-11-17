import { Request, Response } from "express";
import { Asset, AssetAssign, Onboarding } from "../../models/index";
import { CompanyRequest } from "../../../middlewares/authMiddleware";
import Sequelize from "sequelize";

const createAsset = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const {
      name,
      asset_type,
      serial_number,
      purchase_date,
      purchase_value,
      condition,
      location,
    } = req.body;
    const company_code = req.user.company_code;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const asset = await Asset.create({
      company_code,
      name,
      asset_type,
      serial_number,
      purchase_date: purchase_date ? new Date(purchase_date) : null,
      purchase_value: purchase_value ? Number(purchase_value) : 0,
      condition,
      location,
      status: "available",
      generated_by: req.user.id,
    });

    return res.status(201).json({ message: "Asset created", data: asset });
  } catch (err: any) {
    return res.status(500).json({ message: "Error creating asset", error: err.message });
  }
};

const updateAsset = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const company_code = req.user.company_code;

    const asset = await Asset.findOne({ where: { id, company_code } });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    await asset.update(updates);
    return res.status(200).json({ message: "Asset updated", data: asset });
  } catch (err: any) {
    return res.status(500).json({ message: "Error updating asset", error: err.message });
  }
};

const deleteAsset = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;
    const asset = await Asset.findOne({ where: { id, company_code } });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    // Prevent delete if currently assigned
    if (asset.status === "assigned" || asset.assigned_to) {
      return res.status(400).json({ message: "Cannot delete an assigned asset. Return first." });
    }

    await asset.destroy();
    return res.status(200).json({ message: "Asset deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: "Error deleting asset", error: err.message });
  }
};

/** Assign (issue) asset to employee */
const assignAsset = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params; // asset id
    const { employee_id, note } = req.body;
    const company_code = req.user.company_code;

    if (!employee_id) return res.status(400).json({ message: "employee_id required" });

    const asset = await Asset.findOne({ where: { id, company_code } });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    if (asset.status === "assigned") return res.status(400).json({ message: "Asset already assigned" });

    const employee = await Onboarding.findOne({ where: { id: employee_id, company_code } });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Create assignment history
    const assignment = await AssetAssign.create({
      asset_id: asset.id,
      employee_id,
      company_code,
      issued_at: new Date(),
      issued_by: req.user.id,
      note,
      status: "issued",
    });

    // Update asset current state
    asset.assigned_to = employee_id;
    asset.status = "assigned";
    await asset.save();

    return res.status(200).json({ message: "Asset issued", data: { asset, assignment } });
  } catch (err: any) {
    return res.status(500).json({ message: "Error assigning asset", error: err.message });
  }
};

/** Return asset */
const returnAsset = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params; // asset id
    const { condition_on_return, note } = req.body;
    const company_code = req.user.company_code;

    const asset = await Asset.findOne({ where: { id, company_code } });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    if (asset.status !== "assigned" || !asset.assigned_to) {
      return res.status(400).json({ message: "Asset is not currently assigned" });
    }

    // Find latest open assignment for this asset and employee
    const assignment = await AssetAssign.findOne({
      where: { asset_id: asset.id, company_code, status: "issued" },
      order: [["issued_at", "DESC"]],
    });
    if (!assignment) {
      return res.status(404).json({ message: "Active assignment not found" });
    }

    assignment.returned_at = new Date();
    assignment.returned_by = req.user.id;
    assignment.condition_on_return = condition_on_return;
    assignment.note = note;
    assignment.status = "returned";
    await assignment.save();

    // Update asset
    asset.assigned_to = null;
    asset.status = condition_on_return && condition_on_return.toLowerCase().includes("damag") ? "maintenance" : "available";
    if (condition_on_return) asset.condition = condition_on_return;
    await asset.save();

    return res.status(200).json({ message: "Asset returned", data: { asset, assignment } });
  } catch (err: any) {
    return res.status(500).json({ message: "Error returning asset", error: err.message });
  }
};

/** Get assets assigned to an employee (current) */
const getEmployeeAssets = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const employee_id = Number(req.params.employee_id);
    const company_code = req.user.company_code;

    if (!employee_id) {
      return res.status(400).json({ message: "Invalid employee_id" });
    }

    const assets = await Asset.findAll({
      where: { assigned_to: employee_id, company_code }
    });

    return res.status(200).json({ data: assets });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error fetching employee assets",
      error: err.message
    });
  }
};


/** Get full assignment history for an asset */
const getAssetHistory = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const history = await AssetAssign.findAll({
      where: { asset_id: id, company_code },
      order: [["issued_at", "DESC"]],
      raw: true,
    });
    return res.status(200).json({ data: history });
  } catch (err: any) {
    return res.status(500).json({ message: "Error fetching asset history", error: err.message });
  }
};

/** Get all assets for company with optional filters */
const getAllAssets = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const company_code = req.user.company_code;
    const { status, employee_id, page = "1", limit = "50" } = req.query as any;
    const where: any = { company_code };

    if (status) where.status = status;
    if (employee_id) where.assigned_to = employee_id;

    const pageNum = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Math.min(Number(limit) || 50, 1000), 1);
    const offset = (pageNum - 1) * pageSize;

    const { rows, count } = await Asset.findAndCountAll({ where, offset, limit: pageSize, order: [["createdAt", "DESC"]], raw: true });

    return res.status(200).json({ data: rows, meta: { total: count, page: pageNum, pages: Math.ceil(count / pageSize) } });
  } catch (err: any) {
    return res.status(500).json({ message: "Error fetching assets", error: err.message });
  }
};

export {
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset,
  getEmployeeAssets,
  getAssetHistory,
  getAllAssets,
};
