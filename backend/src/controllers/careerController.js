const careerAdvisorService = require("../services/careerAdvisorService");
const historyService = require("../services/historyService");
const asyncHandler = require("../utils/asyncHandler");

const analyzeCareerProfile = asyncHandler(async (req, res) => {
  const result = await careerAdvisorService.analyzeCareerProfile({
    body: req.body,
    file: req.file
  });

  if (req.authUser) {
    await historyService.saveHistory({
      userId: req.authUser.id,
      request: req.body,
      result
    });
  }

  res.json(result);
});

const rewriteCvOnly = asyncHandler(async (req, res) => {
  const result = await careerAdvisorService.rewriteCvOnly({
    body: req.body,
    file: req.file
  });

  res.json(result);
});

const analyzeCvTextOnly = asyncHandler(async (req, res) => {
  const result = await careerAdvisorService.analyzeCvTextOnly(req.body);
  res.json(result);
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await historyService.listHistoryByUser(req.authUser.id);
  res.json({ history });
});

module.exports = {
  analyzeCareerProfile,
  rewriteCvOnly,
  analyzeCvTextOnly,
  getHistory
};
