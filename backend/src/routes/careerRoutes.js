const express = require("express");

const careerController = require("../controllers/careerController");
const { attachAuth, requireAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Accept either raw JSON CV text or multipart form data with a PDF upload.
router.post("/analyze", attachAuth, upload.single("cvFile"), careerController.analyzeCareerProfile);
router.post("/rewrite", attachAuth, upload.single("cvFile"), careerController.rewriteCvOnly);
router.post("/analyze-text", careerController.analyzeCvTextOnly);
router.get("/history", attachAuth, requireAuth, careerController.getHistory);

module.exports = router;
