// routes/upload.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import wasabiS3 from "../../config/wasabi";
import { uploadToS3 } from "../../utils/uploadToS3";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// Store file temporarily in 'uploads/' before sending to Wasabi
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload/:provider",
  upload.single("file"),
  async (req: Request, res: Response): Promise<any> => {
    const { provider } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const s3 = wasabiS3;
    const bucket =
      provider === "wasabi"
        ? process.env.WASABI_BUCKET_NAME!
        : "fallback-bucket";

    const key = `uploads/${Date.now()}-${file.originalname}`;

    const response = await uploadToS3(s3, bucket, file, key);
    if (response.success) {
      res.json({ message: "Upload successful", key });
    } else {
      const errorMessage =
        response.error instanceof Error
          ? response.error.message
          : "Unknown upload error";

      res.status(500).json({ error: errorMessage });
    }
  }
);

export default router;
