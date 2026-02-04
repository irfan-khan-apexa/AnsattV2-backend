import { Router } from "express";
import {
  createSalary,
  getEmployeeSlips,
  downloadSlip,
  bulkUploadSalaryAdvanced,
  exportSalaryData,
  updateSalary,
  deleteSalary,
  getAllSalaries
} from "../../../modules/controllers/index";
import { authenticateUser } from "../../../middlewares/authMiddleware";
import upload from "../../../config/multer";

const salaryRouter = Router();

salaryRouter.post("/salary", authenticateUser, createSalary);
salaryRouter.get("/salary/all", authenticateUser, getAllSalaries);
salaryRouter.get(
  "/salary/:employee_id",
  authenticateUser,
  getEmployeeSlips
);
salaryRouter.get(
  "/salary/:id/download/:format",
  authenticateUser,
  downloadSlip
);
salaryRouter.post(
  "/salary/bulk-advanced",
  authenticateUser,
  upload.single("file"),
  bulkUploadSalaryAdvanced
);
salaryRouter.post(
  "/salary/export-bulk",
  authenticateUser,
  exportSalaryData
);
salaryRouter.put(
  "/salary/:id",
  authenticateUser,
 updateSalary
);
salaryRouter.delete(
  "/salary/:id",
  authenticateUser,
 deleteSalary
);

export { salaryRouter };
