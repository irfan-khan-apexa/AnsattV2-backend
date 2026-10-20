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
  department: string;
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
  exit_letter: string | undefined;

  static findById(id: string) {
    throw new Error("Method not implemented.");
  }

  public id!: number;
  public company_code!: string;
  public name!: string;
  public email!: string;
  public contact!: string;
  public role_id!: number;
  public designation!: string;
  public department!: string;
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

  public pan_card!: string;
  public aadhar_card!: string;
  public pan_photo!: string;
  public aadhar_photo!: string;
  public passport_photo!: string;

  public resume!: string;
  public offer_letter!: string;
  public joining_letter!: string;
  public experience_letter!: string;

  public deleted_at!: Date;

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
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    contact: DataTypes.STRING,
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    designation: DataTypes.STRING,
    department: DataTypes.STRING,
    reporting_manager: DataTypes.STRING,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    joining_date: DataTypes.DATE,
    exit_date: DataTypes.DATE,
    probation_period: DataTypes.STRING,
    auto_password: DataTypes.STRING,

    // Attendance Fields
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

    pan_card: DataTypes.STRING,
    aadhar_card: DataTypes.STRING,

    pan_photo: DataTypes.TEXT,
    aadhar_photo: DataTypes.TEXT,
    passport_photo: DataTypes.TEXT,

    resume: DataTypes.TEXT,
    offer_letter: DataTypes.TEXT,
    joining_letter: DataTypes.TEXT,
    experience_letter: DataTypes.TEXT,
    exit_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    deleted_at: DataTypes.DATE,

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

Onboarding.sync({ alter: true });
// Onboarding.sync();

export default Onboarding;
