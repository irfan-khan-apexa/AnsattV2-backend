import { Router } from "express";
import {
  createExitRequest,
  getAllExitRequests,
  getExitRequestById,
  updateExitRequestStatus,
  generateExitLetterById,
  downloadExitLetter,
} from "../../controllers/index";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

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

export { exitRouter };
