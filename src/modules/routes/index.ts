import { Router, Request, Response } from "express";

import { superMasterRouter } from "./superMasterRoutes/superMaster.Routes";
import { companyRouter } from "./companyRoutes/company.Routes";
import { employeeRouter } from "./employeeRoutes/employee.Routes";
const router = Router();

router.use(superMasterRouter);
router.use(companyRouter);
router.use(employeeRouter);

router.all("/{*any}", (req: Request, res: Response) => {
  res.status(200).json({
    code: 200,
    message: "Bad Request - Url not found",
  });
});

export { router };
