import { Router } from "express";
import { getPlatformDashboard } from "../../controllers/index";
import { authenticateUser } from "../../../middlewares/authMiddleware";

const dashboardRouter = Router();

dashboardRouter.get("/platform", authenticateUser, getPlatformDashboard);

export { dashboardRouter };
