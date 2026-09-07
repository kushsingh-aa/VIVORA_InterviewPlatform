const mongoose = require("mongoose");

const requiredSkillSchema = new mongoose.Schema({
    skillSlug: { type: String, required: true },
    skillName: { type: String, required: true },
    minProficiency: { type: Number, default: 60 },
    weight: { type: Number, default: 1 }
}, { _id: false });

/**
 * Opportunity — internship or job listing.
 * Posted by recruiters, matched to candidates by skill overlap.
 */
const opportunitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyLogo: { type: String, default: "" },
    type: { type: String, enum: ["internship", "full_time", "part_time", "contract"], default: "internship" },
    domain: { type: String, required: true }, // software, data, product, design, etc.
    location: { type: String, default: "Remote" },
    workMode: { type: String, enum: ["remote", "hybrid", "on-site"], default: "remote" },
    stipend: { type: String, default: "" },       // e.g. "₹15,000/month" or "Unpaid"
    salaryRange: { type: String, default: "" },   // e.g. "6-10 LPA"
    duration: { type: String, default: "" },      // e.g. "3 months"
    experienceLevel: { type: String, enum: ["fresher", "junior", "mid", "senior"], default: "fresher" },
    description: { type: String, default: "" },
    requiredSkills: [requiredSkillSchema],
    preferredSkills: [requiredSkillSchema],
    eligibility: { type: String, default: "" },   // e.g. "B.Tech 2nd/3rd year"
    degree: { type: String, default: "" },        // e.g. "B.Tech / B.E."
    applyDeadline: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    postedBy: { type: mongoose.Schema.Types.Mixed, default: null }, // recruiter userId
    postedByEmail: { type: String, default: "" },
    applicationCount: { type: Number, default: 0 }
}, { timestamps: true });

opportunitySchema.index({ isActive: 1, domain: 1 });

module.exports = mongoose.model("Opportunity", opportunitySchema);
