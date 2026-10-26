import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface ShiftAttributes {
  id: number;
  companyCode: string | null;
  shiftCode: string | null;
  shiftName: string | null;
  shiftType: string | null;
  startTime: string | null;
  endTime: string | null;
  totalHours: number | null;
  isActive: boolean;
}

export type ShiftCreationAttributes = Optional<
  ShiftAttributes,
  "id" | "isActive"
>;

export class Shift
  extends Model<ShiftAttributes, ShiftCreationAttributes>
  implements ShiftAttributes
{
  public id!: number;
  public companyCode!: string | null;
  public shiftCode!: string | null;
  public shiftName!: string | null;
  public shiftType!: string | null;
  public startTime!: string | null;
  public endTime!: string | null;
  public totalHours!: number | null;
  public isActive!: boolean;
}

Shift.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    companyCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shiftCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shiftName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shiftType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalHours: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Shift",
    tableName: "shifts",
    timestamps: true,
  },
);
// Shift.sync();
export default Shift;
