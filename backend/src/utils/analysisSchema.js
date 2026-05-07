const AppError = require("./appError");

function ensureString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function ensureStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ensureString(item))
    .filter(Boolean);
}

function normalizeAnalysisResponse(payload = {}) {
  const normalized = {
    candidateName: ensureString(payload.candidateName, "Candidate"),
    targetRole: ensureString(payload.targetRole, "Generalist"),
    skills: ensureStringArray(payload.skills),
    experienceLevel: ensureString(payload.experienceLevel, "Junior"),
    weakPoints: ensureStringArray(payload.weakPoints),
    careerRecommendations: ensureStringArray(payload.careerRecommendations),
    cvImprovementSuggestions: ensureStringArray(payload.cvImprovementSuggestions),
    rewrittenCv: ensureString(payload.rewrittenCv),
    summary: ensureString(payload.summary)
  };

  if (!normalized.rewrittenCv) {
    throw new AppError("AI response is missing rewrittenCv.", 502, "AI_RESPONSE_INVALID");
  }

  return normalized;
}

module.exports = {
  normalizeAnalysisResponse
};
