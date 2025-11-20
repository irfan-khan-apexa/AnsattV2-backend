import { SuperMaster } from "./superMasterModel/superMaster.Model";
import { Company } from "./companyModel/company.Model";
import { Employee } from "./employeeModel/employee.Model";
import { Department } from "./departmentModel/department.Model";
import { OfferLetter } from "./onboardingModel/offerLetter.Model";
import { Onboarding } from "./onboardingModel/Onboarding.Model";
import { ExitRequest } from "./exitRequestModel/exitRequest.Model";
import { Module } from "./roleModel/module.model";
import { Role } from "./roleModel/role.model";
import { RoleModulePermission } from "./roleModel/roleModulePermission.model";
import { Permission } from "./roleModel/permission.model";
import { Policy } from "./policyModel/policyModel";
import { Leave } from "./leaveModel/leaveModel";
import { LeaveMaster } from "./leaveModel/LeaveMasterModel";
import { LeaveTransaction } from "./leaveModel/LeaveTransactionModel";
import { LeaveActionToken } from "./leaveModel/LeaveActionTokenModel";
import { LeaveExtraField } from "./leaveModel/LeaveExtraFieldModel";
import { FinancialYear } from "./leaveModel/FinancialYearModel";
import { Salary } from "./salaryModel/Salary.Model";
import { Asset } from "./assetModel/Asset.Model";
import { AssetAssign } from "./assetModel/AssetAssign.Model";
import { ExitFeedback } from "./exitRequestModel/exitFeedback.Model";
import sequelize from "../../config/sequelize";

Role.hasMany(RoleModulePermission, { foreignKey: "role_id" });
RoleModulePermission.belongsTo(Role, { foreignKey: "role_id" });

Module.hasMany(RoleModulePermission, { foreignKey: "module_id" });
RoleModulePermission.belongsTo(Module, { foreignKey: "module_id" });

// Onboarding belongs to Department
// Onboarding.belongsTo(Department, { foreignKey: "department" });

// Onboarding has one Manager (self relation)
// Onboarding.belongsTo(Onboarding, { foreignKey: "reporting_manager", as: "Manager" });


// Employee.hasOne(Onboarding, { foreignKey: "employee_id" });
// Onboarding.belongsTo(Employee, { foreignKey: "employee_id" });

// sequelize.sync({
//   alter: true,
//   logging: console.log, // <-- ye line add karo
// })
// .then(() => {
//   console.log("✅ All models synced with DB");
// })
// .catch((err) => {
//   console.error("❌ Error syncing models:", err);
// });


export {
  SuperMaster,
  Company,
  Employee,
  Department,
  OfferLetter,
  Module,
  Role,
  RoleModulePermission,
  Permission,
  Policy,
  Leave,
  LeaveMaster,
  LeaveTransaction,
  LeaveActionToken,
  LeaveExtraField,
  FinancialYear,
  Onboarding,
  ExitRequest,
  Salary,
  Asset,
  AssetAssign,
  ExitFeedback
};
