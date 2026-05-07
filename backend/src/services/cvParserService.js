const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const AppError = require("../utils/appError");

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function parsePdf(file) {
  const parsed = await pdfParse(file.buffer).catch(() => {
    throw new AppError("PDF уншихад алдаа гарлаа. Password-protected эсвэл image-only PDF байж болзошгүй.", 400, "PDF_PARSE_FAILED");
  });
  return normalizeText(parsed.text);
}

async function parseDocx(file) {
  const parsed = await mammoth.extractRawText({ buffer: file.buffer }).catch(() => {
    throw new AppError("DOCX файл уншихад алдаа гарлаа.", 400, "DOCX_PARSE_FAILED");
  });
  return normalizeText(parsed.value);
}

async function extractCvText({ cvText, file }) {
  if (cvText && String(cvText).trim()) {
    return normalizeText(cvText);
  }

  if (!file) {
    throw new AppError("CV text эсвэл PDF/DOCX файл оруулна уу.", 400, "CV_REQUIRED");
  }

  const name = file.originalname.toLowerCase();
  const isTextFile = file.mimetype === "text/plain" || name.endsWith(".txt");
  const isDocx =
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx");

  if (isTextFile) {
    return normalizeText(file.buffer.toString("utf8"));
  }

  const extracted = isDocx ? await parseDocx(file) : await parsePdf(file);

  if (!extracted) {
    throw new AppError("CV-ээс унших боломжтой текст олдсонгүй.", 400, "EMPTY_CV");
  }

  return extracted;
}

module.exports = {
  extractCvText
};
