import { Router } from "express";

import {
  createOrUpdateCalendar,
  getDepartmentCalendar,
} from "../../controllers/index";

import { authenticateUser } from "../../../middlewares/authMiddleware";
import { authorizePermission } from "../../../middlewares/checkPermission";

const calendarRouter = Router();

// Create or update department calendar
calendarRouter.put(
  "/calendar",
  authenticateUser,
  //   authorizePermission("calendar", "create"),
  createOrUpdateCalendar,
);

// Get department calendar by month or year
calendarRouter.get(
  "/calendar",
  authenticateUser,
  //   authorizePermission("calendar", "read"),
  getDepartmentCalendar,
);

export { calendarRouter };
