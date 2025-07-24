import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface OnboardingAttributes {
  id?: number;
  company_code: string;
  name: string;
  email: string;
  contact: string;
  role: string;
  designation: string;
  department: string;
  reporting_manager: string;
  status?: string;
  joining_date?: Date;
  probation_period?: string;
  auto_password?: string;

  // ✅ KYC Fields
  pan_card?: string;
  aadhar_card?: string;

  pan_photo?: string;
  aadhar_photo?: string;
  passport_photo?: string;

  // ✅ Wasabi Uploads
  resume?: string;
  offer_letter?: string;
  joining_letter?: string;
  experience_letter?: string;

  deleted_at?: Date;
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
  public role!: string;
  public designation!: string;
  public department!: string;
  public reporting_manager!: string;
  public status!: string;
  public joining_date!: Date;
  public probation_period!: string;
  public auto_password!: string;

  public pan_card!: string;
  public aadhar_card!: string;

  pan_photo!: string;
  aadhar_photo!: string;

  public passport_photo!: string;

  public resume!: string;
  public offer_letter!: string;
  public joining_letter!: string;
  public experience_letter!: string;

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
    role: DataTypes.STRING,
    designation: DataTypes.STRING,
    department: DataTypes.STRING,
    reporting_manager: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    joining_date: DataTypes.DATE,
    probation_period: DataTypes.STRING,
    auto_password: DataTypes.STRING,

    pan_card: DataTypes.STRING,
    aadhar_card: DataTypes.STRING,

    pan_photo: DataTypes.STRING,
    aadhar_photo: DataTypes.STRING,
    passport_photo: DataTypes.STRING,

    resume: DataTypes.STRING,
    offer_letter: DataTypes.STRING,
    joining_letter: DataTypes.STRING,
    experience_letter: DataTypes.STRING,

    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "onboardings",
    timestamps: true,
    paranoid: true,
  }
);

Onboarding.sync({ alter: true });
export default Onboarding;
