import {
  loginSuperMaster,
  signupSuperMaster,
  getAllCompanies,
} from "./superMasterController/superMaster.Controller";

import {
  createCompany,
  loginCompany,
  getCompanyDashboard,
} from "./companyController/company.Controller";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  getEmployeeModules,
} from "./employeeController/employee.Controller";

import {
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
} from "./rolePermissionController/role.Controller";
import {
  createModule,
  getAllModules,
  updateModule,
  deleteModule,
} from "./rolePermissionController/module.Controller";
import {
  createRoleModulePermission,
  getRolePermissions,
  updateRoleModulePermission,
  deleteRoleModulePermission,
} from "./rolePermissionController/roleModulePermission.Controller";
import {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} from "./policyController/policyController";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
} from "./leaveController/leaveController";
import { createOfferLetter } from "./onboardingController/offerLetter.Controller";

// All controllers exported as single object
export {
  signupSuperMaster,
  loginSuperMaster,
  createCompany,
  loginCompany,
  getCompanyDashboard,
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  getEmployeeModules,
  getAllCompanies,
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
  createModule,
  getAllModules,
  updateModule,
  deleteModule,
  createRoleModulePermission,
  getRolePermissions,
  updateRoleModulePermission,
  deleteRoleModulePermission,
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  createOfferLetter,
};
