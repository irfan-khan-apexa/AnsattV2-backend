import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

interface RoleAttributes {
  id: number;
  name: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: number;
  public name!: string;
}

Role.init(
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
    tableName: "roles",
    timestamps: false,
  }
);

Role.sync();
export default Role;
