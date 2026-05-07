const pdfParse = require("pdf-parse");
const AppError = require("../utils/appError");

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractCvText({ cvText, file }) {
  if (cvText && String(cvText).trim()) {
    return normalizeText(cvText);
  }

  if (file) {
    const isTextFile = file.mimetype === "text/plain" || file.originalname.toLowerCase().endsWith(".txt");

    if (isTextFile) {
      return normalizeText(file.buffer.toString("utf8"));
    }

    const parsed = await pdfParse(file.buffer).catch(() => {
      throw new AppError("Failed to parse the uploaded PDF file.", 400, "PDF_PARSE_FAILED");
    });
    return normalizeText(parsed.text);
  }

  throw new AppError("Provide either CV text or a supported file upload.", 400, "CV_REQUIRED");
}

module.exports = {
  extractCvText
};
