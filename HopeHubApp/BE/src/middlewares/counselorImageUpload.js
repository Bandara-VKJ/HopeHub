
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "counselors"
);

fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  filename(req, file, cb) {
    const ext = allowedTypes[file.mimetype];

    cb(
      null,
      `counselor_${crypto.randomUUID()}${ext}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedTypes[file.mimetype]) {
    return cb(
      new Error(
        "Only JPG, PNG and WEBP images are allowed."
      )
    );
  }

  cb(null, true);
};

const uploadCounselorImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export default uploadCounselorImage;
