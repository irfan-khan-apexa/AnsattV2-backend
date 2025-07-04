import { Router } from "express";
import {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} from "../../controllers/index";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const policyRouter = Router();

policyRouter.post("/policies", authenticateCompanyMaster, createPolicy);
policyRouter.get("/policies", authenticateCompanyMaster, getAllPolicies);
policyRouter.get("/policies/:id", authenticateCompanyMaster, getPolicyById);
policyRouter.put("/policies/:id", authenticateCompanyMaster, updatePolicy);
policyRouter.delete("/policies/:id", authenticateCompanyMaster, deletePolicy);

export { policyRouter };
