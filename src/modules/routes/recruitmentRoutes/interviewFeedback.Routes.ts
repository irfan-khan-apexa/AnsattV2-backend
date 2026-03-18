import express from "express";
import {

  submitFeedback,getAllFeedbacks,getFeedbackByApplicationId
} from "../../controllers/index";
import { authenticateUser } from "../../../middlewares/authMiddleware";

const interviewFeedbackRouter = express.Router();

interviewFeedbackRouter.put("/interview-feedback",authenticateUser, submitFeedback);
interviewFeedbackRouter.get(
  "/interview-feedback",
  authenticateUser,
  getAllFeedbacks
);

interviewFeedbackRouter.get(
  "/interview-feedback/application/:application_id",
  authenticateUser,
  getFeedbackByApplicationId
);


export  {interviewFeedbackRouter};