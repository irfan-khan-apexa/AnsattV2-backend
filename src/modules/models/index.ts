import { SuperMaster } from "./superMasterModel/superMaster.Model";
import { Company } from "./companyModel/company.Model";
import { Employee } from "./employeeModel/employee.Model";
import { OfferLetter } from "./onboardingModel/offerLetter.Model";
import { Module } from "./rolePermission/module.model";
import { Role } from "./rolePermission/role.model";
import { RoleModulePermission } from "./rolePermission/roleModulePermission.model";
import { Policy } from "./policyModel/policyModel";
import { Leave } from "./leaveModel/leaveModel";

Role.hasMany(RoleModulePermission, { foreignKey: "role_id" });
RoleModulePermission.belongsTo(Role, { foreignKey: "role_id" });

Module.hasMany(RoleModulePermission, { foreignKey: "module_id" });
RoleModulePermission.belongsTo(Module, { foreignKey: "module_id" });

export {
  SuperMaster,
  Company,
  Employee,
  OfferLetter,
  Module,
  Role,
  RoleModulePermission,
  Policy,
  Leave,
};
