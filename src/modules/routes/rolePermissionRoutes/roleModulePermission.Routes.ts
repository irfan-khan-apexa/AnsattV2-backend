import { Router } from "express";
import {
  createRoleModulePermission,
  getRolePermissions,
  updateRoleModulePermission,
  deleteRoleModulePermission,
} from "../../controllers/index";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const permissionRouter = Router();

permissionRouter.post(
  "/role-permissions",
  authenticateCompanyMaster,
  createRoleModulePermission
);
permissionRouter.get(
  "/role-permissions/:role_id",
  authenticateCompanyMaster,
  getRolePermissions
);
permissionRouter.put(
  "/role-permissions/:role_id",
  authenticateCompanyMaster,
  updateRoleModulePermission
);
permissionRouter.delete(
  "/role-permissions/:role_id",
  authenticateCompanyMaster,
  deleteRoleModulePermission
);

export { permissionRouter };
