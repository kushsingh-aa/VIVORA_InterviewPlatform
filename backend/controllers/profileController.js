const User = require("../models/User");
const { getIsConnected } = require("../config/db");

// ── GET /profile/me ────────────────────────────────────────────────────────
const getMyProfile = async (req, res) => {
    try {
        const { id: userId } = req.user;

        if (!getIsConnected()) {
            return res.json({ success: true, user: req.user });
        }

        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ success: true, user });
    } catch (err) {
        console.error("getMyProfile error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── PUT /profile/me ────────────────────────────────────────────────────────
const updateMyProfile = async (req, res) => {
    try {
        const { id: userId } = req.user;

        // Fields that are allowed to be updated
        const allowedFields = [
            "name", "phone", "location", "profilePhoto",
            "institution", "degree", "branch", "graduationYear", "cgpa",
            "technicalSkills", "softSkills",
            "projects", "certifications", "internshipHistory", "achievements",
            "resumeUrl", "githubUrl", "linkedinUrl", "portfolioUrl",
            // Recruiter fields
            "company", "designation", "companyWebsite", "companySize", "industry", "companyLogo"
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (!getIsConnected()) {
            return res.json({ success: true, user: { ...req.user, ...updates }, message: "Updated (demo mode)" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ success: true, user });
    } catch (err) {
        console.error("updateMyProfile error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /profile/:userId (recruiter/faculty view) ─────────────────────────
const getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!getIsConnected()) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const user = await User.findById(userId).select(
            "-password -phone -resumeUrl"  // exclude sensitive fields
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ success: true, user });
    } catch (err) {
        console.error("getPublicProfile error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getMyProfile, updateMyProfile, getPublicProfile };
