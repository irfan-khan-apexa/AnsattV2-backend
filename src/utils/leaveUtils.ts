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
      (await LeaveTransaction.sum("paidLeaveDays", {
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