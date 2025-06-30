import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  getEmployeeModules,
} from "../../controllers/index";
import {
  authenticateCompanyMaster,
  authenticateEmployee,
} from "../../../middlewares/authMiddleware";

const employeeRouter = Router();

// employeeRouter.use(authenticateCompanyMaster);

employeeRouter.post(
  "/create-employee",
  authenticateCompanyMaster,
  createEmployee
);
employeeRouter.get("/get-employee", authenticateCompanyMaster, getEmployees);
employeeRouter.put(
  "/update-employee/:id",
  authenticateCompanyMaster,
  updateEmployee
);
employeeRouter.delete(
  "/delete-employee/:id",
  authenticateCompanyMaster,
  deleteEmployee
);
employeeRouter.post("/login-employee", loginEmployee);

employeeRouter.get(
  "/employee/modules",
  authenticateEmployee,
  getEmployeeModules
);

export { employeeRouter };
