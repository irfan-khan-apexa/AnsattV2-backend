import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface blackListedTokenAttributes {
  id?: number;
  company_code: string;
  token: string;
  expiresAt: Date;
}

export type blackListedTokenCreationAttributes = Optional<
  blackListedTokenAttributes,
  "id"
>;

export class BlackListedToken
  extends Model<blackListedTokenAttributes, blackListedTokenCreationAttributes>
  implements blackListedTokenAttributes
{
  public id!: number;
  public company_code!: string;
  public token!: string;
  public expiresAt!: Date;
}
BlackListedToken.init(
  {
    company_code: { type: DataTypes.STRING, allowNull: false },
    token: { type: DataTypes.TEXT, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
  },

  { sequelize, tableName: "blackListedToken", timestamps: true },
);
// BlackListedToken.sync({ alter: true });
export default BlackListedToken;
