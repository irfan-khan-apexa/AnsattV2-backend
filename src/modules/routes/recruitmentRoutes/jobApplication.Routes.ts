import { Router } from "express";
import {
  applyForJob,
  getAllApplications,
  updateApplicationStatus,
} from "../../controllers/index";

import upload from "../../../middlewares/fileUpload";
import { authenticateUser } from "../../../middlewares/authMiddleware";

const jobApplicationRouter = Router();

jobApplicationRouter.post(
  "/jobs/apply",
  upload.fields([{ name: "resume", maxCount: 1 }]),
  applyForJob
);

jobApplicationRouter.get(
  "/job-applications",
  authenticateUser,
  getAllApplications
);

jobApplicationRouter.put(
  "/job-applications/:id/status",
  authenticateUser,
  updateApplicationStatus
);

export { jobApplicationRouter };