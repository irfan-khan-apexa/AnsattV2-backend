import { Router } from "express";
import {
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
} from "../../controllers/index";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const roleRouter = Router();

roleRouter.post("/roles", authenticateCompanyMaster, createRole);
roleRouter.get("/roles", authenticateCompanyMaster, getAllRoles);
roleRouter.put("/roles/:id", authenticateCompanyMaster, updateRole);
roleRouter.delete("/roles/:id", authenticateCompanyMaster, deleteRole);

export { roleRouter };
