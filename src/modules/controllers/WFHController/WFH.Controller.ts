import { Request, Response } from "express";
import { Op } from "sequelize";
import {
  WFHRequest,
  Onboarding,
  HolidayMaster,
  Calendar,
  DepartmentPolicy,
} from "../../models/index";

type WFHStatus = "PENDING" | "APPROVED" | "REJECTED";

const getUserContext = (req: Request) => {
  const user = (req as any).user;

  return {
    user,
    companyCode: user?.company_code || user?.companyCode,
    employeeId: Number(user?.id),
    role: String(user?.role || "").toLowerCase(),
  };
};

const getEmployee = async (employeeId: number, companyCode: string) => {
  return Onboarding.findOne({
    where: {
      id: employeeId,
      company_code: companyCode,
      status: true,
    },
  });
};

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

const getDatesBetween = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  while (current <= end) {
    dates.push(formatDate(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
};

const isValidDate = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && formatDate(date) === value;
};

// ======================================================
// APPLY WFH
// ======================================================
const applyWFH = async (req: Request, res: Response) => {
  try {
    const { user, companyCode, employeeId, role } = getUserContext(req);

    if (
      !user ||
      !companyCode ||
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {
      return res.status(401).json({
        message: "Invalid user authentication context",
      });
    }

    if (role !== "employee") {
      return res.status(403).json({
        message: "Only employees can apply for WFH",
      });
    }

    const { date, startDate, endDate, reason } = req.body;

    const requestStart = date || startDate;
    const requestEnd = date || endDate || date;

    if (
      !isValidDate(requestStart) ||
      !isValidDate(requestEnd) ||
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        message: "Valid date/startDate, endDate and reason are required",
      });
    }

    if (requestStart > requestEnd) {
      return res.status(400).json({
        message: "startDate cannot be greater than endDate",
      });
    }

    const today = formatDate(new Date());

    if (requestStart < today) {
      return res.status(400).json({
        message: "Past dates cannot be requested for WFH",
      });
    }

    const employee = await getEmployee(employeeId, companyCode);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (!employee.department) {
      return res.status(400).json({
        message: "Employee department is not assigned",
      });
    }

    const departmentId = Number(employee.department);

    const policy = await DepartmentPolicy.findOne({
      where: {
        companyCode,
        departmentId,
      },
    });

    const attendancePolicy: any = policy?.attendancePolicy || {};

    if (attendancePolicy.allowWFH !== true) {
      return res.status(403).json({
        message: "WFH is not enabled for this department",
      });
    }

    const requestedDates = getDatesBetween(requestStart, requestEnd);

    // Get holidays in the requested range.
    const holidays = await HolidayMaster.findAll({
      where: {
        companyCode,
        date: {
          [Op.between]: [requestStart, requestEnd],
        },
      },
      attributes: ["date"],
    });

    const holidaySet = new Set(
      holidays.map((holiday: any) => String(holiday.date).slice(0, 10)),
    );

    // Department calendar entries override the default weekday rule.
    const calendarEntries = await Calendar.findAll({
      where: {
        companyCode,
        departmentId,
        date: {
          [Op.between]: [requestStart, requestEnd],
        },
      },
      attributes: ["date", "isWorkDay"],
    });

    const calendarMap = new Map<string, boolean>(
      calendarEntries.map((entry: any) => [
        String(entry.date).slice(0, 10),
        Boolean(entry.isWorkDay),
      ]),
    );

    const validDates: string[] = [];
    const weeklyOffDates: string[] = [];
    const holidayDates: string[] = [];

    for (const currentDate of requestedDates) {
      // A holiday is excluded unless the department calendar
      // explicitly marks the date as a working day.
      const calendarWorkDay = calendarMap.get(currentDate);

      if (calendarWorkDay === false) {
        weeklyOffDates.push(currentDate);
        continue;
      }

      if (calendarWorkDay === true) {
        validDates.push(currentDate);
        continue;
      }

      if (holidaySet.has(currentDate)) {
        holidayDates.push(currentDate);
        continue;
      }

      // Default weekday rule when no department calendar entry exists.
      const day = new Date(`${currentDate}T00:00:00.000Z`).getUTCDay();

      if (day === 0 || day === 6) {
        weeklyOffDates.push(currentDate);
      } else {
        validDates.push(currentDate);
      }
    }

    if (!validDates.length) {
      return res.status(400).json({
        message: "No valid working days available for WFH",
        data: {
          weeklyOffDates,
          holidayDates,
        },
      });
    }

    // Prevent overlapping pending or approved requests.
    const existingRequests = await WFHRequest.findAll({
      where: {
        companyCode,
        employeeId,
        status: {
          [Op.in]: ["PENDING", "APPROVED"],
        },
        startDate: {
          [Op.lte]: validDates[validDates.length - 1],
        },
        endDate: {
          [Op.gte]: validDates[0],
        },
      },
    });

    const existingDates = new Set<string>();

    for (const existing of existingRequests) {
      for (const existingDate of getDatesBetween(
        existing.startDate,
        existing.endDate,
      )) {
        existingDates.add(existingDate);
      }
    }

    const duplicateDates = validDates.filter((d) => existingDates.has(d));

    if (duplicateDates.length) {
      return res.status(409).json({
        message: "An existing WFH request overlaps these dates",
        data: { duplicateDates },
      });
    }

    // Enforce configured monthly WFH limit.
    const maxWFHDays = Number(attendancePolicy.maxWFHDaysPerMonth);

    if (Number.isFinite(maxWFHDays) && maxWFHDays >= 0) {
      const monthCounts = new Map<string, number>();

      for (const d of validDates) {
        const month = d.slice(0, 7);
        monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
      }

      for (const existing of existingRequests) {
        for (const d of getDatesBetween(existing.startDate, existing.endDate)) {
          if (existingDates.has(d)) {
            const month = d.slice(0, 7);
            monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
          }
        }
      }

      for (const [month, requestedCount] of monthCounts) {
        if (requestedCount > maxWFHDays) {
          return res.status(400).json({
            message: `WFH monthly limit exceeded for ${month}`,
            maxWFHDaysPerMonth: maxWFHDays,
          });
        }
      }
    }

    // Approval behavior follows the existing policy convention.
    const leavePolicy: any = (policy as any)?.leavePolicy || {};

    const status: WFHStatus =
      leavePolicy.requireApproval === false || leavePolicy.autoApprove === true
        ? "APPROVED"
        : "PENDING";

    const request = await WFHRequest.create({
      companyCode,
      employeeId,
      departmentId,
      startDate: validDates[0],
      endDate: validDates[validDates.length - 1],
      reason: reason.trim(),
      status,
      approvedBy: null,
      approvedAt: null,
    });

    return res.status(201).json({
      message: "WFH request submitted successfully",
      data: {
        ...request.toJSON(),
        totalDays: validDates.length,
        weeklyOffDates,
        holidayDates,
      },
    });
  } catch (error) {
    console.error("Apply WFH error:", error);

    return res.status(500).json({
      message: "Server error while applying for WFH",
    });
  }
};

// ======================================================
// MY WFH REQUESTS
// ======================================================
const getMyWFHRequests = async (req: Request, res: Response) => {
  try {
    const { user, companyCode, employeeId, role } = getUserContext(req);

    if (!user || !companyCode) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (role !== "employee") {
      return res.status(403).json({
        message: "Employee access only",
      });
    }

    const list = await WFHRequest.findAll({
      where: {
        companyCode,
        employeeId,
      },
      order: [["startDate", "DESC"]],
    });

    return res.status(200).json({ data: list });
  } catch (error) {
    console.error("My WFH requests error:", error);

    return res.status(500).json({
      message: "Server error while fetching WFH requests",
    });
  }
};

// ======================================================
// CANCEL PENDING WFH REQUEST
// ======================================================
const cancelWFHRequest = async (req: Request, res: Response) => {
  try {
    const { user, companyCode, employeeId, role } = getUserContext(req);

    const id = Number(req.params.id);

    if (!user || !companyCode) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (role !== "employee") {
      return res.status(403).json({
        message: "Only employees can cancel their requests",
      });
    }

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid WFH request ID",
      });
    }

    const request = await WFHRequest.findOne({
      where: {
        id,
        companyCode,
        employeeId,
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "WFH request not found",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending WFH requests can be cancelled",
      });
    }

    await request.destroy();

    return res.status(200).json({
      message: "WFH request cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel WFH error:", error);

    return res.status(500).json({
      message: "Server error while cancelling WFH request",
    });
  }
};

// ======================================================
// APPROVE / REJECT WFH REQUEST
// Protect this endpoint with your existing RBAC middleware.
// ======================================================
const updateWFHStatus = async (req: Request, res: Response) => {
  try {
    const { user, companyCode, employeeId, role } = getUserContext(req);

    const id = Number(req.params.id);
    const status = req.body.status as WFHStatus;

    if (!user || !companyCode) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (role === "employee") {
      return res.status(403).json({
        message: "Employees cannot approve or reject WFH requests",
      });
    }

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid WFH request ID",
      });
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const request = await WFHRequest.findOne({
      where: {
        id,
        companyCode,
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "WFH request not found",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        message: "This WFH request has already been processed",
      });
    }

    request.status = status;
    request.approvedBy =
      Number.isInteger(employeeId) && employeeId > 0 ? employeeId : null;
    request.approvedAt = new Date();

    await request.save();

    return res.status(200).json({
      message: `WFH request ${status.toLowerCase()} successfully`,
      data: request,
    });
  } catch (error) {
    console.error("Update WFH status error:", error);

    return res.status(500).json({
      message: "Server error while updating WFH request",
    });
  }
};

// ======================================================
// COMPANY-LEVEL WFH REQUESTS
// Protect this endpoint with your existing RBAC middleware.
// ======================================================
const getWFHRequests = async (req: Request, res: Response) => {
  try {
    const { user, companyCode } = getUserContext(req);

    if (!user || !companyCode) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (String(user.role || "").toLowerCase() === "employee") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const list = await WFHRequest.findAll({
      where: { companyCode },
      order: [["startDate", "DESC"]],
    });

    const employeeIds = [...new Set(list.map((item) => item.employeeId))];

    const employees = employeeIds.length
      ? await Onboarding.findAll({
          where: {
            id: { [Op.in]: employeeIds },
            company_code: companyCode,
          },
          attributes: ["id", "name", "email", "department"],
        })
      : [];

    const employeeMap = new Map(
      employees.map((employee: any) => [
        Number(employee.id),
        {
          name: employee.name,
          email: employee.email,
          department: employee.department,
        },
      ]),
    );

    return res.status(200).json({
      data: list.map((item) => ({
        ...item.toJSON(),
        employee: employeeMap.get(item.employeeId) || null,
      })),
    });
  } catch (error) {
    console.error("Get WFH requests error:", error);

    return res.status(500).json({
      message: "Server error while fetching WFH requests",
    });
  }
};

export {
  applyWFH,
  getMyWFHRequests,
  cancelWFHRequest,
  updateWFHStatus,
  getWFHRequests,
};
