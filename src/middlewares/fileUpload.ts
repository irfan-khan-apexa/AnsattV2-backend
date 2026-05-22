import multer from "multer";

// ✅ MEMORY STORAGE
const storage = multer.memoryStorage();

// ✅ FILE FILTER (OPTIONAL)
const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb
) => {
  cb(null, true);
};

// ✅ MULTER INSTANCE
const upload = multer({
  storage,

  fileFilter,

  limits: {
    // 500 MB
    fileSize:
      500 * 1024 * 1024,
  },
});

export default upload;