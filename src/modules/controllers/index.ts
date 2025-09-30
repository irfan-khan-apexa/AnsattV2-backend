import {
  loginSuperMaster,
  signupSuperMaster,
  getAllCompanies,
  getEmployeesByCompanyCode,
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
 createDepartment,getDepartments,getDepartmentById,updateDepartment,deleteDepartment
} from "./departmentController/department.Controller";
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
// import {
//   createRoleModulePermission,
//   getRolePermissions,
//   updateRoleModulePermission,
//   deleteRoleModulePermission,
// } from "./rolePermissionController/roleModulePermission.Controller";
import {
  createPermission,
  getAllPermissions,
} from "./rolePermissionController/permission.Controller";

import {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} from "./policyController/policyController";
// import {
//   applyLeave,
//   getMyLeaves,
//   getAllLeaves,
//   approveLeave,
//   rejectLeave,
// } from "./leaveController/leaveController";
import {
  applyLeave, 
  getMyLeaves, 
  getAllLeaves, 
handleLeaveAction,
  approveLeave, 
  rejectLeave,
 addNewCategory, getLeaveCategory,updateLeaveCategory, deleteLeavecategory,
    addExtraField,getExtraFields,getExtraFieldById, renameExtraField, deleteExtraField,getLeaveBalance,
    getAllEmployeesLeaveBalance,setFinancialYear,getFinancialYear,getAllFinancialYears,deleteFinancialYear
} from "./leaveController/leaveController";
import { createOfferLetter } from "./onboardingController/offerLetter.Controller";
import {
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
  getAllPresignedUrls,
  generateOfferLetterById,
  downloadOfferLetter,
  getAllTemplates,
} from "./onboardingController/onBoarding.Controller";
import {
  createExitRequest,
  getAllExitRequests,
  getExitRequestById,
  updateExitRequestStatus,
  generateExitLetterById,
  downloadExitLetter,
} from "./exitRequestController/exitRequest.controller";
import {
  createSalary,
  getEmployeeSlips,
  downloadSlip,
  bulkUploadSalaryAdvanced,
  exportSalaryData
} from "./salaryController/salary.Controller";

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
  getEmployeesByCompanyCode,
  createDepartment,getDepartments,getDepartmentById,updateDepartment,deleteDepartment,
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
  createModule,
  getAllModules,
  updateModule,
  deleteModule,
  // createRoleModulePermission,
  // getRolePermissions,
  // updateRoleModulePermission,
  // deleteRoleModulePermission,
  createPermission,
  getAllPermissions,
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  handleLeaveAction,
  approveLeave,
  rejectLeave,
 addNewCategory, getLeaveCategory,updateLeaveCategory, deleteLeavecategory,
   addExtraField,getExtraFields,getExtraFieldById, renameExtraField, deleteExtraField,getLeaveBalance,
   getAllEmployeesLeaveBalance,setFinancialYear,getFinancialYear,getAllFinancialYears,deleteFinancialYear,
  createOfferLetter,
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
  getAllPresignedUrls,
  generateOfferLetterById,
  downloadOfferLetter,
  getAllTemplates,
  createExitRequest,
  getAllExitRequests,
  getExitRequestById,
  updateExitRequestStatus,
  generateExitLetterById,
  downloadExitLetter,
  createSalary,
  getEmployeeSlips,
  downloadSlip,
  bulkUploadSalaryAdvanced,
  exportSalaryData
};
