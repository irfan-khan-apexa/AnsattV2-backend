import { Router } from "express";
import {
  createExitRequest,
  getAllExitRequests,
  getExitRequestById,
  updateExitRequestStatus,
  generateExitLetterById,
  downloadExitLetter,
    createExitFeedback,
  getFeedbacksForEmployee
} from "../../controllers/index";
import { authenticateCompanyMaster ,authenticateEmployee} from "../../../middlewares/authMiddleware";

const exitRouter = Router();

// Create a new exit request
exitRouter.post("/exit/exitrequest", createExitRequest);

// Get a specific exit request by ID
exitRouter.get(
  "/exit/getbycompanyid",
  authenticateCompanyMaster,
  getAllExitRequests
);

exitRouter.get("/exit/:id", getExitRequestById);
// Update status (approve/reject/complete)

exitRouter.put("/exit/:id", authenticateCompanyMaster, updateExitRequestStatus);

exitRouter.post(
  "/generate-exit-letter/:id",
  authenticateCompanyMaster,
  generateExitLetterById
);
exitRouter.get(
  "/generate-exit-letter/:type/:id/:format",
  authenticateCompanyMaster,
  downloadExitLetter
);




exitRouter.post(
  "/exit/feedback",
  authenticateEmployee,
  createExitFeedback
);
exitRouter.get(
  "/exit/feedback/:id",
  authenticateCompanyMaster,
  getFeedbacksForEmployee
);




export { exitRouter };
