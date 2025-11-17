import { Router, Request, Response } from "express";

import { superMasterRouter } from "./superMasterRoutes/superMaster.Routes";
import { companyRouter } from "./companyRoutes/company.Routes";
import { departmentRouter } from "./departmentRoutes/departmentRoutes";
import { employeeRouter } from "./employeeRoutes/employee.Routes";
import { onboardingRouter } from "./onboardingRoutes/onboarding.Routes";
import { roleRouter } from "./rolePermissionRoutes/role.Routes";
import { moduleRouter } from "./rolePermissionRoutes/module.Routes";
import { permissionRouter } from "./rolePermissionRoutes/permission.routes";
import { policyRouter } from "./policyRoutes/policyRoutes";
import { leaveRouter } from "./leaveRoutes/leaveRoutes";
import { exitRouter } from "./exitRequestRoutes/exitRequest.Routes";
import { salaryRouter } from "./salaryRoutes/salary.Routes";
import { assetRouter } from "./assetRoutes/asset.Routes";
const router = Router();

router.use(superMasterRouter);
router.use(companyRouter);
router.use(departmentRouter);
router.use(employeeRouter);
router.use(onboardingRouter);
router.use(roleRouter);
router.use(moduleRouter);
router.use(permissionRouter);
router.use(policyRouter);
router.use(leaveRouter);
router.use(exitRouter);
router.use(salaryRouter);
router.use(assetRouter);

router.all("/{*any}", (req: Request, res: Response) => {
  res.status(200).json({
    code: 200,
    message: "Bad Request - Url not found",
  });
});

export { router };
