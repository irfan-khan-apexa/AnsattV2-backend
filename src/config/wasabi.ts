import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const wasabiS3 = new S3Client({
  region: process.env.WASABI_REGION || "ap-northeast-1",
  endpoint:
    process.env.WASABI_ENDPOINT || "https://s3.ap-northeast-1.wasabisys.com",
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY!,
    secretAccessKey: process.env.WASABI_SECRET_KEY!,
  },
  forcePathStyle: true,
});
console.log("Wasabi Credentials:", {
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
});

export default wasabiS3;
