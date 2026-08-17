const Interview = require("../models/Interview");
const Chat = require("../models/Chat");
const { getIsConnected, inMemoryStore } = require("../config/db");
const gptService = require("../services/gptService");

// In-memory active session cache for ultra-fast conversational state
const activeSessions = new Map();

/**
 * Start a new interview session
 */
const startInterview = async (req, res) => {
    try {
        const { track = "software", role = "Software Engineering Core", difficulty = "Senior", apiKey } = req.body;
        const effectiveApiKey = apiKey || req.headers["x-api-key"] || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
        const userId = req.user ? req.user.id : null;
        const userEmail = req.user ? req.user.email : "candidate@vivora.ai";
        const candidateName = req.user ? req.user.name : "Candidate";

        // Initialize AI session dynamically using LLM
        const sessionState = await gptService.initSession(track, difficulty, candidateName, effectiveApiKey);
        const sessionId = "session_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

        const sessionData = {
            sessionId,
            userId,
            userEmail,
            track,
            roleTitle: sessionState.roleTitle || role,
            difficulty,
            persona: sessionState.persona,
            greeting: sessionState.greeting,
            currentQuestionIndex: sessionState.currentQuestionIndex || 0,
            totalQuestions: sessionState.totalQuestions || 4,
            currentQuestion: sessionState.currentQuestion,
            status: "active",
            history: sessionState.history || [],
            scores: [],
            apiKey: effectiveApiKey,
            createdAt: new Date()
        };

        // Cache in memory for quick multi-turn turnarounds
        activeSessions.set(sessionId, sessionData);

        // Save to MongoDB if connected
        if (getIsConnected()) {
            try {
                const newInterviewDoc = new Interview({
                    sessionId,
                    userId,
                    userEmail,
                    track,
                    roleTitle: sessionState.roleTitle || role,
                    difficulty,
                    persona: sessionState.persona,
                    greeting: sessionState.greeting,
                    currentQuestionIndex: 0,
                    totalQuestions: sessionState.totalQuestions || 4,
                    status: "active",
                    history: sessionState.history.map(h => ({
                        speaker: h.speaker,
                        text: h.text,
                        questionId: h.questionId,
                        timestamp: new Date()
                    }))
                });
                await newInterviewDoc.save();
            } catch (mongoErr) {
                console.warn("MongoDB Interview create warning:", mongoErr.message);
            }
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
        const effectiveApiKey = apiKey || req.headers["x-api-key"] || session?.apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

        if (!session) {
            // Restore from MongoDB or create on-the-fly session
            if (getIsConnected()) {
                const doc = await Interview.findOne({ sessionId });
                if (doc) {
                    session = {
                        sessionId: doc.sessionId,
                        userId: doc.userId,
                        userEmail: doc.userEmail,
                        track: doc.track,
                        roleTitle: doc.roleTitle,
                        difficulty: doc.difficulty,
                        persona: doc.persona,
                        history: doc.history || [],
                        scores: doc.scores || [],
                        currentQuestionIndex: doc.currentQuestionIndex || 0,
                        totalQuestions: doc.totalQuestions || 4,
                        status: doc.status
                    };
                    activeSessions.set(sessionId, session);
                }
            }

            if (!session) {
                const newSession = await gptService.initSession("software", "Senior", "Candidate", effectiveApiKey);
                session = { sessionId, userId: req.user ? req.user.id : null, apiKey: effectiveApiKey, ...newSession };
                activeSessions.set(sessionId, session);
            }
        }

        const result = await gptService.processCandidateAnswer(session, answerText || "", effectiveApiKey);

        // Update in MongoDB
        if (getIsConnected()) {
            try {
                await Interview.findOneAndUpdate(
                    { sessionId },
                    {
                        $set: {
                            status: result.isComplete ? "completed" : "active",
                            currentQuestionIndex: session.currentQuestionIndex,
                            scores: session.scores,
                            ...(result.report ? { report: result.report } : {})
                        },
                        $push: {
                            history: {
                                $each: [
                                    { speaker: "candidate", text: answerText, timestamp: new Date() },
                                    { speaker: "interviewer", text: result.interviewerText, isFollowUp: result.isFollowUp, timestamp: new Date() }
                                ]
                            }
                        }
                    },
                    { new: true, upsert: true }
                );
            } catch (mongoUpdateErr) {
                console.warn("MongoDB update interview warning:", mongoUpdateErr.message);
            }
        } else {
            // In-memory archive
            if (result.isComplete && result.report) {
                inMemoryStore.interviews.set(sessionId, {
                    sessionId,
                    userId: session.userId,
                    userEmail: session.userEmail,
                    track: session.track,
                    role: session.roleTitle,
                    difficulty: session.difficulty,
                    report: result.report,
                    createdAt: new Date()
                });
            }
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
        const effectiveApiKey = apiKey || req.headers["x-api-key"] || session?.apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
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
        const effectiveApiKey = apiKey || req.headers["x-api-key"] || session?.apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
        const copilotResponse = await gptService.askCopilotAssistant(query, session, effectiveApiKey);

        // Log Chat in MongoDB
        if (getIsConnected() && sessionId) {
            try {
                const chatDoc = new Chat({
                    sessionId,
                    userId: req.user?.id,
                    userEmail: req.user?.email || "candidate@vivora.ai",
                    query,
                    reply: copilotResponse.reply,
                    timestamp: new Date()
                });
                await chatDoc.save();
            } catch (chatErr) {
                console.warn("MongoDB Chat log error:", chatErr.message);
            }
        }

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
        const effectiveApiKey = apiKey || req.headers["x-api-key"] || session?.apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

        if (!session) {
            const mockSession = await gptService.initSession("software", "Senior", "Candidate", effectiveApiKey);
            const report = await gptService.generateFinalReport(mockSession, effectiveApiKey);
            return res.json({ success: true, report });
        }

        session.status = "completed";
        const report = await gptService.generateFinalReport(session, effectiveApiKey);

        // Update in MongoDB
        if (getIsConnected()) {
            try {
                await Interview.findOneAndUpdate(
                    { sessionId },
                    { $set: { status: "completed", report } },
                    { new: true, upsert: true }
                );
            } catch (err) {
                console.warn("MongoDB complete interview update error:", err.message);
            }
        } else {
            inMemoryStore.interviews.set(sessionId, {
                sessionId,
                userId: session.userId,
                userEmail: session.userEmail,
                track: session.track,
                role: session.roleTitle,
                difficulty: session.difficulty,
                report,
                createdAt: new Date()
            });
        }

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
        const userEmail = req.user?.email;

        // 1. Fetch from MongoDB
        if (getIsConnected()) {
            const query = (userEmail && userEmail !== "guest@vivora.ai") ? { userEmail } : {};
            const interviews = await Interview.find(query).sort({ createdAt: -1 }).limit(20);
            
            const historyList = interviews.map(doc => ({
                sessionId: doc.sessionId,
                userId: doc.userId,
                userEmail: doc.userEmail,
                track: doc.track,
                role: doc.roleTitle,
                difficulty: doc.difficulty,
                report: doc.report,
                createdAt: doc.createdAt
            }));

            return res.json({ success: true, history: historyList });
        }

        // 2. In-Memory fallback
        const userHistory = Array.from(inMemoryStore.interviews.values()).reverse();
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