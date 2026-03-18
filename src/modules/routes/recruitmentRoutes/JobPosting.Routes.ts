import { Router } from "express";
import {
  createJobPosting,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../../controllers/index";

import { authenticateUser } from "../../../middlewares/authMiddleware";

const jobPostingRouter = Router();

jobPostingRouter.post(
  "/job-postings",
  authenticateUser,
  createJobPosting
);

jobPostingRouter.get(
  "/job-postings",
  authenticateUser,
  getAllJobs
);

jobPostingRouter.get(
  "/getall-job-postings",
  getAllJobs
);

jobPostingRouter.get(
  "/job-postings/:id",
  authenticateUser,
  getJobById
);

jobPostingRouter.put(
  "/job-postings/:id",
  authenticateUser,
  updateJob
);

jobPostingRouter.delete(
  "/job-postings/:id",
  authenticateUser,
  deleteJob
);

export { jobPostingRouter };