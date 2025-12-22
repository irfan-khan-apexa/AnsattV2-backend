import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface ExitFeedbackAttributes {
  id?: number;
  company_code: string;
  employee_id: number;
  improvements: string[]; // 3 items
  problems: string[];     // 3 items
  positives: string[];    // 3 items
  comments?: string | null;
  rating?: number | null; // 1-5
  created_by: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ExitFeedbackCreationAttributes = Optional<
  ExitFeedbackAttributes,
  "id" | "comments" | "rating" | "createdAt" | "updatedAt"
>;

export class ExitFeedback
  extends Model<ExitFeedbackAttributes, ExitFeedbackCreationAttributes>
  implements ExitFeedbackAttributes
{
  public id!: number;
  public company_code!: string;
  public employee_id!: number;
  public improvements!: string[];
  public problems!: string[];
  public positives!: string[];
  public comments!: string | null;
  public rating!: number | null;
  public created_by!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExitFeedback.init(
  {
    company_code: { type: DataTypes.STRING, allowNull: false },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    improvements: { type: DataTypes.JSON, allowNull: false },
    problems: { type: DataTypes.JSON, allowNull: false },
    positives: { type: DataTypes.JSON, allowNull: false },
    comments: { type: DataTypes.TEXT, allowNull: true },
    rating: { type: DataTypes.INTEGER, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: "exit_feedbacks", timestamps: true }
);
// ExitFeedback.sync()
export default ExitFeedback;
