import { Router } from "express";
import { createPermission, getAllPermissions } from "../../controllers/index";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const permissionRouter = Router();

permissionRouter.post(
  "/permissions",
  //   authenticateCompanyMaster,
  createPermission
);
permissionRouter.get(
  "/permissions",
  //   authenticateCompanyMaster,
  getAllPermissions
);

export { permissionRouter };
