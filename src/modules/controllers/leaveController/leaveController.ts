import { Request, Response } from "express";
import { Leave } from "../../models";
import { Op } from "sequelize";

// Apply for Leave (Employee)
const applyLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    const employeeId = (req as any).user.id;
    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const leave = await Leave.create({
      employeeId,
      type,
      startDate,
      endDate,
      reason,
      status: "Pending",
    });

    res.status(201).json({ message: "Leave applied", leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error applying leave" });
  }
};

// Get My Leaves (Employee)
const getMyLeaves = async (req: Request, res: Response): Promise<any> => {
  try {
    const employeeId = (req as any).user.id;
    const leaves = await Leave.findAll({ where: { employeeId } });
    res.status(200).json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

// Get All Leaves (HR/Manager)
// GET /api/leaves?page=1&limit=10&search=fever&status=Pending&type=Sick&start=2025-07-01&end=2025-07-10
const getAllLeaves = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      status,
      type,
      start,
      end,
    } = req.query;

    const whereClause: any = {};

    // Filters
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;
    if (search) {
      whereClause.reason = { [Op.like]: `%${search}%` };
    }
    if (start && end) {
      whereClause.startDate = {
        [Op.between]: [start, end],
      };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const { rows: leaves, count: total } = await Leave.findAndCountAll({
      where: whereClause,
      offset,
      limit: limitNum,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      total,
      page: pageNum,
      pageSize: limitNum,
      leaves,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

// Approve Leave
const approveLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = "Approved";
    await leave.save();

    res.status(200).json({ message: "Leave approved", leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving leave" });
  }
};

// Reject Leave
const rejectLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = "Rejected";
    await leave.save();

    res.status(200).json({ message: "Leave rejected", leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting leave" });
  }
};

export { applyLeave, getMyLeaves, getAllLeaves, approveLeave, rejectLeave };
