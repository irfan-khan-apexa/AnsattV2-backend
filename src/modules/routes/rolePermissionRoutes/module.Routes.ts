import { Router } from "express";
import {
  createModule,
  getAllModules,
  updateModule,
  deleteModule,
} from "../../controllers/index";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const moduleRouter = Router();

moduleRouter.post("/modules", authenticateCompanyMaster, createModule);
moduleRouter.get("/modules", authenticateCompanyMaster, getAllModules);
moduleRouter.put("/modules/:id", authenticateCompanyMaster, updateModule);
moduleRouter.delete("/modules/:id", authenticateCompanyMaster, deleteModule);

export { moduleRouter };
