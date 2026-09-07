const mongoose = require("mongoose");

const skillEntrySchema = new mongoose.Schema({
    skillSlug: { type: String, required: true },
    skillName: { type: String, required: true },
    category: { type: String, required: true },
    proficiency: { type: Number, default: 0, min: 0, max: 100 },
    proficiencyLabel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        default: "Beginner"
    },
    // Verification level for Skill Passport credibility
    verificationLevel: {
        type: String,
        enum: ["self_declared", "certificate", "project", "ai_assessed"],
        default: "self_declared"
    },
    // Source: 'interview' | 'self_assessment' | 'seed'
    source: { type: String, default: "interview" },
    sessionId: { type: String, default: null },
    lastAssessed: { type: Date, default: Date.now }
}, { _id: false });

/**
 * SkillProfile — one per candidate user.
 * Auto-populated from interview reports + manual self-assessment.
 */
const skillProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        index: true
    },
    userEmail: { type: String, required: true, index: true },
    institution: { type: String, default: "" },
    branch: { type: String, default: "" },
    graduationYear: { type: Number, default: null },
    skills: [skillEntrySchema],
    // Aggregate scores computed from interviews
    overallReadiness: { type: Number, default: 0, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("SkillProfile", skillProfileSchema);
