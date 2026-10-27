import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface CalendarAttributes {
  id: number;
  companyCode: string;
  departmentId: number;
  date: string;
  isWorkDay: boolean;
  note: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CalendarCreationAttributes = Optional<
  CalendarAttributes,
  "id" | "isWorkDay" | "note" | "createdAt" | "updatedAt"
>;

export class Calendar
  extends Model<CalendarAttributes, CalendarCreationAttributes>
  implements CalendarAttributes
{
  public id!: number;
  public companyCode!: string;
  public departmentId!: number;
  public date!: string;
  public isWorkDay!: boolean;
  public note!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Calendar.init(
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
    departmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    isWorkDay: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Calendar",
    tableName: "calendars",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["companyCode", "departmentId", "date"],
      },
      {
        fields: ["companyCode", "departmentId"],
      },
    ],
  },
);
Calendar.sync();
export default Calendar;
