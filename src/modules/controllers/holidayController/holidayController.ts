import { Request, Response } from "express";
import { Op } from "sequelize";
import { HolidayMaster } from "../../models/index";

// Normalize company code from the authenticated JWT
const getCompanyCode = (req: Request): string | undefined => {
  const user = (req as any).user;

  return user?.company_code ?? user?.companyCode;
};

// ================= CREATE HOLIDAY =================
const createHoliday = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyCode = getCompanyCode(req);

    if (!companyCode) {
      res.status(401).json({ message: "Company code missing from token" });
      return;
    }

    const { year, date, name, type } = req.body;

    if (!year || !date || !name) {
      res.status(400).json({
        message: "year, date and name are required",
      });
      return;
    }

    const holidayDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(holidayDate.getTime()) ||
      holidayDate.toISOString().slice(0, 10) !== date
    ) {
      res.status(400).json({
        message: "date must be a valid YYYY-MM-DD date",
      });
      return;
    }

    if (Number(year) !== holidayDate.getUTCFullYear()) {
      res.status(400).json({
        message: "year must match the year in date",
      });
      return;
    }

    const existingHoliday = await HolidayMaster.findOne({
      where: {
        companyCode,
        date,
      },
    });

    if (existingHoliday) {
      res.status(409).json({
        message: "A holiday already exists for this date",
      });
      return;
    }

    const holiday = await HolidayMaster.create({
      companyCode,
      year: Number(year),
      date,
      name: String(name).trim(),
      type: type ? String(type).trim() : "GOVT",
    });

    res.status(201).json({
      message: "Holiday created successfully",
      data: holiday,
    });
  } catch (error) {
    console.error("createHoliday error:", error);
    res.status(500).json({
      message: "Failed to create holiday",
    });
  }
};

// ================= GET HOLIDAYS BY YEAR =================
const getHolidaysByYear = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyCode = getCompanyCode(req);

    if (!companyCode) {
      res.status(401).json({ message: "Company code missing from token" });
      return;
    }

    const year = Number(req.query.year);

    if (!Number.isInteger(year) || year < 1900 || year > 9999) {
      res.status(400).json({
        message: "A valid year query parameter is required",
      });
      return;
    }

    const holidays = await HolidayMaster.findAll({
      where: {
        companyCode,
        year,
      },
      order: [["date", "ASC"]],
    });

    res.status(200).json({
      message: "Holidays fetched successfully",
      count: holidays.length,
      data: holidays,
    });
  } catch (error) {
    console.error("getHolidaysByYear error:", error);
    res.status(500).json({
      message: "Failed to fetch holidays",
    });
  }
};

// ================= GET SINGLE HOLIDAY =================
const getHolidayById = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyCode = getCompanyCode(req);

    if (!companyCode) {
      res.status(401).json({ message: "Company code missing from token" });
      return;
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid holiday ID" });
      return;
    }

    const holiday = await HolidayMaster.findOne({
      where: { id, companyCode },
    });

    if (!holiday) {
      res.status(404).json({ message: "Holiday not found" });
      return;
    }

    res.status(200).json({
      message: "Holiday fetched successfully",
      data: holiday,
    });
  } catch (error) {
    console.error("getHolidayById error:", error);
    res.status(500).json({
      message: "Failed to fetch holiday",
    });
  }
};

// ================= UPDATE HOLIDAY =================
const updateHoliday = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyCode = getCompanyCode(req);

    if (!companyCode) {
      res.status(401).json({ message: "Company code missing from token" });
      return;
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid holiday ID" });
      return;
    }

    const holiday = await HolidayMaster.findOne({
      where: { id, companyCode },
    });

    if (!holiday) {
      res.status(404).json({ message: "Holiday not found" });
      return;
    }

    const { year, date, name, type } = req.body;

    const nextDate = date ?? holiday.date;
    const nextYear = year === undefined ? holiday.year : Number(year);

    if (date !== undefined) {
      const parsedDate = new Date(`${date}T00:00:00.000Z`);

      if (
        typeof date !== "string" ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date
      ) {
        res.status(400).json({
          message: "date must be a valid YYYY-MM-DD date",
        });
        return;
      }
    }

    if (
      !Number.isInteger(nextYear) ||
      nextYear !== new Date(`${nextDate}T00:00:00.000Z`).getUTCFullYear()
    ) {
      res.status(400).json({
        message: "year must match the year in date",
      });
      return;
    }

    if (name !== undefined && !String(name).trim()) {
      res.status(400).json({ message: "name cannot be empty" });
      return;
    }

    const duplicate = await HolidayMaster.findOne({
      where: {
        companyCode,
        date: nextDate,
        id: { [Op.ne]: id },
      },
    });

    if (duplicate) {
      res.status(409).json({
        message: "Another holiday already exists for this date",
      });
      return;
    }

    await holiday.update({
      year: nextYear,
      date: nextDate,
      ...(name !== undefined && { name: String(name).trim() }),
      ...(type !== undefined && { type: String(type).trim() }),
    });

    res.status(200).json({
      message: "Holiday updated successfully",
      data: holiday,
    });
  } catch (error) {
    console.error("updateHoliday error:", error);
    res.status(500).json({
      message: "Failed to update holiday",
    });
  }
};

// ================= DELETE HOLIDAY =================
const deleteHoliday = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyCode = getCompanyCode(req);

    if (!companyCode) {
      res.status(401).json({ message: "Company code missing from token" });
      return;
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid holiday ID" });
      return;
    }

    const holiday = await HolidayMaster.findOne({
      where: { id, companyCode },
    });

    if (!holiday) {
      res.status(404).json({ message: "Holiday not found" });
      return;
    }

    await holiday.destroy();

    res.status(200).json({
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    console.error("deleteHoliday error:", error);
    res.status(500).json({
      message: "Failed to delete holiday",
    });
  }
};
export {
  createHoliday,
  getHolidaysByYear,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
};
