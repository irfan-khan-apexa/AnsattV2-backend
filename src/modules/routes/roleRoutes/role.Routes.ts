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
  authenticateUser,
} from "../../../middlewares/authMiddleware";

const roleRouter = Router();

/* permission structure (frontend use) */
roleRouter.get(
  "/permissions",
  authenticateUser,
  getPermissionRegistry
);

/* COMPANY MASTER */
roleRouter.post("/company/roles", authenticateUser, createRole);
roleRouter.get("/company/roles", authenticateUser, getRoles);
roleRouter.get("/company/roles/:id", authenticateUser, getRoleById);
roleRouter.put("/company/roles/:id", authenticateUser, updateRole);
roleRouter.delete("/company/roles/:id", authenticateUser, deleteRole);

/* SUPER ADMIN */
roleRouter.post("/super/roles", authenticateSuperMaster, createRole);
roleRouter.get("/super/roles", authenticateSuperMaster, getRoles);
roleRouter.put("/super/roles/:id", authenticateSuperMaster, updateRole);
roleRouter.delete("/super/roles/:id", authenticateSuperMaster, deleteRole);

export { roleRouter };
