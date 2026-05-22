// models/Policy.ts
import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

interface PolicyAttributes {
  id: number;
  title: string;
  content: string;
  department: string;
  role: string;
  company_code: string;   // <-- added
}

interface PolicyCreationAttributes extends Optional<PolicyAttributes, "id"> {}

class Policy
  extends Model<PolicyAttributes, PolicyCreationAttributes>
  implements PolicyAttributes
{
  public id!: number;
  public title!: string;
  public content!: string;
  public department!: string;
  public role!: string;
  public company_code!: string;  // <-- added
}

Policy.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    company_code: {                 // <-- must add this
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    tableName: "policies",
    timestamps: true,
  }
);

// DEV ONLY
// Policy.sync();

export { Policy };
