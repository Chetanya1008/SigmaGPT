import multer from "multer";
import path from "path";

const ALLOWED_TYPES = {
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/png": "image",
  "image/webp": "image",
  "application/pdf": "document",
  "text/plain": "document",
};

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".txt"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Unsupported file type: ${ext}. Supported files are JPG, JPEG, PNG, WEBP, PDF, and TXT.`));
  }

  if (!ALLOWED_TYPES[file.mimetype]) {
    return cb(new Error(`Unsupported MIME type: ${file.mimetype}. Supported files are JPG, JPEG, PNG, WEBP, PDF, and TXT.`));
  }

  const extMimeMap = {
    ".jpg": ["image/jpeg"],
    ".jpeg": ["image/jpeg"],
    ".png": ["image/png"],
    ".webp": ["image/webp"],
    ".pdf": ["application/pdf"],
    ".txt": ["text/plain"],
  };

  const expectedMimes = extMimeMap[ext];
  if (expectedMimes && !expectedMimes.includes(file.mimetype)) {
    return cb(new Error(`File extension ${ext} does not match MIME type ${file.mimetype}.`));
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

function handleUpload(req, res, next) {
  const uploadMiddleware = upload.array("attachments", MAX_FILES);

  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.` });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ error: `You can attach up to ${MAX_FILES} files.` });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: "Unexpected field name for attachments." });
      }
      return res.status(400).json({ error: err.message });
    }

    if (err) {
      return res.status(400).json({ error: err.message });
    }

    next();
  });
}

function getAttachmentMeta(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const type = ALLOWED_TYPES[file.mimetype] || "document";
  const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100) + ext;

  return {
    name: safeName,
    mimeType: file.mimetype,
    size: file.size,
    type,
  };
}

export { handleUpload, getAttachmentMeta, MAX_FILE_SIZE, MAX_FILES };
