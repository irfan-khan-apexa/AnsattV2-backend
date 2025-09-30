import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

interface PermissionAttributes {
  id: number;
  field: string;
  allowed: boolean;
}

interface PermissionCreationAttributes
  extends Optional<PermissionAttributes, "id"> {}

export class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  public id!: number;
  public field!: string;
  public allowed!: boolean;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    field: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true
    },
    allowed: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    tableName: "permissions",
    timestamps: false,
  }
);

// Permission.sync({ alter: true });
export default Permission;
