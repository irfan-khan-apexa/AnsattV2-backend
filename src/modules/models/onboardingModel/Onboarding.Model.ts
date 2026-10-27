import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface OnboardingAttributes {
  id?: number;
  company_code: string;
  name: string;
  email: string;
  contact: string;
  role_id: number;
  designation: string;

  // Department ID instead of department name
  department: number;

  reporting_manager: string;
  status?: boolean;
  joining_date?: Date;
  probation_period?: string;
  auto_password?: string;

  // Attendance Fields
  siteCode?: string | null;
  shiftCode?: string | null;
  shiftType?: number | null;
  reportingManagerEmail?: string | null;
  reportingHrEmail?: string | null;

  // KYC Fields
  pan_card?: string;
  aadhar_card?: string;

  pan_photo?: string;
  aadhar_photo?: string;
  passport_photo?: string;

  // Uploads
  resume?: string;
  offer_letter?: string;
  joining_letter?: string;
  experience_letter?: string;
  exit_letter?: string;

  deleted_at?: Date;

  // Presigned URL Caching
  presigned_url_cache?: Record<string, string | null>;
  presigned_url_cache_time?: Date;

  exit_date?: Date;
}

export class Onboarding
  extends Model<OnboardingAttributes>
  implements OnboardingAttributes
{
  public id!: number;
  public company_code!: string;
  public name!: string;
  public email!: string;
  public contact!: string;
  public role_id!: number;
  public designation!: string;

  // Department ID
  public department!: number;

  public reporting_manager!: string;
  public status!: boolean;
  public joining_date!: Date;
  public exit_date!: Date;
  public probation_period!: string;
  public auto_password!: string;

  // Attendance Fields
  public siteCode!: string | null;
  public shiftCode!: string | null;
  public shiftType!: number | null;
  public reportingManagerEmail!: string | null;
  public reportingHrEmail!: string | null;

  // KYC Fields
  public pan_card!: string;
  public aadhar_card!: string;
  public pan_photo!: string;
  public aadhar_photo!: string;
  public passport_photo!: string;

  // Uploads
  public resume!: string;
  public offer_letter!: string;
  public joining_letter!: string;
  public experience_letter!: string;
  public exit_letter!: string;

  public deleted_at!: Date;

  // Presigned URL Caching
  public presigned_url_cache!: Record<string, string | null>;
  public presigned_url_cache_time!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Onboarding.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    designation: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Store Department.id
    department: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    reporting_manager: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    joining_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    exit_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    probation_period: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    auto_password: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ================= ATTENDANCE FIELDS =================
    siteCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    shiftCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    shiftType: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    reportingManagerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    reportingHrEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ================= KYC FIELDS =================
    pan_card: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    aadhar_card: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    pan_photo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    aadhar_photo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    passport_photo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ================= UPLOAD FIELDS =================
    resume: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    offer_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    joining_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    experience_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    exit_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // ================= PRESIGNED URL CACHE =================
    presigned_url_cache: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    presigned_url_cache_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "onboardings",
    timestamps: true,
  },
);

// IMPORTANT:
// Do not run sync({ alter: true }) until existing department names
// have been migrated to their corresponding Department.id values.
// Onboarding.sync({ alter: true });
export default Onboarding;
