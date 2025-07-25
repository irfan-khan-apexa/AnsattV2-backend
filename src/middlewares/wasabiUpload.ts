import multer from "multer";
import multerS3 from "multer-s3";
import wasabiS3 from "../config/wasabi";
import path from "path";

const bucket = process.env.WASABI_BUCKET_NAME!;

const upload = multer({
  storage: multerS3({
    s3: wasabiS3,
    bucket: bucket,
    acl: "public-read",
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${file.fieldname}${ext}`;
      cb(null, `documents/${filename}`);
    },
  }),
});

export default upload;
