const express = require("express");
const cors = require("cors");
const path = require("path");

const { env } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const careerRoutes = require("./routes/careerRoutes");
const AppError = require("./utils/appError");

const app = express();
const appStartedAt = Date.now();
const frontendDir = path.resolve(__dirname, "../../frontend");

app.disable("x-powered-by");
app.use(cors({
  origin: env.corsOrigin === "*" ? true : env.corsOrigin
}));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(express.json({ limit: env.jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: env.jsonLimit }));
app.use(express.static(frontendDir));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: env.nodeEnv,
    aiProvider: env.openAiApiKey ? "openai" : "simulated",
    uptimeMs: Date.now() - appStartedAt,
    message: "AI Career Advisor backend is running."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/career", careerRoutes);
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "ROUTE_NOT_FOUND"));
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const isProduction = env.nodeEnv === "production";

  if (!isProduction) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: error.message || "Unexpected server error.",
    code: error.code || "INTERNAL_ERROR"
  });
});

module.exports = app;
