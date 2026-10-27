import { Request, Response } from "express";
import { Op } from "sequelize";
import dayjs from "dayjs";

import {
  Calendar,
  Department,
  DepartmentPolicy,
  HolidayMaster,
  LeaveTransaction,
  Onboarding,
} from "../../models";

const getAuthUser = (req: Request) => (req as any).user;

const getDepartmentForCompany = async (
  departmentId: number,
  companyCode: string,
) => {
  return Department.findOne({
    where: { id: departmentId, companyCode },
  });
};

/**
 * Create or update department calendar.
 * Supports weekly offs and manual calendar entries.
 */
const createOrUpdateCalendar = async (req: Request, res: Response) => {
  try {
    const companyCode = getAuthUser(req)?.company_code;
    const { departmentId, entries, weeklyOffDays, year } = req.body;

    const parsedDepartmentId = Number(departmentId);
    const parsedYear = Number(year);

    if (
      !companyCode ||
      !Number.isInteger(parsedDepartmentId) ||
      parsedDepartmentId <= 0 ||
      !Number.isInteger(parsedYear) ||
      parsedYear < 2000 ||
      parsedYear > 2100
    ) {
      return res.status(400).json({
        message: "Valid departmentId and year are required",
      });
    }

    if (
      weeklyOffDays !== undefined &&
      (!Array.isArray(weeklyOffDays) ||
        !weeklyOffDays.every((day: unknown) => typeof day === "string"))
    ) {
      return res.status(400).json({
        message: "weeklyOffDays must be an array of weekday names",
      });
    }

    if (
      entries !== undefined &&
      (!Array.isArray(entries) ||
        !entries.every(
          (entry: any) =>
            entry &&
            typeof entry.date === "string" &&
            dayjs(entry.date, "YYYY-MM-DD", true).isValid() &&
            typeof entry.isWorkDay === "boolean" &&
            (entry.note === undefined ||
              entry.note === null ||
              typeof entry.note === "string"),
        ))
    ) {
      return res.status(400).json({
        message:
          "Each entry must contain a valid date (YYYY-MM-DD), isWorkDay boolean, and optional note",
      });
    }

    const validWeekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    if (weeklyOffDays?.some((day: string) => !validWeekdays.includes(day))) {
      return res.status(400).json({
        message: "weeklyOffDays contains an invalid weekday",
      });
    }

    const department = await getDepartmentForCompany(
      parsedDepartmentId,
      companyCode,
    );

    if (!department) {
      return res.status(404).json({
        message: "Department not found for this company",
      });
    }

    const today = dayjs().startOf("day");
    const yearStart = dayjs(`${parsedYear}-01-01`);
    const yearEnd = dayjs(`${parsedYear}-12-31`);

    // Remove only future weekly-off entries for this department.
    // Manual entries are preserved.
    const weeklyOffStart = today.isAfter(yearStart) ? today : yearStart;

    if (!weeklyOffStart.isAfter(yearEnd)) {
      await Calendar.destroy({
        where: {
          companyCode,
          departmentId: parsedDepartmentId,
          date: {
            [Op.between]: [
              weeklyOffStart.format("YYYY-MM-DD"),
              yearEnd.format("YYYY-MM-DD"),
            ],
          },
          note: { [Op.like]: "%Weekly Off%" },
        },
      });
    }

    // Generate weekly offs from the current date (or year start)
    // through December 31 of the selected year.
    const newWeeklyOffs: Array<{
      companyCode: string;
      departmentId: number;
      date: string;
      isWorkDay: boolean;
      note: string;
    }> = [];

    if (weeklyOffDays?.length && !weeklyOffStart.isAfter(yearEnd)) {
      for (
        let current = weeklyOffStart;
        !current.isAfter(yearEnd);
        current = current.add(1, "day")
      ) {
        const dayName = current.format("dddd");

        if (weeklyOffDays.includes(dayName)) {
          newWeeklyOffs.push({
            companyCode,
            departmentId: parsedDepartmentId,
            date: current.format("YYYY-MM-DD"),
            isWorkDay: false,
            note: `${dayName} Weekly Off`,
          });
        }
      }
    }

    if (newWeeklyOffs.length > 0) {
      await Calendar.bulkCreate(newWeeklyOffs, {
        ignoreDuplicates: true,
      });
    }

    // Apply manual entries. Existing entries are updated.
    for (const entry of entries ?? []) {
      const date = entry.date;

      if (dayjs(date).year() !== parsedYear) {
        return res.status(400).json({
          message: `Entry date ${date} does not belong to year ${parsedYear}`,
        });
      }

      const [calendarEntry, created] = await Calendar.findOrCreate({
        where: {
          companyCode,
          departmentId: parsedDepartmentId,
          date,
        },
        defaults: {
          companyCode,
          departmentId: parsedDepartmentId,
          date,
          isWorkDay: entry.isWorkDay,
          note: entry.note ?? null,
        },
      });

      if (!created) {
        await calendarEntry.update({
          isWorkDay: entry.isWorkDay,
          note: entry.note ?? null,
        });
      }
    }

    return res.status(200).json({
      message: "Calendar updated successfully",
      departmentId: parsedDepartmentId,
      year: parsedYear,
      appliedFrom: !weeklyOffStart.isAfter(yearEnd)
        ? weeklyOffStart.format("YYYY-MM-DD")
        : null,
      newWeeklyOffs: newWeeklyOffs.length,
      manualEntriesProcessed: (entries ?? []).length,
    });
  } catch (error) {
    console.error("createOrUpdateCalendar error:", error);

    return res.status(500).json({
      message: "Server error while updating calendar",
    });
  }
};

/**
 * Get department calendar for a month or a full year.
 * Includes company holidays and approved employee leaves.
 */
const getDepartmentCalendar = async (req: Request, res: Response) => {
  try {
    const companyCode = getAuthUser(req)?.company_code;

    const departmentId = Number(req.query.departmentId);
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : dayjs().year();

    if (!companyCode || !Number.isInteger(departmentId) || departmentId <= 0) {
      return res.status(400).json({
        message: "Valid departmentId is required",
      });
    }

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        message: "Valid year is required",
      });
    }

    if (
      month !== undefined &&
      (!Number.isInteger(month) || month < 1 || month > 12)
    ) {
      return res.status(400).json({
        message: "month must be between 1 and 12",
      });
    }

    const department = await getDepartmentForCompany(departmentId, companyCode);

    if (!department) {
      return res.status(404).json({
        message: "Department not found for this company",
      });
    }

    const start = month
      ? dayjs(`${year}-${String(month).padStart(2, "0")}-01`)
      : dayjs(`${year}-01-01`);

    const end = month ? start.endOf("month") : dayjs(`${year}-12-31`);

    const startDate = start.format("YYYY-MM-DD");
    const endDate = end.format("YYYY-MM-DD");

    const [calendarEntries, holidays, employees] = await Promise.all([
      Calendar.findAll({
        where: {
          companyCode,
          departmentId,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        raw: true,
      }),

      HolidayMaster.findAll({
        where: {
          companyCode,
          year,
        },
        raw: true,
      }),

      Onboarding.findAll({
        where: {
          company_code: companyCode,
          department: departmentId,
          status: true,
          [Op.and]: [require("sequelize").literal("`deleted_at` IS NULL")],
        },
        attributes: ["id", "name"],
        raw: true,
      }),
    ]);

    const employeeIds = employees.map((employee: any) => employee.id);

    const leaves =
      employeeIds.length > 0
        ? await LeaveTransaction.findAll({
            where: {
              companyCode,
              employeeId: {
                [Op.in]: employeeIds,
              },
              status: "Approved",
              startDate: {
                [Op.lte]: endDate,
              },
              endDate: {
                [Op.gte]: startDate,
              },
            },
            raw: true,
          })
        : [];

    const calendarMap = new Map(
      calendarEntries.map((entry: any) => [entry.date, entry]),
    );

    const holidayMap = new Map(
      holidays.map((holiday: any) => [holiday.date, holiday]),
    );

    const employeeMap = new Map(
      employees.map((employee: any) => [employee.id, employee.name]),
    );

    const leavesByDate: Record<string, any[]> = {};

    for (const leave of leaves as any[]) {
      const leaveStart = dayjs(leave.startDate).isAfter(start)
        ? dayjs(leave.startDate)
        : start;

      const leaveEnd = dayjs(leave.endDate).isBefore(end)
        ? dayjs(leave.endDate)
        : end;

      for (
        let current = leaveStart;
        !current.isAfter(leaveEnd);
        current = current.add(1, "day")
      ) {
        const date = current.format("YYYY-MM-DD");

        if (!leavesByDate[date]) {
          leavesByDate[date] = [];
        }

        leavesByDate[date].push({
          employeeId: leave.employeeId,
          employeeName: employeeMap.get(leave.employeeId) ?? null,
          category: leave.category,
          noOfDays: leave.noOfDays,
          status: leave.status,
        });
      }
    }

    const calendar = [];

    for (
      let current = start;
      !current.isAfter(end);
      current = current.add(1, "day")
    ) {
      const date = current.format("YYYY-MM-DD");
      const calendarEntry: any = calendarMap.get(date);
      const holiday: any = holidayMap.get(date);

      const isWorkDay = calendarEntry?.isWorkDay ?? (holiday ? false : true);
      const note = calendarEntry?.note ?? holiday?.name ?? null;

      calendar.push({
        date,
        day: current.format("dddd"),
        isWorkDay,
        note,
        holidayType: holiday?.type ?? null,
        leaves: leavesByDate[date] ?? [],
      });
    }

    return res.status(200).json({
      viewType: month ? "month" : "year",
      companyCode,
      departmentId,
      month: month ?? null,
      year,
      totalDays: calendar.length,
      holidays: holidays.length,
      calendar,
    });
  } catch (error) {
    console.error("getDepartmentCalendar error:", error);

    return res.status(500).json({
      message: "Server error while fetching department calendar",
    });
  }
};
export { createOrUpdateCalendar, getDepartmentCalendar };
