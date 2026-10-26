import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export type WFHStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface WFHRequestAttributes {
  id: number;
  company_code: string;
  employee_id: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: WFHStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WFHRequestCreationAttributes = Optional<
  WFHRequestAttributes,
  "id" | "status" | "approvedBy" | "approvedAt" | "createdAt" | "updatedAt"
>;

export class WFHRequest
  extends Model<WFHRequestAttributes, WFHRequestCreationAttributes>
  implements WFHRequestAttributes
{
  public id!: number;
  public company_code!: string;
  public employee_id!: number;
  public startDate!: string;
  public endDate!: string;
  public reason!: string;
  public status!: WFHStatus;
  public approvedBy!: string | null;
  public approvedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WFHRequest.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    approvedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "WFHRequest",
    tableName: "wfh_requests",
    timestamps: true,
    indexes: [
      { fields: ["company_code"] },
      { fields: ["employee_id"] },
      { fields: ["status"] },
    ],
  },
);
WFHRequest.sync();

export default WFHRequest;
