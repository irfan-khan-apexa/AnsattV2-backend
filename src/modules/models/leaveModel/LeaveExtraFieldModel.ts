import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

class LeaveExtraField extends Model {
  public id!: number;
  public companyCode!: string;
  public name!: string;
}

LeaveExtraField.init(
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
  },
  {
    sequelize,
    tableName: "leave_extra_fields",
    timestamps: true,
  }
);

LeaveExtraField.sync();

export { LeaveExtraField };
