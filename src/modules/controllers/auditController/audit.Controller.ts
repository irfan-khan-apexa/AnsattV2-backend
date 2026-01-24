import { Request, Response } from "express";
import {AuditLog} from "../../models/index";

 const getCompanyAudit = async (req: Request, res: Response) => {
  const user: any = (req as any).user;

  const logs = await AuditLog.findAll({
    where: { company_code: user.company_code },
    order: [["createdAt", "DESC"]],
  });

  res.json({ data: logs });
};

 const getAllAudit = async (_: Request, res: Response) => {
  const logs = await AuditLog.findAll({ order: [["createdAt", "DESC"]] });
  res.json({ data: logs });
};
 export {getCompanyAudit,getAllAudit};