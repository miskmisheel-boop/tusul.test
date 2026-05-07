const crypto = require("crypto");

const { readDb, updateDb } = require("./dbService");

function buildSnapshot(request, result) {
  return {
    candidateName: result.candidateName || request.fullName || "Candidate",
    targetRole: result.targetRole || request.targetRole || "Generalist",
    experienceLevel: result.experienceLevel || "Unknown",
    skills: Array.isArray(result.skills) ? result.skills.slice(0, 12) : [],
    weakPoints: Array.isArray(result.weakPoints) ? result.weakPoints.slice(0, 6) : [],
    careerRecommendations: Array.isArray(result.careerRecommendations) ? result.careerRecommendations.slice(0, 6) : [],
    cvImprovementSuggestions: Array.isArray(result.cvImprovementSuggestions) ? result.cvImprovementSuggestions.slice(0, 6) : [],
    rewrittenCv: result.rewrittenCv || "",
    summary: result.summary || "",
    metadata: result.metadata || {}
  };
}

async function saveHistory({ userId, request, result }) {
  const historyItem = {
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    request: {
      fullName: request.fullName || "",
      targetRole: request.targetRole || "",
      experienceYears: Number(request.experienceYears || 0),
      careerGoals: request.careerGoals || "",
      language: request.language === "mn" ? "mn" : "en"
    },
    result: buildSnapshot(request, result)
  };

  await updateDb((currentDb) => {
    currentDb.histories.unshift(historyItem);
    currentDb.histories = currentDb.histories.slice(0, 200);
    return currentDb;
  });

  return historyItem;
}

async function listHistoryByUser(userId) {
  const db = await readDb();
  return db.histories
    .filter((entry) => entry.userId === userId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

module.exports = {
  saveHistory,
  listHistoryByUser
};
