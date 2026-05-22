import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

interface GoalSettingAttributes {
  id: number;
  companyCode: string;
  employeeId: number;
  cycleId: number;

  title: string;
  description: string;
  type: "OKR" | "KPI";

  targetValue: number;
  achievedValue: number;
  weightage: number;

  status: "pending" | "in_progress" | "completed";

  startDate: Date;
  endDate: Date;
}

interface GoalSettingCreationAttributes
  extends Optional<GoalSettingAttributes, "id" | "achievedValue" | "status"> {}

class GoalSetting
  extends Model<GoalSettingAttributes, GoalSettingCreationAttributes>
  implements GoalSettingAttributes {

  public id!: number;
  public companyCode!: string;
  public employeeId!: number;
  public cycleId!: number;

  public title!: string;
  public description!: string;
  public type!: "OKR" | "KPI";

  public targetValue!: number;
  public achievedValue!: number;
  public weightage!: number;

  public status!: "pending" | "in_progress" | "completed";

  public startDate!: Date;
  public endDate!: Date;
}

GoalSetting.init(
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
    employeeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    cycleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("OKR", "KPI"),
      allowNull: false,
    },
    targetValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    achievedValue: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    weightage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed"),
      defaultValue: "pending",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "GoalSettings",
    timestamps: true,
  }
);
// GoalSetting.sync();
export  {GoalSetting} ;