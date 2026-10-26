import { Router } from "express";

import {
  createShift,
  getShifts,
  getShiftbyId,
  updateShift,
  deleteShift,
} from "../../controllers/index";

import { authenticateUser } from "../../../middlewares/authMiddleware";
import { authorizePermission } from "../../../middlewares/checkPermission";

const shiftRouter = Router();

// ================= CREATE SHIFT =================
shiftRouter.post(
  "/shift",
  authenticateUser,
  // authorizePermission("shift", "create"),
  createShift,
);

// ================= GET ALL SHIFTS =================
shiftRouter.get(
  "/shift/all",
  authenticateUser,
  // authorizePermission("shift", "read"),
  getShifts,
);

// ================= GET SHIFT BY ID =================
shiftRouter.get(
  "/shift/:id",
  authenticateUser,
  // authorizePermission("shift", "read"),
  getShiftbyId,
);

// ================= UPDATE SHIFT =================
shiftRouter.put(
  "/shift/:id",
  authenticateUser,
  // authorizePermission("shift", "update"),
  updateShift,
);

// ================= DELETE SHIFT =================
shiftRouter.delete(
  "/shift/:id",
  authenticateUser,
  // authorizePermission("shift", "delete"),
  deleteShift,
);

export { shiftRouter };
