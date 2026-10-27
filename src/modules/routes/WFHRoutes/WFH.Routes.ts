import { Router } from "express";

import { authenticateUser } from "../../../middlewares/authMiddleware";
import { authorizePermission } from "../../../middlewares/checkPermission";

import {
  applyWFH,
  getMyWFHRequests,
  cancelWFHRequest,
  updateWFHStatus,
  getWFHRequests,
} from "../../controllers/index";

const wfhRouter = Router();

// Employee: Apply for WFH
wfhRouter.post(
  "/apply-wfh",
  authenticateUser,
  // authorizePermission("wfh", "create"),
  applyWFH,
);

// Employee: View own WFH requests
wfhRouter.get(
  "/employee-wfh-requests",
  authenticateUser,
  // authorizePermission("wfh", "read"),
  getMyWFHRequests,
);

// Employee: Cancel pending WFH request
wfhRouter.delete(
  "/cancel-wfh/:id",
  authenticateUser,
  // authorizePermission("wfh", "delete"),
  cancelWFHRequest,
);

// Company / HR: View all WFH requests
wfhRouter.get(
  "/wfh-requests",
  authenticateUser,
  // authorizePermission("wfh", "read"),
  getWFHRequests,
);

// Company / HR: Approve or reject WFH request
wfhRouter.put(
  "/update-wfh-status/:id",
  authenticateUser,
  // authorizePermission("wfh", "update"),
  updateWFHStatus,
);

export { wfhRouter };
