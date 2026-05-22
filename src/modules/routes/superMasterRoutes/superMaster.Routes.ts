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
  upsertCompanySettings,getCompanySettings,deleteCompanySettings,
} from "../../controllers/index";
import { authenticateSuperMaster } from "../../../middlewares/authMiddleware";
import upload from "../../../middlewares/fileUpload";

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



superMasterRouter.post(
  "/super-master/company-settings",
  authenticateSuperMaster,
    upload.single("company_logo"),
  upsertCompanySettings
);

superMasterRouter.get(
  "/super-master/company-setting/:company_code",
  authenticateSuperMaster,
  getCompanySettings
);
superMasterRouter.delete(
  "/super-master/company-setting/delete/:company_code",
  authenticateSuperMaster,
  deleteCompanySettings
);


export { superMasterRouter };
