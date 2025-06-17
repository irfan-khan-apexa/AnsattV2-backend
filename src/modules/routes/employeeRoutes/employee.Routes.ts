import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from "../../controllers/index";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

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

export { employeeRouter };
