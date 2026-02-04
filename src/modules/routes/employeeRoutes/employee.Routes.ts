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
  authenticateUser
} from "../../../middlewares/authMiddleware";

const employeeRouter = Router();

// employeeRouter.use(authenticateCompanyMaster);

employeeRouter.post(
  "/create-employee",
  authenticateUser,
  createEmployee
);
employeeRouter.get("/get-employee", authenticateUser, getEmployees);
employeeRouter.put(
  "/update-employee/:id",
  authenticateUser,
  updateEmployee
);
employeeRouter.delete(
  "/delete-employee/:id",
  authenticateUser,
  deleteEmployee
);
employeeRouter.post("/login-employee", loginEmployee);

employeeRouter.get(
  "/employee/modules",
  authenticateUser,
  getEmployeeModules
);

export { employeeRouter };
