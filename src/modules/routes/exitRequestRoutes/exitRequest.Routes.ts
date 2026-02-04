import { Router } from "express";
import {
  createExitRequest,
  getAllExitRequests,
  getExitRequestById,
  updateExitRequestStatus,
  generateExitLetterById,
  downloadExitLetter,
    createExitFeedback,
  getFeedbacksForEmployee,
  getMyExitRequest
} from "../../controllers/index";
import { authenticateCompanyMaster ,authenticateEmployee,authenticateUser} from "../../../middlewares/authMiddleware";

const exitRouter = Router();

// Create a new exit request
exitRouter.post("/exit/exitrequest",authenticateUser, createExitRequest);

// Get a specific exit request by ID
exitRouter.get(
  "/exit/getbycompanyid",
  authenticateUser,
  getAllExitRequests
);

// exitRouter.get("/exit/:id", getExitRequestById);
// Update status (approve/reject/complete)



// Employee can view his own exit request
exitRouter.get(
  "/exit/myexitrequest",
  authenticateUser,
  getMyExitRequest
);



exitRouter.put("/exit/:id", authenticateUser, updateExitRequestStatus);

exitRouter.post(
  "/generate-exit-letter/:id",
  authenticateUser,
  generateExitLetterById
);
exitRouter.get(
  "/generate-exit-letter/:type/:id/:format",
  authenticateUser,
  downloadExitLetter
);




exitRouter.post(
  "/exit/feedback",
  authenticateUser,
  createExitFeedback
);
exitRouter.get(
  "/exit/feedback/:id",
  authenticateUser,
  getFeedbacksForEmployee
);




export { exitRouter };
