import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

// Attributes
interface SuperMasterAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

interface SuperMasterCreationAttributes
  extends Optional<
    SuperMasterAttributes,
    "id" | "created_at" | "updated_at"
  > {}

class SuperMaster
  extends Model<
    SuperMasterAttributes,
    SuperMasterCreationAttributes
  >
  implements SuperMasterAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SuperMaster.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "super_masters",
    timestamps: false,
  }
);

export { SuperMaster };