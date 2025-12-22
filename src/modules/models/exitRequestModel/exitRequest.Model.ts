import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";
import { Company } from "../companyModel/company.Model";
import { Onboarding } from "../onboardingModel/Onboarding.Model";

interface ExitRequestAttributes {
  id?: number;
  company_code: string;
  employee_id: number;
  exit_type: "Resignation" | "Termination";
  request_date?: Date;
  notice_start_date: Date;
  notice_end_date: Date;
  notice_status?: "Pending" | "In Progress" | "Completed";
  current_stage?: string;
  overall_status?: "Pending" | "Approved" | "Rejected";
  remarks?: string;
  exit_date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExitRequestCreationAttributes
  extends Optional<
    ExitRequestAttributes,
    | "id"
    | "request_date"
    | "notice_status"
    | "current_stage"
    | "overall_status"
    | "remarks"
    | "exit_date"
  > {}

class ExitRequest
  extends Model<ExitRequestAttributes, ExitRequestCreationAttributes>
  implements ExitRequestAttributes
{
  public id!: number;
  public company_code!: string;
  public employee_id!: number;
  public exit_type!: "Resignation" | "Termination";
  public request_date!: Date;
  public notice_start_date!: Date;
  public notice_end_date!: Date;
  public notice_status!: "Pending" | "In Progress" | "Completed";
  public current_stage!: string;
  public overall_status!: "Pending" | "Approved" | "Rejected";
  public remarks?: string;
  public exit_date?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  exit_reason: any;
  employee: any;
}

ExitRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exit_type: {
      type: DataTypes.ENUM("Resignation", "Termination"),
      allowNull: false,
    },
    request_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    notice_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notice_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notice_status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed"),
      defaultValue: "Pending",
    },
    current_stage: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    overall_status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    exit_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "exits",
    timestamps: true,
  }
);

//  Relations
ExitRequest.belongsTo(Company, {
  foreignKey: "company_code",
  targetKey: "company_code",
});

ExitRequest.belongsTo(Onboarding, {
  foreignKey: "employee_id",
  targetKey: "id",
});
// ExitRequest.sync();

export { ExitRequest };
