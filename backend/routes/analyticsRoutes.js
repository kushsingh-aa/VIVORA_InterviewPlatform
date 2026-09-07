const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { getCohortAnalytics, getIndustryDemand, getCurriculumGaps, getIndustryVsStudent } = require("../controllers/analyticsController");

router.get("/cohort", verifyToken, requireRole("faculty", "admin"), getCohortAnalytics);
router.get("/demand", verifyToken, getIndustryDemand);
router.get("/curriculum-gaps", verifyToken, requireRole("faculty", "admin"), getCurriculumGaps);
router.get("/industry-vs-student", verifyToken, requireRole("faculty", "admin"), getIndustryVsStudent);

module.exports = router;
