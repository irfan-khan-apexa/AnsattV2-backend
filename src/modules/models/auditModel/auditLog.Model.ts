import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";

export class AuditLog extends Model {}

AuditLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    company_code: { type: DataTypes.STRING, allowNull: false },

    actor_id: { type: DataTypes.INTEGER, allowNull: false },
    actor_role: { type: DataTypes.STRING, allowNull: false },

    module: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },

    record_id: { type: DataTypes.STRING },

    old_value: { type: DataTypes.JSON },
    new_value: { type: DataTypes.JSON },

    ip_address: { type: DataTypes.STRING },

    // tamper detection
    hash: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false, // 🔥 NEVER allow update
  }
);

// AuditLog.sync({ alter: true });
// AuditLog.sync();

export default AuditLog;
