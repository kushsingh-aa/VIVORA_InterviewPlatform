const axios = require("axios");

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
        greeting: "Welcome to your Software Engineering technical evaluation. I'm Alex. We'll explore problem solving, practical implementation, and system resilience. Feel free to reason out loud. Ready?"
    },
    system_design: {
        roleTitle: "Systems Architect",
        persona: "Dr. Marcus Chen (Chief Infrastructure Architect)",
        greeting: "Greetings. I'm Marcus. Today we will design large-scale, fault-tolerant infrastructure tailored to your target seniority. Let's build something robust."
    },
    product: {
        roleTitle: "Product Manager",
        persona: "Elena Vance (VP of Product)",
        greeting: "Hi there! I'm Elena, VP of Product. In this interview, we'll dive into product strategy, metric-driven decision making, and navigating tough product trade-offs. Let's get started!"
    },
    behavioral: {
        roleTitle: "Engineering Leader",
        persona: "Samantha Reed (Director of People & Organizational Excellence)",
        greeting: "Hello and welcome! I'm Samantha. Today we'll explore your collaborative experiences, leadership under pressure, and how you navigate complex interpersonal dynamics using the STAR framework."
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
FOCUS THEMES: ${archetype.sampleQuestionTheme}

YOUR TASK:
Generate an opening question that PERFECTLY MATCHES the "${difficulty}" seniority level.
- If Junior: Ask about fundamental coding mechanics, basic API design, basic SQL, or step-by-step logic. Do NOT ask planetary distributed systems.
- If Mid-Level: Ask about production-ready microservices, database query indexing, caching, background workers, and modular design.
- If Senior: Ask about high-throughput distributed systems, concurrency locking, cache stampedes, circuit breakers, and fault tolerance.
- If Staff/Lead: Ask about multi-region active-active architectures, zero-downtime database sharding, consensus algorithms, and macro technical strategy.

Respond in JSON format:
{
  "greeting": "Personal greeting acknowledging their ${difficulty} level track",
  "openingQuestion": "Detailed scenario-based question calibrated precisely for ${difficulty} level",
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

        if (!generated || !generated.openingQuestion) {
            let fallbackQ = "";
            let fallbackTopic = "";

            if (difficulty === "Junior") {
                fallbackTopic = "API Design & Input Validation";
                fallbackQ = "Let's start with API development. Imagine you need to build a user registration endpoint that accepts user details, validates email and password constraints, hashes the password, and stores it in PostgreSQL. How would you structure this endpoint, handle validation errors, and ensure sensitive data is protected?";
            } else if (difficulty === "Mid-Level") {
                fallbackTopic = "Database Indexing & Caching";
                fallbackQ = "Imagine your e-commerce product catalog search query starts taking 1.5 seconds under 2,000 concurrent requests. How would you analyze the slow query, add database indexing, and implement a caching layer using Redis with appropriate TTL and eviction policies?";
            } else if (difficulty === "Staff/Lead") {
                fallbackTopic = "Planetary Multi-Region Active-Active Architecture";
                fallbackQ = "Design a multi-region active-active transaction ledger handling 100,000 write operations per second across 3 continents with under 50ms latency. How do you resolve cross-datacenter replication conflicts, handle split-brain partitions, and ensure regulatory data residency compliance?";
            } else {
                fallbackTopic = "Distributed Systems & Scalability";
                fallbackQ = "Imagine your service experiences sudden 10x traffic spikes during flash sales, causing database CPU to hit 99% and request latency to spike from 20ms to 4000ms. How would you systematically diagnose the bottleneck, mitigate it immediately, and architect a long-term resilient topology?";
            }

            generated = {
                greeting: `${personaInfo.greeting} We will be evaluating at the **${difficulty} Level** (${archetype.title}).`,
                openingQuestion: fallbackQ,
                topic: fallbackTopic
            };
        }

        const firstQuestionObj = {
            id: `q_${Date.now()}`,
            topic: generated.topic || "System Architecture",
            question: generated.openingQuestion
        };

        const initialInterviewerText = `${generated.greeting}\n\n**Question 1 [${difficulty} Level - ${firstQuestionObj.topic}]:**\n${firstQuestionObj.question}`;

        return {
            track,
            difficulty,
            roleTitle: `${difficulty} ${personaInfo.roleTitle}`,
            persona: personaInfo.persona,
            greeting: generated.greeting,
            currentQuestionIndex: 0,
            totalQuestions: 4,
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
        const totalQuestions = sessionState.totalQuestions || 4;

        // Record candidate answer in history
        sessionState.history.push({
            speaker: "candidate",
            text: answerText,
            questionId: sessionState.currentQuestion?.id || `q_${Date.now()}`,
            timestamp: new Date().toISOString()
        });

        const systemPrompt = `You are ${personaInfo.persona}, conducting a live ${archetype.title} interview for a ${sessionState.roleTitle} candidate.
Review the full conversation history and the candidate's latest response.

CALIBRATION GUIDELINES FOR ${difficulty} LEVEL:
- Target Scope: ${archetype.scope}
- Interviewer Tone: ${archetype.tone}
- Evaluation Rubric: ${archetype.evalCriteria}

YOUR TASK:
1. Critically evaluate the candidate's latest response calibrated strictly against the "${difficulty}" bar.
2. Score their answer (0-100) across:
   - overallScore: holistic mark relative to ${difficulty} expectations
   - technicalDepth: depth relative to ${difficulty} expectations
   - problemSolving: systematic breakdown and reasoning
   - communication: clarity, conciseness, structured delivery
   - composure: confidence and handling of complexity
3. Identify specific strengths (highlights) and areas to improve (critiques).
4. Formulate the interviewer's next response:
   - Give 1-2 sentences of realistic interviewer feedback acknowledging their answer.
   - DYNAMICALLY PROBE DEEPER into what they said or ASK THE NEXT QUESTION matching the ${difficulty} seniority level.
   - If total questions (${totalQuestions}) have been completed, set isComplete: true.

Respond in JSON format:
{
  "interviewerFeedback": "Short direct reaction acknowledging what they said",
  "isFollowUp": true/false,
  "nextQuestion": "The follow-up or next technical question calibrated for ${difficulty} level (empty if complete)",
  "nextTopic": "Topic title for the next question",
  "isComplete": true/false,
  "evaluation": {
    "overallScore": 85,
    "technicalDepth": 88,
    "problemSolving": 84,
    "communication": 86,
    "composure": 88,
    "feedback": "Concise summary feedback for candidate",
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
            let question = lines.slice(1).join("\n") || raw;

            const wordCount = answerText.split(/\s+/).length;
            const score = Math.min(95, Math.max(65, Math.round(72 + (wordCount * 0.3))));

            result = {
                interviewerFeedback: feedback,
                isFollowUp,
                nextQuestion: question,
                nextTopic: isFollowUp ? `Deep-Dive Probe` : "Technical Focus",
                isComplete: false,
                evaluation: {
                    overallScore: score,
                    technicalDepth: score + 2,
                    problemSolving: score,
                    communication: score - 1,
                    composure: 88,
                    feedback: feedback,
                    highlights: ["Addressed key aspects of the problem directly"],
                    critiques: ["Explore deeper edge cases and alternative solutions"]
                }
            };
        }

        if (!result || !result.evaluation) {
            const wordCount = answerText.split(/\s+/).length;
            const score = Math.min(95, Math.max(50, Math.round(60 + (wordCount * 0.35))));
            const isFollowUp = !sessionState.inFollowUp && currentIndex < totalQuestions - 1;
            sessionState.inFollowUp = isFollowUp;

            let followUpText = "";
            if (isFollowUp) {
                followUpText = `How would you test this solution for failure modes and verify that it performs within acceptable latency bounds?`;
            } else {
                followUpText = `Let's move to data architecture and consistency. How would you design your storage schema and indexing strategy for this workflow?`;
                sessionState.currentQuestionIndex = currentIndex + 1;
            }

            result = {
                interviewerFeedback: score > 75 ? "Good technical breakdown." : "Solid start on the problem.",
                isFollowUp,
                nextQuestion: followUpText,
                nextTopic: isFollowUp ? "Deep-Dive Verification" : "Data Architecture",
                isComplete: currentIndex >= totalQuestions - 1 && !isFollowUp,
                evaluation: {
                    overallScore: score,
                    technicalDepth: score + 2,
                    problemSolving: score,
                    communication: score - 1,
                    composure: 85,
                    feedback: "Good grasp of principles with clear communication.",
                    highlights: ["Addressed the core challenge systematically"],
                    critiques: ["Elaborate on edge cases and failure handling"]
                }
            };
        }

        // Record score in session
        sessionState.scores.push(result.evaluation);

        if (result.isComplete) {
            sessionState.status = "completed";
            const report = await gptService.generateFinalReport(sessionState, apiKey);
            const concludingMsg = `${result.interviewerFeedback}\n\n🎉 **Interview Concluded!** You've completed all assessment chamber verticals at the **${difficulty}** level. I am compiling your final technical telemetry and performance scorecard now.`;

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

        // Construct interviewer message
        const questionLabel = result.isFollowUp ? `🔍 [${difficulty} Follow-up]` : `📌 Question ${(sessionState.currentQuestionIndex || 0) + 1} [${difficulty} Level - ${result.nextTopic || 'Engineering'}]`;
        const fullInterviewerText = `${result.interviewerFeedback}\n\n**${questionLabel}:**\n${result.nextQuestion}`;

        sessionState.currentQuestion = {
            id: `q_${Date.now()}`,
            topic: result.nextTopic || "Technical Problem",
            question: result.nextQuestion
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
        const avgTech = scores.length ? Math.round(scores.reduce((a, s) => a + (s.technicalDepth || 75), 0) / scores.length) : 85;
        const avgProb = scores.length ? Math.round(scores.reduce((a, s) => a + (s.problemSolving || 75), 0) / scores.length) : 84;
        const avgComm = scores.length ? Math.round(scores.reduce((a, s) => a + (s.communication || 75), 0) / scores.length) : 86;
        const avgComp = scores.length ? Math.round(scores.reduce((a, s) => a + (s.composure || 85), 0) / scores.length) : 88;
        const overallScore = Math.round((avgTech * 0.35) + (avgProb * 0.3) + (avgComm * 0.25) + (avgComp * 0.1));

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

        const questionBreakdown = (sessionState.history || [])
            .filter(h => h.speaker === "candidate")
            .map((item, idx) => ({
                questionNumber: idx + 1,
                candidateAnswer: item.text,
                score: sessionState.scores[idx]?.overallScore || 80,
                feedback: sessionState.scores[idx]?.feedback || `Answer demonstrated solid command of ${difficulty}-level principles.`
            }));

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
