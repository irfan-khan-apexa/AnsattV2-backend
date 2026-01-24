import { Router } from "express";
import { getCompanyAudit, getAllAudit } from "../../controllers/index";
import {
  authenticateCompanyMaster,
  authenticateSuperMaster,
} from "../../../middlewares/authMiddleware";

const auditRouter = Router();

auditRouter.get("/audit/company", authenticateCompanyMaster, getCompanyAudit);
auditRouter.get("/audit/all", authenticateSuperMaster, getAllAudit);

export  {auditRouter};
