import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

class LeaveTransaction extends Model {
  public id!: number;
  public employeeId!: number;
  public employeeName!: string; 
  public category!: string;
  public startDate!: Date;
  public endDate!: Date;
  public noOfDays!: number;
  public reason!: string;       // user reason
  public status!: string;       // Pending | Approved | Rejected
  public document?: string;
  public extraFields?: any;
 public actionBy?: number | null;     // ✅ HR/Manager ka ID
  public actionReason?: string | null;; // optional reason for rejection
}

LeaveTransaction.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    employeeName: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    noOfDays: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "Pending" },
    document: { type: DataTypes.STRING, allowNull: true },
    extraFields: { type: DataTypes.JSON, allowNull: true },
    actionBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }, 
    actionReason: { type: DataTypes.STRING, allowNull: true }, 
  },
  { sequelize, tableName: "leave_transactions", timestamps: true }
);


// LeaveTransaction.sync({ alter: true });

export { LeaveTransaction };
