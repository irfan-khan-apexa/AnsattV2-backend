import { Router } from "express";

import {
  createSalary,
  getEmployeeSlips,
  downloadSlip,
  updateSalary,
  deleteSalary,
  getAllSalaries,
  bulkUploadSalaryAdvanced,
  exportSalaryData,
} from "../../../modules/controllers/index";

import { authenticateUser } from "../../../middlewares/authMiddleware";

import upload from "../../../middlewares/fileUpload";
import {
  // authorizeOwnEmployeeResource,
  authorizePermission,
} from "../../../middlewares/checkPermission";

import { validateRequest } from "../../../middlewares/validateRequest";
import { createSalarySchema } from "../../../dtos/salary/createSalary.dto";
import { updateSalarySchema } from "../../../dtos/salary/updateSalary.dto";
const salaryRouter = Router();

// ================= CREATE =================
salaryRouter.post(
  "/salary",
  authenticateUser,
  authorizePermission("salary", "create"),
  validateRequest(createSalarySchema),
  createSalary,
);

// ================= GET ALL =================
salaryRouter.get(
  "/salary/all",
  authenticateUser,
  authorizePermission("salary", "read"),
  getAllSalaries,
);

// ================= GET EMPLOYEE SLIPS =================
salaryRouter.get(
  "/salary/:employee_id",
  authenticateUser,
  authorizePermission("salary", "read"),
  // authorizeOwnEmployeeResource,
  getEmployeeSlips,
);

// ================= DOWNLOAD =================
salaryRouter.get(
  "/salary/:id/download/:format",
  authenticateUser,
  authorizePermission("salary", "download"),
  downloadSlip,
);

// ================= UPDATE =================
salaryRouter.put(
  "/salary/:id",
  authenticateUser,
  authorizePermission("salary", "update"),
  validateRequest(updateSalarySchema),
  updateSalary,
);

// ================= DELETE =================
salaryRouter.delete(
  "/salary/:id",
  authenticateUser,
  authorizePermission("salary", "delete"),
  deleteSalary,
);

// ================= BULK UPLOAD =================
salaryRouter.post(
  "/salary/bulk-upload",
  authenticateUser,
  authorizePermission("salary", "bulk_upload"),
  upload.single("file"),
  bulkUploadSalaryAdvanced,
);

// ================= EXPORT =================
salaryRouter.get(
  "/salary/export/excel",
  authenticateUser,
  authorizePermission("salary", "export"),
  exportSalaryData,
);

export { salaryRouter };
