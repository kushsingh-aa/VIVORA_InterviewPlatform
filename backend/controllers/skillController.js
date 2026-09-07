const SkillProfile = require("../models/SkillProfile");
const Skill = require("../models/Skill");
const Interview = require("../models/Interview");
const { getIsConnected, inMemoryStore } = require("../config/db");

// ── Skill extraction: interview track → relevant skill slugs ──────────────
const TRACK_SKILL_MAP = {
    software: [
        { slug: "data-structures", weight: 1.2 },
        { slug: "algorithms", weight: 1.2 },
        { slug: "system-design", weight: 1.3 },
        { slug: "distributed-systems", weight: 1.1 },
        { slug: "caching", weight: 1.0 },
        { slug: "rest-apis", weight: 1.0 },
        { slug: "microservices", weight: 1.0 },
        { slug: "nodejs", weight: 0.9 },
        { slug: "problem-solving", weight: 1.2 },
        { slug: "communication", weight: 1.0 },
        { slug: "structured-thinking", weight: 1.0 },
        { slug: "composure", weight: 0.8 }
    ],
    system_design: [
        { slug: "system-design", weight: 1.5 },
        { slug: "distributed-systems", weight: 1.4 },
        { slug: "cloud-architecture", weight: 1.2 },
        { slug: "caching", weight: 1.2 },
        { slug: "message-queues", weight: 1.1 },
        { slug: "microservices", weight: 1.1 },
        { slug: "aws", weight: 1.0 },
        { slug: "kubernetes", weight: 0.9 },
        { slug: "problem-solving", weight: 1.2 },
        { slug: "communication", weight: 1.0 },
        { slug: "structured-thinking", weight: 1.1 },
        { slug: "composure", weight: 0.8 }
    ],
    product: [
        { slug: "product-strategy", weight: 1.4 },
        { slug: "product-metrics", weight: 1.3 },
        { slug: "prioritization", weight: 1.2 },
        { slug: "user-research", weight: 1.1 },
        { slug: "ab-testing", weight: 1.0 },
        { slug: "agile", weight: 1.0 },
        { slug: "communication", weight: 1.3 },
        { slug: "problem-solving", weight: 1.2 },
        { slug: "structured-thinking", weight: 1.1 },
        { slug: "leadership", weight: 0.9 },
        { slug: "composure", weight: 0.8 }
    ],
    behavioral: [
        { slug: "leadership", weight: 1.5 },
        { slug: "communication", weight: 1.4 },
        { slug: "teamwork", weight: 1.3 },
        { slug: "problem-solving", weight: 1.2 },
        { slug: "composure", weight: 1.3 },
        { slug: "structured-thinking", weight: 1.0 }
    ]
};

/**
 * Compute skill scores from an interview report and track.
 * Maps LLM evaluation scores → canonical skill proficiency.
 */
function computeSkillsFromReport(report, track) {
    const mappings = TRACK_SKILL_MAP[track] || TRACK_SKILL_MAP.software;
    const metrics = report.metrics || {};

    // Base scores from report metrics
    const techBase = metrics.technicalDepth || report.overallScore || 60;
    const probBase = metrics.problemSolving || report.overallScore || 60;
    const commBase = metrics.communication || report.overallScore || 60;
    const compBase = metrics.composure || report.overallScore || 60;

    return mappings.map(({ slug, weight }) => {
        let baseScore;
        if (["communication", "teamwork", "leadership"].includes(slug)) baseScore = commBase;
        else if (["composure", "resilience"].includes(slug)) baseScore = compBase;
        else if (["problem-solving", "structured-thinking", "algorithms", "data-structures", "dynamic-programming"].includes(slug)) baseScore = probBase;
        else if (["product-strategy", "product-metrics", "prioritization", "user-research", "ab-testing", "agile"].includes(slug)) baseScore = (techBase + commBase) / 2;
        else baseScore = techBase;

        const proficiency = Math.min(100, Math.round(baseScore * weight));
        return { slug, proficiency };
    });
}

// ── Get or create skill profile for user ─────────────────────────────────
const getOrCreateProfile = async (userId, userEmail, extraFields = {}) => {
    let profile = null;
    if (getIsConnected()) {
        try {
            profile = await SkillProfile.findOne({ userEmail });
        } catch (e) {
            console.warn("MongoDB getOrCreateProfile query warning:", e.message);
        }
    }
    if (!profile) {
        profile = inMemoryStore.skillProfiles.get(userEmail);
    }
    if (!profile) {
        profile = {
            userId,
            userEmail,
            skills: [],
            overallReadiness: 0,
            ...extraFields
        };
        inMemoryStore.skillProfiles.set(userEmail, profile);
        if (getIsConnected()) {
            try {
                const doc = new SkillProfile(profile);
                await doc.save();
                profile = doc;
            } catch (e) {}
        }
    }
    return profile;
};

// ── GET /skill/passport ────────────────────────────────────────────────────
const getSkillPassport = async (req, res) => {
    try {
        const { email: userEmail, id: userId } = req.user;
        let profile = await getOrCreateProfile(userId, userEmail);

        // If no skills yet, derive from interview history (MongoDB or inMemoryStore)
        if (!profile.skills || profile.skills.length === 0) {
            let interviews = [];
            if (getIsConnected()) {
                try {
                    interviews = await Interview.find({
                        userEmail,
                        status: "completed",
                        report: { $ne: null }
                    }).sort({ createdAt: -1 }).limit(10);
                } catch (e) {}
            }
            if (!interviews || interviews.length === 0) {
                interviews = Array.from(inMemoryStore.interviews.values())
                    .filter(i => (i.userEmail === userEmail || i.userId === userId) && i.report)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }

            if (interviews.length > 0) {
                profile = await extractAndUpdateSkillsFromInterviews(profile, interviews);
                inMemoryStore.skillProfiles.set(userEmail, profile);
            }
        }

        res.json({ success: true, profile });
    } catch (err) {
        console.error("getSkillPassport error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── POST /skill/extract (internal — called after interview completes) ──────
const extractAndUpdateSkillsFromReport = async (userId, userEmail, report, track, sessionId) => {
    try {
        if (!report || report.overallScore === 0) return;

        const skillScores = computeSkillsFromReport(report, track);
        let profile = await getOrCreateProfile(userId, userEmail);

        if (!profile.skills) profile.skills = [];

        // Merge/update skills
        for (const { slug, proficiency } of skillScores) {
            const existing = profile.skills.find(s => s.skillSlug === slug);
            let skillName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            if (getIsConnected()) {
                try {
                    const taxEntry = await Skill.findOne({ slug });
                    if (taxEntry?.name) skillName = taxEntry.name;
                } catch (e) {}
            }
            const category = "technical";

            if (existing) {
                existing.proficiency = Math.round(existing.proficiency * 0.7 + proficiency * 0.3);
                existing.lastAssessed = new Date();
                existing.sessionId = sessionId;
                existing.source = "interview";
            } else {
                profile.skills.push({
                    skillSlug: slug,
                    skillName,
                    category,
                    proficiency,
                    source: "interview",
                    sessionId,
                    lastAssessed: new Date()
                });
            }
        }

        // Recompute overall readiness
        if (profile.skills.length > 0) {
            const avg = profile.skills.reduce((acc, s) => acc + s.proficiency, 0) / profile.skills.length;
            profile.overallReadiness = Math.round(avg);
        }

        profile.lastUpdated = new Date();

        // Save in memory
        inMemoryStore.skillProfiles.set(userEmail, profile);

        // Save to MongoDB if connected
        if (getIsConnected()) {
            try {
                if (typeof profile.save === 'function') {
                    await profile.save();
                } else {
                    await SkillProfile.findOneAndUpdate(
                        { userEmail },
                        { $set: profile },
                        { upsert: true, new: true }
                    );
                }
            } catch (err) {
                console.warn("MongoDB save skill profile error:", err.message);
            }
        }

        return profile;
    } catch (err) {
        console.error("extractAndUpdateSkillsFromReport error:", err);
    }
};

// ── Extract from multiple completed interviews ─────────────────────────────
const extractAndUpdateSkillsFromInterviews = async (profile, interviews) => {
    for (const interview of interviews) {
        if (interview.report) {
            const skillScores = computeSkillsFromReport(interview.report, interview.track);
            for (const { slug, proficiency } of skillScores) {
                const existing = profile.skills?.find ? profile.skills.find(s => s.skillSlug === slug) : null;
                if (existing) {
                    existing.proficiency = Math.round((existing.proficiency + proficiency) / 2);
                } else {
                    if (!profile.skills) profile.skills = [];
                    profile.skills.push({
                        skillSlug: slug,
                        skillName: slug,
                        category: "technical",
                        proficiency,
                        source: "interview",
                        sessionId: interview.sessionId,
                        lastAssessed: new Date()
                    });
                }
            }
        }
    }
    if (profile.skills && profile.skills.length > 0) {
        const avg = profile.skills.reduce((acc, s) => acc + s.proficiency, 0) / profile.skills.length;
        profile.overallReadiness = Math.round(avg);
        if (profile.save) await profile.save();
    }
    return profile;
};

// ── GET /skill/gap?roleSlug=backend-developer ─────────────────────────────
const getSkillGap = async (req, res) => {
    try {
        const { roleSlug } = req.query;
        const { email: userEmail, id: userId } = req.user;

        // Predefined role skill requirements
        const ROLE_REQUIREMENTS = {
            "backend-developer": {
                title: "Backend Developer",
                requiredSkills: [
                    { slug: "nodejs", minProficiency: 70, weight: 1.3 },
                    { slug: "rest-apis", minProficiency: 75, weight: 1.2 },
                    { slug: "sql", minProficiency: 65, weight: 1.1 },
                    { slug: "mongodb", minProficiency: 60, weight: 1.0 },
                    { slug: "system-design", minProficiency: 60, weight: 1.2 },
                    { slug: "distributed-systems", minProficiency: 55, weight: 1.0 },
                    { slug: "data-structures", minProficiency: 65, weight: 1.1 },
                    { slug: "problem-solving", minProficiency: 70, weight: 1.2 },
                    { slug: "communication", minProficiency: 60, weight: 1.0 }
                ]
            },
            "frontend-developer": {
                title: "Frontend Developer",
                requiredSkills: [
                    { slug: "javascript", minProficiency: 75, weight: 1.4 },
                    { slug: "react", minProficiency: 70, weight: 1.3 },
                    { slug: "html-css", minProficiency: 75, weight: 1.2 },
                    { slug: "typescript", minProficiency: 60, weight: 1.1 },
                    { slug: "rest-apis", minProficiency: 60, weight: 1.0 },
                    { slug: "problem-solving", minProficiency: 65, weight: 1.1 },
                    { slug: "communication", minProficiency: 60, weight: 1.0 }
                ]
            },
            "fullstack-developer": {
                title: "Full Stack Developer",
                requiredSkills: [
                    { slug: "javascript", minProficiency: 70, weight: 1.3 },
                    { slug: "react", minProficiency: 65, weight: 1.2 },
                    { slug: "nodejs", minProficiency: 65, weight: 1.2 },
                    { slug: "rest-apis", minProficiency: 70, weight: 1.2 },
                    { slug: "sql", minProficiency: 60, weight: 1.0 },
                    { slug: "mongodb", minProficiency: 55, weight: 1.0 },
                    { slug: "docker", minProficiency: 50, weight: 0.9 },
                    { slug: "system-design", minProficiency: 55, weight: 1.0 },
                    { slug: "problem-solving", minProficiency: 70, weight: 1.2 },
                    { slug: "communication", minProficiency: 60, weight: 1.0 }
                ]
            },
            "data-scientist": {
                title: "Data Scientist",
                requiredSkills: [
                    { slug: "python", minProficiency: 75, weight: 1.4 },
                    { slug: "machine-learning", minProficiency: 70, weight: 1.4 },
                    { slug: "pandas", minProficiency: 70, weight: 1.2 },
                    { slug: "sql-analytics", minProficiency: 65, weight: 1.1 },
                    { slug: "data-analysis", minProficiency: 75, weight: 1.3 },
                    { slug: "deep-learning", minProficiency: 55, weight: 1.1 },
                    { slug: "problem-solving", minProficiency: 70, weight: 1.2 },
                    { slug: "communication", minProficiency: 65, weight: 1.1 },
                    { slug: "structured-thinking", minProficiency: 65, weight: 1.1 }
                ]
            },
            "ml-engineer": {
                title: "ML Engineer",
                requiredSkills: [
                    { slug: "python", minProficiency: 80, weight: 1.4 },
                    { slug: "machine-learning", minProficiency: 75, weight: 1.5 },
                    { slug: "deep-learning", minProficiency: 65, weight: 1.3 },
                    { slug: "tensorflow", minProficiency: 60, weight: 1.1 },
                    { slug: "pytorch", minProficiency: 60, weight: 1.1 },
                    { slug: "data-engineering", minProficiency: 60, weight: 1.2 },
                    { slug: "docker", minProficiency: 55, weight: 1.0 },
                    { slug: "aws", minProficiency: 50, weight: 0.9 },
                    { slug: "problem-solving", minProficiency: 70, weight: 1.2 },
                    { slug: "communication", minProficiency: 60, weight: 1.0 }
                ]
            },
            "devops-engineer": {
                title: "DevOps Engineer",
                requiredSkills: [
                    { slug: "docker", minProficiency: 75, weight: 1.4 },
                    { slug: "kubernetes", minProficiency: 70, weight: 1.3 },
                    { slug: "cicd", minProficiency: 75, weight: 1.3 },
                    { slug: "aws", minProficiency: 70, weight: 1.2 },
                    { slug: "linux", minProficiency: 70, weight: 1.2 },
                    { slug: "terraform", minProficiency: 60, weight: 1.1 },
                    { slug: "problem-solving", minProficiency: 65, weight: 1.1 },
                    { slug: "communication", minProficiency: 60, weight: 1.0 }
                ]
            },
            "product-manager": {
                title: "Product Manager",
                requiredSkills: [
                    { slug: "product-strategy", minProficiency: 75, weight: 1.5 },
                    { slug: "product-metrics", minProficiency: 70, weight: 1.4 },
                    { slug: "prioritization", minProficiency: 70, weight: 1.3 },
                    { slug: "user-research", minProficiency: 65, weight: 1.2 },
                    { slug: "agile", minProficiency: 65, weight: 1.1 },
                    { slug: "communication", minProficiency: 80, weight: 1.4 },
                    { slug: "leadership", minProficiency: 65, weight: 1.2 },
                    { slug: "structured-thinking", minProficiency: 70, weight: 1.3 },
                    { slug: "ab-testing", minProficiency: 60, weight: 1.0 }
                ]
            }
        };

        const roleReq = ROLE_REQUIREMENTS[roleSlug] || ROLE_REQUIREMENTS["fullstack-developer"];
        let profile;

        if (getIsConnected()) {
            profile = await SkillProfile.findOne({ userEmail });
        }

        if (!profile) {
            profile = { skills: [], overallReadiness: 0 };
        }

        // Compute gap per skill
        const gapAnalysis = roleReq.requiredSkills.map(req => {
            const candidate = profile.skills?.find(s => s.skillSlug === req.slug);
            const candidateLevel = candidate?.proficiency || 0;
            const gap = Math.max(0, req.minProficiency - candidateLevel);
            const status = candidateLevel >= req.minProficiency ? "met" :
                candidateLevel >= req.minProficiency * 0.6 ? "partial" : "missing";
            return {
                slug: req.slug,
                skillName: req.slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
                required: req.minProficiency,
                current: candidateLevel,
                gap,
                status,
                weight: req.weight
            };
        });

        // Overall match score (weighted)
        const totalWeight = roleReq.requiredSkills.reduce((a, r) => a + r.weight, 0);
        const achievedWeight = gapAnalysis.reduce((acc, g) => {
            const ratio = Math.min(1, g.current / g.required);
            return acc + (ratio * g.weight);
        }, 0);
        const matchScore = Math.round((achievedWeight / totalWeight) * 100);

        // Learning recommendations for missing/partial skills
        const recommendations = gapAnalysis
            .filter(g => g.status !== "met")
            .sort((a, b) => b.gap - a.gap)
            .slice(0, 5)
            .map(g => ({
                skill: g.skillName,
                slug: g.slug,
                gap: g.gap,
                suggestion: `Improve ${g.skillName} from ${g.current}% → ${g.required}% through practice interviews and projects.`
            }));

        res.json({
            success: true,
            role: roleReq.title,
            targetRole: roleReq.title,
            roleSlug,
            matchScore,
            gapAnalysis,
            recommendations,
            availableRoles: Object.entries(ROLE_REQUIREMENTS).map(([slug, r]) => ({ slug, title: r.title }))
        });

    } catch (err) {
        console.error("getSkillGap error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /skill/taxonomy ────────────────────────────────────────────────────
const getSkillTaxonomy = async (req, res) => {
    try {
        if (getIsConnected()) {
            const skills = await Skill.find({}).sort({ category: 1, name: 1 });
            return res.json({ success: true, skills });
        }
        const taxonomy = require("../data/skillTaxonomy");
        res.json({ success: true, skills: taxonomy });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// ── PUT /skill/passport — manual self-assessment ──────────────────────────
const updateSkillPassport = async (req, res) => {
    try {
        const { email: userEmail, id: userId } = req.user;
        const { skills: updatedSkills } = req.body;

        if (!Array.isArray(updatedSkills)) {
            return res.status(400).json({ message: "skills must be an array" });
        }

        if (!getIsConnected()) {
            return res.json({ success: true, message: "Skills noted (in-memory mode)" });
        }

        let profile = await SkillProfile.findOne({ userEmail });
        if (!profile) {
            profile = new SkillProfile({ userId, userEmail, skills: [] });
        }

        for (const update of updatedSkills) {
            const existing = profile.skills.find(s => s.skillSlug === update.slug);
            if (existing) {
                existing.proficiency = Math.min(100, update.proficiency);
                existing.source = "self_assessment";
                existing.lastAssessed = new Date();
            } else {
                profile.skills.push({
                    skillSlug: update.slug,
                    skillName: update.name || update.slug,
                    category: update.category || "technical",
                    proficiency: Math.min(100, update.proficiency),
                    source: "self_assessment",
                    lastAssessed: new Date()
                });
            }
        }

        if (profile.skills.length > 0) {
            const avg = profile.skills.reduce((a, s) => a + s.proficiency, 0) / profile.skills.length;
            profile.overallReadiness = Math.round(avg);
        }

        profile.lastUpdated = new Date();
        await profile.save();
        res.json({ success: true, profile });
    } catch (err) {
        console.error("updateSkillPassport error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getSkillPassport,
    getSkillGap,
    getSkillTaxonomy,
    updateSkillPassport,
    extractAndUpdateSkillsFromReport
};
