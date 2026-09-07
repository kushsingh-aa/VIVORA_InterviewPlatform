const SkillProfile = require("../models/SkillProfile");
const Opportunity = require("../models/Opportunity");
const Interview = require("../models/Interview");
const { getIsConnected } = require("../config/db");

// ── GET /analytics/cohort (faculty only) ─────────────────────────────────
const getCohortAnalytics = async (req, res) => {
    try {
        const { institution } = req.query;
        const facultyInstitution = institution || req.user?.institution || "";

        if (!getIsConnected()) {
            return res.json({ success: true, data: generateDemoCohortData() });
        }

        const filter = { "skills.0": { $exists: true } };
        if (facultyInstitution) filter.institution = new RegExp(facultyInstitution, "i");

        const profiles = await SkillProfile.find(filter);

        if (profiles.length === 0) {
            return res.json({ success: true, data: generateDemoCohortData(), isDemoData: true });
        }

        const skillAggregates = {};
        let totalStudents = profiles.length;

        for (const profile of profiles) {
            for (const skill of (profile.skills || [])) {
                if (!skillAggregates[skill.skillSlug]) {
                    skillAggregates[skill.skillSlug] = {
                        slug: skill.skillSlug,
                        name: skill.skillName,
                        category: skill.category,
                        totalProficiency: 0,
                        count: 0
                    };
                }
                skillAggregates[skill.skillSlug].totalProficiency += skill.proficiency;
                skillAggregates[skill.skillSlug].count += 1;
            }
        }

        const skillSummaries = Object.values(skillAggregates).map(s => ({
            slug: s.slug,
            name: s.name,
            category: s.category,
            avgProficiency: Math.round(s.totalProficiency / s.count),
            studentsCovered: s.count,
            coveragePercent: Math.round((s.count / totalStudents) * 100)
        })).sort((a, b) => a.avgProficiency - b.avgProficiency);

        const activeOpps = await Opportunity.find({ isActive: true });
        const demandMap = {};
        for (const opp of activeOpps) {
            for (const req of (opp.requiredSkills || [])) {
                demandMap[req.skillSlug] = (demandMap[req.skillSlug] || 0) + 1;
            }
        }

        const criticalGaps = skillSummaries
            .filter(s => s.avgProficiency < 60)
            .map(s => ({
                ...s,
                industryDemand: demandMap[s.slug] || 0,
                gapSeverity: (100 - s.avgProficiency) * (1 + (demandMap[s.slug] || 0) * 0.1)
            }))
            .sort((a, b) => b.gapSeverity - a.gapSeverity)
            .slice(0, 10);

        const interviewCount = await Interview.countDocuments(
            facultyInstitution ? { userEmail: { $in: profiles.map(p => p.userEmail) } } : {}
        );

        const industryReadyCount = profiles.filter(p => p.overallReadiness >= 65).length;

        res.json({
            success: true,
            data: {
                totalStudents,
                interviewCount,
                avgReadiness: Math.round(profiles.reduce((a, p) => a + p.overallReadiness, 0) / profiles.length),
                industryReady: industryReadyCount,
                needsUpskilling: totalStudents - industryReadyCount,
                skillSummaries,
                criticalGaps,
                categoryBreakdown: computeCategoryBreakdown(skillSummaries),
                topStrengths: skillSummaries.filter(s => s.avgProficiency >= 70).sort((a, b) => b.avgProficiency - a.avgProficiency).slice(0, 5),
                isDemoData: false
            }
        });

    } catch (err) {
        console.error("getCohortAnalytics error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /analytics/demand ────────────────────────────────────────────────
const getIndustryDemand = async (req, res) => {
    try {
        if (!getIsConnected()) {
            return res.json({ success: true, demand: getDemoIndustryDemand() });
        }

        const opps = await Opportunity.find({ isActive: true });
        const demandMap = {};

        for (const opp of opps) {
            for (const req of (opp.requiredSkills || [])) {
                if (!demandMap[req.skillSlug]) {
                    demandMap[req.skillSlug] = {
                        slug: req.skillSlug,
                        name: req.skillName || req.skillSlug,
                        count: 0,
                        totalWeight: 0
                    };
                }
                demandMap[req.skillSlug].count += 1;
                demandMap[req.skillSlug].totalWeight += req.weight || 1;
            }
        }

        const totalOpps = opps.length || 1;
        const demand = Object.values(demandMap)
            .map(d => ({ ...d, demandPercent: Math.round((d.count / totalOpps) * 100) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        res.json({ success: true, demand, totalOpportunities: opps.length });
    } catch (err) {
        console.error("getIndustryDemand error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /analytics/curriculum-gaps (faculty only) ─────────────────────────
const getCurriculumGaps = async (req, res) => {
    try {
        if (!getIsConnected()) {
            return res.json({ success: true, gaps: getDemoCurriculumGaps() });
        }

        const { institution } = req.query;
        const facultyInstitution = institution || req.user?.institution || "";

        const filter = { "skills.0": { $exists: true } };
        if (facultyInstitution) filter.institution = new RegExp(facultyInstitution, "i");

        const profiles = await SkillProfile.find(filter);
        const opps = await Opportunity.find({ isActive: true });

        // Compute student average per skill
        const studentAverages = {};
        for (const profile of profiles) {
            for (const skill of (profile.skills || [])) {
                if (!studentAverages[skill.skillSlug]) {
                    studentAverages[skill.skillSlug] = { name: skill.skillName, total: 0, count: 0 };
                }
                studentAverages[skill.skillSlug].total += skill.proficiency;
                studentAverages[skill.skillSlug].count += 1;
            }
        }

        // Compute industry demand per skill
        const industryDemand = {};
        for (const opp of opps) {
            for (const req of (opp.requiredSkills || [])) {
                if (!industryDemand[req.skillSlug]) {
                    industryDemand[req.skillSlug] = { name: req.skillName || req.skillSlug, count: 0, minRequired: req.minProficiency };
                }
                industryDemand[req.skillSlug].count += 1;
                industryDemand[req.skillSlug].minRequired = Math.max(
                    industryDemand[req.skillSlug].minRequired,
                    req.minProficiency
                );
            }
        }

        const totalOpps = opps.length || 1;
        const gaps = [];

        for (const [slug, demand] of Object.entries(industryDemand)) {
            const studentData = studentAverages[slug];
            const studentAvg = studentData
                ? Math.round(studentData.total / studentData.count)
                : 0;
            const demandPercent = Math.round((demand.count / totalOpps) * 100);
            const gapSize = Math.max(0, demand.minRequired - studentAvg);

            // Only flag as curriculum gap if: high demand AND low student proficiency
            if (demandPercent >= 30 && studentAvg < demand.minRequired - 10) {
                gaps.push({
                    slug,
                    skillName: demand.name,
                    industryDemandPercent: demandPercent,
                    studentAvgProficiency: studentAvg,
                    industryRequiredProficiency: demand.minRequired,
                    gapSize,
                    severity: demandPercent >= 60 && gapSize >= 30 ? "critical" :
                              demandPercent >= 40 && gapSize >= 20 ? "high" : "medium",
                    recommendation: generateCurriculumRecommendation(demand.name, demandPercent, studentAvg)
                });
            }
        }

        gaps.sort((a, b) => {
            const severityOrder = { critical: 3, high: 2, medium: 1 };
            return (severityOrder[b.severity] - severityOrder[a.severity]) || b.gapSize - a.gapSize;
        });

        res.json({ success: true, gaps, totalStudents: profiles.length, totalOpportunities: opps.length });
    } catch (err) {
        console.error("getCurriculumGaps error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /analytics/industry-vs-student (faculty only) ────────────────────
const getIndustryVsStudent = async (req, res) => {
    try {
        if (!getIsConnected()) {
            return res.json({ success: true, comparison: getDemoIndustryVsStudent() });
        }

        const { institution } = req.query;
        const facultyInstitution = institution || req.user?.institution || "";

        const filter = { "skills.0": { $exists: true } };
        if (facultyInstitution) filter.institution = new RegExp(facultyInstitution, "i");

        const profiles = await SkillProfile.find(filter);
        const opps = await Opportunity.find({ isActive: true });

        const studentMap = {};
        for (const profile of profiles) {
            for (const skill of (profile.skills || [])) {
                if (!studentMap[skill.skillSlug]) {
                    studentMap[skill.skillSlug] = { name: skill.skillName, total: 0, count: 0 };
                }
                studentMap[skill.skillSlug].total += skill.proficiency;
                studentMap[skill.skillSlug].count += 1;
            }
        }

        const industryMap = {};
        for (const opp of opps) {
            for (const req of (opp.requiredSkills || [])) {
                if (!industryMap[req.skillSlug]) {
                    industryMap[req.skillSlug] = { name: req.skillName || req.skillSlug, count: 0 };
                }
                industryMap[req.skillSlug].count += 1;
            }
        }

        const totalOpps = opps.length || 1;
        const totalStudents = profiles.length || 1;

        // Build comparison for skills that appear in both
        const comparison = Object.entries(industryMap)
            .map(([slug, demand]) => {
                const student = studentMap[slug];
                return {
                    slug,
                    skillName: demand.name,
                    industryDemandPercent: Math.round((demand.count / totalOpps) * 100),
                    studentProficiency: student ? Math.round(student.total / student.count) : 0,
                    studentCoverage: student ? Math.round((student.count / totalStudents) * 100) : 0
                };
            })
            .filter(c => c.industryDemandPercent >= 20)
            .sort((a, b) => b.industryDemandPercent - a.industryDemandPercent)
            .slice(0, 15);

        res.json({ success: true, comparison });
    } catch (err) {
        console.error("getIndustryVsStudent error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Helpers ───────────────────────────────────────────────────────────────
function computeCategoryBreakdown(skillSummaries) {
    const cats = {};
    for (const s of skillSummaries) {
        if (!cats[s.category]) cats[s.category] = { total: 0, count: 0 };
        cats[s.category].total += s.avgProficiency;
        cats[s.category].count += 1;
    }
    return Object.entries(cats).map(([cat, v]) => ({
        category: cat,
        avgProficiency: Math.round(v.total / v.count)
    }));
}

function generateCurriculumRecommendation(skillName, demandPercent, studentAvg) {
    if (demandPercent >= 60 && studentAvg < 40) {
        return `CRITICAL: Add a dedicated ${skillName} course to the curriculum. ${demandPercent}% of industry jobs require it but students average only ${studentAvg}%.`;
    }
    if (demandPercent >= 40) {
        return `Recommended: Introduce ${skillName} as an elective or add an industry-led workshop. High demand (${demandPercent}% of jobs).`;
    }
    return `Consider: Integrate ${skillName} topics into existing courses. Growing demand (${demandPercent}% of jobs).`;
}

function generateDemoCohortData() {
    return {
        totalStudents: 1250, interviewCount: 3120, avgReadiness: 64,
        industryReady: 742, needsUpskilling: 508,
        isDemoData: true,
        categoryBreakdown: [
            { category: "technical", avgProficiency: 67 },
            { category: "soft", avgProficiency: 74 },
            { category: "cloud", avgProficiency: 38 },
            { category: "data", avgProficiency: 55 },
            { category: "product", avgProficiency: 45 }
        ],
        criticalGaps: [
            { slug: "kubernetes", name: "Kubernetes", avgProficiency: 28, industryDemand: 42, coveragePercent: 18 },
            { slug: "system-design", name: "System Design", avgProficiency: 42, industryDemand: 67, coveragePercent: 55 },
            { slug: "machine-learning", name: "Machine Learning", avgProficiency: 38, industryDemand: 58, coveragePercent: 34 },
            { slug: "cloud-architecture", name: "Cloud Architecture", avgProficiency: 35, industryDemand: 45, coveragePercent: 24 },
            { slug: "spring-boot", name: "Spring Boot", avgProficiency: 42, industryDemand: 48, coveragePercent: 38 },
            { slug: "docker", name: "Docker", avgProficiency: 45, industryDemand: 61, coveragePercent: 48 },
            { slug: "aws", name: "AWS", avgProficiency: 38, industryDemand: 78, coveragePercent: 32 }
        ],
        topStrengths: [
            { slug: "javascript", name: "JavaScript", avgProficiency: 82, coveragePercent: 78 },
            { slug: "python", name: "Python", avgProficiency: 78, coveragePercent: 72 },
            { slug: "sql", name: "SQL", avgProficiency: 75, coveragePercent: 68 },
            { slug: "communication", name: "Communication", avgProficiency: 74, coveragePercent: 90 },
            { slug: "data-structures", name: "Data Structures", avgProficiency: 71, coveragePercent: 80 }
        ],
        skillSummaries: []
    };
}

function getDemoIndustryDemand() {
    return [
        { slug: "system-design", name: "System Design", count: 24, demandPercent: 92 },
        { slug: "javascript", name: "JavaScript", count: 22, demandPercent: 85 },
        { slug: "python", name: "Python", count: 20, demandPercent: 77 },
        { slug: "rest-apis", name: "REST APIs", count: 19, demandPercent: 73 },
        { slug: "aws", name: "AWS", count: 17, demandPercent: 65 },
        { slug: "react", name: "React", count: 16, demandPercent: 62 },
        { slug: "docker", name: "Docker", count: 15, demandPercent: 58 },
        { slug: "machine-learning", name: "Machine Learning", count: 14, demandPercent: 54 },
        { slug: "sql", name: "SQL", count: 13, demandPercent: 50 },
        { slug: "communication", name: "Communication", count: 12, demandPercent: 46 }
    ];
}

function getDemoCurriculumGaps() {
    return [
        {
            slug: "aws", skillName: "AWS Cloud Computing", industryDemandPercent: 78,
            studentAvgProficiency: 38, industryRequiredProficiency: 65, gapSize: 27, severity: "critical",
            recommendation: "CRITICAL: Add a dedicated AWS Cloud course to the curriculum. 78% of industry jobs require it but students average only 38%."
        },
        {
            slug: "system-design", skillName: "System Design", industryDemandPercent: 67,
            studentAvgProficiency: 42, industryRequiredProficiency: 70, gapSize: 28, severity: "critical",
            recommendation: "CRITICAL: Add a dedicated System Design course to the curriculum. 67% of industry jobs require it but students average only 42%."
        },
        {
            slug: "spring-boot", skillName: "Spring Boot", industryDemandPercent: 52,
            studentAvgProficiency: 45, industryRequiredProficiency: 70, gapSize: 25, severity: "high",
            recommendation: "Recommended: Introduce Spring Boot as an elective or add an industry-led workshop. High demand (52% of jobs)."
        },
        {
            slug: "docker", skillName: "Docker & Containers", industryDemandPercent: 48,
            studentAvgProficiency: 38, industryRequiredProficiency: 65, gapSize: 27, severity: "high",
            recommendation: "Recommended: Introduce Docker containerization as an elective or workshop. High demand (48% of jobs)."
        },
        {
            slug: "machine-learning", skillName: "Machine Learning", industryDemandPercent: 42,
            studentAvgProficiency: 35, industryRequiredProficiency: 68, gapSize: 33, severity: "high",
            recommendation: "Recommended: Add AI/ML as a core elective. Industry demand is at 42% and growing rapidly."
        }
    ];
}

function getDemoIndustryVsStudent() {
    return [
        { slug: "java", skillName: "Java", industryDemandPercent: 92, studentProficiency: 84, studentCoverage: 78 },
        { slug: "python", skillName: "Python", industryDemandPercent: 87, studentProficiency: 71, studentCoverage: 65 },
        { slug: "sql", skillName: "SQL", industryDemandPercent: 84, studentProficiency: 52, studentCoverage: 60 },
        { slug: "aws", skillName: "AWS / Cloud", industryDemandPercent: 78, studentProficiency: 38, studentCoverage: 32 },
        { slug: "react", skillName: "React", industryDemandPercent: 72, studentProficiency: 68, studentCoverage: 55 },
        { slug: "system-design", skillName: "System Design", industryDemandPercent: 67, studentProficiency: 42, studentCoverage: 40 },
        { slug: "machine-learning", skillName: "AI / ML", industryDemandPercent: 68, studentProficiency: 41, studentCoverage: 35 },
        { slug: "docker", skillName: "Docker", industryDemandPercent: 58, studentProficiency: 38, studentCoverage: 28 },
        { slug: "communication", skillName: "Communication", industryDemandPercent: 95, studentProficiency: 74, studentCoverage: 92 },
        { slug: "data-structures", skillName: "DSA", industryDemandPercent: 88, studentProficiency: 71, studentCoverage: 80 }
    ];
}

module.exports = { getCohortAnalytics, getIndustryDemand, getCurriculumGaps, getIndustryVsStudent };
