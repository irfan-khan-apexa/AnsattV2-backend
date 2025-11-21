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
  deductions?: number | null; // employee-side deductions
  bonus?: number | null;
  net_salary: number;

  // NEW fields
  gross?: number | null; // basic + hra + allowances + bonus
  pf_esic_pt?: number | null; // employee PF / ESIC / Professional Tax combined (employee contribution)
  employer_pf?: number | null; // employer PF contribution
  ctc?: number | null; // gross + employer contributions

  generated_by: number; // HR/Admin who generated
  salary_slip?: string | null; // encrypted Wasabi URL
}

// For creation, `id` and optional fields are not required
export type SalaryCreationAttributes = Optional<
  SalaryAttributes,
  | "id"
  | "hra"
  | "allowances"
  | "deductions"
  | "bonus"
  | "salary_slip"
  | "gross"
  | "pf_esic_pt"
  | "employer_pf"
  | "ctc"
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

  // NEW
  public gross!: number | null;
  public pf_esic_pt!: number | null;
  public employer_pf!: number | null;
  public ctc!: number | null;

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

    // NEW fields
    gross: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    pf_esic_pt: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    employer_pf: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    ctc: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },

    net_salary: { type: DataTypes.FLOAT, allowNull: false },
    generated_by: { type: DataTypes.INTEGER, allowNull: false },
    salary_slip: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: "salaries", timestamps: true }
);

Salary.sync();
export default Salary;
