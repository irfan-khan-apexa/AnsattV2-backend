import { Router } from "express";
import {
  createCompany,
  loginCompany,
  getCompanyDashboard,
  getMyCompanySettings,
  
} from "../../controllers/index";
import {
  authenticateSuperMaster,
  authenticateCompanyMaster,
  authenticateUser
  // authenticateRole,
} from "../../../middlewares/authMiddleware";

const companyRouter = Router();

companyRouter.post("/create-company", authenticateSuperMaster, createCompany);

companyRouter.post("/login-company", loginCompany);

// companyRouter.get("/dashboard", authenticateCompanyMaster, getCompanyDashboard);
// Route (e.g. /api/company/dashboard)
companyRouter.get("/dashboard", authenticateUser, getCompanyDashboard);
// For either role:

// app.get("/shared", authenticateRole(["super_master", "company_master"]), handlerFn);
companyRouter.get("/getcompanysetting", authenticateUser, getMyCompanySettings);

export { companyRouter };
