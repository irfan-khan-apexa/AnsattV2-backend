import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

class LeaveTransaction extends Model {
  public id!: number;
  public employeeId!: number;
  public employeeName!: string; 
  public category!: string;     // dynamic: user-defined leave category
  public startDate!: Date;
  public endDate!: Date;
  public noOfDays!: number;
  public reason!: string;
  public status!: string;       // ✅ no ENUM → "Pending", "Approved", "Rejected", or any new status user adds
  public document?: string;
  public extraFields?: any;     // ✅ dynamic JSON for custom fields
}

LeaveTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      employeeName: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false }, // ✅ dynamic category
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    noOfDays: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "Pending" }, // ✅ fully dynamic
    document: { type: DataTypes.STRING, allowNull: true },
    extraFields: { type: DataTypes.JSON, allowNull: true }, // ✅ dynamic fields
  },
  {
    sequelize,
    tableName: "leave_transactions",
    timestamps: true,
  }
);
LeaveTransaction.sync({ alter: true });

export { LeaveTransaction };
