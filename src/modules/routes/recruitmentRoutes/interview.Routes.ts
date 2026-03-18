import express from "express";
import {
  createInterview,
  getAllInterviews,
  getByApplication,
  updateInterview,
  deleteInterview,
} from "../../controllers/index";
import { authenticateUser } from "../../../middlewares/authMiddleware";

const interviewRouter = express.Router();

interviewRouter.post("/create-interview", authenticateUser,createInterview);

interviewRouter.get("/get-all-interview",authenticateUser, getAllInterviews);

interviewRouter.get("/get-interview-by-yapplication/:id",authenticateUser, getByApplication);

interviewRouter.put("/update-interview/:id",authenticateUser, updateInterview);

interviewRouter.delete("/delete-interview/:id",authenticateUser, deleteInterview);

export  {interviewRouter};