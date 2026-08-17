const pool = require("../config/db");
const gptService = require("../services/gptService");

// In-memory active session store (backed by DB when available)
const activeSessions = new Map();
const sessionHistoryStore = [];

/**
 * Start a new interview session
 */
const startInterview = async (req, res) => {
    try {
        const { track = "software", role = "Software Engineering Core", experience = "Senior", difficulty = "Senior", apiKey } = req.body;
        const effectiveApiKey = apiKey || req.headers["x-api-key"] || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
        const userId = req.user ? req.user.id : 1;

        // Initialize AI session dynamically using LLM
        const sessionState = await gptService.initSession(track, difficulty, req.user ? req.user.name : "Candidate", effectiveApiKey);
        const sessionId = "session_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

        activeSessions.set(sessionId, {
            sessionId,
            userId,
            track,
            role,
            experience,
            difficulty,
            apiKey: effectiveApiKey,
            createdAt: new Date().toISOString(),
            ...sessionState
        });

        // Record in DB if available
        try {
            await pool.query(
                `INSERT INTO interviews(user_id, role, experience, difficulty)
                 VALUES($1, $2, $3, $4) RETURNING *`,
                [userId, role, experience, difficulty]
            );
        } catch (dbErr) {
            // Safe fallback
        }

        res.status(201).json({
            message: "Interview Initialized Successfully",
            sessionId,
            track,
            persona: sessionState.persona,
            roleTitle: sessionState.roleTitle,
            greeting: sessionState.greeting,
            currentQuestion: sessionState.currentQuestion,
            totalQuestions: sessionState.totalQuestions,
            questionIndex: 1,
            history: sessionState.history
        });

    } catch (err) {
        console.error("Start interview error:", err);
        res.status(500).json({ message: "Failed to initialize interview", error: err.message });
    }
};

/**
 * Submit candidate answer / response message
 */
const submitMessage = async (req, res) => {
    try {
        const { sessionId, answerText, apiKey } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: "sessionId is required" });
        }

        let session = activeSessions.get(sessionId);
        const effectiveApiKey = apiKey || req.headers["x-api-key"] || session?.apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

        if (!session) {
            // Create on-the-fly fallback session
            const newSession = await gptService.initSession("software", "Senior", "Candidate", effectiveApiKey);
            session = { sessionId, userId: req.user ? req.user.id : 1, apiKey: effectiveApiKey, ...newSession };
            activeSessions.set(sessionId, session);
        }

        const result = await gptService.processCandidateAnswer(session, answerText || "", effectiveApiKey);

        // If interview just completed, archive it
        if (result.isComplete && result.report) {
            sessionHistoryStore.unshift({
                sessionId,
                userId: session.userId,
                track: session.track,
                role: session.role || session.roleTitle,
                difficulty: session.difficulty,
                report: result.report,
                createdAt: new Date().toISOString()
            });
        }

        res.json({
            sessionId,
            isComplete: result.isComplete,
            isFollowUp: result.isFollowUp,
            interviewerText: result.interviewerText,
            evaluation: result.evaluation,
            currentQuestionIndex: result.questionIndex,
            totalQuestions: result.totalQuestions,
            report: result.report || null,
            history: session.history
        });

    } catch (err) {
        console.error("Submit message error:", err);
        res.status(500).json({ message: "Failed to process message", error: err.message });
    }
};

/**
 * Get hint for current active question
 */
const getHint = async (req, res) => {
    try {
        const { sessionId, apiKey } = req.body;
        const session = activeSessions.get(sessionId) || {};
        const effectiveApiKey = apiKey || req.headers["x-api-key"] || session?.apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
        const hintData = await gptService.getQuestionHint(session, effectiveApiKey);

        res.json({
            success: true,
            hint: hintData.hint,
            topic: hintData.topic
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to get hint", error: err.message });
    }
};

/**
 * Chat with side-drawer Vivora Copilot Assistant
 */
const assistantChat = async (req, res) => {
    try {
        const { sessionId, query, apiKey } = req.body;
        const session = activeSessions.get(sessionId) || {};
        const effectiveApiKey = apiKey || req.headers["x-api-key"] || session?.apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
        const copilotResponse = await gptService.askCopilotAssistant(query, session, effectiveApiKey);

        res.json({
            success: true,
            reply: copilotResponse.reply,
            timestamp: copilotResponse.timestamp
        });
    } catch (err) {
        res.status(500).json({ message: "Copilot assistant error", error: err.message });
    }
};

/**
 * Force complete interview and get final evaluation
 */
const completeInterview = async (req, res) => {
    try {
        const { sessionId, apiKey } = req.body;
        const session = activeSessions.get(sessionId);
        const effectiveApiKey = apiKey || req.headers["x-api-key"] || session?.apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

        if (!session) {
            // Generate standard report
            const mockSession = await gptService.initSession("software", "Senior", "Candidate", effectiveApiKey);
            const report = await gptService.generateFinalReport(mockSession, effectiveApiKey);
            return res.json({ success: true, report });
        }

        session.status = "completed";
        const report = await gptService.generateFinalReport(session, effectiveApiKey);

        sessionHistoryStore.unshift({
            sessionId,
            userId: session.userId,
            track: session.track,
            role: session.role || session.roleTitle,
            difficulty: session.difficulty,
            report,
            createdAt: new Date().toISOString()
        });

        res.json({
            success: true,
            sessionId,
            report,
            history: session.history
        });
    } catch (err) {
        console.error("Complete interview error:", err);
        res.status(500).json({ message: "Failed to conclude interview", error: err.message });
    }
};

/**
 * Get interview history archive
 */
const getHistory = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 1;
        const userHistory = sessionHistoryStore.filter(s => !s.userId || s.userId === userId || userId === 1);
        res.json({ success: true, history: userHistory });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch history", error: err.message });
    }
};

module.exports = {
    startInterview,
    submitMessage,
    getHint,
    assistantChat,
    completeInterview,
    getHistory
};