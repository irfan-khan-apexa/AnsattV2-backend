import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { createReadStream } from "fs";
import { Express } from "express";

export async function uploadToS3(
  client: S3Client,
  bucket: string,
  file: Express.Multer.File,
  key: string
): Promise<
  | { success: true; result: PutObjectCommandOutput }
  | { success: false; error: Error }
> {
  const fileStream = createReadStream(file.path);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileStream,
    ContentType: file.mimetype,
  });

  try {
    const result = await client.send(command);
    return { success: true, result };
  } catch (error: any) {
    return { success: false, error };
  }
}
