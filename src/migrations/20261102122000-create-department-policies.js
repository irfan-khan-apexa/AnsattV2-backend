"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("department_policies", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      companyCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      departmentId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      attendancePolicy: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          allowWFH: false,
          maxWFHDaysPerMonth: 0,
          allowLatePunch: false,
          latePunchLimit: 0,
          allowGeoFenceBypass: false,
          allowRemoteLocation: false,
          enforceGeoFence: true,
          standardDailyHours: 9,
          standardWeeklyHours: 45,
          halfDayThreshold: 4,
          fullDayThreshold: 8,
          earlyLogoutMinutes: 30,
          forgotPunchAllowed: false,
          clientVisitAllowed: false,
          fieldForceTracking: false,
          onPremiseAttendance: true,
          remotePunchAllowed: false,
        },
      },

      shiftPolicy: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          allowNightShift: false,
          allowFlexibleShift: false,
          allowRotationalShift: false,
          shiftMode: "STANDARD",
          overtimeAllowed: false,
          maxOvertimeHours: 0,
          undertimeAllowed: false,
        },
      },

      leavePolicy: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          requireApproval: true,
          approvalLevels: 1,
          autoApprove: false,
          allowPaidLeave: true,
          allowHalfDay: false,
          allowEmergencyLeave: false,
          sandwichLeave: false,
          maxLeaveDays: 0,
          carryForwardLeave: false,
          negativeLeaveBalance: false,
          leaveEncashment: false,
          hourlyLeaveAllowed: false,
          probationLeaveAllowed: false,
        },
      },

      holidayPolicy: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          nationalHoliday: true,
          stateHoliday: true,
          branchHoliday: true,
          optionalHoliday: false,
          festivalHoliday: true,
          weeklyOffPattern: "SUNDAY_FIXED",
        },
      },

      payrollPolicy: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          allowBonus: false,
          allowIncentive: false,
          salaryEditable: false,
          showSalaryToEmployee: false,
          billableHoursEnabled: false,
        },
      },

      documentPolicy: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          canUploadDocuments: true,
          documentApprovalRequired: false,
        },
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex(
      "department_policies",
      ["companyCode", "departmentId"],
      { unique: true },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("department_policies");
  },
};
