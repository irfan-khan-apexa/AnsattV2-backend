import { Op, fn, col, where } from "sequelize";
import {
  FinancialYear,
  Onboarding,
  LeaveMaster,
  LeaveTransaction,
} from "../modules/models";

export const calculateLeaveBalance = async (
  employeeId: number,
  companyCode: string
) => {
  // Financial Year
  const fy = await FinancialYear.findOne({
    where: {
      companyCode,
      isActive: true,
    },
  });

  if (!fy) throw new Error("Financial year not set for company");

  const fyStart = new Date(fy.startDate);
  const fyEnd = new Date(fy.endDate);

  // Employee
  const employee = await Onboarding.findByPk(employeeId);

  if (!employee) throw new Error("Employee not found");

  const joiningDate = employee.joining_date || fyStart;

  const effectiveStart =
    joiningDate > fyStart ? joiningDate : fyStart;

  // Leave Categories
  const categories = await LeaveMaster.findAll({
    where: {
      companyCode,
    },
  });

  const result: any[] = [];

  for (const category of categories) {
    const categoryName = category.name.trim().toLowerCase();

    const monthsLeft =
      (fyEnd.getFullYear() - effectiveStart.getFullYear()) * 12 +
      (fyEnd.getMonth() - effectiveStart.getMonth() + 1);

    const allowedLeaves = Math.floor(
      (category.allowedLeaves / 12) * monthsLeft
    );

    // Pending + Approved Paid Leave
 const paidLeave =
  (await LeaveTransaction.sum("paidDays", {
        where: {
          companyCode,
          employeeId,
          status: {
            [Op.in]: ["Pending", "Approved"],
          },
          startDate: {
            [Op.between]: [fyStart, fyEnd],
          },
          [Op.and]: [
            where(
              fn("LOWER", fn("TRIM", col("category"))),
              categoryName
            ),
          ],
        },
      })) || 0;

    // Approved LWP
    const lwpDays =
      (await LeaveTransaction.sum("lwpDays", {
        where: {
          companyCode,
          employeeId,
          status: "Approved",
          startDate: {
            [Op.between]: [fyStart, fyEnd],
          },
          [Op.and]: [
            where(
              fn("LOWER", fn("TRIM", col("category"))),
              categoryName
            ),
          ],
        },
      })) || 0;

    result.push({
      category: category.name,
      allowed: allowedLeaves,
      used: paidLeave,
      balance: Math.max(allowedLeaves - paidLeave, 0),
      lwpTaken: lwpDays,
    });
  }

  return {
    employeeId,
    financialYear: `${fyStart.toDateString()} - ${fyEnd.toDateString()}`,
    leaves: result,
  };
};


export const calculateAllEmployeesLeaveBalance = async (
  companyCode: string
) => {
  // ==============================
  // Financial Year
  // ==============================

  const fy = await FinancialYear.findOne({
    where: {
      companyCode,
      isActive: true,
    },
  });

  if (!fy) {
    throw new Error("Financial year not set for company");
  }

  const fyStart = new Date(fy.startDate);
  const fyEnd = new Date(fy.endDate);

  // ==============================
  // Load Everything (Only 3 more queries)
  // ==============================

  const [employees, categories, transactions] = await Promise.all([
    Onboarding.findAll({
      where: {
        company_code: companyCode,
      },
      order: [["name", "ASC"]],
    }),

    LeaveMaster.findAll({
      where: {
        companyCode,
      },
    }),

    LeaveTransaction.findAll({
      where: {
        companyCode,
        status: {
          [Op.in]: ["Pending", "Approved"],
        },
        startDate: {
          [Op.between]: [fyStart, fyEnd],
        },
      },
    }),
  ]);

  // ==========================================
  // Build Fast Lookup Map
  // employeeId -> category -> values
  // ==========================================

  const leaveMap = new Map<
    number,
    Map<
      string,
      {
        paid: number;
        lwp: number;
      }
    >
  >();

  for (const trx of transactions as any[]) {
    const employeeId = trx.employeeId;

    const category = trx.category.trim().toLowerCase();

    if (!leaveMap.has(employeeId)) {
      leaveMap.set(employeeId, new Map());
    }

    const employeeLeaves = leaveMap.get(employeeId)!;

    if (!employeeLeaves.has(category)) {
      employeeLeaves.set(category, {
        paid: 0,
        lwp: 0,
      });
    }

    const current = employeeLeaves.get(category)!;

    // Pending + Approved consume leave balance
    current.paid += trx.paidDays || 0;

    // Only Approved contributes LWP
    if (trx.status === "Approved") {
      current.lwp += trx.lwpDays || 0;
    }
  }

  // ==========================================
  // Prepare Response
  // ==========================================

  const result = [];

  for (const employee of employees as any[]) {
    const joiningDate =
      employee.joining_date || fyStart;

    const effectiveStart =
      joiningDate > fyStart
        ? joiningDate
        : fyStart;

    const monthsLeft =
      (fyEnd.getFullYear() -
        effectiveStart.getFullYear()) *
        12 +
      (fyEnd.getMonth() -
        effectiveStart.getMonth() +
        1);

    const employeeLeaveMap =
      leaveMap.get(employee.id) ||
      new Map();

    const leaveBalances = [];

    for (const category of categories as any[]) {
      const categoryKey =
        category.name.trim().toLowerCase();

      const allowedLeaves = Math.floor(
        (category.allowedLeaves / 12) *
          monthsLeft
      );

      const leaveData =
        employeeLeaveMap.get(categoryKey);

      const used =
        leaveData?.paid || 0;

      const lwpTaken =
        leaveData?.lwp || 0;

      leaveBalances.push({
        category: category.name,
        allowed: allowedLeaves,
        used,
        balance: Math.max(
          allowedLeaves - used,
          0
        ),
        lwpTaken,
      });
    }

    result.push({
      employeeId: employee.id,
      employeeName: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joining_date,
      financialYear: `${fyStart.toDateString()} - ${fyEnd.toDateString()}`,
      leaves: leaveBalances,
    });
  }

  return result;
};