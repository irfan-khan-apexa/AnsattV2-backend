import { Router } from "express";

import {
  createDepartmentPolicy,
  getDepartmentPolicies,
  getDepartmentPolicyById,
  updateDepartmentPolicy,
  deleteDepartmentPolicy,
} from "../../controllers/index";

import { authenticateUser } from "../../../middlewares/authMiddleware";
import { authorizePermission } from "../../../middlewares/checkPermission";

const departmentPolicyRouter = Router();

// ================= CREATE POLICY =================
departmentPolicyRouter.post(
  "/department-policy",
  authenticateUser,
  //   authorizePermission("departmentPolicy", "create"),
  createDepartmentPolicy,
);

// ================= GET ALL POLICIES =================
departmentPolicyRouter.get(
  "/department-policy",
  authenticateUser,
  //   authorizePermission("departmentPolicy", "read"),
  getDepartmentPolicies,
);

// ================= GET POLICY BY ID =================
departmentPolicyRouter.get(
  "/department-policy/:id",
  authenticateUser,
  //   authorizePermission("departmentPolicy", "read"),
  getDepartmentPolicyById,
);

// ================= UPDATE POLICY =================
departmentPolicyRouter.put(
  "/department-policy/:id",
  authenticateUser,
  //   authorizePermission("departmentPolicy", "update"),
  updateDepartmentPolicy,
);

// ================= DELETE POLICY =================
departmentPolicyRouter.delete(
  "/department-policy/:id",
  authenticateUser,
  //   authorizePermission("departmentPolicy", "delete"),
  deleteDepartmentPolicy,
);

export { departmentPolicyRouter };
