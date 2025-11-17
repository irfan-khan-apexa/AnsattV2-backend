import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface AssetAssignAttributes {
  id?: number;
  asset_id: number;
  employee_id: number;
  company_code: string;
  issued_at: Date;
  returned_at?: Date | null;
  issued_by: number;
  returned_by?: number | null;
  note?: string | null;
  condition_on_return?: string | null;
  status: string; // issued | returned
}

export type AssetAssignCreationAttributes = Optional<
  AssetAssignAttributes,
  "id" | "returned_at" | "returned_by" | "note" | "condition_on_return"
>;

export class AssetAssign extends Model<AssetAssignAttributes, AssetAssignCreationAttributes> implements AssetAssignAttributes {
  public id!: number;
  public asset_id!: number;
  public employee_id!: number;
  public company_code!: string;
  public issued_at!: Date;
  public returned_at!: Date | null;
  public issued_by!: number;
  public returned_by!: number | null;
  public note!: string | null;
  public condition_on_return!: string | null;
  public status!: string;
}

AssetAssign.init(
  {
    asset_id: { type: DataTypes.INTEGER, allowNull: false },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    company_code: { type: DataTypes.STRING, allowNull: false },
    issued_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    returned_at: { type: DataTypes.DATE, allowNull: true },
    issued_by: { type: DataTypes.INTEGER, allowNull: false },
    returned_by: { type: DataTypes.INTEGER, allowNull: true },
    note: { type: DataTypes.TEXT, allowNull: true },
    condition_on_return: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "issued" },
  },
  { sequelize, tableName: "asset_assigns", timestamps: true }
);

// AssetAssign.sync({ alter: true });

export default AssetAssign;
