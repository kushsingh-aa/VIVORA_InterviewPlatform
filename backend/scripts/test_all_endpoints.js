const axios = require("axios");

const BASE = "http://localhost:5000";

async function runTests() {
    console.log("=== STARTING VIVORA COMPREHENSIVE ENDPOINT AUDIT ===");
    let passed = 0;
    let failed = 0;
    const errors = [];

    async function test(name, fn) {
        process.stdout.write(`Testing: ${name}... `);
        try {
            await fn();
            console.log("✓ PASS");
            passed++;
        } catch (err) {
            console.log(`✗ FAIL: ${err.message}`);
            if (err.response?.data) {
                console.log("   Response data:", JSON.stringify(err.response.data));
            }
            errors.push({ test: name, error: err.message, data: err.response?.data });
            failed++;
        }
    }

    let token = "";
    let recruiterToken = "";
    let facultyToken = "";
    let sessionId = "";
    let oppId = "";

    // 1. Health
    await test("Health check GET /api/health", async () => {
        const res = await axios.get(`${BASE}/api/health`);
        if (res.status !== 200 || res.data.status !== "online") throw new Error("Health check failed");
    });

    // 2. Auth - Register & Login
    const testEmail = `candidate_${Date.now()}@test.com`;
    await test("Auth POST /auth/register (Candidate)", async () => {
        const res = await axios.post(`${BASE}/auth/register`, {
            name: "Candidate Tester",
            email: testEmail,
            password: "password123",
            role: "candidate",
            institution: "IIT Delhi"
        });
        if (!res.data.token) throw new Error("No token returned");
        token = res.data.token;
    });

    await test("Auth POST /auth/login (Candidate)", async () => {
        const res = await axios.post(`${BASE}/auth/login`, {
            email: testEmail,
            password: "password123"
        });
        if (!res.data.token) throw new Error("Login failed");
        token = res.data.token;
    });

    await test("Auth GET /auth/profile", async () => {
        const res = await axios.get(`${BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.email) throw new Error("Profile did not return email");
    });

    // Recruiter register
    const recruiterEmail = `recruiter_${Date.now()}@test.com`;
    await test("Auth POST /auth/register (Recruiter)", async () => {
        const res = await axios.post(`${BASE}/auth/register`, {
            name: "Tech Recruiter",
            email: recruiterEmail,
            password: "password123",
            role: "recruiter",
            company: "Google"
        });
        if (!res.data.token) throw new Error("No token");
        recruiterToken = res.data.token;
    });

    // Faculty register
    const facultyEmail = `faculty_${Date.now()}@test.com`;
    await test("Auth POST /auth/register (Faculty)", async () => {
        const res = await axios.post(`${BASE}/auth/register`, {
            name: "Prof. Sharma",
            email: facultyEmail,
            password: "password123",
            role: "faculty",
            institution: "IIT Delhi"
        });
        if (!res.data.token) throw new Error("No token");
        facultyToken = res.data.token;
    });

    // 3. Interview Endpoints
    await test("Interview POST /interview/start", async () => {
        const res = await axios.post(`${BASE}/interview/start`, {
            track: "software",
            role: "Frontend Developer",
            difficulty: "Mid-Level"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.sessionId || !res.data.currentQuestion) throw new Error("Start interview failed");
        sessionId = res.data.sessionId;
    });

    await test("Interview POST /interview/telemetry", async () => {
        const res = await axios.post(`${BASE}/interview/telemetry`, {
            sessionId,
            telemetryData: {
                faceCount: 1,
                gazeDirection: "center",
                irisTracking: { left: 0.5, right: 0.5 },
                poseStability: 0.95
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.success) throw new Error("Telemetry recording failed");
    });

    await test("Interview POST /interview/hint", async () => {
        const res = await axios.post(`${BASE}/interview/hint`, {
            sessionId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.hint) throw new Error("Hint not returned");
    });

    await test("Interview POST /interview/assistant", async () => {
        const res = await axios.post(`${BASE}/interview/assistant`, {
            sessionId,
            query: "How should I structure my answer?"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.reply) throw new Error("Copilot reply not returned");
    });

    await test("Interview POST /interview/message", async () => {
        const res = await axios.post(`${BASE}/interview/message`, {
            sessionId,
            answerText: "In React, reconciliation is the algorithm React uses to diff one tree of elements with another to determine which parts need to be updated. It uses keys to identify stable items and renders differences efficiently with virtual DOM."
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.interviewerText) throw new Error("Message submission failed");
    });

    await test("Interview POST /interview/complete", async () => {
        const res = await axios.post(`${BASE}/interview/complete`, {
            sessionId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.report || !res.data.report.overallScore) throw new Error("Complete interview failed to generate report");
    });

    await test("Interview GET /interview/history", async () => {
        const res = await axios.get(`${BASE}/interview/history`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!Array.isArray(res.data.history) || res.data.history.length === 0) throw new Error("History failed or empty");
    });

    // 4. Skill Endpoints
    await test("Skill GET /skill/passport", async () => {
        const res = await axios.get(`${BASE}/skill/passport`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.profile) throw new Error("Passport profile not returned");
    });

    await test("Skill PUT /skill/passport", async () => {
        const res = await axios.put(`${BASE}/skill/passport`, {
            skills: [
                { slug: "react", name: "React", proficiency: 85, category: "technical" },
                { slug: "nodejs", name: "Node.js", proficiency: 75, category: "technical" }
            ]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.profile) throw new Error("Update passport failed");
    });

    await test("Skill GET /skill/gap", async () => {
        const res = await axios.get(`${BASE}/skill/gap?roleSlug=fullstack-developer`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.targetRole) throw new Error("Skill gap failed");
    });

    await test("Skill GET /skill/taxonomy", async () => {
        const res = await axios.get(`${BASE}/skill/taxonomy`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!Array.isArray(res.data.skills)) throw new Error("Skill taxonomy failed");
    });

    // 5. Opportunity Endpoints
    await test("Opportunity POST /opportunity (Recruiter create)", async () => {
        const res = await axios.post(`${BASE}/opportunity`, {
            title: "Full Stack Engineer Intern",
            company: "Acme Corp",
            type: "internship",
            domain: "Engineering",
            location: "Remote",
            stipend: "₹30,000/mo",
            duration: "6 months",
            description: "Build cutting-edge web applications.",
            requiredSkills: [
                { skillSlug: "react", skillName: "React", minProficiency: 70, weight: 1.5 },
                { skillSlug: "nodejs", skillName: "Node.js", minProficiency: 65, weight: 1.2 }
            ]
        }, {
            headers: { Authorization: `Bearer ${recruiterToken}` }
        });
        if (!res.data.opportunity?._id) throw new Error("Create opportunity failed");
        oppId = res.data.opportunity._id;
    });

    await test("Opportunity GET /opportunity (List for candidate)", async () => {
        const res = await axios.get(`${BASE}/opportunity`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!Array.isArray(res.data.opportunities)) throw new Error("List opportunities failed");
    });

    await test("Opportunity GET /opportunity/:id", async () => {
        const res = await axios.get(`${BASE}/opportunity/${oppId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.opportunity) throw new Error("Get single opportunity failed");
    });

    await test("Opportunity POST /opportunity/:id/apply", async () => {
        const res = await axios.post(`${BASE}/opportunity/${oppId}/apply`, {
            coverNote: "I am passionate about fullstack development and have built multiple MERN projects."
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.application) throw new Error("Apply to opportunity failed");
    });

    await test("Opportunity GET /opportunity/my-applications", async () => {
        const res = await axios.get(`${BASE}/opportunity/my-applications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!Array.isArray(res.data.applications) || res.data.applications.length === 0) throw new Error("My applications empty");
    });

    await test("Opportunity GET /opportunity/recruiter/listings", async () => {
        const res = await axios.get(`${BASE}/opportunity/recruiter/listings`, {
            headers: { Authorization: `Bearer ${recruiterToken}` }
        });
        if (!Array.isArray(res.data.listings)) throw new Error("Recruiter listings failed");
    });

    await test("Opportunity GET /opportunity/recruiter/shortlist/:id", async () => {
        const res = await axios.get(`${BASE}/opportunity/recruiter/shortlist/${oppId}`, {
            headers: { Authorization: `Bearer ${recruiterToken}` }
        });
        if (!Array.isArray(res.data.shortlist)) throw new Error("Shortlist failed");
    });

    // 6. Analytics Endpoints
    await test("Analytics GET /analytics/cohort (Faculty)", async () => {
        const res = await axios.get(`${BASE}/analytics/cohort`, {
            headers: { Authorization: `Bearer ${facultyToken}` }
        });
        if (!res.data.data) throw new Error("Cohort data failed");
    });

    await test("Analytics GET /analytics/demand", async () => {
        const res = await axios.get(`${BASE}/analytics/demand`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!Array.isArray(res.data.demand)) throw new Error("Industry demand failed");
    });

    console.log("\n==============================");
    console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==============================");
    if (failed > 0) {
        console.log("Failures summary:", JSON.stringify(errors, null, 2));
    }
}

runTests().catch(e => {
    console.error("FATAL RUNNER ERROR:", e);
});
