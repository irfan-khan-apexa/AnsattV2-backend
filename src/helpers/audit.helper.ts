import { Request } from "express";
import { writeAudit } from "../services/audit.service";

export const audit = async (req: Request, meta: any) => {
  try {
    const user: any = (req as any).user;
    if (!user) return;

    await writeAudit({
      company_code: user.company_code,
      actor_id: user.id,
      actor_role: user.role,
      module: meta.module,
      action: meta.action,
      record_id: meta.record_id,
      old_value: meta.old_value,
      new_value: meta.new_value,
      ip_address: req.ip,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("Audit failed:", err);
  }
};
