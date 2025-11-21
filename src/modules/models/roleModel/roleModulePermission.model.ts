import { Model, DataTypes, Optional } from "sequelize";
import Module from "./module.model";
import sequelize from "../../../config/sequelize";

interface RoleModulePermissionAttributes {
  id: number;
  role_id: number;
  module_id: number;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface RoleModulePermissionCreationAttributes
  extends Optional<RoleModulePermissionAttributes, "id"> {}

export class RoleModulePermission
  extends Model<
    RoleModulePermissionAttributes,
    RoleModulePermissionCreationAttributes
  >
  implements RoleModulePermissionAttributes
{
  public id!: number;
  public role_id!: number;
  public module_id!: number;
  public can_read!: boolean;
  public can_create!: boolean;
  public can_update!: boolean;
  public can_delete!: boolean;
}

RoleModulePermission.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    module_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    can_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_create: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_update: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_delete: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    tableName: "role_module_permissions",
    timestamps: false,
  }
);

RoleModulePermission.sync();
RoleModulePermission.belongsTo(Module, { foreignKey: "module_id" });
export default RoleModulePermission;
