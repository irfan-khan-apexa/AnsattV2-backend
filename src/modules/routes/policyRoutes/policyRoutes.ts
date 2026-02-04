import { Router } from "express";
import {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} from "../../controllers/index";
import { authenticateUser } from "../../../middlewares/authMiddleware";

const policyRouter = Router();

policyRouter.post("/policies", authenticateUser, createPolicy);
policyRouter.get("/policies", authenticateUser, getAllPolicies);
policyRouter.get("/policies/:id", authenticateUser, getPolicyById);
policyRouter.put("/policies/:id", authenticateUser, updatePolicy);
policyRouter.delete("/policies/:id", authenticateUser, deletePolicy);

export { policyRouter };
