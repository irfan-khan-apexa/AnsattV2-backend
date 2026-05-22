import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface LetterAccessRequestAttributes {
  id?: number;
  company_code: string;
  employee_id: number;
  letter_type: "offer_letter" | "joining_letter" | "experience_letter" | "exit_letter";
  status?: "Pending" | "Approved" | "Rejected";
  requested_at?: Date;
  actioned_at?: Date | null;
  actioned_by?: number | null; // HR id
  remarks?: string | null;
}

export type LetterAccessRequestCreationAttributes = Optional<
  LetterAccessRequestAttributes,
  "id" | "status" | "requested_at" | "actioned_at" | "actioned_by" | "remarks"
>;

export class LetterAccessRequest
  extends Model<LetterAccessRequestAttributes, LetterAccessRequestCreationAttributes>
  implements LetterAccessRequestAttributes
{
  public id!: number;
  public company_code!: string;
  public employee_id!: number;
  public letter_type!: any;
  public status!: any;
  public requested_at!: Date;
  public actioned_at!: Date | null;
  public actioned_by!: number | null;
  public remarks!: string | null;
}

LetterAccessRequest.init(
  {
    company_code: { type: DataTypes.STRING, allowNull: false },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    letter_type: {
      type: DataTypes.ENUM(
        "offer_letter",
        "joining_letter",
        "experience_letter",
        "exit_letter"
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
    requested_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    actioned_at: { type: DataTypes.DATE, allowNull: true },
    actioned_by: { type: DataTypes.INTEGER, allowNull: true },
    remarks: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    tableName: "letter_access_requests",
    timestamps: false,
  }
);

// LetterAccessRequest.sync();

export default LetterAccessRequest;
