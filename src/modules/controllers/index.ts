import {
  loginSuperMaster,
  signupSuperMaster,
  getAllCompanies,
  getEmployeesByCompanyCode,
  upsertCompanySettings,getCompanySettings,deleteCompanySettings
} from "./superMasterController/superMaster.Controller";

import {
  createCompany,
  loginCompany,
  getCompanyDashboard,
  getMyCompanySettings,

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
createRole,getRoles,getRoleById,updateRole,deleteRole,getPermissionRegistry
} from "./roleController/roleController";

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
    getAllEmployeesLeaveBalance,setFinancialYear,getFinancialYear,getAllFinancialYears,deleteFinancialYear,
    
} from "./leaveController/leaveController";
import { createOfferLetter ,requestLetterAccess,getCompanyLetterRequests,getEmployeeLetterRequests,downloadLetter,actionLetterRequest} from "./onboardingController/offerLetter.Controller";
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
  bulkCreateOnboarding,
  employeeLogin
} from "./onboardingController/onBoarding.Controller";
import {
  createExitRequest,
  getAllExitRequests,
  getExitRequestById,
  updateExitRequestStatus,
  generateExitLetterById,
  downloadExitLetter,
    createExitFeedback,
  getFeedbacksForEmployee,
  getMyExitRequest
} from "./exitRequestController/exitRequest.controller";
import {
  createSalary,
  getEmployeeSlips,
  downloadSlip,
  bulkUploadSalaryAdvanced,
  exportSalaryData,
  updateSalary,
  deleteSalary,
  getAllSalaries
} from "./salaryController/salary.Controller";
import {
createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset,
  getEmployeeAssets,
  getAssetHistory,
  getAllAssets,
} from "./assetController/asset.Controller";
import {
createAnnouncement,getActiveAnnouncements,getPreviousAnnouncements,updateAnnouncement,deleteAnnouncement
} from "./hrAnnouncementController/hrAnnouncement.Controller";

// All controllers exported as single object
export {
  signupSuperMaster,
  loginSuperMaster,
  createCompany,
  loginCompany,
  getCompanyDashboard,upsertCompanySettings,getCompanySettings,deleteCompanySettings,
  getMyCompanySettings,
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  getEmployeeModules,
  getAllCompanies,
  getEmployeesByCompanyCode,
  createDepartment,getDepartments,getDepartmentById,updateDepartment,deleteDepartment,
 
  createRole,getRoles,getRoleById,updateRole,deleteRole,getPermissionRegistry,
  // createRoleModulePermission,
  // getRolePermissions,
  // updateRoleModulePermission,
  // deleteRoleModulePermission,
 
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
  createOfferLetter,requestLetterAccess,getCompanyLetterRequests,getEmployeeLetterRequests,downloadLetter,actionLetterRequest,
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
  bulkCreateOnboarding,employeeLogin,

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
  getMyExitRequest,
    createExitFeedback,
  getFeedbacksForEmployee,
  createSalary,
  getEmployeeSlips,
  downloadSlip,
  bulkUploadSalaryAdvanced,
  exportSalaryData,
  updateSalary,
  deleteSalary,
  getAllSalaries,
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset,
  getEmployeeAssets,
  getAssetHistory,
  getAllAssets, 

  createAnnouncement,getActiveAnnouncements,getPreviousAnnouncements,updateAnnouncement,deleteAnnouncement
};
