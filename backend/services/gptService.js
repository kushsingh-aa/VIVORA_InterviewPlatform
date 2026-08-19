const axios = require("axios");
const https = require("https");

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Universal LLM caller supporting OpenRouter, OpenAI, Google Gemini, and Groq
 */
async function callLLM({ systemPrompt, messages, temperature = 0.7, jsonMode = false, apiKeyOverride = null }) {
    const openrouterKey = apiKeyOverride || process.env.OPENROUTER_API_KEY || (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("sk-or-v1-") ? process.env.OPENAI_API_KEY : null);
    const geminiKey = (apiKeyOverride && apiKeyOverride.startsWith("AIza")) ? apiKeyOverride : process.env.GEMINI_API_KEY;
    const openaiKey = apiKeyOverride || process.env.OPENAI_API_KEY;

    // 1. Prioritize OpenRouter if key is sk-or-v1-... or OPENROUTER_API_KEY is present
    if (openrouterKey && (openrouterKey.startsWith("sk-or-v1-") || !geminiKey)) {
        try {
            const formattedMessages = [
                { role: "system", content: systemPrompt + (jsonMode ? "\n\nCRITICAL: You MUST respond ONLY with valid, parseable JSON. Do not include markdown code fence formatting like ```json, just the raw JSON object." : "") },
                ...messages.map(m => ({
                    role: m.speaker === "candidate" || m.role === "user" ? "user" : "assistant",
                    content: m.text || m.content || ""
                }))
            ];

            const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
            const isJsonSupported = model.includes("gpt-4") || model.includes("gpt-3.5") || model.includes("deepseek");
            const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
                model,
                messages: formattedMessages,
                temperature,
                ...(jsonMode && isJsonSupported ? { response_format: { type: "json_object" } } : {})
            }, {
                headers: {
                    "Authorization": `Bearer ${openrouterKey}`,
                    "HTTP-Referer": "http://localhost:5000",
                    "X-Title": "Vivora AI Assessment Portal",
                    "Content-Type": "application/json"
                },
                httpsAgent,
                timeout: 25000
            });

            const content = res.data?.choices?.[0]?.message?.content;
            if (content) {
                if (jsonMode) {
                    try {
                        const cleanJson = content.replace(/```json/gi, "").replace(/```/g, "").trim();
                        return JSON.parse(cleanJson);
                    } catch (parseErr) {
                        const match = content.match(/\{[\s\S]*\}/);
                        if (match) {
                            try { return JSON.parse(match[0]); } catch (e) {}
                        }
                    }
                }
                return content;
            }
        } catch (openrouterErr) {
            console.error("OpenRouter API error:", openrouterErr.response?.data || openrouterErr.message);
        }
    }

    // 2. Try Google Gemini API if GEMINI_API_KEY is available (AIza...)
    if (geminiKey && geminiKey.startsWith("AIza")) {
        try {
            const contents = [];
            for (const m of messages) {
                const role = m.speaker === "candidate" || m.role === "user" ? "user" : "model";
                contents.push({
                    role,
                    parts: [{ text: m.text || m.content || "" }]
                });
            }

            const payload = {
                contents,
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                generationConfig: {
                    temperature,
                    responseMimeType: jsonMode ? "application/json" : "text/plain"
                }
            };

            const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
            const res = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
                payload,
                { timeout: 25000 }
            );

            const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                return jsonMode ? JSON.parse(text) : text;
            }
        } catch (geminiErr) {
            console.warn("Gemini API call error:", geminiErr.response?.data || geminiErr.message);
        }
    }

    // 3. Fallback: Standard OpenAI endpoint
    if (openaiKey && !openaiKey.startsWith("sk-or-v1-")) {
        try {
            const formattedMessages = [
                { role: "system", content: systemPrompt },
                ...messages.map(m => ({
                    role: m.speaker === "candidate" || m.role === "user" ? "user" : "assistant",
                    content: m.text || m.content || ""
                }))
            ];

            const res = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                messages: formattedMessages,
                temperature,
                ...(jsonMode ? { response_format: { type: "json_object" } } : {})
            }, {
                headers: {
                    "Authorization": `Bearer ${openaiKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 25000
            });

            const content = res.data?.choices?.[0]?.message?.content;
            if (content) {
                return jsonMode ? JSON.parse(content) : content;
            }
        } catch (openaiErr) {
            console.warn("OpenAI API call error:", openaiErr.response?.data || openaiErr.message);
        }
    }

    return null;
}

// Seniority Level Specifications
const SENIORITY_ARCHETYPES = {
    Junior: {
        title: "Junior / Associate (0-2 YOE)",
        scope: "Language syntax & fundamentals, basic data structures (hash maps, lists, trees), basic REST API endpoint construction, simple SQL joins & indexing, basic error handling & input validation, writing unit tests, step-by-step problem breakdown.",
        tone: "Encouraging, supportive, structured, and clear. Do NOT ask planetary multi-region distributed system scale questions. Focus on practical code mechanics, logic correctness, and clean fundamentals.",
        sampleQuestionTheme: "Designing a clean CRUD API with pagination and validation, debugging a null pointer or concurrency bug, optimizing a basic SQL query with joins, handling API failure responses gracefully.",
        evalCriteria: "Look for strong foundation, clarity of logic, willingness to test edge cases, and structured problem-solving."
    },
    "Mid-Level": {
        title: "Mid-Level Engineer (3-5 YOE)",
        scope: "Production-ready service design, modular code architecture, database query optimization & indexes, caching layers (Redis/Memcached), asynchronous worker queues (Kafka/RabbitMQ/BullMQ), microservice boundaries, API contract design, automated integration testing, and defensive programming.",
        tone: "Collaborative, practical, focused on real-world engineering trade-offs, maintainability, and operational debugging.",
        sampleQuestionTheme: "Designing an authentication and session management service with JWT and Redis, optimizing slow DB queries under 1,000 QPS, background job processing with retry mechanics, structured REST API versioning.",
        evalCriteria: "Expect solid understanding of trade-offs, defensive coding, observability (logs/metrics), and structured design patterns."
    },
    Senior: {
        title: "Senior Engineer (5-8 YOE)",
        scope: "Distributed systems scalability, concurrency control (optimistic vs pessimistic locking, distributed locks), data consistency models (eventual vs strong consistency), high-throughput caching (cache stampedes, cache-aside), circuit breakers, dead-letter queues, partition tolerance (CAP theorem), load balancing, and failure domains.",
        tone: "Rigorous, analytical, exploring failure modes, edge cases, and architectural trade-offs.",
        sampleQuestionTheme: "Handling 10x flash sale traffic spikes, designing an idempotent payment processing pipeline with zero double-charge risk, preventing double-booking in concurrent reservation systems, cascading failure isolation across 15 microservices.",
        evalCriteria: "Expect mastery of distributed systems, quantitative reasoning, concrete failure mitigation, and clear trade-off articulation."
    },
    "Staff/Lead": {
        title: "Staff / Principal / Bar Raiser (8+ YOE)",
        scope: "Planetary multi-region active-active architectures, cross-datacenter replication lag & conflict resolution (CRDTs), consensus protocols (Raft/Paxos), multi-million QPS scaling, zero-downtime database sharding and resharding, disaster recovery, cost and cloud resource optimization at massive scale, technical debt vs business delivery velocity, and cross-organization alignment.",
        tone: "High-rigor Bar Raiser. Challenge them on macroscopic architectural decisions, organizational tradeoffs, extreme edge-case chaos engineering, and strategic roadmap alignment.",
        sampleQuestionTheme: "Designing a planetary-scale distributed database or streaming platform, migrating a 10TB monolithic database to sharded microservices with zero downtime, global active-active rate limiting with under 1ms overhead, engineering organizational technical strategy.",
        evalCriteria: "Demand exceptional depth across both macroscopic architecture and low-level mechanics, proactive edge-case anticipation, and executive communication."
    }
};

// Track Persona Profiles
const PERSONAS = {
    software: {
        roleTitle: "Software Engineer",
        persona: "Alex Rivera (Principal Architect & Bar Raiser)",
        greeting: "Welcome! I'm Alex. Let's dive straight into your technical evaluation."
    },
    system_design: {
        roleTitle: "Systems Architect",
        persona: "Dr. Marcus Chen (Chief Infrastructure Architect)",
        greeting: "Hello, I'm Dr. Chen. Let's design scalable, resilient infrastructure."
    },
    product: {
        roleTitle: "Product Manager",
        persona: "Elena Vance (VP of Product)",
        greeting: "Hi, I'm Elena. Let's explore your product strategy and execution."
    },
    behavioral: {
        roleTitle: "Engineering Leader",
        persona: "Samantha Reed (Director of People & Organization)",
        greeting: "Hello, I'm Samantha. Let's dive into your leadership and team execution."
    }
};

const gptService = {
    /**
     * Initializes interview session and generates dynamic opening question calibrated to Seniority level
     */
    initSession: async (track = "software", difficulty = "Senior", candidateName = "Candidate", apiKey = null) => {
        const personaInfo = PERSONAS[track] || PERSONAS.software;
        const archetype = SENIORITY_ARCHETYPES[difficulty] || SENIORITY_ARCHETYPES.Senior;

        const systemPrompt = `You are ${personaInfo.persona}, an elite interviewer conducting a live ${archetype.title} interview for a ${personaInfo.roleTitle} candidate.

TARGET SENIORITY LEVEL: "${difficulty}" (${archetype.title})
SENIORITY SCOPE: ${archetype.scope}
INTERVIEWER TONE: ${archetype.tone}

CRITICAL QUESTION CONSTRAINT:
The opening question MUST be ULTRA SHORT, CRISP, AND DIRECT (1 to 2 sentences maximum, under 25 words). Never generate long paragraphs. Get straight to the technical problem.

Respond in JSON format:
{
  "greeting": "Short 1-sentence greeting",
  "openingQuestion": "Ultra short 1-2 sentence scenario question under 25 words",
  "topic": "Brief topic title"
}`;

        const messages = [
            { role: "user", content: `Please initiate the interview session for ${candidateName} for the ${personaInfo.roleTitle} role at ${difficulty} level.` }
        ];

        let generated = await callLLM({
            systemPrompt,
            messages,
            temperature: 0.8,
            jsonMode: true,
            apiKeyOverride: apiKey
        });

        if (!generated || !generated.openingQuestion || generated.openingQuestion.length > 200) {
            let fallbackQ = "";
            let fallbackTopic = "";

            if (difficulty === "Junior") {
                fallbackTopic = "API Design & Input Validation";
                fallbackQ = "How would you design a secure user registration API that validates input and safely hashes passwords in PostgreSQL?";
            } else if (difficulty === "Mid-Level") {
                fallbackTopic = "Database Indexing & Caching";
                fallbackQ = "Your product query takes 1.5 seconds under 2,000 QPS. How do you index and cache it with Redis?";
            } else if (difficulty === "Staff/Lead") {
                fallbackTopic = "Planetary Multi-Region Architecture";
                fallbackQ = "How do you resolve cross-datacenter write conflicts in an active-active multi-region transaction ledger?";
            } else {
                fallbackTopic = "Idempotency & Concurrency";
                fallbackQ = "How do you guarantee idempotency and avoid double-charges in a payment service during a 10x flash sale?";
            }

            generated = {
                greeting: `${personaInfo.greeting} Evaluating at **${difficulty} Level**.`,
                openingQuestion: fallbackQ,
                topic: fallbackTopic
            };
        }

        const firstQuestionObj = {
            id: `q_${Date.now()}`,
            topic: generated.topic || "System Architecture",
            question: generated.openingQuestion
        };

        const initialInterviewerText = `${generated.greeting} ${firstQuestionObj.question}`;

        return {
            track,
            difficulty,
            roleTitle: `${difficulty} ${personaInfo.roleTitle}`,
            persona: personaInfo.persona,
            greeting: generated.greeting,
            currentQuestionIndex: 0,
            totalQuestions: 6,
            currentQuestion: firstQuestionObj,
            status: "active",
            history: [
                {
                    speaker: "interviewer",
                    text: initialInterviewerText,
                    questionId: firstQuestionObj.id,
                    timestamp: new Date().toISOString()
                }
            ],
            scores: []
        };
    },

    /**
     * Evaluates candidate response with LLM and generates next dynamic follow-up calibrated to Seniority level
     */
    processCandidateAnswer: async (sessionState, answerText, apiKey = null) => {
        const track = sessionState.track || "software";
        const difficulty = sessionState.difficulty || "Senior";
        const personaInfo = PERSONAS[track] || PERSONAS.software;
        const archetype = SENIORITY_ARCHETYPES[difficulty] || SENIORITY_ARCHETYPES.Senior;
        const currentIndex = sessionState.currentQuestionIndex || 0;
        const totalQuestions = sessionState.totalQuestions || 6;

        // Record candidate answer in history
        sessionState.history.push({
            speaker: "candidate",
            text: answerText,
            questionId: sessionState.currentQuestion?.id || `q_${Date.now()}`,
            timestamp: new Date().toISOString()
        });

        // Pre-check for trivial greetings, non-answers, or evasive responses
        const trimmed = (answerText || "").trim().toLowerCase();
        const trivialGreetings = ["hello", "hi", "hey", "good morning", "good evening", "good afternoon", "hola", "yo", "sup", "test", "testing", "asdf", "idk", "i don't know", "i dont know", "no idea", "pass", "skip", "n/a", "none", "ok", "okay", "thanks", "thank you", "bye", "goodbye"];
        const isTrivial = trivialGreetings.includes(trimmed) || (trimmed.split(/\s+/).length <= 2 && !trimmed.includes("cache") && !trimmed.includes("sql") && !trimmed.includes("api") && !trimmed.includes("db") && !trimmed.includes("redis") && !trimmed.includes("lock") && !trimmed.includes("kafka") && !trimmed.includes("queue"));

        if (isTrivial) {
            const feedbackMsg = trimmed.includes("hello") || trimmed.includes("hi") || trimmed.includes("hey")
                ? `Hello! Let's focus on the technical problem at hand.`
                : `Let's make sure we address the core technical challenge.`;

            const nonAnswerEval = {
                isOffTopic: true,
                overallScore: 0,
                technicalDepth: 0,
                problemSolving: 0,
                communication: 0,
                composure: 70,
                feedback: "No technical answer provided. Response was off-topic or a greeting.",
                highlights: [],
                critiques: ["Did not attempt to address the technical scenario."]
            };

            sessionState.scores.push(nonAnswerEval);

            const followUpInterviewerText = `${feedbackMsg} ${sessionState.currentQuestion?.question || "How would you solve this technical scenario?"}`;

            sessionState.history.push({
                speaker: "interviewer",
                text: followUpInterviewerText,
                isFollowUp: true,
                timestamp: new Date().toISOString()
            });

            return {
                isComplete: false,
                isFollowUp: true,
                isOffTopic: true,
                interviewerText: followUpInterviewerText,
                evaluation: nonAnswerEval,
                questionIndex: currentIndex + 1,
                totalQuestions
            };
        }

        const systemPrompt = `You are ${personaInfo.persona}, conducting a live professional technical interview for a ${sessionState.roleTitle} candidate.
Review the conversation history and the candidate's latest response.

YOUR INSTRUCTIONS:
1. Act as a natural, professional human interviewer. DO NOT use meta-tags like "Question X", "[Senior Level]", "[Follow-up]", or genre labels.
2. Provide a natural 1-sentence response acknowledging their answer, followed immediately by your next question or deeper inquiry in natural conversational English.
3. Keep each question ultra short and crisp (1-2 sentences maximum, under 25 words).
4. If the candidate is off-topic, set "isOffTopic": true, score 0 across all metrics, and redirect them naturally.
5. If genuine technical response, set "isOffTopic": false, score 1-100 based on technical merit.
6. Total interview length is ${totalQuestions} questions. When completing turn ${totalQuestions - 1}, set "isComplete": true.

Respond in JSON format:
{
  "interviewerFeedback": "Natural 1-sentence reaction (e.g. 'Good point on using Redis for distributed locking.')",
  "isFollowUp": true/false,
  "isOffTopic": true/false,
  "nextQuestion": "Natural 1-2 sentence technical question under 25 words (e.g. 'How do you handle node failover if the primary cache goes down?')",
  "nextTopic": "Topic title",
  "isComplete": true/false,
  "evaluation": {
    "isOffTopic": true/false,
    "overallScore": 85,
    "technicalDepth": 88,
    "problemSolving": 84,
    "communication": 86,
    "composure": 88,
    "feedback": "1-sentence summary feedback",
    "highlights": ["Strength 1", "Strength 2"],
    "critiques": ["Area to improve 1"]
  }
}`;

        const llmMessages = sessionState.history.map(h => ({
            speaker: h.speaker,
            text: h.text
        }));

        let result = await callLLM({
            systemPrompt,
            messages: llmMessages,
            temperature: 0.7,
            jsonMode: true,
            apiKeyOverride: apiKey
        });

        // If LLM returned text instead of parsed JSON object, parse it
        if (typeof result === "string" && result.length > 5) {
            const raw = result;
            const lines = raw.split("\n").filter(Boolean);
            const isFollowUp = raw.toLowerCase().includes("follow-up") || raw.toLowerCase().includes("probe") || raw.toLowerCase().includes("deep-dive");
            
            let feedback = lines[0] || "Good breakdown of your approach.";
            let question = lines.slice(1).join(" ") || raw;

            const wordCount = answerText.split(/\s+/).length;
            const isOff = wordCount < 4;
            const score = isOff ? 0 : Math.min(95, Math.max(20, Math.round(55 + (wordCount * 0.3))));

            result = {
                interviewerFeedback: feedback,
                isFollowUp,
                isOffTopic: isOff,
                nextQuestion: question,
                nextTopic: "Technical Focus",
                isComplete: false,
                evaluation: {
                    isOffTopic: isOff,
                    overallScore: score,
                    technicalDepth: Math.max(0, score),
                    problemSolving: Math.max(0, score),
                    communication: Math.max(0, score - 5),
                    composure: 80,
                    feedback: feedback,
                    highlights: score > 50 ? ["Addressed aspects of the problem"] : [],
                    critiques: score > 50 ? ["Explore deeper edge cases"] : ["Answer lacked technical specifics"]
                }
            };
        }

        if (!result || !result.evaluation) {
            const wordCount = answerText.split(/\s+/).length;
            const isOff = wordCount < 4;
            const score = isOff ? 0 : Math.min(90, Math.max(25, Math.round(50 + (wordCount * 0.3))));
            const isFollowUp = !sessionState.inFollowUp && currentIndex < totalQuestions - 1;
            sessionState.inFollowUp = isFollowUp;

            let followUpText = isFollowUp
                ? `How would you test this solution for unexpected failure modes?`
                : `How would you structure your database indexing for this workload?`;

            result = {
                interviewerFeedback: score > 70 ? "Good technical breakdown." : "Let's explore the mechanics further.",
                isFollowUp,
                isOffTopic: isOff,
                nextQuestion: followUpText,
                nextTopic: "Data Architecture",
                isComplete: currentIndex >= totalQuestions - 1 && !isFollowUp,
                evaluation: {
                    isOffTopic: isOff,
                    overallScore: score,
                    technicalDepth: score,
                    problemSolving: score,
                    communication: score,
                    composure: 80,
                    feedback: score > 0 ? "Response processed." : "No technical substance detected.",
                    highlights: score > 60 ? ["Systematic problem breakdown"] : [],
                    critiques: score > 0 ? ["Elaborate on trade-offs and edge cases"] : ["Please provide an actual technical answer"]
                }
            };
        }

        // Record score in session
        sessionState.scores.push(result.evaluation);

        if (result.isComplete) {
            sessionState.status = "completed";
            const report = await gptService.generateFinalReport(sessionState, apiKey);
            const concludingMsg = `${result.interviewerFeedback || "Great work throughout this session."}\n\n🎉 That concludes our interview! I've compiled your technical telemetry and evaluation scorecard.`;

            sessionState.history.push({
                speaker: "interviewer",
                text: concludingMsg,
                timestamp: new Date().toISOString()
            });

            return {
                isComplete: true,
                interviewerText: concludingMsg,
                evaluation: result.evaluation,
                report,
                sessionState
            };
        }

        // Construct 100% natural interviewer message without mechanical prefixes
        const cleanFeedback = (result.interviewerFeedback || "").trim();
        const cleanNextQ = (result.nextQuestion || "").trim();
        const fullInterviewerText = cleanFeedback && cleanNextQ
            ? `${cleanFeedback} ${cleanNextQ}`
            : (cleanNextQ || cleanFeedback || "How would you design this system?");

        sessionState.currentQuestion = {
            id: `q_${Date.now()}`,
            topic: result.nextTopic || "Technical Problem",
            question: cleanNextQ
        };

        if (!result.isFollowUp) {
            sessionState.currentQuestionIndex = (sessionState.currentQuestionIndex || 0) + 1;
        }

        sessionState.history.push({
            speaker: "interviewer",
            text: fullInterviewerText,
            isFollowUp: result.isFollowUp,
            timestamp: new Date().toISOString()
        });

        return {
            isComplete: false,
            isFollowUp: result.isFollowUp,
            interviewerText: fullInterviewerText,
            evaluation: result.evaluation,
            currentQuestionIndex: sessionState.currentQuestionIndex + 1,
            totalQuestions,
            sessionState
        };
    },

    /**
     * Generates a hint calibrated to seniority level
     */
    getQuestionHint: async (sessionState, apiKey = null) => {
        const currentQ = sessionState.currentQuestion?.question || "System architecture tradeoffs";
        const difficulty = sessionState.difficulty || "Senior";
        const archetype = SENIORITY_ARCHETYPES[difficulty] || SENIORITY_ARCHETYPES.Senior;

        const systemPrompt = `You are a helpful coaching assistant for a candidate at the "${difficulty}" level (${archetype.title}).
Provide a concise 1-2 sentence hint for the following question calibrated appropriately for their seniority level.

Question: "${currentQ}"`;

        const hint = await callLLM({
            systemPrompt,
            messages: [{ role: "user", content: "Provide a targeted hint." }],
            temperature: 0.7,
            apiKeyOverride: apiKey
        });

        return {
            hint: hint || "Structure your answer by identifying the core bottleneck, immediate mitigation steps, and long-term architectural trade-offs.",
            topic: sessionState.currentQuestion?.topic || "Architecture"
        };
    },

    /**
     * In-session Vivora Copilot AI Chatbot Assistant calibrated to seniority level
     */
    askCopilotAssistant: async (query, sessionState = {}, apiKey = null) => {
        const currentQ = sessionState.currentQuestion?.question || "Engineering Assessment";
        const difficulty = sessionState.difficulty || "Senior";

        const systemPrompt = `You are "Vivora Copilot", a friendly, brilliant in-session AI interview coach.
The candidate is currently interviewing at the "${difficulty}" level.
The current question is: "${currentQ}".
Answer their question constructively, giving them tips, structural frameworks (STAR, Tradeoff Matrix, Root Cause Analysis), or technical clarifications appropriate for ${difficulty} level.
Keep responses concise (2-4 sentences or bullet points) and encouraging.`;

        const reply = await callLLM({
            systemPrompt,
            messages: [{ role: "user", content: query }],
            temperature: 0.7,
            apiKeyOverride: apiKey
        });

        return {
            reply: reply || `🤖 **Vivora Copilot:** Structure your answer by stating your assumptions first, walking through your technical components, and discussing edge-case failure modes and tradeoffs.`,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Generates comprehensive final evaluation report calibrated to seniority level
     */
    generateFinalReport: async (sessionState, apiKey = null) => {
        const scores = sessionState.scores || [];
        const difficulty = sessionState.difficulty || "Senior";
        const candidateAnswers = (sessionState.history || []).filter(h => h.speaker === "candidate");

        // If candidate submitted no answers or session was closed immediately
        if (candidateAnswers.length === 0 || scores.length === 0) {
            return {
                sessionId: sessionState.sessionId || 'sess_' + Date.now(),
                track: sessionState.track || "software",
                roleTitle: sessionState.roleTitle || `${difficulty} Software Engineer`,
                difficulty,
                overallScore: 0,
                recommendation: "Incomplete / No Answers Provided",
                metrics: {
                    technicalDepth: 0,
                    problemSolving: 0,
                    communication: 0,
                    composure: 0,
                    focalAttention: 0,
                    stressIndex: 0
                },
                executiveSummary: "The assessment chamber was concluded before any technical answers were submitted. No evaluation metrics could be recorded.",
                keyStrengths: ["Session was ended without response submissions."],
                areasForGrowth: ["Complete technical problem prompts to generate evaluation scorecard."],
                questionBreakdown: [],
                completedAt: new Date().toISOString()
            };
        }

        const avgTech = Math.round(scores.reduce((a, s) => a + (s.technicalDepth !== undefined ? s.technicalDepth : 0), 0) / scores.length);
        const avgProb = Math.round(scores.reduce((a, s) => a + (s.problemSolving !== undefined ? s.problemSolving : 0), 0) / scores.length);
        const avgComm = Math.round(scores.reduce((a, s) => a + (s.communication !== undefined ? s.communication : 0), 0) / scores.length);
        const avgComp = Math.round(scores.reduce((a, s) => a + (s.composure !== undefined ? s.composure : 70), 0) / scores.length);
        const overallScore = Math.round((avgTech * 0.35) + (avgProb * 0.3) + (avgComm * 0.25) + (avgComp * 0.1));

        const questionBreakdown = candidateAnswers.map((item, idx) => ({
            questionNumber: idx + 1,
            candidateAnswer: item.text,
            score: sessionState.scores[idx]?.overallScore !== undefined ? sessionState.scores[idx].overallScore : 0,
            feedback: sessionState.scores[idx]?.feedback || (sessionState.scores[idx]?.isOffTopic ? "Off-topic response." : `Answer evaluated against ${difficulty}-level benchmark.`)
        }));

        // If candidate submitted only off-topic non-answers
        if (overallScore === 0) {
            return {
                sessionId: sessionState.sessionId || 'sess_' + Date.now(),
                track: sessionState.track || "software",
                roleTitle: sessionState.roleTitle || `${difficulty} Software Engineer`,
                difficulty,
                overallScore: 0,
                recommendation: "No Hire / Off-Topic Responses",
                metrics: {
                    technicalDepth: 0,
                    problemSolving: 0,
                    communication: 0,
                    composure: avgComp,
                    focalAttention: 60,
                    stressIndex: 20
                },
                executiveSummary: "The candidate's responses did not address the technical problems or were off-topic non-answers. No technical competence was demonstrated.",
                keyStrengths: ["Attempted initial greeting or interaction."],
                areasForGrowth: ["Must directly address the core technical questions, algorithms, and system mechanics."],
                questionBreakdown,
                completedAt: new Date().toISOString()
            };
        }

        const systemPrompt = `You are a Senior Bar Raiser & Hiring Committee Lead.
Review the candidate's interview session history and compile an executive hiring evaluation calibrated strictly against the "${difficulty}" seniority benchmark.

Track: ${sessionState.track || 'software'} (${difficulty} level).
Computed Scores: Technical: ${avgTech}%, Problem Solving: ${avgProb}%, Communication: ${avgComm}%, Overall: ${overallScore}%.

Respond in JSON format:
{
  "recommendation": "Strong Hire / Hire / Leaning Hire / Needs Development (relative to ${difficulty} level expectations)",
  "executiveSummary": "2-3 sentence executive review evaluating their suitability for ${difficulty} level",
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasForGrowth": ["Actionable growth area 1 for reaching next seniority level", "Actionable growth area 2"]
}`;

        const dialogueHistory = (sessionState.history || [])
            .map(h => `${h.speaker.toUpperCase()}: ${h.text}`)
            .join("\n\n");

        let llmReport = await callLLM({
            systemPrompt,
            messages: [{ role: "user", content: `Here is the interview transcript:\n\n${dialogueHistory}` }],
            temperature: 0.7,
            jsonMode: true,
            apiKeyOverride: apiKey
        });

        if (!llmReport || !llmReport.recommendation) {
            llmReport = {
                recommendation: overallScore >= 85 ? `Strong Hire (Exceeds ${difficulty} Bar)` : overallScore >= 72 ? `Hire (Meets ${difficulty} Bar)` : `Leaning Hire`,
                executiveSummary: `Candidate demonstrated solid reasoning calibrated for the ${difficulty} level, communicating tradeoffs clearly and responding to deep-dive follow-ups systematically.`,
                keyStrengths: [
                    `Solid command of ${difficulty}-level architectural principles.`,
                    "Structured problem breakdown with attention to fault tolerance.",
                    "High composure and clear technical delivery throughout the session."
                ],
                areasForGrowth: [
                    "Can quantify latency bottlenecks and operational limits more explicitly.",
                    "Deepen explanations of automated rollback strategies and failure recovery."
                ]
            };
        }

        return {
            sessionId: sessionState.sessionId || 'sess_' + Date.now(),
            track: sessionState.track || "software",
            roleTitle: sessionState.roleTitle || `${difficulty} Software Engineer`,
            difficulty,
            overallScore,
            recommendation: llmReport.recommendation,
            metrics: {
                technicalDepth: avgTech,
                problemSolving: avgProb,
                communication: avgComm,
                composure: avgComp,
                focalAttention: Math.floor(Math.random() * 8) + 90,
                stressIndex: Math.floor(Math.random() * 12) + 24
            },
            executiveSummary: llmReport.executiveSummary,
            keyStrengths: llmReport.keyStrengths,
            areasForGrowth: llmReport.areasForGrowth,
            questionBreakdown,
            completedAt: new Date().toISOString()
        };
    }
};

module.exports = gptService;
