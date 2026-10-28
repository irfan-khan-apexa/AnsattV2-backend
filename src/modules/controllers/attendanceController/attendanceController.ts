import { Request, Response } from "express";
import { Op } from "sequelize";
import {
  Attendance,
  Calendar,
  HolidayMaster,
  LeaveTransaction,
  Onboarding,
  Shift,
  Site,
  WFHRequest,
} from "../../models";

// ================= AUTH HELPERS =================

const getUser = (req: Request): any => {
  return (req as any).user;
};

const getCompanyCode = (req: Request): string | undefined => {
  const user = getUser(req);

  return user?.company_code ?? user?.companyCode;
};

const getTargetEmployeeId = (req: Request): number | undefined => {
  const user = getUser(req);

  // Employees can only act for themselves.
  if (user?.role === "employee") {
    const id = Number(user.id);
    return Number.isInteger(id) && id > 0 ? id : undefined;
  }

  const rawId =
    req.body?.employee_id ??
    req.body?.employeeId ??
    req.params?.employeeId ??
    req.query?.employeeId ??
    req.query?.employee_id;

  const id = Number(rawId);

  return Number.isInteger(id) && id > 0 ? id : undefined;
};

const findCompanyEmployee = async (employeeId: number, companyCode: string) => {
  return Onboarding.findOne({
    where: {
      id: employeeId,
      company_code: companyCode,
      status: true,
    },
  });
};

// ================= TIME HELPERS =================

const calculateDurationHours = (inTime: Date, outTime: Date): number => {
  const milliseconds = new Date(outTime).getTime() - new Date(inTime).getTime();

  return Math.max(0, Number((milliseconds / (1000 * 60 * 60)).toFixed(2)));
};

const formatHoursToHMS = (hours: number | null | undefined): string | null => {
  if (hours == null || !Number.isFinite(Number(hours))) {
    return null;
  }

  const totalSeconds = Math.round(Number(hours) * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");
};

const toIST = (value: Date | string | null | undefined): string | null => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  const datePart = `${part("year")}-${part("month")}-${part("day")}`;

  const timePart = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return `${datePart} ${timePart}`;
};

// Return a date-only key in Asia/Kolkata so it matches HolidayMaster DATEONLY values.
const getISTDateKey = (value: Date | string): string | null => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
};

// ================= GEO HELPERS =================

const getDistanceInMeters = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const earthRadius = 6371000;

  const dLatitude = toRadians(latitude2 - latitude1);
  const dLongitude = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(dLatitude / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(dLongitude / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ================= SHIFT HELPERS =================

const calculateOvertime = async (
  employee: any,
  companyCode: string,
  durationHours: number,
): Promise<number> => {
  if (!employee?.shiftCode) return 0;

  const shift = await Shift.findOne({
    where: {
      shiftCode: employee.shiftCode,
      companyCode: companyCode, // Fixed: model field is companyCode
      isActive: true,
    },
  });

  if (!shift || shift.totalHours == null) {
    return 0;
  }

  // Calculate overtime using the configured shift duration.
  return Math.max(
    0,
    Number((durationHours - Number(shift.totalHours)).toFixed(2)),
  );
};
// ================= PUNCH IN / PUNCH OUT =================

const punch = async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const employeeId = getTargetEmployeeId(req);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from authentication token",
      });
    }

    if (!employeeId) {
      return res.status(400).json({
        message: "Employee ID is required for authorized company users",
      });
    }

    const employee = await findCompanyEmployee(employeeId, companyCode);

    if (!employee) {
      return res.status(404).json({
        message: "Active employee not found in this company",
      });
    }

    // Find an open attendance early so punch-out can reuse its original WFH mode.
    const openAttendance = await Attendance.findOne({
      where: {
        employee_id: employeeId,
        company_code: companyCode,
        outTime: null,
      },
      order: [["inTime", "DESC"]],
    });

    const { latitude, longitude, timestamp } = req.body;

    // If punch-in was WFH, punch-out remains WFH even if the client omits isWFH.
    const isWFH = req.body.isWFH === true || Boolean(openAttendance?.isWFH);
    const hasCoordinates = latitude !== undefined && longitude !== undefined;

    if (
      hasCoordinates &&
      (!Number.isFinite(Number(latitude)) ||
        !Number.isFinite(Number(longitude)) ||
        Number(latitude) < -90 ||
        Number(latitude) > 90 ||
        Number(longitude) < -180 ||
        Number(longitude) > 180)
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude",
      });
    }

    let distance: number | null = null;
    let isInsideGeofence: boolean | null = null;

    if (!isWFH) {
      if (!employee.siteCode) {
        return res.status(400).json({
          message: "Employee site is not configured",
        });
      }

      const site = await Site.findOne({
        where: {
          sitecode: employee.siteCode,
          company_code: companyCode,
        },
      });

      if (!site) {
        return res.status(404).json({
          message: "Employee site not found",
        });
      }

      if (!hasCoordinates) {
        return res.status(400).json({
          message: "Latitude and longitude are required for office attendance",
        });
      }

      distance = getDistanceInMeters(
        Number(latitude),
        Number(longitude),
        Number(site.latitude),
        Number(site.longitude),
      );

      isInsideGeofence = distance <= Number(site.radius);

      if (!isInsideGeofence) {
        return res.status(403).json({
          message: "You are outside the allowed attendance location",
          distance: Math.round(distance),
          allowedRadius: site.radius,
        });
      }
    }

    const time = timestamp ? new Date(timestamp) : new Date();

    if (Number.isNaN(time.getTime())) {
      return res.status(400).json({
        message: "Invalid attendance timestamp",
      });
    }

    // Holiday integration: retain attendance punches on holidays so actual holiday
    // work can still be recorded. For punch-out, use the punch-in date (overnight shifts).
    const attendanceDateKey = getISTDateKey(openAttendance?.inTime ?? time);

    // WFH punches are allowed only for an approved WFH request covering this date.
    // DepartmentPolicy integration is intentionally kept separate for a later step.
    const approvedWFHRequest =
      isWFH && attendanceDateKey
        ? await WFHRequest.findOne({
            where: {
              companyCode,
              employeeId,
              status: "APPROVED",
              startDate: { [Op.lte]: attendanceDateKey },
              endDate: { [Op.gte]: attendanceDateKey },
            },
          })
        : null;

    if (isWFH && !approvedWFHRequest) {
      return res.status(403).json({
        message: "Approved WFH request not found for this date",
      });
    }

    const holiday = attendanceDateKey
      ? await HolidayMaster.findOne({
          where: {
            companyCode,
            date: attendanceDateKey,
          },
        })
      : null;

    // Approved leave integration: allow punch-in but return a warning.
    // Only check leave when starting a new attendance record, not on punch-out.
    const approvedLeave =
      !openAttendance && attendanceDateKey
        ? await LeaveTransaction.findOne({
            where: {
              companyCode,
              employeeId,
              status: "Approved",
              startDate: { [Op.lte]: attendanceDateKey },
              endDate: { [Op.gte]: attendanceDateKey },
            },
          })
        : null;

    // Calendar integration: check the employee department's configured day.
    // Missing calendar entries remain normal working days; existing logic is preserved.
    const departmentId = Number(employee.department);
    const calendarEntry =
      attendanceDateKey && Number.isInteger(departmentId) && departmentId > 0
        ? await Calendar.findOne({
            where: {
              companyCode,
              departmentId,
              date: attendanceDateKey,
            },
          })
        : null;

    const isCalendarWorkDay = calendarEntry
      ? Boolean(calendarEntry.isWorkDay)
      : null;
    const calendarNote = calendarEntry?.note ?? null;
    const isWeeklyOff = Boolean(
      calendarEntry &&
      !calendarEntry.isWorkDay &&
      /weekly off/i.test(calendarEntry.note ?? ""),
    );

    // ================= PUNCH IN =================

    if (!openAttendance) {
      const attendance = await Attendance.create({
        employee_id: employeeId,
        company_code: companyCode,
        inTime: time,
        outTime: null,
        durationHours: null,
        overtimeHours: 0,
        note: null,
        status: "PUNCH_IN",
        isManual: false,
        latitude: isWFH ? null : Number(latitude),
        longitude: isWFH ? null : Number(longitude),
        distance: isWFH ? null : distance,
        isInsideGeofence: isWFH ? false : isInsideGeofence,
        isWFH,
      });

      return res.status(201).json({
        message: isWFH ? "WFH Punch In" : "Punched In",
        ...(approvedLeave || (calendarEntry && !calendarEntry.isWorkDay)
          ? {
              warning: [
                ...(approvedLeave
                  ? [
                      "Employee is on approved leave today. Attendance has been recorded.",
                    ]
                  : []),
                ...(calendarEntry && !calendarEntry.isWorkDay
                  ? [
                      `This is a non-working day in the department calendar${calendarNote ? ` (${calendarNote})` : ""}. Attendance has been recorded.`,
                    ]
                  : []),
              ].join(" "),
            }
          : {}),
        data: {
          id: attendance.id,
          employee_id: employeeId,
          employeeName: employee.name,
          company_code: companyCode,
          inTime: toIST(attendance.inTime),
          outTime: null,
          distance: distance == null ? null : Math.round(distance),
          isInsideGeofence,
          isWFH,
          isHoliday: Boolean(holiday),
          holidayName: holiday?.name ?? null,
          isOnLeave: Boolean(approvedLeave),
          isCalendarWorkDay,
          isWeeklyOff,
          calendarNote,
          status: attendance.status,
        },
      });
    }

    // ================= PUNCH OUT =================

    if (!openAttendance.inTime) {
      return res.status(400).json({
        message: "Open attendance record has no punch-in time",
      });
    }

    if (time.getTime() < new Date(openAttendance.inTime).getTime()) {
      return res.status(400).json({
        message: "Punch-out time cannot be earlier than punch-in time",
      });
    }

    const durationHours = calculateDurationHours(
      new Date(openAttendance.inTime),
      time,
    );

    const overtimeHours = await calculateOvertime(
      employee,
      companyCode,
      durationHours,
    );

    await openAttendance.update({
      outTime: time,
      durationHours,
      overtimeHours,
      status: "PUNCH_OUT",
      latitude: isWFH ? null : Number(latitude),
      longitude: isWFH ? null : Number(longitude),
      distance: isWFH ? null : distance,
      isInsideGeofence: isWFH ? false : isInsideGeofence,
      isWFH,
    });

    return res.status(200).json({
      message: isWFH ? "WFH Punch Out" : "Punched Out",
      data: {
        id: openAttendance.id,
        employee_id: employeeId,
        employeeName: employee.name,
        company_code: companyCode,
        inTime: toIST(openAttendance.inTime),
        outTime: toIST(openAttendance.outTime),
        durationHours: formatHoursToHMS(durationHours),
        overtimeHours: formatHoursToHMS(overtimeHours),
        distance: distance == null ? null : Math.round(distance),
        isInsideGeofence,
        isWFH,
        isHoliday: Boolean(holiday),
        holidayName: holiday?.name ?? null,
        isCalendarWorkDay,
        isWeeklyOff,
        calendarNote,
        status: openAttendance.status,
      },
    });
  } catch (error) {
    console.error("Punch error:", error);

    return res.status(500).json({
      message: "Failed to process attendance punch",
    });
  }
};

// ================= MANUAL ADD ATTENDANCE =================

const manualAdd = async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const employeeId = getTargetEmployeeId(req);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    if (!employeeId) {
      return res.status(400).json({
        message: "employee_id is required",
      });
    }

    const employee = await findCompanyEmployee(employeeId, companyCode);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found in this company",
      });
    }

    const { inTime, outTime, note, isWFH = false } = req.body;

    if (!inTime) {
      return res.status(400).json({
        message: "inTime is required",
      });
    }

    const inDate = new Date(inTime);
    const outDate = outTime ? new Date(outTime) : null;

    if (
      Number.isNaN(inDate.getTime()) ||
      (outDate && Number.isNaN(outDate.getTime()))
    ) {
      return res.status(400).json({
        message: "Invalid inTime or outTime",
      });
    }

    if (outDate && outDate.getTime() < inDate.getTime()) {
      return res.status(400).json({
        message: "outTime cannot be earlier than inTime",
      });
    }

    // Additional integration: check approved leave and holiday.
    // Existing attendance creation logic remains unchanged.
    const attendanceDateKey = getISTDateKey(inDate);

    const approvedLeave = attendanceDateKey
      ? await LeaveTransaction.findOne({
          where: {
            companyCode,
            employeeId,
            status: "Approved",
            startDate: { [Op.lte]: attendanceDateKey },
            endDate: { [Op.gte]: attendanceDateKey },
          },
        })
      : null;

    const holiday = attendanceDateKey
      ? await HolidayMaster.findOne({
          where: {
            companyCode,
            date: attendanceDateKey,
          },
        })
      : null;

    const departmentId = Number(employee.department);
    const calendarEntry =
      attendanceDateKey && Number.isInteger(departmentId) && departmentId > 0
        ? await Calendar.findOne({
            where: {
              companyCode,
              departmentId,
              date: attendanceDateKey,
            },
          })
        : null;

    const isCalendarWorkDay = calendarEntry
      ? Boolean(calendarEntry.isWorkDay)
      : null;
    const calendarNote = calendarEntry?.note ?? null;
    const isWeeklyOff = Boolean(
      calendarEntry &&
      !calendarEntry.isWorkDay &&
      /weekly off/i.test(calendarEntry.note ?? ""),
    );

    let durationHours: number | null = null;
    let overtimeHours = 0;

    if (outDate) {
      durationHours = calculateDurationHours(inDate, outDate);
      overtimeHours = await calculateOvertime(
        employee,
        companyCode,
        durationHours,
      );
    }

    const attendance = await Attendance.create({
      employee_id: employeeId,
      company_code: companyCode,
      inTime: inDate,
      outTime: outDate,
      durationHours,
      overtimeHours,
      note: note ?? null,
      status: outDate ? "PUNCH_OUT" : "PUNCH_IN",
      isManual: true,
      latitude: null,
      longitude: null,
      distance: null,
      isInsideGeofence: null,
      isWFH: Boolean(isWFH),
    });

    const warnings: string[] = [];

    if (approvedLeave) {
      warnings.push(
        "Employee is on approved leave on this date. Manual attendance has been recorded.",
      );
    }

    if (holiday) {
      warnings.push(
        `This date is a holiday (${holiday.name}). Manual attendance has been recorded.`,
      );
    }

    if (calendarEntry && !calendarEntry.isWorkDay) {
      warnings.push(
        `This is a non-working day in the department calendar${calendarNote ? ` (${calendarNote})` : ""}. Manual attendance has been recorded.`,
      );
    }

    return res.status(201).json({
      message: "Manual attendance added successfully",
      ...(warnings.length > 0 && {
        warning: warnings.join(" "),
      }),
      data: {
        id: attendance.id,
        employee_id: employeeId,
        employeeName: employee.name,
        company_code: companyCode,
        inTime: toIST(attendance.inTime),
        outTime: toIST(attendance.outTime),
        durationHours: formatHoursToHMS(durationHours),
        overtimeHours: formatHoursToHMS(overtimeHours),
        note: attendance.note,
        status: attendance.status,
        isManual: attendance.isManual,
        isWFH: attendance.isWFH,
        isOnLeave: Boolean(approvedLeave),
        isHoliday: Boolean(holiday),
        holidayName: holiday?.name ?? null,
        isCalendarWorkDay,
        isWeeklyOff,
        calendarNote,
        createdAt: toIST(attendance.createdAt),
        updatedAt: toIST(attendance.updatedAt),
      },
    });
  } catch (error) {
    console.error("Manual attendance add error:", error);

    return res.status(500).json({
      message: "Failed to add manual attendance",
    });
  }
};

// ================= UPDATE MANUAL ATTENDANCE =================

const updateManualAttendance = async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const attendanceId = Number(req.params.id);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    if (!Number.isInteger(attendanceId) || attendanceId <= 0) {
      return res.status(400).json({
        message: "Invalid attendance ID",
      });
    }

    const attendance = await Attendance.findOne({
      where: {
        id: attendanceId,
        company_code: companyCode,
      },
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    if (!attendance.isManual) {
      return res.status(403).json({
        message: "Only manually created attendance can be updated",
      });
    }

    const { inTime, outTime, note } = req.body;

    const inDate = inTime ? new Date(inTime) : attendance.inTime;

    const outDate =
      outTime === null
        ? null
        : outTime
          ? new Date(outTime)
          : attendance.outTime;

    if (
      (inDate && Number.isNaN(new Date(inDate).getTime())) ||
      (outDate && Number.isNaN(new Date(outDate).getTime()))
    ) {
      return res.status(400).json({
        message: "Invalid inTime or outTime",
      });
    }

    if (
      inDate &&
      outDate &&
      new Date(outDate).getTime() < new Date(inDate).getTime()
    ) {
      return res.status(400).json({
        message: "outTime cannot be earlier than inTime",
      });
    }

    let durationHours: number | null = null;
    let overtimeHours = 0;

    if (inDate && outDate) {
      durationHours = calculateDurationHours(
        new Date(inDate),
        new Date(outDate),
      );

      overtimeHours = await calculateOvertime(
        await findCompanyEmployee(attendance.employee_id, companyCode),
        companyCode,
        durationHours,
      );
    }

    await attendance.update({
      inTime: inDate,
      outTime: outDate,
      durationHours,
      overtimeHours,
      note: note ?? attendance.note,
      status: outDate ? "PUNCH_OUT" : "PUNCH_IN",
    });

    return res.status(200).json({
      message: "Manual attendance updated successfully",
      data: {
        id: attendance.id,
        employee_id: attendance.employee_id,
        company_code: attendance.company_code,
        inTime: toIST(attendance.inTime),
        outTime: toIST(attendance.outTime),
        durationHours: formatHoursToHMS(attendance.durationHours),
        overtimeHours: formatHoursToHMS(attendance.overtimeHours),
        note: attendance.note,
        status: attendance.status,
        isManual: attendance.isManual,
        updatedAt: toIST(attendance.updatedAt),
      },
    });
  } catch (error) {
    console.error("Update manual attendance error:", error);

    return res.status(500).json({
      message: "Failed to update manual attendance",
    });
  }
};

// ================= GET COMPANY ATTENDANCE =================

const getCompanyAttendance = async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const user = getUser(req);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    const where: any = {
      company_code: companyCode,
    };

    if (user?.role === "employee") {
      const employeeId = getTargetEmployeeId(req);

      if (!employeeId) {
        return res.status(400).json({
          message: "Employee ID missing from token",
        });
      }

      where.employee_id = employeeId;
    }

    const attendances = await Attendance.findAll({
      where,
      order: [["inTime", "DESC"]],
    });

    const employeeIds = [
      ...new Set(attendances.map((record) => record.employee_id)),
    ];

    const employees = employeeIds.length
      ? await Onboarding.findAll({
          where: {
            id: { [Op.in]: employeeIds },
            company_code: companyCode,
          },
          attributes: [
            "id",
            "name",
            "email",
            "department",
            "siteCode",
            "shiftCode",
          ],
        })
      : [];

    const employeeMap = new Map(
      employees.map((employee: any) => [Number(employee.id), employee]),
    );

    const data = attendances.map((record) => {
      const employee: any = employeeMap.get(record.employee_id);

      return {
        id: record.id,
        employee_id: record.employee_id,
        employeeName: employee?.name ?? null,
        employeeEmail: employee?.email ?? null,
        department: employee?.department ?? null,
        siteCode: employee?.siteCode ?? null,
        shiftCode: employee?.shiftCode ?? null,
        company_code: record.company_code,
        inTime: toIST(record.inTime),
        outTime: toIST(record.outTime),
        durationHours: formatHoursToHMS(record.durationHours),
        overtimeHours: formatHoursToHMS(record.overtimeHours),
        note: record.note,
        status: record.status,
        isManual: record.isManual,
        isWFH: record.isWFH,
        latitude: record.latitude,
        longitude: record.longitude,
        distance: record.distance,
        isInsideGeofence: record.isInsideGeofence,
        createdAt: toIST(record.createdAt),
        updatedAt: toIST(record.updatedAt),
      };
    });

    return res.status(200).json({
      role: user?.role,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("Get company attendance error:", error);

    return res.status(500).json({
      message: "Failed to fetch attendance",
    });
  }
};

// ================= GET SINGLE EMPLOYEE ATTENDANCE =================

const getSingleEmployeeAttendance = async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const employeeId = getTargetEmployeeId(req);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    if (!employeeId) {
      return res.status(400).json({
        message: "employeeId is required",
      });
    }

    const employee = await findCompanyEmployee(employeeId, companyCode);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found in this company",
      });
    }

    const attendances = await Attendance.findAll({
      where: {
        employee_id: employeeId,
        company_code: companyCode,
      },
      order: [["inTime", "DESC"]],
    });

    return res.status(200).json({
      total: attendances.length,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        siteCode: employee.siteCode,
        shiftCode: employee.shiftCode,
      },
      data: attendances.map((record) => ({
        id: record.id,
        employee_id: record.employee_id,
        company_code: record.company_code,
        inTime: toIST(record.inTime),
        outTime: toIST(record.outTime),
        durationHours: formatHoursToHMS(record.durationHours),
        overtimeHours: formatHoursToHMS(record.overtimeHours),
        note: record.note,
        status: record.status,
        isManual: record.isManual,
        isWFH: record.isWFH,
        createdAt: toIST(record.createdAt),
        updatedAt: toIST(record.updatedAt),
      })),
    });
  } catch (error) {
    console.error("Get single employee attendance error:", error);

    return res.status(500).json({
      message: "Failed to fetch employee attendance",
    });
  }
};

// ================= LATEST EMPLOYEE ATTENDANCE STATUS =================

const punchController = async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const employeeId = getTargetEmployeeId(req);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    if (!employeeId) {
      return res.status(400).json({
        message: "employee_id is required",
      });
    }

    const employee = await findCompanyEmployee(employeeId, companyCode);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found in this company",
      });
    }

    const latestAttendance = await Attendance.findOne({
      where: {
        employee_id: employeeId,
        company_code: companyCode,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!latestAttendance) {
      return res.status(200).json({
        message: "Employee has no attendance records yet",
        data: {
          employee_id: employeeId,
          status: null,
          inTime: null,
          outTime: null,
        },
      });
    }

    return res.status(200).json({
      message: "Latest attendance fetched",
      data: {
        employee_id: employeeId,
        status: latestAttendance.status,
        inTime: toIST(latestAttendance.inTime),
        outTime: toIST(latestAttendance.outTime),
      },
    });
  } catch (error) {
    console.error("Latest attendance status error:", error);

    return res.status(500).json({
      message: "Failed to fetch attendance status",
    });
  }
};

// ================= MONTHLY ATTENDANCE SUMMARY =================

const getMonthlyAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2200
    ) {
      return res.status(400).json({
        message: "Valid month (1-12) and year are required",
      });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const employees = await Onboarding.findAll({
      where: {
        company_code: companyCode,
        status: true,
      },
      attributes: [
        "id",
        "name",
        "email",
        "department",
        "siteCode",
        "shiftCode",
      ],
    });

    const employeeIds = employees.map((employee: any) => employee.id);

    if (!employeeIds.length) {
      return res.status(200).json({
        company_code: companyCode,
        month,
        year,
        totalEmployees: 0,
        employees: [],
      });
    }

    const attendanceRecords = await Attendance.findAll({
      where: {
        company_code: companyCode,
        employee_id: { [Op.in]: employeeIds },
        inTime: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
    });

    const leaveRecords = await LeaveTransaction.findAll({
      where: {
        companyCode,
        employeeId: { [Op.in]: employeeIds },
        status: "Approved",
        startDate: { [Op.lt]: endDate },
        endDate: { [Op.gte]: startDate },
      },
    });

    // Holiday integration: fetch company holidays for this month.
    const monthStartKey = `${year}-${String(month).padStart(2, "0")}-01`;
    const monthEndKey = `${year}-${String(month).padStart(2, "0")}-${String(
      new Date(year, month, 0).getDate(),
    ).padStart(2, "0")}`;

    const holidayRecords = await HolidayMaster.findAll({
      where: {
        companyCode,
        date: {
          [Op.gte]: monthStartKey,
          [Op.lte]: monthEndKey,
        },
      },
      attributes: ["date", "name"],
      order: [["date", "ASC"]],
    });

    const holidayByDate = new Map<string, string>();
    for (const holiday of holidayRecords) {
      holidayByDate.set(String(holiday.date), holiday.name);
    }

    const attendanceByEmployee = new Map<number, Set<string>>();

    for (const record of attendanceRecords) {
      if (!record.inTime) continue;

      const dateKey = getISTDateKey(record.inTime);

      if (!dateKey) continue;

      if (!attendanceByEmployee.has(record.employee_id)) {
        attendanceByEmployee.set(record.employee_id, new Set());
      }

      attendanceByEmployee.get(record.employee_id)!.add(dateKey);
    }

    const leavesByEmployee = new Map<number, any[]>();

    for (const leave of leaveRecords) {
      if (!leavesByEmployee.has(leave.employeeId)) {
        leavesByEmployee.set(leave.employeeId, []);
      }

      leavesByEmployee.get(leave.employeeId)!.push(leave);
    }

    const data = employees.map((employee: any) => {
      const employeeId = Number(employee.id);
      const presentDates =
        attendanceByEmployee.get(employeeId) ?? new Set<string>();
      const leaves = leavesByEmployee.get(employeeId) ?? [];

      const paidLeaveDays = leaves.reduce(
        (sum, leave) => sum + Number(leave.paidDays ?? 0),
        0,
      );

      const lwpDays = leaves.reduce(
        (sum, leave) => sum + Number(leave.lwpDays ?? 0),
        0,
      );

      const daysInMonth = new Date(year, month, 0).getDate();

      // Holidays with attendance are already counted as present; only exclude
      // holiday dates without attendance from the absent-day estimate.
      const holidayDays = holidayByDate.size;
      const holidaysWithoutAttendance = [...holidayByDate.keys()].filter(
        (dateKey) => !presentDates.has(dateKey),
      ).length;

      return {
        employeeId,
        employeeName: employee.name,
        email: employee.email,
        department: employee.department,
        siteCode: employee.siteCode,
        shiftCode: employee.shiftCode,
        summary: {
          daysInMonth,
          presentDays: presentDates.size,
          paidLeaveDays,
          lwpDays,
          holidayDays,
          holidays: [...holidayByDate.entries()].map(([date, name]) => ({
            date,
            name,
          })),
          // This remains a calendar-day estimate; holiday dates without attendance
          // are excluded from absences. Weekly-offs are not calculated here.
          absentCalendarDays: Math.max(
            0,
            daysInMonth -
              presentDates.size -
              paidLeaveDays -
              lwpDays -
              holidaysWithoutAttendance,
          ),
        },
      };
    });

    return res.status(200).json({
      company_code: companyCode,
      month,
      year,
      totalEmployees: data.length,
      employees: data,
    });
  } catch (error) {
    console.error("Monthly attendance summary error:", error);

    return res.status(500).json({
      message: "Failed to calculate monthly attendance summary",
    });
  }
};
export {
  punch,
  manualAdd,
  updateManualAttendance,
  getCompanyAttendance,
  getSingleEmployeeAttendance,
  punchController,
  getMonthlyAttendanceSummary,
};
