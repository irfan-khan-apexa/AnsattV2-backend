import { DataTypes, Model } from "sequelize";
import sequelize from "../../../config/sequelize"; 

class LeaveActionToken extends Model {
  public id!: number;
  public leaveId!: number;
  public token!: string;
  public type!: "approve" | "reject" | null;
  public email!: string ;
  public expiresAt!: Date;
  public used!: boolean;
}

LeaveActionToken.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    leaveId: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("approve", "reject"), allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: "LeaveActionToken" }
);

LeaveActionToken.sync({ alter: true });
export { LeaveActionToken };
