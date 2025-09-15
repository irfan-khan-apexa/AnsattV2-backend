import { Op } from "sequelize";
import { FinancialYear, Onboarding, LeaveMaster, LeaveTransaction } from "../modules/models/index";

export const calculateLeaveBalance = async (employeeId: number, companyCode: string) => {
  // 1️ Financial Year
  const fy = await FinancialYear.findOne({ where: { companyCode } }); // 
  if (!fy) throw new Error("Financial year not set for company");

  const fyStart = new Date(fy.startDate);
  const fyEnd = new Date(fy.endDate);

  // 2️ Employee joining date
  const employee = await Onboarding.findByPk(employeeId);
  if (!employee) throw new Error("Employee not found");

  const joiningDate = employee.joining_date || fyStart; 
  const effectiveStart = joiningDate > fyStart ? joiningDate : fyStart;

  // 3️ Leave categories
  const categories = await LeaveMaster.findAll({
    where: {
    //   type: "leave_category",
      companyCode: companyCode, 
    },
  });

  let result: any[] = [];

  for (const category of categories) {
    const monthsLeft =
      (fyEnd.getFullYear() - effectiveStart.getFullYear()) * 12 +
      (fyEnd.getMonth() - effectiveStart.getMonth() + 1);

    const proratedLeaves = Math.floor((category.allowedLeaves / 12) * monthsLeft);

    const usedLeaves = await LeaveTransaction.sum("noOfDays", { // 
      where: {
        employeeId: employeeId,                                 // 
        category: category.name,
        // status: "Approved",
        startDate: { [Op.between]: [fyStart, fyEnd] },          // 
      },
    });

    result.push({
      category: category.name,
      allowed: proratedLeaves,
      used: usedLeaves || 0,
      balance: proratedLeaves - (usedLeaves || 0),
    });
  }

  return {
    employeeId,
    financialYear: `${fyStart.toDateString()} - ${fyEnd.toDateString()}`,
    leaves: result,
  };
};
