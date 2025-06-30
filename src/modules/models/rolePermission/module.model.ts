import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

interface ModuleAttributes {
  id: number;
  name: string;
}

interface ModuleCreationAttributes extends Optional<ModuleAttributes, "id"> {}

export class Module
  extends Model<ModuleAttributes, ModuleCreationAttributes>
  implements ModuleAttributes
{
  public id!: number;
  public name!: string;
}

Module.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    tableName: "modules",
    timestamps: false,
  }
);

Module.sync();
export default Module;
