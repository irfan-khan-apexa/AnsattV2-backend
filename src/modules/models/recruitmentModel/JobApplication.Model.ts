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

  parsed_skills?: string;
  match_score?: number;

  rank?: number;

  status?: string;
  rejected_at?: Date;
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

  public parsed_skills!: string;
  public match_score!: number;

  public rank!: number;

  public status!: string;
  public rejected_at!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date; // Sequelize ka default
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

    parsed_skills: DataTypes.TEXT,

    match_score: DataTypes.FLOAT,

    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "applied",
    },

    rejected_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "job_applications",
    timestamps: true,
    paranoid: true,
  }
);

// JobApplication.sync({ alter: true });

export default JobApplication;