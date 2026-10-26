import { Router } from "express";
import {
  createHoliday,
  getHolidaysByYear,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
} from "../../controllers/index";
import { authenticateUser } from "../../../middlewares/authMiddleware";
import { authorizePermission } from "../../../middlewares/checkPermission";

const holidayRouter = Router();

// ================= CREATE HOLIDAY =================
holidayRouter.post(
  "/holidays",
  authenticateUser,
  //   authorizePermission("holidays", "create"),
  createHoliday,
);

// ================= GET HOLIDAYS BY YEAR =================
holidayRouter.get(
  "/holidays",
  authenticateUser,
  //   authorizePermission("holidays", "read"),
  getHolidaysByYear,
);

// ================= GET SINGLE HOLIDAY =================
holidayRouter.get(
  "/holidays/:id",
  authenticateUser,
  //   authorizePermission("holidays", "read"),
  getHolidayById,
);

// ================= UPDATE HOLIDAY =================
holidayRouter.put(
  "/holidays/:id",
  authenticateUser,
  //   authorizePermission("holidays", "update"),
  updateHoliday,
);

// ================= DELETE HOLIDAY =================
holidayRouter.delete(
  "/holidays/:id",
  authenticateUser,
  //   authorizePermission("holidays", "delete"),
  deleteHoliday,
);
export { holidayRouter };
