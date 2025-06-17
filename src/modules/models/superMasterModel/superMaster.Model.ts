// import sequelize from "../../../config/sequelize";
// import { DataType, DataTypes, Model } from "sequelize";

// export const SuperMaster = sequelize.define("SuperMaster", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   name: DataTypes.STRING,
//   email: {
//     type: DataTypes.STRING,
//     unique: true,
//   },
//   password: DataTypes.STRING,
//   created_at: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW,
//   },
// });

// SuperMaster.sync();

// export { SuperMaster };

import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

// 1. Define attributes
interface SuperMasterAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
}

// 2. For creation, id and timestamps are optional
interface SuperMasterCreationAttributes
  extends Optional<SuperMasterAttributes, "id" | "created_at"> {}

// 3. Define model
class SuperMaster
  extends Model<SuperMasterAttributes, SuperMasterCreationAttributes>
  implements SuperMasterAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public readonly created_at!: Date;
}

// 4. Init the model
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
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "SuperMaster",
    tableName: "super_masters",
    timestamps: false,
  }
);
SuperMaster.sync();
export { SuperMaster };
