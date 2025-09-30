import { DataTypes, Model } from "sequelize";
import sequelize from "../../../config/sequelize";

class FinancialYear extends Model {
  public id!: number;
  public companyCode!: string;
  public startDate!: Date;
  public endDate!: Date;
  public isActive!: boolean;
}

FinancialYear.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    companyCode: { type: DataTypes.STRING, allowNull: false },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    tableName: "financial_years",
    timestamps: true,
  }
);


// FinancialYear.sync({ alter: true });

export { FinancialYear };
