const multer = require("multer");

// In-memory storage keeps the starter project simple and avoids local file cleanup.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf";
    const isText = file.mimetype === "text/plain" || file.originalname.toLowerCase().endsWith(".txt");

    if (isPdf || isText) {
      cb(null, true);
      return;
    }

    cb(new Error("Only PDF and plain text uploads are supported for file-based CV parsing."));
  }
});

module.exports = upload;
