import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";
import RoleModulePermission from "./roleModulePermission.model";

interface RoleAttributes {
  id: number;
  name: string;
  description: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public RoleModulePermissions?: RoleModulePermission[];
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: false,
  }
);

// Role.sync();
// Role.sync({ alter: true });
export default Role;
