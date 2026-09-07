const Opportunity = require("../models/Opportunity");
const Application = require("../models/Application");
const SkillProfile = require("../models/SkillProfile");
const User = require("../models/User");
const { getIsConnected, inMemoryStore } = require("../config/db");
const { computeDetailedMatch, computeMatchScore } = require("../services/matchingService");

// ── GET /opportunity ──────────────────────────────────────────────────────
const listOpportunities = async (req, res) => {
    try {
        const { domain, type, search } = req.query;
        const { email: userEmail } = req.user;

        let opportunities = [];

        if (getIsConnected()) {
            const filter = { isActive: true };
            if (domain) filter.domain = domain;
            if (type) filter.type = type;
            opportunities = await Opportunity.find(filter).sort({ createdAt: -1 }).limit(50);

            // Get candidate skill profile for match scoring
            const profile = await SkillProfile.findOne({ userEmail });
            const candidateSkills = profile?.skills || [];

            // Compute match score per opportunity
            opportunities = opportunities.map(opp => {
                const oppObj = opp.toObject();
                oppObj.matchScore = computeMatchScore(candidateSkills, opp.requiredSkills);
                return oppObj;
            });

            // Sort by match score descending
            opportunities.sort((a, b) => b.matchScore - a.matchScore);

        } else {
            // Use in-memory store + seed data
            const memOpps = [...(inMemoryStore.interviews.get("opportunities") || [])];
            opportunities = (memOpps.length > 0 ? memOpps : getDemoOpportunities()).map(o => ({
                ...o,
                matchScore: 50 + Math.floor(Math.random() * 40)
            }));
        }

        // Apply text search filter
        if (search) {
            const q = search.toLowerCase();
            opportunities = opportunities.filter(o =>
                o.title.toLowerCase().includes(q) ||
                o.company.toLowerCase().includes(q) ||
                o.domain.toLowerCase().includes(q)
            );
        }

        res.json({ success: true, opportunities });
    } catch (err) {
        console.error("listOpportunities error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /opportunity/:id ─────────────────────────────────────────────────
const getOpportunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { email: userEmail } = req.user;

        if (!getIsConnected()) {
            const demos = getDemoOpportunities();
            const opp = demos.find(o => o._id === id) || demos[0];
            return res.json({ success: true, opportunity: { ...opp, matchScore: 78 }, hasApplied: false, matchResult: null });
        }

        const opp = await Opportunity.findById(id);
        if (!opp) return res.status(404).json({ message: "Opportunity not found" });

        const profile = await SkillProfile.findOne({ userEmail });
        const user = await User.findOne({ email: userEmail }).select("-password");

        const matchResult = computeDetailedMatch(
            profile?.skills || [],
            opp.requiredSkills,
            opp.preferredSkills,
            user || {},
            opp
        );

        // Check if user already applied
        const existing = await Application.findOne({ userEmail, opportunityId: id });

        res.json({
            success: true,
            opportunity: { ...opp.toObject(), matchScore: matchResult.score },
            hasApplied: !!existing,
            applicationStatus: existing?.status || null,
            matchResult  // Full explainable match
        });
    } catch (err) {
        console.error("getOpportunity error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── POST /opportunity (recruiter only) ───────────────────────────────────
const createOpportunity = async (req, res) => {
    try {
        const { email: postedByEmail, id: postedBy } = req.user;
        const {
            title, company, type, domain, location, workMode, stipend, salaryRange,
            duration, experienceLevel, description, requiredSkills, preferredSkills,
            eligibility, degree, applyDeadline
        } = req.body;

        if (!title || !company || !domain) {
            return res.status(400).json({ message: "Title, company, and domain are required" });
        }

        const newOppData = {
            _id: "opp_" + Date.now(),
            title, company,
            type: type || "internship",
            domain,
            location: location || "Remote",
            workMode: workMode || "remote",
            stipend: stipend || "",
            salaryRange: salaryRange || "",
            duration: duration || "",
            experienceLevel: experienceLevel || "fresher",
            description: description || "",
            requiredSkills: requiredSkills || [],
            preferredSkills: preferredSkills || [],
            eligibility: eligibility || "",
            degree: degree || "",
            applyDeadline: applyDeadline ? new Date(applyDeadline) : null,
            postedBy: postedBy || "recruiter_demo",
            postedByEmail,
            isActive: true,
            createdAt: new Date(),
            applications: []
        };

        if (!getIsConnected()) {
            const currentOpps = inMemoryStore.interviews.get("opportunities") || getDemoOpportunities();
            currentOpps.unshift(newOppData);
            inMemoryStore.interviews.set("opportunities", currentOpps);
            return res.status(201).json({ success: true, opportunity: newOppData });
        }

        const opp = new Opportunity({
            ...newOppData,
            _id: undefined
        });

        await opp.save();
        res.status(201).json({ success: true, opportunity: opp });
    } catch (err) {
        console.error("createOpportunity error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── POST /opportunity/:id/apply ───────────────────────────────────────────
const applyToOpportunity = async (req, res) => {
    try {
        const { id: opportunityId } = req.params;
        const { email: userEmail, id: userId } = req.user;
        const { coverNote } = req.body;

        if (!getIsConnected()) {
            return res.json({ success: true, message: "Application noted (demo mode)", matchScore: 78 });
        }

        // Check already applied
        const existing = await Application.findOne({ userEmail, opportunityId });
        if (existing) {
            return res.status(400).json({ message: "You have already applied to this opportunity" });
        }

        const opp = await Opportunity.findById(opportunityId);
        if (!opp || !opp.isActive) {
            return res.status(404).json({ message: "Opportunity not found or closed" });
        }

        const profile = await SkillProfile.findOne({ userEmail });
        const user = await User.findOne({ email: userEmail }).select("-password");
        const matchResult = computeDetailedMatch(
            profile?.skills || [],
            opp.requiredSkills,
            opp.preferredSkills,
            user || {},
            opp
        );

        const application = new Application({
            userId,
            userEmail,
            opportunityId,
            matchScore: matchResult.score,
            matchBreakdown: matchResult.breakdown,
            coverNote: coverNote || "",
            status: "applied",
            statusHistory: [{ status: "applied", changedAt: new Date() }]
        });

        await application.save();
        await Opportunity.findByIdAndUpdate(opportunityId, { $inc: { applicationCount: 1 } });

        res.status(201).json({ success: true, application, matchScore: matchResult.score, matchResult });
    } catch (err) {
        console.error("applyToOpportunity error:", err);
        if (err.code === 11000) return res.status(400).json({ message: "Already applied" });
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /opportunity/my-applications ─────────────────────────────────────
const getMyApplications = async (req, res) => {
    try {
        const { email: userEmail } = req.user;

        if (!getIsConnected()) {
            return res.json({ success: true, applications: getDemoApplications() });
        }

        const apps = await Application.find({ userEmail })
            .populate("opportunityId")
            .sort({ appliedAt: -1 });

        res.json({ success: true, applications: apps });
    } catch (err) {
        console.error("getMyApplications error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /opportunity/recruiter/listings (recruiter only) ─────────────────
const getRecruiterListings = async (req, res) => {
    try {
        const { email: postedByEmail } = req.user;

        if (!getIsConnected()) {
            const memoryListings = inMemoryStore.interviews.get("recruiter_listings") || getDemoRecruiterListings();
            return res.json({ success: true, listings: memoryListings });
        }

        const listings = await Opportunity.find({ postedByEmail }).sort({ createdAt: -1 });

        // Attach application counts per listing
        const enriched = await Promise.all(listings.map(async (l) => {
            const apps = await Application.find({ opportunityId: l._id }).select("userEmail matchScore status matchBreakdown recruiterNote");
            return { ...l.toObject(), applications: apps };
        }));

        res.json({ success: true, listings: enriched });
    } catch (err) {
        console.error("getRecruiterListings error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /opportunity/recruiter/shortlist/:id (recruiter only) ─────────────────────
const getShortlist = async (req, res) => {
    try {
        const { id: opportunityId } = req.params;
        const { limit = 10 } = req.query;

        if (!getIsConnected()) {
            const demoShortlist = getDemoShortlist(opportunityId);
            return res.json({
                success: true,
                shortlist: demoShortlist,
                opportunityTitle: "Backend Developer Intern"
            });
        }

        const opp = await Opportunity.findById(opportunityId);
        if (!opp) return res.status(404).json({ message: "Opportunity not found" });

        const applications = await Application.find({ opportunityId })
            .sort({ matchScore: -1 })
            .limit(Number(limit));

        // Enrich with skill profile snippets + detailed match
        const shortlist = await Promise.all(applications.map(async (app) => {
            const profile = await SkillProfile.findOne({ userEmail: app.userEmail })
                .select("skills overallReadiness institution");
            const user = await User.findOne({ email: app.userEmail })
                .select("name institution branch graduationYear projects internshipHistory");

            // Compute detailed match for explainable shortlisting
            const matchResult = computeDetailedMatch(
                profile?.skills || [],
                opp.requiredSkills,
                opp.preferredSkills,
                user || {},
                opp
            );

            return {
                ...app.toObject(),
                candidateName: user?.name || app.userEmail.split("@")[0],
                candidateProfile: profile ? {
                    overallReadiness: profile.overallReadiness,
                    institution: user?.institution || profile.institution,
                    branch: user?.branch || "",
                    topSkills: profile.skills
                        .sort((a, b) => b.proficiency - a.proficiency)
                        .slice(0, 5)
                } : null,
                matchResult,
                shortlistReason: matchResult.explanation
            };
        }));

        // Re-sort by computed match score
        shortlist.sort((a, b) => b.matchResult.score - a.matchResult.score);

        res.json({ success: true, shortlist, opportunityTitle: opp.title });
    } catch (err) {
        console.error("getShortlist error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── PUT /opportunity/recruiter/application/:appId/status ───────────────────────
const updateApplicationStatus = async (req, res) => {
    try {
        const { appId } = req.params;
        const { status, note } = req.body;

        const validStatuses = ["applied", "under_review", "shortlisted", "interview", "selected", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        if (!getIsConnected()) {
            // Update in demo memory listings
            const memoryListings = inMemoryStore.interviews.get("recruiter_listings") || getDemoRecruiterListings();
            for (const listing of memoryListings) {
                if (listing.applications) {
                    const found = listing.applications.find(a => a._id === appId);
                    if (found) {
                        found.status = status;
                        found.recruiterNote = note || "";
                    }
                }
            }
            inMemoryStore.interviews.set("recruiter_listings", memoryListings);
            return res.json({ success: true, message: "Status updated successfully", status, note });
        }

        const app = await Application.findByIdAndUpdate(
            appId,
            {
                status,
                recruiterNote: note || "",
                $push: { statusHistory: { status, changedAt: new Date(), note: note || "" } }
            },
            { new: true }
        );

        if (!app) return res.status(404).json({ message: "Application not found" });

        res.json({ success: true, application: app });
    } catch (err) {
        console.error("updateApplicationStatus error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Helpers ───────────────────────────────────────────────────────────────
function getDemoOpportunities() {
    return [
        {
            _id: "opp1", title: "Backend Developer Intern", company: "Google", domain: "software",
            type: "internship", location: "Bangalore", workMode: "hybrid", stipend: "₹50,000/month",
            duration: "3 months", experienceLevel: "fresher",
            description: "Work on distributed backend systems serving millions of users.",
            requiredSkills: [
                { skillSlug: "java", skillName: "Java", minProficiency: 75, weight: 1.4 },
                { skillSlug: "data-structures", skillName: "DSA", minProficiency: 70, weight: 1.3 },
                { skillSlug: "rest-apis", skillName: "REST APIs", minProficiency: 65, weight: 1.2 },
                { skillSlug: "sql", skillName: "SQL", minProficiency: 60, weight: 1.0 },
                { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 70, weight: 1.2 }
            ],
            isActive: true, applicationCount: 145, matchScore: 82
        },
        {
            _id: "opp2", title: "Full Stack Engineer Intern", company: "Microsoft", domain: "software",
            type: "internship", location: "Hyderabad", workMode: "remote", stipend: "₹45,000/month",
            duration: "6 months", experienceLevel: "fresher",
            description: "Build and ship features across the entire stack.",
            requiredSkills: [
                { skillSlug: "javascript", skillName: "JavaScript", minProficiency: 70, weight: 1.4 },
                { skillSlug: "react", skillName: "React", minProficiency: 65, weight: 1.3 },
                { skillSlug: "nodejs", skillName: "Node.js", minProficiency: 65, weight: 1.2 },
                { skillSlug: "sql", skillName: "SQL", minProficiency: 55, weight: 1.0 }
            ],
            isActive: true, applicationCount: 89, matchScore: 76
        },
        {
            _id: "opp3", title: "ML Engineer Intern", company: "Amazon", domain: "data",
            type: "internship", location: "Remote", workMode: "remote", stipend: "₹60,000/month",
            duration: "3 months", experienceLevel: "fresher",
            description: "Train and deploy ML models at Amazon scale.",
            requiredSkills: [
                { skillSlug: "python", skillName: "Python", minProficiency: 75, weight: 1.5 },
                { skillSlug: "machine-learning", skillName: "Machine Learning", minProficiency: 65, weight: 1.4 },
                { skillSlug: "sql", skillName: "SQL", minProficiency: 60, weight: 1.0 },
                { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 70, weight: 1.2 }
            ],
            isActive: true, applicationCount: 201, matchScore: 65
        },
        {
            _id: "opp4", title: "DevOps Intern", company: "Infosys", domain: "devops",
            type: "internship", location: "Chennai", workMode: "on-site", stipend: "₹25,000/month",
            duration: "6 months", experienceLevel: "fresher",
            description: "Set up CI/CD pipelines and manage cloud infrastructure.",
            requiredSkills: [
                { skillSlug: "docker", skillName: "Docker", minProficiency: 65, weight: 1.3 },
                { skillSlug: "aws", skillName: "AWS", minProficiency: 60, weight: 1.2 },
                { skillSlug: "linux", skillName: "Linux", minProficiency: 60, weight: 1.1 }
            ],
            isActive: true, applicationCount: 67, matchScore: 58
        }
    ];
}

function getDemoApplications() {
    return [
        {
            _id: "app1", opportunityId: { _id: "opp1", title: "Backend Developer Intern", company: "Google", type: "internship" },
            status: "interview", matchScore: 82, appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            statusHistory: [
                { status: "applied", changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                { status: "under_review", changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
                { status: "shortlisted", changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
                { status: "interview", changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
            ]
        },
        {
            _id: "app2", opportunityId: { _id: "opp2", title: "Full Stack Engineer Intern", company: "Microsoft", type: "internship" },
            status: "under_review", matchScore: 76, appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            statusHistory: [
                { status: "applied", changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
                { status: "under_review", changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
            ]
        },
        {
            _id: "app3", opportunityId: { _id: "opp3", title: "ML Engineer Intern", company: "Amazon", type: "internship" },
            status: "applied", matchScore: 65, appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            statusHistory: [{ status: "applied", changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }]
        }
    ];
}

function getDemoRecruiterListings() {
    return [
        {
            _id: "rec_opp_1",
            title: "Backend Developer Intern",
            company: "Google Cloud",
            domain: "software",
            type: "internship",
            location: "Bangalore (Hybrid)",
            workMode: "hybrid",
            stipend: "₹55,000/month",
            duration: "3 months",
            isActive: true,
            requiredSkills: [
                { skillSlug: "java", skillName: "Java", minProficiency: 80, weight: 1.3 },
                { skillSlug: "spring-boot", skillName: "Spring Boot", minProficiency: 70, weight: 1.2 },
                { skillSlug: "sql", skillName: "SQL", minProficiency: 70, weight: 1.1 },
                { skillSlug: "data-structures", skillName: "DSA", minProficiency: 75, weight: 1.2 },
                { skillSlug: "rest-apis", skillName: "REST APIs", minProficiency: 65, weight: 1.0 }
            ],
            applications: [
                {
                    _id: "rec_app_1",
                    userEmail: "aarav.sharma@nitk.edu.in",
                    candidateName: "Aarav Sharma",
                    matchScore: 94,
                    status: "shortlisted",
                    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    candidateProfile: {
                        institution: "NIT Karnataka",
                        branch: "Computer Science",
                        overallReadiness: 91,
                        topSkills: [
                            { skillName: "Java", proficiency: 92 },
                            { skillName: "DSA", proficiency: 95 },
                            { skillName: "REST APIs", proficiency: 88 }
                        ]
                    }
                },
                {
                    _id: "rec_app_2",
                    userEmail: "priya.nair@iitb.ac.in",
                    candidateName: "Priya Nair",
                    matchScore: 91,
                    status: "under_review",
                    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    candidateProfile: {
                        institution: "IIT Bombay",
                        branch: "Information Technology",
                        overallReadiness: 88,
                        topSkills: [
                            { skillName: "DSA", proficiency: 96 },
                            { skillName: "Java", proficiency: 87 },
                            { skillName: "SQL", proficiency: 84 }
                        ]
                    }
                },
                {
                    _id: "rec_app_3",
                    userEmail: "rohit.verma@dtu.ac.in",
                    candidateName: "Rohit Verma",
                    matchScore: 84,
                    status: "applied",
                    appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                    candidateProfile: {
                        institution: "Delhi Technological University",
                        branch: "Software Engineering",
                        overallReadiness: 81,
                        topSkills: [
                            { skillName: "Java", proficiency: 82 },
                            { skillName: "REST APIs", proficiency: 84 }
                        ]
                    }
                }
            ]
        },
        {
            _id: "rec_opp_2",
            title: "Full Stack Developer",
            company: "Razorpay",
            domain: "software",
            type: "full_time",
            location: "Bangalore",
            workMode: "remote",
            stipend: "₹18-24 LPA",
            duration: "Full-Time",
            isActive: true,
            requiredSkills: [
                { skillSlug: "react", skillName: "React", minProficiency: 75, weight: 1.3 },
                { skillSlug: "nodejs", skillName: "Node.js", minProficiency: 70, weight: 1.2 },
                { skillSlug: "sql", skillName: "SQL", minProficiency: 65, weight: 1.0 }
            ],
            applications: [
                {
                    _id: "rec_app_4",
                    userEmail: "aditi.deshmukh@coep.ac.in",
                    candidateName: "Aditi Deshmukh",
                    matchScore: 89,
                    status: "interview",
                    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    candidateProfile: {
                        institution: "COEP Pune",
                        branch: "Computer Science",
                        overallReadiness: 86,
                        topSkills: [
                            { skillName: "React", proficiency: 90 },
                            { skillName: "Node.js", proficiency: 85 }
                        ]
                    }
                }
            ]
        }
    ];
}

function getDemoShortlist(opportunityId) {
    return [
        {
            _id: "rec_app_1",
            candidateName: "Aarav Sharma",
            userEmail: "aarav.sharma@nitk.edu.in",
            matchScore: 94,
            status: "shortlisted",
            candidateProfile: {
                overallReadiness: 91,
                institution: "NIT Karnataka",
                branch: "Computer Science",
                topSkills: [
                    { skillName: "Java", proficiency: 92 },
                    { skillName: "DSA", proficiency: 95 },
                    { skillName: "REST APIs", proficiency: 88 },
                    { skillName: "Problem Solving", proficiency: 94 }
                ]
            },
            matchResult: {
                score: 94,
                breakdown: {
                    technicalCoverage: 96,
                    proficiencyDepth: 94,
                    problemSolving: 95,
                    communication: 89,
                    education: 90,
                    experience: 85
                },
                explanation: "Top Candidate: Exceeds all critical requirements in Java, DSA, and REST APIs. Demonstrates exceptional problem-solving (95%) and strong communication (89%)."
            },
            shortlistReason: "Selected because: Technical Depth (96%), Problem Solving (95%), Communication (89%), Required Skills Coverage (100%)."
        },
        {
            _id: "rec_app_2",
            candidateName: "Priya Nair",
            userEmail: "priya.nair@iitb.ac.in",
            matchScore: 91,
            status: "under_review",
            candidateProfile: {
                overallReadiness: 88,
                institution: "IIT Bombay",
                branch: "Information Technology",
                topSkills: [
                    { skillName: "DSA", proficiency: 96 },
                    { skillName: "Java", proficiency: 87 },
                    { skillName: "SQL", proficiency: 84 },
                    { skillName: "System Design", proficiency: 82 }
                ]
            },
            matchResult: {
                score: 91,
                breakdown: {
                    technicalCoverage: 90,
                    proficiencyDepth: 92,
                    problemSolving: 96,
                    communication: 88,
                    education: 95,
                    experience: 80
                },
                explanation: "High Priority: Exceptional algorithmic competence with 96% DSA and 87% Java. Meets all required engineering bars."
            },
            shortlistReason: "Selected because: Problem Solving (96%), Technical Foundation (90%), Education Fit (95%)."
        },
        {
            _id: "rec_app_3",
            candidateName: "Rohit Verma",
            userEmail: "rohit.verma@dtu.ac.in",
            matchScore: 84,
            status: "applied",
            candidateProfile: {
                overallReadiness: 81,
                institution: "Delhi Technological University",
                branch: "Software Engineering",
                topSkills: [
                    { skillName: "Java", proficiency: 82 },
                    { skillName: "REST APIs", proficiency: 84 },
                    { skillName: "SQL", proficiency: 75 }
                ]
            },
            matchResult: {
                score: 84,
                breakdown: {
                    technicalCoverage: 85,
                    proficiencyDepth: 82,
                    problemSolving: 85,
                    communication: 82,
                    education: 85,
                    experience: 75
                },
                explanation: "Solid candidate meeting foundational backend criteria with balanced competence across Java and REST APIs."
            },
            shortlistReason: "Selected because: Meets required skills bar across all core domains."
        }
    ];
}

module.exports = {
    listOpportunities,
    getOpportunity,
    createOpportunity,
    applyToOpportunity,
    getMyApplications,
    getRecruiterListings,
    getShortlist,
    updateApplicationStatus,
    computeMatchScore
};
