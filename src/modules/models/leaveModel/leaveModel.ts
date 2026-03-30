import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

interface LeaveAttributes {
  id: number;
  employeeId: number;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface LeaveCreationAttributes
  extends Optional<LeaveAttributes, "id" | "status"> {}

class Leave
  extends Model<LeaveAttributes, LeaveCreationAttributes>
  implements LeaveAttributes
{
  public id!: number;
  public employeeId!: number;
  public type!: string;
  public startDate!: Date;
  public endDate!: Date;
  public reason!: string;
  public status!: "Pending" | "Approved" | "Rejected";
}

Leave.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      allowNull: false,
      defaultValue: "Pending",
    },
  },
  {
    sequelize,
    tableName: "leaves",
    timestamps: true,
  }
);

Leave.sync();

export { Leave };
