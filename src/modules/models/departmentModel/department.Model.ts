import { Model, DataTypes,Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

interface DepartmentAttributes {
    id: number;
   companyCode: string;
   name: string;
   HrId: number;
}
interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, "id"> {}

class Department 
extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes 
  {
  public id!: number;
  public companyCode!: string;
  public name!: string;
  public HrId!: number;
}

Department.init(
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
    HrId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "departments",
    timestamps: true,
  }
);
Department.sync({ alter: true });
export { Department };
