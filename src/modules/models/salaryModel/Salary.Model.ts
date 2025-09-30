import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface SalaryAttributes {
  id?: number;
  employee_id: number; // FK with Onboarding.id
  company_code: string; // Multi-tenant isolation
  month: string; // e.g., "2025-07"
  basic: number;
  hra?: number | null;
  allowances?: number | null;
  deductions?: number | null;
  bonus?: number | null;
  net_salary: number;
  generated_by: number; // HR/Admin who generated
  salary_slip?: string | null; // encrypted Wasabi URL
}

// For creation, `id` and optional fields are not required
export type SalaryCreationAttributes = Optional<
  SalaryAttributes,
  "id" | "hra" | "allowances" | "deductions" | "bonus" | "salary_slip"
>;

export class Salary
  extends Model<SalaryAttributes, SalaryCreationAttributes>
  implements SalaryAttributes
{
  public id!: number;
  public employee_id!: number;
  public company_code!: string;
  public month!: string;
  public basic!: number;
  public hra!: number | null;
  public allowances!: number | null;
  public deductions!: number | null;
  public bonus!: number | null;
  public net_salary!: number;
  public generated_by!: number;
  public salary_slip!: string | null;
}

Salary.init(
  {
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    company_code: { type: DataTypes.STRING, allowNull: false },
    month: { type: DataTypes.STRING, allowNull: false },
    basic: { type: DataTypes.FLOAT, allowNull: false },
    hra: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    allowances: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    deductions: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    bonus: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    net_salary: { type: DataTypes.FLOAT, allowNull: false },
    generated_by: { type: DataTypes.INTEGER, allowNull: false },
    salary_slip: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: "salaries", timestamps: true }
);

// Salary.sync({ alter: true });
export default Salary;
