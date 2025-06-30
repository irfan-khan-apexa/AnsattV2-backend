import { Router } from "express";
import {
  createRoleModulePermission,
  getRolePermissions,
} from "../../controllers/index";

const permissionRouter = Router();

permissionRouter.post("/role-permissions", createRoleModulePermission);
permissionRouter.get("/role-permissions/:role_id", getRolePermissions);

export { permissionRouter };
