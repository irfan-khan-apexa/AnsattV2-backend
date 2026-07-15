import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface HrAnnouncementAttributes {
  id?: number;
  company_code: string;
  title: string;
  message: string;

  type?: "info" | "notice" | "alert" | "policy";
  priority?: "low" | "medium" | "high";

  publish_from?: Date | null;
  publish_till?: Date | null;

  is_active?: boolean;

  created_by: number;

  // NEW
  target_type?: "all" | "department" | "employee" |"employee/department";
  target_departments?: number[] | null;
  target_employees?: number[] | null;
}

export type HrAnnouncementCreationAttributes = Optional<
  HrAnnouncementAttributes,
  | "id"| "type"| "priority"| "publish_from"| "publish_till"| "is_active"| "target_type"| "target_departments" | "target_employees"
>;

export class HrAnnouncement
  extends Model<
    HrAnnouncementAttributes,
    HrAnnouncementCreationAttributes
  >
  implements HrAnnouncementAttributes
{
  public id!: number;
  public company_code!: string;
  public title!: string;
  public message!: string;

  public type!: "info" | "notice" | "alert" | "policy";
  public priority!: "low" | "medium" | "high";

  public publish_from!: Date | null;
  public publish_till!: Date | null;

  public is_active!: boolean;
  public created_by!: number;

  // NEW
  public target_type!: "all" | "department" | "employee" |"employee/department";
  public target_departments!: number[] | null;
  public target_employees!: number[] | null;
}

HrAnnouncement.init(
  {
    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(
        "info",
        "notice",
        "alert",
        "policy"
      ),
      allowNull: false,
      defaultValue: "info",
    },

    priority: {
      type: DataTypes.ENUM(
        "low",
        "medium",
        "high"
      ),
      allowNull: false,
      defaultValue: "medium",
    },

    publish_from: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    publish_till: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ==========================
    // Announcement Targeting
    // ==========================

    target_type: {
      type: DataTypes.ENUM(
        "all",
        "department",
        "employee",
        "employee/department"
      ),
      allowNull: false,
      defaultValue: "all",
    },

    target_departments: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    target_employees: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "hr_announcements",
    timestamps: true,
  }
);

// HrAnnouncement.sync({ alter: true });

export default HrAnnouncement;