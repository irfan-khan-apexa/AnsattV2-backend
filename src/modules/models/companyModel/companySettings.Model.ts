import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface CompanySettingsAttributes {
  id?: number;
  company_code: string;
  company_name: string;
  company_logo?: string | null;
  brand_color?: string | null;
  language?: string;

  // 🔥 RBAC ROOT PERMISSIONS
  permissions?: Record<string, string[]>;
}

export type CompanySettingsCreationAttributes = Optional<
  CompanySettingsAttributes,
  "id" | "company_logo" | "brand_color" | "language" | "permissions"
>;

export class CompanySettings
  extends Model<CompanySettingsAttributes, CompanySettingsCreationAttributes>
  implements CompanySettingsAttributes
{
  public id!: number;
  public company_code!: string;
  public company_name!: string;
  public company_logo!: string | null;
  public brand_color!: string | null;
  public language!: string;
  public permissions!: Record<string, string[]>;
}

CompanySettings.init(
  {
    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_logo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    brand_color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "#670edcff",
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "en",
    },

    //  ROOT PERMISSION LAYER
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        onboarding: ["read", "create", "update", "delete"],
        leaves: ["read", "create"],
        assets: ["read", "create", "update"],
        salary: [],
        hrAnnouncement: ["read"],
        roles: ["read", "create"],
      },
    },
  },
  {
    sequelize,
    tableName: "company_settings",
    timestamps: true,
  }
);


// CompanySettings.sync({ alter: true });
// CompanySettings.sync();
export default CompanySettings;
