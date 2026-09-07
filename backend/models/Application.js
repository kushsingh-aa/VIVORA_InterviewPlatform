const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
    status: { type: String },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: "" }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.Mixed, required: false },
    userEmail: { type: String, required: true, index: true },
    opportunityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Opportunity",
        required: true,
        index: true
    },
    matchScore: { type: Number, default: 0 },
    matchBreakdown: { type: mongoose.Schema.Types.Mixed, default: null }, // { technical, communication, ... }
    coverNote: { type: String, default: "" },
    status: {
        type: String,
        enum: ["applied", "under_review", "shortlisted", "interview", "selected", "rejected"],
        default: "applied",
        index: true
    },
    statusHistory: [statusHistorySchema],
    recruiterNote: { type: String, default: "" },
    aiShortlistReason: { type: String, default: "" },
    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

applicationSchema.index({ userEmail: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
