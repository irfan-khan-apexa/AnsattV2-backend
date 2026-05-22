import multer from "multer";
import multerS3 from "multer-s3";
// import wasabiS3 from "../config/wasabi"; // Assuming this path is correct
import path from "path";

const bucket = process.env.WASABI_BUCKET_NAME!;

if (!bucket) {
  // Add a check to ensure bucket name is defined, crucial for startup
  console.error("WASABI_BUCKET_NAME is not defined in environment variables.");
  process.exit(1); // Exit if critical config is missing
}

const upload = multer({
  // storage: multerS3({
  //   s3: wasabiS3,
  //   bucket: bucket,
  //   acl: "public-read", // Consider 'private' if you intend to only serve via presigned URLs
  //   key: function (req, file, cb) {
  //     const ext = path.extname(file.originalname);
  //     const filename = `${Date.now()}-${file.fieldname}${ext}`;
  //     //  IMPORTANT: This is the exact key the file will have in Wasabi.
  //     // Make sure this matches how you expect files to be located.
  //     // If you intended files to be in a 'files/' directory, change 'documents' to 'files'.
  //     cb(null, `documents/${filename}`);
  //   },
  // }),
  // limits: {
  //   fileSize: 10 * 1024 * 1024, // Example: 10MB file size limit
  // },
});

export default upload;
