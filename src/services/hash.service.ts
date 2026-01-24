import crypto from "crypto";

export const generateAuditHash = (data: any) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
};
