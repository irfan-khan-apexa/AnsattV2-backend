import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface DepartmentPolicyAttributes {
  id: number;
  companyCode: string;
  departmentId: number;

  attendancePolicy: {
    allowWFH: boolean;
    maxWFHDaysPerMonth: number;
    allowLatePunch: boolean;
    latePunchLimit: number;
    allowGeoFenceBypass: boolean;
    allowRemoteLocation: boolean;
    enforceGeoFence: boolean;
    standardDailyHours: number;
    standardWeeklyHours: number;
    halfDayThreshold: number;
    fullDayThreshold: number;
    earlyLogoutMinutes: number;
    forgotPunchAllowed: boolean;
    clientVisitAllowed: boolean;
    fieldForceTracking: boolean;
    onPremiseAttendance: boolean;
    remotePunchAllowed: boolean;
  };

  shiftPolicy: {
    allowNightShift: boolean;
    allowFlexibleShift: boolean;
    allowRotationalShift: boolean;
    shiftMode: "STANDARD" | "FLEXIBLE" | "ROTATIONAL" | "NIGHT";
    overtimeAllowed: boolean;
    maxOvertimeHours: number;
    undertimeAllowed: boolean;
  };

  leavePolicy: {
    requireApproval: boolean;
    approvalLevels: number;
    autoApprove: boolean;
    allowPaidLeave: boolean;
    allowHalfDay: boolean;
    allowEmergencyLeave: boolean;
    sandwichLeave: boolean;
    maxLeaveDays: number;
    carryForwardLeave: boolean;
    negativeLeaveBalance: boolean;
    leaveEncashment: boolean;
    hourlyLeaveAllowed: boolean;
    probationLeaveAllowed: boolean;
  };

  holidayPolicy: {
    nationalHoliday: boolean;
    stateHoliday: boolean;
    branchHoliday: boolean;
    optionalHoliday: boolean;
    festivalHoliday: boolean;
    weeklyOffPattern:
      | "SUNDAY_FIXED"
      | "ALTERNATE_SATURDAY"
      | "SAT_SUN"
      | "CUSTOM";
  };

  payrollPolicy: {
    allowBonus: boolean;
    allowIncentive: boolean;
    salaryEditable: boolean;
    showSalaryToEmployee: boolean;
    billableHoursEnabled: boolean;
  };

  documentPolicy: {
    canUploadDocuments: boolean;
    documentApprovalRequired: boolean;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export type DepartmentPolicyCreationAttributes = Optional<
  DepartmentPolicyAttributes,
  | "id"
  | "attendancePolicy"
  | "shiftPolicy"
  | "leavePolicy"
  | "holidayPolicy"
  | "payrollPolicy"
  | "documentPolicy"
  | "createdAt"
  | "updatedAt"
>;

export class DepartmentPolicy
  extends Model<DepartmentPolicyAttributes, DepartmentPolicyCreationAttributes>
  implements DepartmentPolicyAttributes
{
  public id!: number;
  public companyCode!: string;
  public departmentId!: number;

  public attendancePolicy!: DepartmentPolicyAttributes["attendancePolicy"];
  public shiftPolicy!: DepartmentPolicyAttributes["shiftPolicy"];
  public leavePolicy!: DepartmentPolicyAttributes["leavePolicy"];
  public holidayPolicy!: DepartmentPolicyAttributes["holidayPolicy"];
  public payrollPolicy!: DepartmentPolicyAttributes["payrollPolicy"];
  public documentPolicy!: DepartmentPolicyAttributes["documentPolicy"];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DepartmentPolicy.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    companyCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    departmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    attendancePolicy: {
      type: DataTypes.JSON,
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
      type: DataTypes.JSON,
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
      type: DataTypes.JSON,
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
      type: DataTypes.JSON,
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
      type: DataTypes.JSON,
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
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        canUploadDocuments: true,
        documentApprovalRequired: false,
      },
    },
  },
  {
    sequelize,
    modelName: "DepartmentPolicy",
    tableName: "department_policies",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["companyCode", "departmentId"],
      },
    ],
  },
);
DepartmentPolicy.sync();

export default DepartmentPolicy;
