import { Router } from "express";
import {
 createDepartment,getDepartments,getDepartmentById,updateDepartment,deleteDepartment,
} from "../../controllers/index";
import { authenticateCompanyMaster,authenticateUser } from "../../../middlewares/authMiddleware";

const departmentRouter = Router();

departmentRouter.post("/department", authenticateUser, createDepartment);
departmentRouter.get("/department", authenticateUser, getDepartments);
departmentRouter.get("/department/:id", authenticateUser, getDepartmentById);
departmentRouter.put("/department/:id", authenticateUser, updateDepartment);
departmentRouter.delete("/department/:id", authenticateUser, deleteDepartment);

export { departmentRouter };
