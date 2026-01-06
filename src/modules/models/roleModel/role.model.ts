import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

export class Role extends Model {}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("SUPER_ADMIN", "COMPANY", "EMPLOYEE"),
      allowNull: false,
    },

    company_code: {
      type: DataTypes.STRING,
      allowNull: true, // null for super admin
    },

    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: true,
  }
);




// Role.sync({alter:true});
// sequelize.sync({ alter: false });


export default Role;
