const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    techStack: [{ type: String }],
    link: { type: String, default: "" },
    githubLink: { type: String, default: "" }
}, { _id: false });

const certificationSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    issuer: { type: String, default: "" },
    issueDate: { type: String, default: "" },
    credentialUrl: { type: String, default: "" }
}, { _id: false });

const internshipHistorySchema = new mongoose.Schema({
    company: { type: String, default: "" },
    role: { type: String, default: "" },
    duration: { type: String, default: "" },
    description: { type: String, default: "" }
}, { _id: false });

const achievementSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    year: { type: String, default: "" }
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        enum: ["candidate", "recruiter", "faculty", "institution_admin", "admin"],
        default: "candidate"
    },

    // ── Student / Candidate fields ─────────────────────────────────────────
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    institution: { type: String, default: "" },
    degree: { type: String, default: "" },         // e.g. "B.Tech"
    branch: { type: String, default: "" },
    graduationYear: { type: Number, default: null },
    cgpa: { type: Number, default: null },

    // Skills declared by the student (raw, for profile display)
    technicalSkills: [{ type: String }],   // e.g. ["Java", "Python", "React"]
    softSkills: [{ type: String }],        // e.g. ["Communication", "Leadership"]

    // Portfolio items
    projects: [projectSchema],
    certifications: [certificationSchema],
    internshipHistory: [internshipHistorySchema],
    achievements: [achievementSchema],

    // Links
    resumeUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },

    // ── Recruiter / Company fields ─────────────────────────────────────────
    company: { type: String, default: "" },
    designation: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    companySize: { type: String, default: "" },    // e.g. "51-200", "500+"
    industry: { type: String, default: "" },       // e.g. "FinTech", "EdTech"
    companyLogo: { type: String, default: "" },

    // Admin verification for recruiters
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
