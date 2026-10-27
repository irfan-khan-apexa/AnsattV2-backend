import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export type WFHStatus = "PENDING" | "APPROVED" | "REJECTED";

interface WFHRequestAttributes {
  id: number;
  companyCode: string;
  employeeId: number;
  departmentId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: WFHStatus;
  approvedBy: number | null;
  approvedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WFHRequestCreationAttributes extends Optional<
  WFHRequestAttributes,
  "id" | "status" | "approvedBy" | "approvedAt" | "createdAt" | "updatedAt"
> {}

class WFHRequest
  extends Model<WFHRequestAttributes, WFHRequestCreationAttributes>
  implements WFHRequestAttributes
{
  declare id: number;
  declare companyCode: string;
  declare employeeId: number;
  declare departmentId: number;
  declare startDate: string;
  declare endDate: string;
  declare reason: string;
  declare status: WFHStatus;
  declare approvedBy: number | null;
  declare approvedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

WFHRequest.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    companyCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "company_code",
    },

    employeeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "employee_id",
    },

    departmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "department_id",
    },

    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "start_date",
    },

    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "end_date",
    },

    reason: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    approvedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "approved_by",
    },

    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "approved_at",
    },
  },
  {
    sequelize,
    tableName: "wfh_requests",
    timestamps: true,
    indexes: [
      {
        fields: ["company_code", "employee_id"],
      },
      {
        fields: ["company_code", "status"],
      },
      {
        fields: ["start_date", "end_date"],
      },
    ],
  },
);
WFHRequest.sync();
export { WFHRequest };
