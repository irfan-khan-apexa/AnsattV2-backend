import { Router } from "express";
import {
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
} from "../../controllers/index";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const roleRouter = Router();

roleRouter.post("/roles", createRole);
roleRouter.get("/roles", getAllRoles);
roleRouter.put("/roles/:id", updateRole);
roleRouter.delete("/roles/:id", deleteRole);

export { roleRouter };
