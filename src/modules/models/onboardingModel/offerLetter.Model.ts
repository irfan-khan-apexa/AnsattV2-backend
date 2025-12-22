import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface OfferLetterAttributes {
  id: number;
  employee_id: number;
  terms: string;
  status: string; // e.g., Pending, Approved, Sent
  created_at?: Date;
}

interface OfferLetterCreationAttributes
  extends Optional<OfferLetterAttributes, "id" | "created_at"> {}

export class OfferLetter
  extends Model<OfferLetterAttributes, OfferLetterCreationAttributes>
  implements OfferLetterAttributes
{
  public id!: number;
  public employee_id!: number;
  public terms!: string;
  public status!: string;
  public readonly created_at!: Date;
}

OfferLetter.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    terms: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pending",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "offer_letters",
    modelName: "OfferLetter",
    timestamps: false,
  }
);

// OfferLetter.sync();
export default OfferLetter;
