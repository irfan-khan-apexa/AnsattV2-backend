import { Router } from "express";

import {
  punch,
  manualAdd,
  updateManualAttendance,
  getCompanyAttendance,
  getSingleEmployeeAttendance,
  punchController,
  getMonthlyAttendanceSummary,
} from "../../controllers/index";

import { authenticateUser } from "../../../middlewares/authMiddleware";
import { authorizePermission } from "../../../middlewares/checkPermission";

const attendanceRouter = Router();

// ================= PUNCH IN / OUT =================
attendanceRouter.post(
  "/attendance/punch",
  authenticateUser,
  //   authorizePermission("attendance", "create"),
  punch,
);

// ================= MANUAL ADD ATTENDANCE =================
attendanceRouter.post(
  "/attendance/manual",
  authenticateUser,
  //   authorizePermission("attendance", "create"),
  manualAdd,
);

// ================= UPDATE MANUAL ATTENDANCE =================
attendanceRouter.put(
  "/attendance/manual/:id",
  authenticateUser,
  //   authorizePermission("attendance", "update"),
  updateManualAttendance,
);

// ================= GET ALL COMPANY ATTENDANCE =================
attendanceRouter.get(
  "/attendance/all",
  authenticateUser,
  //   authorizePermission("attendance", "read"),
  getCompanyAttendance,
);

// ================= GET SINGLE EMPLOYEE ATTENDANCE =================
attendanceRouter.get(
  "/attendance/employee/:employeeId",
  authenticateUser,
  //   authorizePermission("attendance", "read"),
  getSingleEmployeeAttendance,
);

// ================= GET LATEST ATTENDANCE STATUS =================
attendanceRouter.get(
  "/attendance/status",
  authenticateUser,
  //   authorizePermission("attendance", "read"),
  punchController,
);

// ================= MONTHLY ATTENDANCE SUMMARY =================
attendanceRouter.get(
  "/attendance/summary/monthly",
  authenticateUser,
  //   authorizePermission("attendance", "read"),
  getMonthlyAttendanceSummary,
);

export { attendanceRouter };
