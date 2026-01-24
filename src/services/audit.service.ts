import {AuditLog} from "../modules/models/index";
import { generateAuditHash } from "./hash.service";

export const writeAudit = async (payload: any) => {
  const hash = generateAuditHash(payload);

  await AuditLog.create({
    ...payload,
    hash,
  });
};
