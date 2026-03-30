import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface AssetAttributes {
  id?: number;
  company_code: string;
  name: string;
  asset_type?: string | null; // laptop, phone, id-card, furniture...
  serial_number?: string | null;
  purchase_date?: Date | null;
  purchase_value?: number | null;
  condition?: string | null; // new / good / damaged
  location?: string | null;
  status?: string; // available | assigned | maintenance | disposed
  assigned_to?: number | null; // current employee_id (nullable)
  generated_by: number; // who created the asset
}

export type AssetCreationAttributes = Optional<
  AssetAttributes,
  "id" | "asset_type" | "serial_number" | "purchase_date" | "purchase_value" | "condition" | "location" | "status" | "assigned_to"
>;

export class Asset extends Model<AssetAttributes, AssetCreationAttributes> implements AssetAttributes {
  public id!: number;
  public company_code!: string;
  public name!: string;
  public asset_type!: string | null;
  public serial_number!: string | null;
  public purchase_date!: Date | null;
  public purchase_value!: number | null;
  public condition!: string | null;
  public location!: string | null;
  public status!: string;
  public assigned_to!: number | null;
  public generated_by!: number;
}

Asset.init(
  {
    company_code: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    asset_type: { type: DataTypes.STRING, allowNull: true },
    serial_number: { type: DataTypes.STRING, allowNull: true },
    purchase_date: { type: DataTypes.DATE, allowNull: true },
    purchase_value: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    condition: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "available" },
    assigned_to: { type: DataTypes.INTEGER, allowNull: true },
    generated_by: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: "assets", timestamps: true }
);

Asset.sync();


export default Asset;
