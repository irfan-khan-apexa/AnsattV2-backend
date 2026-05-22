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

import {
  authenticateUser,
} from "../../../middlewares/authMiddleware";

import upload from "../../../middlewares/fileUpload";

const salaryRouter =
  Router();

// ================= CREATE =================
salaryRouter.post(
  "/salary",
  authenticateUser,
  createSalary
);

// ================= GET ALL =================
salaryRouter.get(
  "/salary/all",
  authenticateUser,
  getAllSalaries
);

// ================= GET EMPLOYEE SLIPS =================
salaryRouter.get(
  "/salary/:employee_id",
  authenticateUser,
  getEmployeeSlips
);

// ================= DOWNLOAD =================
salaryRouter.get(
  "/salary/:id/download/:format",
  authenticateUser,
  downloadSlip
);

// ================= UPDATE =================
salaryRouter.put(
  "/salary/:id",
  authenticateUser,
  updateSalary
);

// ================= DELETE =================
salaryRouter.delete(
  "/salary/:id",
  authenticateUser,
  deleteSalary
);

// ================= BULK UPLOAD =================
salaryRouter.post(
  "/salary/bulk-upload",
  authenticateUser,
  upload.single("file"),
  bulkUploadSalaryAdvanced
);

// ================= EXPORT =================
salaryRouter.get(
  "/salary/export/excel",
  authenticateUser,
  exportSalaryData
);

export { salaryRouter };