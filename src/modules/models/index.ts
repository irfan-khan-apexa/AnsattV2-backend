import { SuperMaster } from "./superMasterModel/superMaster.Model";
import { Company } from "./companyModel/company.Model";
import { Employee } from "./employeeModel/employee.Model";
import { Department } from "./departmentModel/department.Model";
import { OfferLetter } from "./onboardingModel/offerLetter.Model";
import { Onboarding } from "./onboardingModel/Onboarding.Model";
import { ExitRequest } from "./exitRequestModel/exitRequest.Model";
import { Module } from "./rolePermission/module.model";
import { Role } from "./rolePermission/role.model";
import { RoleModulePermission } from "./rolePermission/roleModulePermission.model";
import { Permission } from "./rolePermission/permission.model";
import { Policy } from "./policyModel/policyModel";
import { Leave } from "./leaveModel/leaveModel";
import { LeaveMaster } from "./leaveModel/LeaveMasterModel";
import { LeaveTransaction } from "./leaveModel/LeaveTransactionModel";
import { LeaveExtraField } from "./leaveModel/LeaveExtraFieldModel";
import { FinancialYear } from "./leaveModel/FinancialYearModel";
import { Salary } from "./salaryModel/Salary.Model";
import sequelize from "../../config/sequelize";

Role.hasMany(RoleModulePermission, { foreignKey: "role_id" });
RoleModulePermission.belongsTo(Role, { foreignKey: "role_id" });

Module.hasMany(RoleModulePermission, { foreignKey: "module_id" });
RoleModulePermission.belongsTo(Module, { foreignKey: "module_id" });



// Employee.hasOne(Onboarding, { foreignKey: "employee_id" });
// Onboarding.belongsTo(Employee, { foreignKey: "employee_id" });

// sequelize.sync({ alter: true }).then(() => {
//   console.log("✅ All models synced with DB");
// }).catch((err) => {
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
  LeaveExtraField,
  FinancialYear,
  Onboarding,
  ExitRequest,
  Salary,
};
