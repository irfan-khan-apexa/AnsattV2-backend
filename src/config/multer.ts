import multer from "multer";

// Memory storage use kar rahe hai, kyunki file ko directly buffer me read karenge
const upload = multer({ storage: multer.memoryStorage() });

export default upload;
