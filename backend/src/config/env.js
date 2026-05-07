require("dotenv").config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3001),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jsonLimit: process.env.JSON_LIMIT || "2mb",
  cvTextMaxLength: Number(process.env.CV_TEXT_MAX_LENGTH || 40000),
  cacheTtlMs: Number(process.env.CACHE_TTL_MS || 300000),
  authSecret: process.env.AUTH_SECRET || "career-advisor-local-secret",
  sessionTtlMs: Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 24 * 7),
  openAiTimeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || 30000),
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini"
};

module.exports = { env };
