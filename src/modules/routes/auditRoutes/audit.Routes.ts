import { Router } from "express";
import { getCompanyAudit, getAllAudit } from "../../controllers/index";
import {
  authenticateCompanyMaster,
  authenticateSuperMaster,
  authenticateUser
} from "../../../middlewares/authMiddleware";

const auditRouter = Router();

auditRouter.get("/audit/company", authenticateUser, getCompanyAudit);
auditRouter.get("/audit/all", authenticateSuperMaster, getAllAudit);

export  {auditRouter};
