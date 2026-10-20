import { Router } from "express";

import {
  createSite,
  getAllSites,
  getSiteById,
  updateSite,
  deleteSite,
} from "../../controllers/siteController/siteController";

import { authenticateUser } from "../../../middlewares/authMiddleware";
import { authorizePermission } from "../../../middlewares/checkPermission";

const siteRouter = Router();

// ================= CREATE SITE =================
siteRouter.post(
  "/site",
  authenticateUser,
  authorizePermission("site", "create"),
  createSite,
);

// ================= GET ALL SITES =================
siteRouter.get(
  "/site/all",
  authenticateUser,
  authorizePermission("site", "read"),
  getAllSites,
);

// ================= GET SITE BY ID =================
siteRouter.get(
  "/site/:id",
  authenticateUser,
  authorizePermission("site", "read"),
  getSiteById,
);

// ================= UPDATE SITE =================
siteRouter.put(
  "/site/:id",
  authenticateUser,
  authorizePermission("site", "update"),
  updateSite,
);

// ================= DELETE SITE =================
siteRouter.delete(
  "/site/:id",
  authenticateUser,
  authorizePermission("site", "delete"),
  deleteSite,
);

export { siteRouter };
