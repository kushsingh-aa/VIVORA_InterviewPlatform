const mongoose = require("mongoose");

const dialogueItemSchema = new mongoose.Schema({
    speaker: {
        type: String,
        enum: ["interviewer", "candidate"],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    questionId: {
        type: String
    },
    isFollowUp: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const scoreItemSchema = new mongoose.Schema({
    overallScore: { type: Number, default: 80 },
    technicalDepth: { type: Number, default: 80 },
    problemSolving: { type: Number, default: 80 },
    communication: { type: Number, default: 80 },
    composure: { type: Number, default: 80 },
    feedback: { type: String, default: "" },
    highlights: [{ type: String }],
    critiques: [{ type: String }]
}, { _id: false });

const interviewSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    userEmail: {
        type: String,
        default: "candidate@vivora.ai",
        index: true
    },
    track: {
        type: String,
        required: true,
        default: "software"
    },
    roleTitle: {
        type: String,
        default: "Senior Software Engineer"
    },
    difficulty: {
        type: String,
        enum: ["Junior", "Mid-Level", "Senior", "Staff/Lead", "Principal"],
        default: "Senior"
    },
    persona: {
        type: String,
        default: "Alex Rivera (Principal Architect & Bar Raiser)"
    },
    greeting: {
        type: String
    },
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 4
    },
    status: {
        type: String,
        enum: ["active", "completed", "abandoned"],
        default: "active",
        index: true
    },
    history: [dialogueItemSchema],
    scores: [scoreItemSchema],
    report: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Interview", interviewSchema);
