import { Router } from "express";
import {
  createPermission,
  listPermissions,
  getPermission,
  updatePermission,
  deletePermission,
} from "../../controllers/index";

import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const permissionRouter = Router();

permissionRouter.post("/permission", authenticateCompanyMaster, createPermission);
permissionRouter.get("/permission", authenticateCompanyMaster, listPermissions);
permissionRouter.get("/permission/:id", authenticateCompanyMaster, getPermission);
permissionRouter.put("/permission/:id", authenticateCompanyMaster, updatePermission);
permissionRouter.delete("/permission/:id", authenticateCompanyMaster, deletePermission);

export  {permissionRouter};
