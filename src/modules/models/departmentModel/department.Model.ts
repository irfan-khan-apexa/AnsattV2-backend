import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

class Department extends Model {
  public id!: number;
  public companyCode!: string;
  public name!: string;
  public managerId!: number;
}

Department.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    managerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "departments",
    timestamps: true,
  }
);

export { Department };
