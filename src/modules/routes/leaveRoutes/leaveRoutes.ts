import { Router } from "express";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
} from "../../controllers/index";
import { authenticateEmployee } from "../../../middlewares/authMiddleware";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const leaveRouter = Router();

// Employee Routes
leaveRouter.post("/leaves", authenticateEmployee, applyLeave);
leaveRouter.get("/leaves/mine", authenticateEmployee, getMyLeaves);

// Company Master Routes
leaveRouter.get("/leaves", authenticateCompanyMaster, getAllLeaves);
leaveRouter.put("/leaves/:id/approve", authenticateCompanyMaster, approveLeave);
leaveRouter.put("/leaves/:id/reject", authenticateCompanyMaster, rejectLeave);

export { leaveRouter };
