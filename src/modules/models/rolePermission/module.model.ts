import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

interface ModuleAttributes {
  id: number;
  name: string;
  description: string;
}

interface ModuleCreationAttributes extends Optional<ModuleAttributes, "id"> {}

export class Module
  extends Model<ModuleAttributes, ModuleCreationAttributes>
  implements ModuleAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
}

Module.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    tableName: "modules",
    timestamps: false,
  }
);

// Module.sync();
Module.sync({ alter: true }); // when change value auatomatic add new columns in table in existing table data

export default Module;
