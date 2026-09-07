const User = require("../models/User");
const SkillProfile = require("../models/SkillProfile");
const Opportunity = require("../models/Opportunity");
const Application = require("../models/Application");
const { getIsConnected } = require("../config/db");

// ── GET /admin/dashboard ──────────────────────────────────────────────────
const getDashboard = async (req, res) => {
    try {
        if (!getIsConnected()) {
            return res.json({ success: true, stats: getDemoStats() });
        }

        const [
            totalStudents,
            totalRecruiters,
            totalFaculty,
            totalJobs,
            totalInternships,
            totalApplications,
            pendingVerifications
        ] = await Promise.all([
            User.countDocuments({ role: "candidate" }),
            User.countDocuments({ role: "recruiter" }),
            User.countDocuments({ role: "faculty" }),
            Opportunity.countDocuments({ type: "full_time", isActive: true }),
            Opportunity.countDocuments({ type: "internship", isActive: true }),
            Application.countDocuments({}),
            User.countDocuments({ role: "recruiter", verificationStatus: "pending" })
        ]);

        const selectedApplications = await Application.countDocuments({ status: "selected" });

        res.json({
            success: true,
            stats: {
                totalStudents,
                totalRecruiters,
                totalFaculty,
                totalJobs,
                totalInternships,
                totalApplications,
                placements: selectedApplications,
                pendingVerifications
            }
        });
    } catch (err) {
        console.error("getDashboard error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /admin/users ──────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 50, search } = req.query;

        if (!getIsConnected()) {
            return res.json({ success: true, users: [] });
        }

        const filter = {};
        if (role) filter.role = role;
        if (search) {
            filter.$or = [
                { name: new RegExp(search, "i") },
                { email: new RegExp(search, "i") }
            ];
        }

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(filter);

        res.json({ success: true, users, total, page: Number(page) });
    } catch (err) {
        console.error("getAllUsers error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /admin/companies ──────────────────────────────────────────────────
const getAllCompanies = async (req, res) => {
    try {
        if (!getIsConnected()) {
            return res.json({ success: true, companies: [] });
        }

        const companies = await User.find({ role: "recruiter" })
            .select("-password")
            .sort({ createdAt: -1 });

        // Enrich with job counts
        const enriched = await Promise.all(companies.map(async (c) => {
            const jobCount = await Opportunity.countDocuments({ postedByEmail: c.email, isActive: true });
            return { ...c.toObject(), jobCount };
        }));

        res.json({ success: true, companies: enriched });
    } catch (err) {
        console.error("getAllCompanies error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── PUT /admin/company/:id/verify ─────────────────────────────────────────
const verifyCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // "verified" | "rejected"

        if (!["verified", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Status must be 'verified' or 'rejected'" });
        }

        if (!getIsConnected()) {
            return res.json({ success: true, message: "Verification noted (demo mode)" });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { verificationStatus: status, isVerified: status === "verified" },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ success: true, user });
    } catch (err) {
        console.error("verifyCompany error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── DELETE /admin/user/:id ────────────────────────────────────────────────
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!getIsConnected()) {
            return res.json({ success: true, message: "Deleted (demo mode)" });
        }

        await User.findByIdAndDelete(id);
        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        console.error("deleteUser error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Helpers ───────────────────────────────────────────────────────────────
function getDemoStats() {
    return {
        totalStudents: 12540,
        totalRecruiters: 842,
        totalFaculty: 186,
        totalJobs: 2430,
        totalInternships: 1210,
        totalApplications: 54230,
        placements: 4821,
        pendingVerifications: 30
    };
}

module.exports = { getDashboard, getAllUsers, getAllCompanies, verifyCompany, deleteUser };
