const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

const {
    startInterview,
    submitMessage,
    getHint,
    assistantChat,
    completeInterview,
    getHistory
} = require("../controllers/interviewController");

// Start a new AI interview
router.post("/start", verifyToken, startInterview);

// Submit candidate response / dialogue turn
router.post("/message", verifyToken, submitMessage);

// Get real-time question hints
router.post("/hint", verifyToken, getHint);

// Chat with side-by-side Vivora AI Copilot
router.post("/assistant", verifyToken, assistantChat);

// End / Complete interview and generate scorecard
router.post("/complete", verifyToken, completeInterview);

// Get interview performance history
router.get("/history", verifyToken, getHistory);

module.exports = router;