import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface SiteAttributes {
  id: number;
  name: string;
  location: string;
  sitecode: string;
  company_code: string;

  // Geofencing fields
  latitude: number;
  longitude: number;
  radius: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export type SiteCreationAttributes = Optional<
  SiteAttributes,
  "id" | "radius" | "createdAt" | "updatedAt"
>;

export class Site
  extends Model<SiteAttributes, SiteCreationAttributes>
  implements SiteAttributes
{
  public id!: number;
  public name!: string;
  public location!: string;
  public sitecode!: string;
  public company_code!: string;

  public latitude!: number;
  public longitude!: number;
  public radius!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Site.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    sitecode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    radius: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
  },
  {
    sequelize,
    modelName: "Site",
    tableName: "sites",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["sitecode", "company_code"],
      },
    ],
  },
);
Site.sync();

export default Site;
