import { Response } from "express";
import { Op, literal } from "sequelize";

import { Onboarding } from "../../models";
import { CompanyRequest } from "../../../middlewares/authMiddleware";

const getPlatformDashboard = async (
  req: CompanyRequest,
  res: Response,
): Promise<any> => {
  try {
    // ==================================================
    // COMPANY CODE FROM TOKEN
    // ==================================================
    const company_code = req.user.company_code;

    const now = new Date();

    // Current month start
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );

    // Next month start
    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0,
    );

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      newEmployeesThisMonth,
      exitedEmployees,
    ] = await Promise.all([
      // --------------------------------------------------
      // 1. Total Employees
      // --------------------------------------------------
      // Only employees who have NOT exited the company
      Onboarding.count({
        where: {
          company_code,

          [Op.and]: [literal("exit_date IS NULL")],
        },
      }),

      // --------------------------------------------------
      // 2. Active Employees
      // --------------------------------------------------
      // status = true
      // AND employee has NOT exited
      Onboarding.count({
        where: {
          company_code,
          status: true,

          [Op.and]: [literal("exit_date IS NULL")],
        },
      }),

      // --------------------------------------------------
      // 3. Inactive Employees
      // --------------------------------------------------
      // status = false
      // AND employee has NOT exited
      //
      // Exited employees will NOT be counted as inactive.
      Onboarding.count({
        where: {
          company_code,
          status: false,

          [Op.and]: [literal("exit_date IS NULL")],
        },
      }),

      // --------------------------------------------------
      // 4. New Employees This Month
      // --------------------------------------------------
      Onboarding.count({
        where: {
          company_code,

          joining_date: {
            [Op.gte]: monthStart,
            [Op.lt]: nextMonthStart,
          },
        },
      }),

      // --------------------------------------------------
      // 5. Exited Employees
      // --------------------------------------------------
      // Employees who have an exit date
      Onboarding.count({
        where: {
          company_code,

          [Op.and]: [literal("exit_date IS NOT NULL")],
        },
      }),
    ]);

    // ==================================================
    // PLATFORM DASHBOARD RESPONSE
    // ==================================================

    const allEmployees = await Onboarding.findAll({
      where: {
        company_code,
      },
      attributes: [
        "id",
        "name",
        "company_code",
        "status",
        "joining_date",
        "exit_date",
      ],
      raw: true,
    });

    console.log("TOKEN COMPANY CODE:", company_code);
    console.log("EMPLOYEE COUNT:", allEmployees.length);
    console.table(allEmployees);

    const totalTest = await Onboarding.count({
      where: {
        company_code,
      },
    });

    console.log("COUNT WITHOUT EXIT FILTER:", totalTest);

    const totalActiveTest = await Onboarding.count({
      where: {
        company_code,
        status: 1,
      },
    });

    console.log("ACTIVE COUNT:", totalActiveTest);

    return res.status(200).json({
      success: true,
      message: "Platform dashboard fetched successfully",

      data: {
        company_code,

        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        newEmployeesThisMonth,
        exitedEmployees,

        // ------------------------------------------------
        // These require additional data/model
        // ------------------------------------------------

        employeesByLocation: [],

        monthlyActiveUsers: null,

        dailyActiveUsers: null,
      },
    });
  } catch (error: any) {
    console.error("Platform Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching platform dashboard",
      error: error.message,
    });
  }
};

export { getPlatformDashboard };
