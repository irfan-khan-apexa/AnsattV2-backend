import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface JobPostingAttributes {
  id?: number;
  company_code: string;

  job_title: string;
  department?: string;
  designation?: string;

  employment_type?: string;
  work_mode?: string;

  experience_min?: number;
  experience_max?: number;

  vacancies?: number;

  job_location?: string;

  salary_min?: number;
  salary_max?: number;
  currency?: string;

  job_summary?: string;
  responsibilities?: string;
  requirements?: string;
  skills_required?: string;

  application_deadline?: Date;

  status?: string;

  deleted_at?: Date;
}

export class JobPosting
  extends Model<JobPostingAttributes>
  implements JobPostingAttributes
{
  public id!: number;
  public company_code!: string;

  public job_title!: string;
  public department!: string;
  public designation!: string;

  public employment_type!: string;
  public work_mode!: string;

  public experience_min!: number;
  public experience_max!: number;

  public vacancies!: number;

  public job_location!: string;

  public salary_min!: number;
  public salary_max!: number;
  public currency!: string;

  public job_summary!: string;
  public responsibilities!: string;
  public requirements!: string;
  public skills_required!: string;

  public application_deadline!: Date;

  public status!: string;

  public deleted_at!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

JobPosting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    job_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    department: DataTypes.STRING,
    designation: DataTypes.STRING,

    employment_type: DataTypes.STRING,
    work_mode: DataTypes.STRING,

    experience_min: DataTypes.INTEGER,
    experience_max: DataTypes.INTEGER,

    vacancies: DataTypes.INTEGER,

    job_location: DataTypes.STRING,

    salary_min: DataTypes.INTEGER,
    salary_max: DataTypes.INTEGER,
    currency: DataTypes.STRING,

    job_summary: DataTypes.TEXT,
    responsibilities: DataTypes.TEXT,
    requirements: DataTypes.TEXT,
    skills_required: DataTypes.TEXT,

    application_deadline: DataTypes.DATE,

    status: {
      type: DataTypes.STRING,
      defaultValue: "draft",
    },

    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "job_postings",
    timestamps: true,
    paranoid: true,
  }
);
// JobPosting.sync();
export default JobPosting;