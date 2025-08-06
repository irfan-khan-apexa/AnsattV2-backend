// import express from "express";
// import { signupSuperMaster } from "../controllers/SuperMaster.Controller";
// // import { SuperMasterController } from "../controllers/index";

// const SuperMasterRouter = express.Router();

// SuperMasterRouter.get("/supermaster", signupSuperMaster);

// // Export Entire user route which will latter used in the application
// export { SuperMasterRouter };

import { Router } from "express";
import {
  loginSuperMaster,
  signupSuperMaster,
  getAllCompanies,
  getEmployeesByCompanyCode,
} from "../../controllers/index";
import { authenticateSuperMaster } from "../../../middlewares/authMiddleware";

const superMasterRouter = Router();

superMasterRouter.post("/super-master/login", loginSuperMaster);
superMasterRouter.post("/super-master/signup", signupSuperMaster);
superMasterRouter.get(
  "/super-master/get-allcompanies",
  authenticateSuperMaster,
  getAllCompanies
);
superMasterRouter.get(
  "/super-master/companies/:company_code/employees",
  authenticateSuperMaster,
  getEmployeesByCompanyCode
);
export { superMasterRouter };
