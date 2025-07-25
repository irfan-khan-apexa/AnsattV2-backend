import { SuperMaster } from "./superMasterModel/superMaster.Model";
import { Company } from "./companyModel/company.Model";
import { Employee } from "./employeeModel/employee.Model";
import { OfferLetter } from "./onboardingModel/offerLetter.Model";
import { Onboarding } from "./onboardingModel/Onboarding.Model";
import { Module } from "./rolePermission/module.model";
import { Role } from "./rolePermission/role.model";
import { RoleModulePermission } from "./rolePermission/roleModulePermission.model";
import { Permission } from "./rolePermission/permission.model";
import { Policy } from "./policyModel/policyModel";
import { Leave } from "./leaveModel/leaveModel";

Role.hasMany(RoleModulePermission, { foreignKey: "role_id" });
RoleModulePermission.belongsTo(Role, { foreignKey: "role_id" });

Module.hasMany(RoleModulePermission, { foreignKey: "module_id" });
RoleModulePermission.belongsTo(Module, { foreignKey: "module_id" });

// Employee.hasOne(Onboarding, { foreignKey: "employee_id" });
// Onboarding.belongsTo(Employee, { foreignKey: "employee_id" });
export {
  SuperMaster,
  Company,
  Employee,
  OfferLetter,
  Module,
  Role,
  RoleModulePermission,
  Permission,
  Policy,
  Leave,
  Onboarding,
};
