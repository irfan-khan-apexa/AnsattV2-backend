import { Router } from "express";
import {
 createDepartment,getDepartments,getDepartmentById,updateDepartment,deleteDepartment,
} from "../../controllers/index";
import { authenticateCompanyMaster,authenticateUser } from "../../../middlewares/authMiddleware";

const departmentRouter = Router();

departmentRouter.post("/department", authenticateCompanyMaster, createDepartment);
departmentRouter.get("/department", authenticateUser, getDepartments);
departmentRouter.get("/department/:id", authenticateCompanyMaster, getDepartmentById);
departmentRouter.put("/department/:id", authenticateCompanyMaster, updateDepartment);
departmentRouter.delete("/department/:id", authenticateCompanyMaster, deleteDepartment);

export { departmentRouter };
