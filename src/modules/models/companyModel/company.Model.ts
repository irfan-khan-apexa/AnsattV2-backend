import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

interface CompanyAttributes {
  id: number;
  name: string;
  address: string;
  contact: string;
  company_code: string;
  password: string;
  created_at?: Date;
}

interface CompanyCreationAttributes
  extends Optional<CompanyAttributes, "id" | "created_at"> {}

class Company
  extends Model<CompanyAttributes, CompanyCreationAttributes>
  implements CompanyAttributes
{
  public id!: number;
  public name!: string;
  public address!: string;
  public contact!: string;
  public company_code!: string;
  public password!: string;
  public readonly created_at!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: true },
    contact: { type: DataTypes.STRING, allowNull: true },
    company_code: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Company",
    tableName: "companies",
    timestamps: false,
  }
);
// Company.sync();
export { Company };
