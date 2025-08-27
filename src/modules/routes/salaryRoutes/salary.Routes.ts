import { Router } from "express";
import {
  createSalary,
  getEmployeeSlips,
  downloadSlip,
  bulkUploadSalaryAdvanced,
  exportSalaryData
} from "../../../modules/controllers/index";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";
import upload from "../../../config/multer";

const salaryRouter = Router();

salaryRouter.post("/salary", authenticateCompanyMaster, createSalary);
salaryRouter.get(
  "/salary/:employee_id",
  authenticateCompanyMaster,
  getEmployeeSlips
);
salaryRouter.get(
  "/salary/:id/download/:format",
  authenticateCompanyMaster,
  downloadSlip
);
salaryRouter.post(
  "/salary/bulk-advanced",
  authenticateCompanyMaster,
  upload.single("file"),
  bulkUploadSalaryAdvanced
);
salaryRouter.post(
  "/salary/export-bulk",
  authenticateCompanyMaster,
  exportSalaryData
);

export { salaryRouter };
