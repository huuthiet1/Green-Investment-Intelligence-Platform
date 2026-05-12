import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = "uploads/chat";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `chat-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const chatUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

export default chatUpload;