import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface InterviewFeedbackAttributes {
  id?: number;

  interview_id: number;
  application_id: number;

  round_number: number;

  interviewer_id?: string;

  technical_skills: number;
  communication: number;
  culture_fit: number;
  problem_solving: number;
  leadership: number;

  additional_notes?: string;

  final_recommendation: string; // hire / reject / hold
}

export class InterviewFeedback
  extends Model<InterviewFeedbackAttributes>
  implements InterviewFeedbackAttributes
{
  public id!: number;

  public interview_id!: number;
  public application_id!: number;

  public round_number!: number;

  public interviewer_id!: string;

  public technical_skills!: number;
  public communication!: number;
  public culture_fit!: number;
  public problem_solving!: number;
  public leadership!: number;

  public additional_notes!: string;

  public final_recommendation!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InterviewFeedback.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    interview_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    round_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    interviewer_id: DataTypes.STRING,

    technical_skills: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    communication: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    culture_fit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    problem_solving: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    leadership: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    additional_notes: DataTypes.TEXT,

    final_recommendation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "interview_feedbacks",
    timestamps: true,
  }
);

// InterviewFeedback.sync();

export default InterviewFeedback;