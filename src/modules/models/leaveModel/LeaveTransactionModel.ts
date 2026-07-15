import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

class LeaveTransaction extends Model {
  public id!: number;
  public companyCode!: string;
  public employeeId!: number;
  public employeeName!: string;
  public category!: string;
  public startDate!: Date;
  public endDate!: Date;
  public noOfDays!: number;

  // LWP
  public paidDays!: number;
  public paidLeaveDays!: number;
  public lwpDays!: number;
  public isLwp!: boolean;

  public reason!: string;
  public status!: string;
  public document?: string;
  public extraFields?: any;
  public actionBy?: number | null;
  public actionReason?: string | null;
}

LeaveTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    companyCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    employeeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    employeeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    noOfDays: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    // Paid Days
    paidDays: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    // Paid Leave Days
    paidLeaveDays: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    // LWP Days
    lwpDays: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    // Is Complete Leave LWP
    isLwp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "Pending",
    },

    document: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    extraFields: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    actionBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    actionReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "leave_transactions",
    timestamps: true,
  }
);

export { LeaveTransaction };