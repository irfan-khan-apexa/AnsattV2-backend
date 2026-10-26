import { Request, Response } from "express";
import { Shift } from "../../models/index";

/**
 * Create shift
 */
const createShift = async (req: Request, res: Response): Promise<any> => {
  try {
    const company_code = (req as any).user.company_code;

    const {
      shiftCode,
      shiftName,
      shiftType,
      startTime,
      endTime,
      totalHours,
      isActive,
    } = req.body;

    // Check duplicate shift code within the same company
    if (shiftCode) {
      const duplicate = await Shift.findOne({
        where: {
          companyCode: company_code,
          shiftCode,
        },
      });

      if (duplicate) {
        return res.status(400).json({
          message: "Shift code already exists for this company",
        });
      }
    }

    const shift = await Shift.create({
      companyCode: company_code,
      shiftCode,
      shiftName,
      shiftType,
      startTime,
      endTime,
      totalHours,
      isActive: isActive ?? true,
    });

    return res.status(201).json({
      message: "Shift created successfully",
      shift,
    });
  } catch (error: any) {
    console.error("Create Shift error:", error);

    return res.status(500).json({
      message: "Failed to create shift",
    });
  }
};

/**
 * Get all shifts belonging to the logged-in company
 */
const getShifts = async (req: Request, res: Response): Promise<any> => {
  try {
    const company_code = (req as any).user.company_code;

    const shifts = await Shift.findAll({
      where: {
        companyCode: company_code,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(shifts);
  } catch (error: any) {
    console.error("Get Shifts error:", error);

    return res.status(500).json({
      message: "Failed to fetch shifts",
    });
  }
};

/**
 * Get a single shift belonging to the logged-in company
 */
const getShiftbyId = async (req: Request, res: Response): Promise<any> => {
  try {
    const company_code = (req as any).user.company_code;
    const { id } = req.params;

    const shift = await Shift.findOne({
      where: {
        id,
        companyCode: company_code,
      },
    });

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    return res.status(200).json(shift);
  } catch (error: any) {
    console.error("Get Shift error:", error);

    return res.status(500).json({
      message: "Failed to fetch shift",
    });
  }
};

/**
 * Update shift
 */
const updateShift = async (req: Request, res: Response): Promise<any> => {
  try {
    const company_code = (req as any).user.company_code;
    const { id } = req.params;

    const shift = await Shift.findOne({
      where: {
        id,
        companyCode: company_code,
      },
    });

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    const {
      shiftCode,
      shiftName,
      shiftType,
      startTime,
      endTime,
      totalHours,
      isActive,
    } = req.body;

    // Check duplicate code only when shiftCode changes
    if (shiftCode && shiftCode !== shift.shiftCode) {
      const duplicate = await Shift.findOne({
        where: {
          companyCode: company_code,
          shiftCode,
        },
      });

      if (duplicate) {
        return res.status(400).json({
          message: "Shift code already exists for this company",
        });
      }
    }

    await shift.update({
      shiftCode: shiftCode ?? shift.shiftCode,
      shiftName: shiftName ?? shift.shiftName,
      shiftType: shiftType ?? shift.shiftType,
      startTime: startTime ?? shift.startTime,
      endTime: endTime ?? shift.endTime,
      totalHours: totalHours ?? shift.totalHours,
      isActive: isActive ?? shift.isActive,
    });

    return res.status(200).json({
      message: "Shift updated successfully",
      shift,
    });
  } catch (error: any) {
    console.error("Update Shift error:", error);

    return res.status(500).json({
      message: "Failed to update shift",
    });
  }
};

/**
 * Delete shift
 */
const deleteShift = async (req: Request, res: Response): Promise<any> => {
  try {
    const company_code = (req as any).user.company_code;
    const { id } = req.params;

    const shift = await Shift.findOne({
      where: {
        id,
        companyCode: company_code,
      },
    });

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    await shift.destroy();

    return res.status(200).json({
      message: "Shift deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Shift error:", error);

    return res.status(500).json({
      message: "Failed to delete shift",
    });
  }
};

export { createShift, getShifts, getShiftbyId, updateShift, deleteShift };
