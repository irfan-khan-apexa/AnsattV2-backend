import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface EmployeeAttributes {
  id: number;
  name: string;
  email: string;
  contact: string;
  role: string;
  company_code: string; //  foreign key to Company
  password: string;
  created_at?: Date;
  deleted_at?: Date;
}

interface EmployeeCreationAttributes
  extends Optional<EmployeeAttributes, "id" | "created_at"> {}

export class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public contact!: string;
  public role!: string;
  public company_code!: string;
  public password!: string;
  public readonly created_at!: Date;
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    contact: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, allowNull: false },
    company_code: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
    timestamps: false,
  }
);

Employee.sync();
export default Employee;
