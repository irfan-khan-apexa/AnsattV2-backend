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
} from "./employeeController/employee.Controller";

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
  getAllCompanies,
};
