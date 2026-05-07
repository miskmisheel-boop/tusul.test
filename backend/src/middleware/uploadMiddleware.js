const multer = require("multer");

// In-memory storage keeps the starter project simple and avoids local file cleanup.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const name = file.originalname.toLowerCase();
    const isPdf = file.mimetype === "application/pdf" || name.endsWith(".pdf");
    const isDocx =
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx");
    const isText = file.mimetype === "text/plain" || name.endsWith(".txt");

    if (isPdf || isDocx || isText) {
      cb(null, true);
      return;
    }

    cb(new Error("Зөвхөн PDF болон DOCX файл upload хийнэ үү."));
  }
});

module.exports = upload;
