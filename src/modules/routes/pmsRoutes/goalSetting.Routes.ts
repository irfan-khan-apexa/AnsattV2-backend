import { Router } from "express";
import {
  createGoal,
  getGoals,
  getGoalsByEmployeeCycle,
  getGoalById,
  updateGoal,
  deleteGoal,
} from "../../controllers";
import { authenticateUser } from "../../../middlewares/authMiddleware";

const goalRouter = Router();

goalRouter.post("/goal", authenticateUser, createGoal);
goalRouter.get("/goal", authenticateUser, getGoals);
goalRouter.get("/goal/filter", authenticateUser, getGoalsByEmployeeCycle);
goalRouter.get("/goal/:id", authenticateUser, getGoalById);
goalRouter.put("/goal/:id", authenticateUser, updateGoal);
goalRouter.delete("/goal/:id", authenticateUser, deleteGoal);

export { goalRouter };