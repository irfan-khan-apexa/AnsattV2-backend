import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface HolidayMasterAttributes {
  id: number;
  companyCode: string;
  year: number;
  date: string;
  name: string;
  type: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type HolidayMasterCreationAttributes = Optional<
  HolidayMasterAttributes,
  "id" | "type" | "createdAt" | "updatedAt"
>;

export class HolidayMaster
  extends Model<HolidayMasterAttributes, HolidayMasterCreationAttributes>
  implements HolidayMasterAttributes
{
  public id!: number;
  public companyCode!: string;
  public year!: number;
  public date!: string;
  public name!: string;
  public type!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

HolidayMaster.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    companyCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "GOVT",
    },
  },
  {
    sequelize,
    modelName: "HolidayMaster",
    tableName: "holiday_masters",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["companyCode", "date"],
      },
      {
        fields: ["companyCode", "year"],
      },
    ],
  },
);
HolidayMaster.sync();

export default HolidayMaster;
