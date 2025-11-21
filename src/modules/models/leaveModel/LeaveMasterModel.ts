import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

class LeaveMaster extends Model {
  public id!: number;
  public companyCode!: string;   //  
  public type!: string;          // e.g. "financial_year", "holiday", "leave_category"
  public name!: string;         // e.g. "April 2025 - March 2026", "Sick Leave"
  public allowedLeaves!: number;     
  public employeeId?: number;    // optional (for balances)
}

LeaveMaster.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    companyCode: { type: DataTypes.STRING, allowNull: false },  // string code from token
    type: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    allowedLeaves: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0
},
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  },
  {
    sequelize,
    tableName: "leave_master",
    timestamps: true,
  }
);

LeaveMaster.sync();

export { LeaveMaster };
