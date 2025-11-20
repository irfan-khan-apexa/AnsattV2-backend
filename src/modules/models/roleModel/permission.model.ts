import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

export class Permission extends Model {
  [x: string]: any;
  id!: number;
  key!: string;
  description!: string | null;
  company_code!: string | null;
}

Permission.init(
  {
    key: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    company_code: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: "permissions", timestamps: true }
);

export default Permission;
