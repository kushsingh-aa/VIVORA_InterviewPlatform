const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
    listOpportunities,
    getOpportunity,
    createOpportunity,
    applyToOpportunity,
    getMyApplications,
    getRecruiterListings,
    getShortlist,
    updateApplicationStatus
} = require("../controllers/opportunityController");

// Candidate routes
router.get("/", verifyToken, listOpportunities);
router.get("/my-applications", verifyToken, getMyApplications);
router.get("/:id", verifyToken, getOpportunity);
router.post("/:id/apply", verifyToken, applyToOpportunity);

// Recruiter-only routes
router.post("/", verifyToken, requireRole("recruiter", "admin"), createOpportunity);
router.get("/recruiter/listings", verifyToken, requireRole("recruiter", "admin"), getRecruiterListings);
router.get("/recruiter/shortlist/:id", verifyToken, requireRole("recruiter", "admin"), getShortlist);
router.put("/recruiter/application/:appId/status", verifyToken, requireRole("recruiter", "admin"), updateApplicationStatus);

module.exports = router;
