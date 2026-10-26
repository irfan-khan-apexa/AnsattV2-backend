import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface AttendanceAttributes {
  id: number;

  employee_id: number;
  company_code: string;

  inTime: Date | null;
  outTime: Date | null;

  durationHours: number | null;
  overtimeHours: number | null;

  note: string | null;

  status: "PUNCH_IN" | "PUNCH_OUT";
  isManual: boolean;

  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  isInsideGeofence: boolean | null;

  isWFH: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

type AttendanceCreationAttributes = Optional<
  AttendanceAttributes,
  | "id"
  | "inTime"
  | "outTime"
  | "durationHours"
  | "overtimeHours"
  | "note"
  | "isManual"
  | "latitude"
  | "longitude"
  | "distance"
  | "isInsideGeofence"
  | "isWFH"
  | "createdAt"
  | "updatedAt"
>;

export class Attendance
  extends Model<AttendanceAttributes, AttendanceCreationAttributes>
  implements AttendanceAttributes
{
  public id!: number;

  public employee_id!: number;
  public company_code!: string;

  public inTime!: Date | null;
  public outTime!: Date | null;

  public durationHours!: number | null;
  public overtimeHours!: number | null;

  public note!: string | null;

  public status!: "PUNCH_IN" | "PUNCH_OUT";
  public isManual!: boolean;

  public latitude!: number | null;
  public longitude!: number | null;
  public distance!: number | null;
  public isInsideGeofence!: boolean | null;

  public isWFH!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attendance.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    employee_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    inTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    outTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    durationHours: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    overtimeHours: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },

    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("PUNCH_IN", "PUNCH_OUT"),
      allowNull: false,
    },

    isManual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    distance: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    isInsideGeofence: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },

    isWFH: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Attendance",
    tableName: "attendances",
    timestamps: true,

    indexes: [
      { fields: ["employee_id"] },
      { fields: ["company_code"] },
      { fields: ["inTime"] },
      { fields: ["isWFH"] },
      { fields: ["employee_id", "company_code", "outTime"] },
    ],
  },
);
Attendance.sync();
export default Attendance;
