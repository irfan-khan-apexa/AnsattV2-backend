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

import { createRole } from "./rolePermissionController/role.Controller";
import { createOfferLetter } from "./onboardingController/offerLetter.Controller";
import { createModule } from "./rolePermissionController/module.Controller";
import {
  createRoleModulePermission,
  getRolePermissions,
} from "./rolePermissionController/roleModulePermission.Controller";

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
  createModule,
  createRoleModulePermission,
  getRolePermissions,
  createOfferLetter,
};
