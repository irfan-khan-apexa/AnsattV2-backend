// utils/generatePresignedUrl.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";
dotenv.config();

const wasabiClient = new S3Client({
  region: process.env.WASABI_REGION || "ap-northeast-1",
  endpoint:
    process.env.WASABI_ENDPOINT || "https://s3.ap-northeast-1.wasabisys.com",
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY!,
    secretAccessKey: process.env.WASABI_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const generatePresignedGetUrl = async (key: string, expiresInSeconds = 60) => {
  const command = new GetObjectCommand({
    Bucket: process.env.WASABI_BUCKET_NAME!,
    Key: key,
  });

  // return await getSignedUrl(wasabiClient, command, {
  //   expiresIn: expiresInSeconds,
  // });
};
export { generatePresignedGetUrl };
