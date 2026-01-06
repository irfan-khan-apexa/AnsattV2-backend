import { Router } from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getPermissionRegistry,
} from "../../controllers/index";
import {
  authenticateSuperMaster,
  authenticateCompanyMaster,
} from "../../../middlewares/authMiddleware";

const roleRouter = Router();

/* permission structure (frontend use) */
roleRouter.get(
  "/permissions",
  authenticateCompanyMaster,
  getPermissionRegistry
);

/* COMPANY MASTER */
roleRouter.post("/company/roles", authenticateCompanyMaster, createRole);
roleRouter.get("/company/roles", authenticateCompanyMaster, getRoles);
roleRouter.get("/company/roles/:id", authenticateCompanyMaster, getRoleById);
roleRouter.put("/company/roles/:id", authenticateCompanyMaster, updateRole);
roleRouter.delete("/company/roles/:id", authenticateCompanyMaster, deleteRole);

/* SUPER ADMIN */
roleRouter.post("/super/roles", authenticateSuperMaster, createRole);
roleRouter.get("/super/roles", authenticateSuperMaster, getRoles);
roleRouter.put("/super/roles/:id", authenticateSuperMaster, updateRole);
roleRouter.delete("/super/roles/:id", authenticateSuperMaster, deleteRole);

export { roleRouter };
