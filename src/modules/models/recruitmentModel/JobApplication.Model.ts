import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface JobApplicationAttributes {
  id?: number;
  company_code: string;

  job_id: number;

  name: string;
  email: string;
  phone: string;

  resume_url?: string;
  cover_letter?: string;

  status?: string;

  rejected_at?: Date;

  deleted_at?: Date;
}

export class JobApplication
  extends Model<JobApplicationAttributes>
  implements JobApplicationAttributes
{
  public id!: number;
  public company_code!: string;

  public job_id!: number;

  public name!: string;
  public email!: string;
  public phone!: string;

  public resume_url!: string;
  public cover_letter!: string;

  public status!: string;

  public rejected_at!: Date;

  public deleted_at!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

JobApplication.init(
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

    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,

    resume_url: DataTypes.TEXT,

    cover_letter: DataTypes.TEXT,

    status: {
      type: DataTypes.STRING,
      defaultValue: "applied",
    },

    rejected_at: DataTypes.DATE,

    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "job_applications",
    timestamps: true,
    paranoid: true,
  }
);
JobApplication.sync();
export default JobApplication;