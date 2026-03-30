import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface InterviewAttributes {
  id?: number;

  application_id: number;
  job_id: number;
  company_code: string;

  round_number: number;
  interview_type: string;

  status?: string;

  scheduled_date: Date;
  start_time: string;
  end_time: string;

  interviewers: string;

  platform: string;
  meeting_link?: string;

  notes?: string;

  created_by?: string;
}

export class Interview
  extends Model<InterviewAttributes>
  implements InterviewAttributes
{
  public id!: number;

  public application_id!: number;
  public job_id!: number;
  public company_code!: string;

  public round_number!: number;
  public interview_type!: string;

  public status!: string;

  public scheduled_date!: Date;
  public start_time!: string;
  public end_time!: string;

  public interviewers!: string;

  public platform!: string;
  public meeting_link!: string;

  public notes!: string;

  public created_by!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Interview.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    round_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    interview_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "scheduled",
    },

    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    start_time: DataTypes.STRING,
    end_time: DataTypes.STRING,

    interviewers: DataTypes.TEXT,

    platform: DataTypes.STRING,
    meeting_link: DataTypes.TEXT,

    notes: DataTypes.TEXT,

    created_by: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "interviews",
    timestamps: true,
  }
);

// Interview.sync({ alter: true });
Interview.sync();

export default Interview;