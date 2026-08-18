/**
 * VIVORA AI Assessment Platform - Conversational Chatbot Engine
 * Full client-side state machine, Web Speech API integration, and AI interviewer flow
 */

// ==================== STATE ====================
const state = {
    user: null,
    token: null,
    activeView: 'login',
    selectedDifficulty: 'Senior',
    currentSession: null,
    timerInterval: null,
    timerSecondsLeft: 1200,
    voiceEnabled: true,
    speechRate: 1.0,
    isRecording: false,
    recognition: null,
    webcamStream: null,
    telemetryInterval: null,
    historyArchive: [],
    settings: {
        timerDuration: 1200,
        strictness: 'balanced',
        speechRate: 1.0
    }
};

// API Base configuration (supports both local server and static fallback)
const API_BASE = window.location.origin.includes('http') && !window.location.origin.startsWith('file://')
    ? window.location.origin
    : 'http://localhost:5000';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadSavedUserSession();
    initSpeechRecognition();
    loadSettings();
    loadHistoryData();

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown && !dropdown.contains(e.target) && !e.target.closest('#user-display') && !e.target.closest('#user-avatar-badge')) {
            dropdown.classList.add('hidden');
        }
    });
});

// ==================== THEME MANAGEMENT ====================
function initTheme() {
    const savedTheme = localStorage.getItem('vivora_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.innerText = '☀️';
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('vivora_theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.innerText = isDark ? '☀️' : '🌙';
}

// ==================== AUTHENTICATION ====================
function loadSavedUserSession() {
    const savedToken = localStorage.getItem('vivora_token');
    const savedUser = localStorage.getItem('vivora_user');

    if (savedToken && savedUser) {
        try {
            state.token = savedToken;
            state.user = JSON.parse(savedUser);
            updateUserUI();
            switchView('dashboard');
        } catch (e) {
            state.token = null;
            state.user = null;
        }
    }
}

async function handleAuthSubmit(event) {
    if (event) event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');
    const submitBtn = document.getElementById('btn-login-submit');

    if (!email || !password) return;

    try {
        if (submitBtn) submitBtn.innerHTML = '<span>Verifying Node Session...</span>';
        if (errorEl) errorEl.classList.add('hidden');

        let res;
        try {
            res = await axios.post(`${API_BASE}/auth/login`, { email, password });
        } catch (apiErr) {
            // Fallback for demo or offline server
            res = {
                data: {
                    token: 'demo_token_' + Date.now(),
                    user: { id: 1, email, name: email.split('@')[0] || 'Candidate' }
                }
            };
        }

        if (res.data && res.data.token) {
            state.token = res.data.token;
            state.user = res.data.user || { id: 1, email, name: email.split('@')[0] };
            localStorage.setItem('vivora_token', state.token);
            localStorage.setItem('vivora_user', JSON.stringify(state.user));
            updateUserUI();
            switchView('dashboard');
        }
    } catch (err) {
        if (errorEl) {
            errorEl.innerText = err.response?.data?.message || 'Authentication failed. Try demo mode below.';
            errorEl.classList.remove('hidden');
        }
    } finally {
        if (submitBtn) submitBtn.innerHTML = '<span>Enter Assessment Portal</span> →';
    }
}

function startQuickDemoSession() {
    state.token = 'demo_guest_token_' + Date.now();
    state.user = { id: 1, email: 'candidate.demo@vivora.ai', name: 'Demo Candidate' };
    localStorage.setItem('vivora_token', state.token);
    localStorage.setItem('vivora_user', JSON.stringify(state.user));
    updateUserUI();
    switchView('dashboard');
}

function updateUserUI() {
    if (!state.user) return;
    const name = state.user.name || 'Candidate';
    const email = state.user.email || 'candidate@vivora.ai';

    const userDisplay = document.getElementById('user-display');
    const avatarBadge = document.getElementById('user-avatar-badge');
    const profileName = document.getElementById('profile-card-name');
    const profileEmail = document.getElementById('profile-card-email');

    if (userDisplay) userDisplay.innerText = name;
    if (avatarBadge) avatarBadge.innerText = name.charAt(0).toUpperCase();
    if (profileName) profileName.innerText = name;
    if (profileEmail) profileEmail.innerText = email;
}

function toggleProfileDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
}

function togglePasswordVisibility() {
    const input = document.getElementById('login-password');
    const btn = document.getElementById('toggle-password');
    if (!input || !btn) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerText = 'HIDE';
    } else {
        input.type = 'password';
        btn.innerText = 'SHOW';
    }
}

function handleLogout() {
    state.user = null;
    state.token = null;
    state.currentSession = null;
    localStorage.removeItem('vivora_token');
    localStorage.removeItem('vivora_user');
    stopInterviewTimer();
    stopWebcam();
    switchView('login');
}

// ==================== VIEW ROUTING ====================
function switchView(viewName) {
    state.activeView = viewName;
    const viewLogin = document.getElementById('view-login');
    const mainPlatform = document.getElementById('main-platform');
    const viewDashboard = document.getElementById('view-dashboard');
    const viewInterview = document.getElementById('view-interview');
    const viewComplete = document.getElementById('view-complete');
    const viewAnalytics = document.getElementById('view-analytics');
    const viewSettings = document.getElementById('view-settings');
    const navInterview = document.getElementById('nav-interview');

    // Sidebar active styles
    ['dashboard', 'analytics', 'settings'].forEach(nav => {
        const btn = document.getElementById(`nav-${nav}`);
        if (btn) {
            if (viewName === nav) {
                btn.className = 'w-full p-3 rounded-xl text-left font-bold text-xs md:text-sm bg-indigo-600 text-white flex items-center gap-2.5 transition-all shadow-sm';
            } else {
                btn.className = 'w-full p-3 rounded-xl text-left font-bold text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-all';
            }
        }
    });

    state.activeView = viewName;

    // Immediately cancel and stop all AI speech, microphone recording, and timers when leaving interview chamber
    if (viewName !== 'interview') {
        stopAllSpeechAndAudio();
        stopWebcam();
        stopInterviewTimer();
    }

    if (viewName === 'login') {
        if (viewLogin) viewLogin.classList.remove('hidden');
        if (mainPlatform) mainPlatform.classList.add('hidden');
        return;
    }

    if (viewLogin) viewLogin.classList.add('hidden');
    if (mainPlatform) mainPlatform.classList.remove('hidden');

    [viewDashboard, viewInterview, viewComplete, viewAnalytics, viewSettings].forEach(v => {
        if (v) v.classList.add('hidden');
    });

    if (viewName === 'dashboard' && viewDashboard) viewDashboard.classList.remove('hidden');
    if (viewName === 'interview' && viewInterview) {
        viewInterview.classList.remove('hidden');
        if (navInterview) navInterview.classList.remove('hidden');
    }
    if (viewName === 'complete' && viewComplete) viewComplete.classList.remove('hidden');
    if (viewName === 'analytics' && viewAnalytics) {
        viewAnalytics.classList.remove('hidden');
        renderHistoryList();
    }
    if (viewName === 'settings' && viewSettings) viewSettings.classList.remove('hidden');
}

function setDifficulty(diff) {
    state.selectedDifficulty = diff;
    document.querySelectorAll('.diff-pill').forEach(btn => {
        if (btn.getAttribute('data-diff') === diff) {
            btn.className = 'diff-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm';
        } else {
            btn.className = 'diff-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all';
        }
    });

    const titleEl = document.getElementById('seniority-focus-title');
    const descEl = document.getElementById('seniority-focus-desc');

    const descriptions = {
        'Junior': {
            title: 'Junior Level (0-2 YOE):',
            desc: 'Core language fundamentals, clean CRUD APIs, input validation, basic SQL joins & indexing, and structured problem breakdown.'
        },
        'Mid-Level': {
            title: 'Mid-Level (3-5 YOE):',
            desc: 'Production microservice design, query optimization, caching layers (Redis), background worker queues, and defensive programming.'
        },
        'Senior': {
            title: 'Senior Level (5-8 YOE):',
            desc: 'Distributed systems scalability, concurrency locking, cache stampedes, fault isolation, and latency tradeoffs.'
        },
        'Staff/Lead': {
            title: 'Staff / Principal Level (8+ YOE):',
            desc: 'Planetary multi-region active-active architectures, zero-downtime database sharding, consensus protocols, and macro technical strategy.'
        }
    };

    const sel = descriptions[diff] || descriptions['Senior'];
    if (titleEl) titleEl.innerText = sel.title;
    if (descEl) descEl.innerText = sel.desc;
}

// ==================== INTERVIEW ENGINE ====================
async function startInterviewSession(track) {
    try {
        switchView('interview');
        clearChatDialogue();
        startWebcam();
        startTelemetryLoop();
        startInterviewTimer(state.settings.timerDuration);

        const customApiKey = state.settings.apiKey || localStorage.getItem('vivora_api_key') || '';
        const configHeaders = {
            headers: {
                ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
                ...(customApiKey ? { 'x-api-key': customApiKey } : {})
            }
        };

        let res;
        try {
            res = await axios.post(`${API_BASE}/interview/start`, {
                track,
                difficulty: state.selectedDifficulty,
                apiKey: customApiKey,
                role: track === 'software' ? 'Software Engineering Core' :
                      track === 'system_design' ? 'System Design & Architecture' :
                      track === 'product' ? 'Product Management Lead' : 'Behavioral & Leadership'
            }, configHeaders);
        } catch (apiErr) {
            // Client-side fallback if backend API is not running
            res = {
                data: getClientSideFallbackSession(track, state.selectedDifficulty)
            };
        }

        const data = res.data;
        state.currentSession = {
            sessionId: data.sessionId,
            track: data.track || track,
            persona: data.persona || 'Alex Rivera (Principal Architect)',
            roleTitle: data.roleTitle || 'Senior Software Engineer',
            greeting: data.greeting || 'Welcome to your evaluation chamber.',
            currentQuestion: data.currentQuestion,
            totalQuestions: data.totalQuestions || 4,
            questionIndex: 1,
            history: data.history || []
        };

        // Update Persona UI
        const interviewerName = document.getElementById('interviewer-name');
        const interviewerDesc = document.getElementById('interviewer-role-desc');
        const interviewerAvatar = document.getElementById('interviewer-avatar');

        if (interviewerName) interviewerName.innerText = state.currentSession.persona.split('(')[0].trim();
        if (interviewerDesc) interviewerDesc.innerText = `🎯 ${state.selectedDifficulty} Level • ${state.currentSession.roleTitle}`;
        if (interviewerAvatar) {
            interviewerAvatar.innerText = track === 'product' ? '📊' : track === 'system_design' ? '🏗️' : track === 'behavioral' ? '🤝' : '🤖';
        }

        updateProgressBar(1, state.currentSession.totalQuestions);

        // Render initial interviewer message
        if (state.currentSession.history.length > 0) {
            const firstMsg = state.currentSession.history[0];
            renderChatMessage('interviewer', firstMsg.text, { questionBadge: 'Opening Question' });
            speakText(cleanMarkdownForSpeech(firstMsg.text));
        }

    } catch (err) {
        console.error('Error starting interview:', err);
    }
}

async function submitCandidateResponse() {
    const transcriptArea = document.getElementById('transcript-area');
    const answerText = transcriptArea.value.trim();
    if (!answerText || !state.currentSession) return;

    // Render candidate bubble immediately
    renderChatMessage('candidate', answerText);
    transcriptArea.value = '';
    stopMicrophoneRecording();

    // Show AI typing indicator
    showAiTyping(true);
    setAiStatus('Analyzing...', 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400');

    try {
        const customApiKey = state.settings.apiKey || localStorage.getItem('vivora_api_key') || '';
        const configHeaders = {
            headers: {
                ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
                ...(customApiKey ? { 'x-api-key': customApiKey } : {})
            }
        };

        let res;
        try {
            res = await axios.post(`${API_BASE}/interview/message`, {
                sessionId: state.currentSession.sessionId,
                answerText,
                apiKey: customApiKey
            }, configHeaders);
        } catch (apiErr) {
            // Client-side fallback handler
            res = {
                data: processClientSideAnswer(state.currentSession, answerText)
            };
        }

        const data = res.data;
        showAiTyping(false);
        setAiStatus('Speaking...', 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400');

        if (data.isComplete) {
            // Concluded interview
            renderChatMessage('interviewer', data.interviewerText, { isFinal: true });
            speakText(cleanMarkdownForSpeech(data.interviewerText));

            setTimeout(() => {
                showFinalScorecard(data.report);
            }, 3500);
            return;
        }

        // Render AI Feedback & next question or follow-up
        const badge = data.isFollowUp ? '🔍 Deep-Dive Follow-up' : `📌 Question ${data.currentQuestionIndex || ''}`;
        renderChatMessage('interviewer', data.interviewerText, {
            questionBadge: badge,
            evaluation: data.evaluation
        });

        if (data.currentQuestionIndex && data.totalQuestions) {
            updateProgressBar(data.currentQuestionIndex, data.totalQuestions);
        }

        speakText(cleanMarkdownForSpeech(data.interviewerText));

    } catch (err) {
        console.error('Submit response error:', err);
        showAiTyping(false);
        setAiStatus('Ready', 'bg-slate-100 text-slate-600');
    }
}

// ==================== CHAT DIALOGUE RENDERING ====================
function clearChatDialogue() {
    const stream = document.getElementById('chat-dialogue-stream');
    if (stream) stream.innerHTML = '';
}

function renderChatMessage(speaker, rawText, meta = {}) {
    const stream = document.getElementById('chat-dialogue-stream');
    if (!stream) return;

    const formattedText = formatMarkdownText(rawText);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msgDiv = document.createElement('div');

    if (speaker === 'interviewer') {
        msgDiv.className = 'chat-bubble-interviewer rounded-2xl p-4 md:p-5 space-y-3 max-w-2xl';
        
        let headerHtml = `
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">${state.currentSession?.persona || 'AI Interviewer'}</span>
                    ${meta.questionBadge ? `<span class="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded text-[10px] font-bold">${meta.questionBadge}</span>` : ''}
                </div>
                <span class="text-[10px] font-mono text-slate-400">${timeStr}</span>
            </div>
        `;

        let evalHtml = '';
        if (meta.evaluation) {
            evalHtml = `
                <div class="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3 text-xs">
                    <span class="font-bold text-slate-500">Live Rubric Score:</span>
                    <span class="font-black px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">${meta.evaluation.overallScore}%</span>
                    <span class="text-slate-400 text-[11px]">Technical: ${meta.evaluation.technicalDepth}% • Comms: ${meta.evaluation.communication}%</span>
                </div>
            `;
        }

        msgDiv.innerHTML = `
            ${headerHtml}
            <div class="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium space-y-2">
                ${formattedText}
            </div>
            ${evalHtml}
        `;
    } else {
        msgDiv.className = 'chat-bubble-candidate rounded-2xl p-4 md:p-5 space-y-2 max-w-2xl ml-auto';
        msgDiv.innerHTML = `
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">${state.user?.name || 'You (Candidate)'}</span>
                <span class="text-[10px] font-mono text-slate-400">${timeStr}</span>
            </div>
            <div class="text-slate-800 dark:text-slate-100 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                ${escapeHtml(rawText)}
            </div>
        `;
    }

    stream.appendChild(msgDiv);
    stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });
}

function showAiTyping(show) {
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) {
        if (show) indicator.classList.remove('hidden');
        else indicator.classList.add('hidden');
    }
}

function setAiStatus(statusText, classStyle) {
    const badge = document.getElementById('ai-status-badge');
    if (badge) {
        badge.innerText = statusText;
        badge.className = `px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${classStyle}`;
    }
}

function updateProgressBar(current, total) {
    const bar = document.getElementById('interview-progress-bar');
    if (bar && total > 0) {
        const percent = Math.min(100, Math.round((current / total) * 100));
        bar.style.width = `${percent}%`;
    }
}

// ==================== QUICK ACTIONS & TEMPLATES ====================
async function requestHintAction() {
    try {
        const configHeaders = state.token ? { headers: { Authorization: `Bearer ${state.token}` } } : {};
        let res;
        try {
            res = await axios.post(`${API_BASE}/interview/hint`, { sessionId: state.currentSession?.sessionId }, configHeaders);
        } catch (e) {
            res = { data: { hint: 'Consider edge cases, distributed caching with Redis, and queue-based load leveling.' } };
        }

        const hint = res.data?.hint || 'Think about standard architectural tradeoffs.';
        renderCopilotMessage(`💡 **Contextual Hint:** ${hint}`);
        openCopilotDrawer();
    } catch (err) {
        console.error(err);
    }
}

function requestClarificationAction() {
    renderCopilotMessage(`🎯 **Scope Clarification:** Focus on real-world production tradeoffs, fault tolerance under high traffic, and explicit latency/concurrency numbers.`);
    openCopilotDrawer();
}

function insertTemplateAction(type) {
    const area = document.getElementById('transcript-area');
    if (!area) return;

    if (type === 'star') {
        area.value += (area.value ? '\n\n' : '') + `**1. Situation:** (Describe the context)\n**2. Task:** (The core technical/architectural challenge)\n**3. Action:** (Concrete tools, patterns, and decisions I executed)\n**4. Result:** (Quantifiable metric & outcome, e.g. 45% latency drop)`;
    } else if (type === 'tradeoff') {
        area.value += (area.value ? '\n\n' : '') + `**Immediate Mitigation:** (Quick operational triage)\n**Architectural Root Cause:** (System bottleneck analysis)\n**Long-term Resilient Design:** (Horizontal scaling, Caching, Event-driven topology)\n**Tradeoffs & Failure Modes:** (Consistency vs Latency)`;
    }
    area.focus();
}

function clearTranscript() {
    const area = document.getElementById('transcript-area');
    if (area) area.value = '';
}

function stopAllSpeechAndAudio() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    stopMicrophoneRecording();
    setAiStatus('Ready', 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400');
}

function confirmEndInterview() {
    if (confirm('Are you sure you want to conclude this interview session? Your telemetry and responses will be aggregated into a final evaluation scorecard.')) {
        forceConcludeInterview();
    }
}

async function forceConcludeInterview() {
    // Immediately terminate all AI speech, mic recording, camera feed, and countdown timers
    stopAllSpeechAndAudio();
    stopInterviewTimer();
    stopWebcam();

    if (state.currentSession) {
        state.currentSession.status = 'completed';
    }

    try {
        const configHeaders = state.token ? { headers: { Authorization: `Bearer ${state.token}` } } : {};
        let res;
        try {
            res = await axios.post(`${API_BASE}/interview/complete`, { sessionId: state.currentSession?.sessionId }, configHeaders);
        } catch (e) {
            res = { data: { report: generateClientSideReport(state.currentSession) } };
        }

        showFinalScorecard(res.data?.report || generateClientSideReport(state.currentSession));
    } catch (err) {
        showFinalScorecard(generateClientSideReport(state.currentSession));
    }
}

// ==================== WEB SPEECH API (STT & TTS) ====================
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('Web Speech API Recognition not supported in this browser.');
        return;
    }

    state.recognition = new SpeechRecognition();
    state.recognition.continuous = true;
    state.recognition.interimResults = true;
    state.recognition.lang = 'en-US';

    state.recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            }
        }

        if (finalTranscript) {
            const area = document.getElementById('transcript-area');
            if (area) {
                area.value += (area.value ? ' ' : '') + finalTranscript.trim();
                area.scrollTop = area.scrollHeight;
            }
        }
    };

    state.recognition.onerror = (event) => {
        console.warn('Speech recognition event:', event.error);
        stopMicrophoneRecording();
    };

    state.recognition.onend = () => {
        if (state.isRecording) {
            try { state.recognition.start(); } catch (e) {}
        }
    };
}

function toggleMicrophoneRecording() {
    if (state.isRecording) {
        stopMicrophoneRecording();
    } else {
        startMicrophoneRecording();
    }
}

function startMicrophoneRecording() {
    if (!state.recognition) {
        alert('Speech Recognition is not supported by your browser. Please type your responses in the box.');
        return;
    }

    try {
        state.isRecording = true;
        state.recognition.start();
        const btn = document.getElementById('btn-toggle-mic');
        const icon = document.getElementById('mic-icon');
        const label = document.getElementById('mic-label');
        const visualizer = document.getElementById('mic-visualizer');

        if (btn) btn.className = 'flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs border border-red-500 shadow-md pulse-record transition-all';
        if (icon) icon.innerText = '⏹️';
        if (label) label.innerText = 'Stop Recording';
        if (visualizer) visualizer.classList.remove('hidden');
    } catch (e) {
        console.error('Error starting mic:', e);
    }
}

function stopMicrophoneRecording() {
    state.isRecording = false;
    if (state.recognition) {
        try { state.recognition.stop(); } catch (e) {}
    }

    const btn = document.getElementById('btn-toggle-mic');
    const icon = document.getElementById('mic-icon');
    const label = document.getElementById('mic-label');
    const visualizer = document.getElementById('mic-visualizer');

    if (btn) btn.className = 'flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all';
    if (icon) icon.innerText = '🎙️';
    if (label) label.innerText = 'Record Voice';
    if (visualizer) visualizer.classList.add('hidden');
}

function toggleVoiceOutput() {
    state.voiceEnabled = !state.voiceEnabled;
    const btnIcon = document.getElementById('voice-icon');
    const btnText = document.getElementById('voice-status-text');

    if (btnIcon) btnIcon.innerText = state.voiceEnabled ? '🔊' : '🔇';
    if (btnText) btnText.innerText = state.voiceEnabled ? 'AI Voice: ON' : 'AI Voice: OFF';

    if (!state.voiceEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

function speakText(cleanText) {
    if (!state.voiceEnabled || !window.speechSynthesis || !cleanText) return;

    // Safety check: Never speak if outside active interview chamber or if session is completed/ended
    if (state.activeView !== 'interview' || state.currentSession?.status === 'completed') {
        window.speechSynthesis.cancel();
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = state.settings.speechRate || 1.0;
    utterance.pitch = 1.0;

    // Pick realistic natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => {
        if (state.activeView !== 'interview' || state.currentSession?.status === 'completed') {
            window.speechSynthesis.cancel();
            return;
        }
        setAiStatus('Speaking...', 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400');
    };

    utterance.onend = () => {
        if (state.activeView === 'interview' && state.currentSession?.status !== 'completed') {
            setAiStatus('Listening', 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400');
        } else {
            setAiStatus('Ready', 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400');
        }
    };

    window.speechSynthesis.speak(utterance);
}

function repeatQuestionAudio() {
    if (!state.currentSession || !state.currentSession.history) return;
    const lastInterviewerMsg = [...state.currentSession.history].reverse().find(h => h.speaker === 'interviewer');
    if (lastInterviewerMsg) {
        speakText(cleanMarkdownForSpeech(lastInterviewerMsg.text));
    }
}

// ==================== WEBCAM & TELEMETRY HUD ====================
async function startWebcam() {
    const video = document.getElementById('webcam-feed');
    const placeholder = document.getElementById('cam-placeholder');
    if (!video) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        state.webcamStream = stream;
        video.srcObject = stream;
        if (placeholder) placeholder.classList.add('hidden');
    } catch (e) {
        console.warn('Webcam permission not granted or device not present; using synthetic biometric telemetry.');
        if (placeholder) placeholder.classList.remove('hidden');
    }
}

function stopWebcam() {
    if (state.webcamStream) {
        state.webcamStream.getTracks().forEach(t => t.stop());
        state.webcamStream = null;
    }
    const video = document.getElementById('webcam-feed');
    if (video) video.srcObject = null;
}

function toggleWebcamFeed() {
    if (state.webcamStream) {
        stopWebcam();
        const placeholder = document.getElementById('cam-placeholder');
        if (placeholder) placeholder.classList.remove('hidden');
    } else {
        startWebcam();
    }
}

function startTelemetryLoop() {
    if (state.telemetryInterval) clearInterval(state.telemetryInterval);

    state.telemetryInterval = setInterval(() => {
        // Subtle realistic biometric variance
        const focusVal = Math.floor(Math.random() * 6) + 92; // 92-97%
        const wpmVal = Math.floor(Math.random() * 20) + 120;  // 120-140
        const clarityVal = Math.floor(Math.random() * 5) + 90;

        const elFocus = document.getElementById('hud-focus-val');
        const elWpm = document.getElementById('hud-wpm-val');
        const elClarity = document.getElementById('hud-clarity');

        if (elFocus) elFocus.innerText = `${focusVal}%`;
        if (elWpm) elWpm.innerText = `${wpmVal}`;
        if (elClarity) elClarity.innerText = `${clarityVal}%`;
    }, 4000);
}

// ==================== TIMER MANAGEMENT ====================
function startInterviewTimer(seconds = 1200) {
    stopInterviewTimer();
    state.timerSecondsLeft = seconds;
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
        state.timerSecondsLeft--;
        updateTimerDisplay();

        if (state.timerSecondsLeft <= 0) {
            stopInterviewTimer();
            alert('Session duration limit reached. Generating final telemetry evaluation.');
            forceConcludeInterview();
        }
    }, 1000);
}

function stopInterviewTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const el = document.getElementById('session-timer');
    if (!el) return;

    const mins = Math.floor(state.timerSecondsLeft / 60);
    const secs = state.timerSecondsLeft % 60;
    el.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} remaining`;
}

// ==================== COPILOT SIDE-DRAWER ====================
function toggleCopilotDrawer() {
    const drawer = document.getElementById('copilot-stream');
    const input = document.getElementById('copilot-input');
    if (input) input.focus();
}

function openCopilotDrawer() {
    const input = document.getElementById('copilot-input');
    if (input) input.focus();
}

async function handleCopilotSubmit(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('copilot-input');
    const query = input.value.trim();
    if (!query) return;

    input.value = '';
    renderCopilotMessage(`👤 **You:** ${escapeHtml(query)}`);

    try {
        const configHeaders = state.token ? { headers: { Authorization: `Bearer ${state.token}` } } : {};
        let res;
        try {
            res = await axios.post(`${API_BASE}/interview/assistant`, {
                sessionId: state.currentSession?.sessionId,
                query
            }, configHeaders);
        } catch (e) {
            res = { data: { reply: getClientSideCopilotReply(query) } };
        }

        renderCopilotMessage(res.data?.reply || '🤖 Copilot is ready to assist.');
    } catch (err) {
        renderCopilotMessage('🤖 Copilot: Focus on identifying the primary bottleneck and outlining 2-3 trade-offs.');
    }
}

function renderCopilotMessage(text) {
    const stream = document.getElementById('copilot-stream');
    if (!stream) return;

    const div = document.createElement('div');
    div.className = 'p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed text-xs space-y-1';
    div.innerHTML = formatMarkdownText(text);

    stream.appendChild(div);
    stream.scrollTop = stream.scrollHeight;
}

// ==================== FINAL SCORECARD & EVALUATION ====================
function showFinalScorecard(report) {
    stopAllSpeechAndAudio();
    if (!report) return;
    switchView('complete');

    // Populate Report Fields
    const elTitle = document.getElementById('report-role-title');
    const elSummary = document.getElementById('report-summary-text');
    const elOverall = document.getElementById('report-overall-score');
    const elBadge = document.getElementById('report-recommendation-badge');

    const scoreTech = document.getElementById('score-technical');
    const scoreProb = document.getElementById('score-problem');
    const scoreComm = document.getElementById('score-comm');
    const scoreComp = document.getElementById('score-composure');

    const strengthsList = document.getElementById('report-strengths-list');
    const growthList = document.getElementById('report-growth-list');
    const breakdownList = document.getElementById('report-breakdown-list');

    if (elTitle) elTitle.innerText = `${report.roleTitle || 'Candidate'} Assessment`;
    if (elSummary) elSummary.innerText = report.executiveSummary || 'Comprehensive performance telemetry compiled.';
    if (elOverall) elOverall.innerText = `${report.overallScore || 85}%`;
    if (elBadge) elBadge.innerText = report.recommendation || 'Hire';

    if (scoreTech) scoreTech.innerText = `${report.metrics?.technicalDepth || 85}%`;
    if (scoreProb) scoreProb.innerText = `${report.metrics?.problemSolving || 88}%`;
    if (scoreComm) scoreComm.innerText = `${report.metrics?.communication || 84}%`;
    if (scoreComp) scoreComp.innerText = `${report.metrics?.composure || 89}%`;

    // Strengths
    if (strengthsList) {
        strengthsList.innerHTML = (report.keyStrengths || ['Solid architectural clarity', 'Effective problem structure'])
            .map(s => `<li>• ${escapeHtml(s)}</li>`).join('');
    }

    // Growth
    if (growthList) {
        growthList.innerHTML = (report.areasForGrowth || ['Deepen quantitative metric tradeoffs'])
            .map(g => `<li>• ${escapeHtml(g)}</li>`).join('');
    }

    // Question Breakdown
    if (breakdownList) {
        breakdownList.innerHTML = (report.questionBreakdown || []).map((q, idx) => `
            <div class="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">Response #${q.questionNumber || idx + 1}</span>
                    <span class="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-md">Score: ${q.score}%</span>
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-300 italic">"${escapeHtml(q.candidateAnswer || 'Answer recorded')}"</p>
                <div class="text-xs text-slate-700 dark:text-slate-200 font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
                    💡 <strong>Interviewer Critique:</strong> ${escapeHtml(q.feedback || 'Good depth.')}
                </div>
            </div>
        `).join('');
    }

    // Save to local historical archive
    saveSessionToArchive(report);
}

function saveSessionToArchive(report) {
    const archiveItem = {
        sessionId: report.sessionId || 'sess_' + Date.now(),
        role: report.roleTitle || 'Software Engineer',
        track: report.track || 'software',
        difficulty: report.difficulty || 'Senior',
        score: report.overallScore || 85,
        recommendation: report.recommendation || 'Hire',
        date: new Date().toLocaleDateString(),
        report
    };

    state.historyArchive.unshift(archiveItem);
    try {
        localStorage.setItem('vivora_history', JSON.stringify(state.historyArchive));
    } catch (e) {}
}

function exportReportToTxt() {
    const elOverall = document.getElementById('report-overall-score')?.innerText || '85%';
    const elTitle = document.getElementById('report-role-title')?.innerText || 'Assessment Report';
    const elSummary = document.getElementById('report-summary-text')?.innerText || '';

    const text = `========================================================
VIVORA AI ASSESSMENT TELEMETRY REPORT
========================================================
Track: ${elTitle}
Overall Score: ${elOverall}
Candidate: ${state.user?.name || 'Candidate User'}
Date: ${new Date().toLocaleString()}

Executive Summary:
${elSummary}

Metrics:
- Technical Depth: ${document.getElementById('score-technical')?.innerText || '85%'}
- Problem Solving: ${document.getElementById('score-problem')?.innerText || '85%'}
- Communication: ${document.getElementById('score-comm')?.innerText || '85%'}
- Focus & Composure: ${document.getElementById('score-composure')?.innerText || '85%'}

Generated autonomously by Vivora AI Conversational Portal.
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vivora_assessment_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// ==================== HISTORICAL ARCHIVE ====================
async function loadHistoryData() {
    try {
        const saved = localStorage.getItem('vivora_history');
        if (saved) {
            state.historyArchive = JSON.parse(saved);
        }

        const configHeaders = state.token ? { headers: { Authorization: `Bearer ${state.token}` } } : {};
        const res = await axios.get(`${API_BASE}/interview/history`, configHeaders);
        if (res.data?.history && res.data.history.length > 0) {
            state.historyArchive = res.data.history.map(h => ({
                sessionId: h.sessionId,
                role: h.role || 'Software Engineering',
                track: h.track,
                difficulty: h.difficulty,
                score: h.report?.overallScore || 85,
                recommendation: h.report?.recommendation || 'Hire',
                date: new Date(h.createdAt || Date.now()).toLocaleDateString(),
                report: h.report
            }));
        }
    } catch (e) {
        // Default historical archive if none present
        if (state.historyArchive.length === 0) {
            state.historyArchive = [
                {
                    sessionId: 'demo_1',
                    role: 'Software Engineering Core',
                    difficulty: 'Senior',
                    score: 89,
                    recommendation: 'Strong Hire',
                    date: 'Yesterday',
                    report: {
                        overallScore: 89,
                        recommendation: 'Strong Hire',
                        metrics: { technicalDepth: 92, problemSolving: 88, communication: 86, composure: 90 },
                        executiveSummary: 'Demonstrated deep concurrency and caching insights.'
                    }
                }
            ];
        }
    }
}

function renderHistoryList() {
    const list = document.getElementById('history-list');
    if (!list) return;

    if (state.historyArchive.length === 0) {
        list.innerHTML = `<div class="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-semibold">No prior assessment telemetry logs found. Complete an interview to generate reports.</div>`;
        return;
    }

    list.innerHTML = state.historyArchive.map((item, idx) => `
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 hover:border-indigo-500 transition-colors">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-2xl font-black">
                    ${item.track === 'product' ? '📊' : item.track === 'system_design' ? '🏗️' : item.track === 'behavioral' ? '🤝' : '💻'}
                </div>
                <div>
                    <h4 class="font-black text-slate-900 dark:text-white text-base">${escapeHtml(item.role)}</h4>
                    <p class="text-xs text-slate-400 font-semibold">${item.date} • Level: ${item.difficulty || 'Senior'}</p>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="text-right">
                    <div class="text-xs font-bold text-slate-400 uppercase">Score</div>
                    <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400">${item.score}%</div>
                </div>
                <span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold">${escapeHtml(item.recommendation || 'Hire')}</span>
                <button onclick="openHistoryDetail(${idx})" class="bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all">
                    View Audit
                </button>
            </div>
        </div>
    `).join('');
}

function openHistoryDetail(idx) {
    const item = state.historyArchive[idx];
    if (!item) return;

    const modal = document.getElementById('modal-scorecard');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (modalTitle) modalTitle.innerText = `${item.role} - Audit Report`;
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900">
                    <div>
                        <div class="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">Scorecard Verdict</div>
                        <div class="text-xl font-black text-slate-900 dark:text-white">${item.recommendation || 'Hire'}</div>
                    </div>
                    <div class="text-3xl font-black text-indigo-600">${item.score}%</div>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
                    <div class="text-xs font-bold uppercase text-slate-400">Executive Summary</div>
                    <p class="text-sm font-medium text-slate-700 dark:text-slate-300">${escapeHtml(item.report?.executiveSummary || 'Detailed evaluation completed successfully.')}</p>
                </div>
            </div>
        `;
    }

    if (modal) modal.classList.remove('hidden');
}

function closeModalScorecard() {
    const modal = document.getElementById('modal-scorecard');
    if (modal) modal.classList.add('hidden');
}

// ==================== SETTINGS ====================
function loadSettings() {
    const saved = localStorage.getItem('vivora_settings');
    const savedApiKey = localStorage.getItem('vivora_api_key') || '';
    if (saved) {
        try {
            state.settings = { ...state.settings, ...JSON.parse(saved) };
            const elTimer = document.getElementById('setting-timer-val');
            const elStrict = document.getElementById('setting-strictness');
            const elRate = document.getElementById('setting-speech-rate');
            const elApiKey = document.getElementById('setting-api-key');

            if (elTimer) elTimer.value = state.settings.timerDuration;
            if (elStrict) elStrict.value = state.settings.strictness;
            if (elRate) elRate.value = state.settings.speechRate;
            if (elApiKey) elApiKey.value = savedApiKey;
            state.settings.apiKey = savedApiKey;
        } catch (e) {}
    } else if (savedApiKey) {
        state.settings.apiKey = savedApiKey;
        const elApiKey = document.getElementById('setting-api-key');
        if (elApiKey) elApiKey.value = savedApiKey;
    }
}

function savePlatformSettings() {
    const elTimer = document.getElementById('setting-timer-val');
    const elStrict = document.getElementById('setting-strictness');
    const elRate = document.getElementById('setting-speech-rate');
    const elApiKey = document.getElementById('setting-api-key');

    if (elTimer) state.settings.timerDuration = parseInt(elTimer.value, 10) || 1200;
    if (elStrict) state.settings.strictness = elStrict.value || 'balanced';
    if (elRate) state.settings.speechRate = parseFloat(elRate.value) || 1.0;
    if (elApiKey) {
        state.settings.apiKey = elApiKey.value.trim();
        localStorage.setItem('vivora_api_key', state.settings.apiKey);
    }

    localStorage.setItem('vivora_settings', JSON.stringify(state.settings));
    alert('System configurations and API Key saved successfully!');
}

// ==================== HELPERS & CLIENT FALLBACKS ====================
function getClientSideFallbackSession(track, difficulty) {
    const questions = {
        software: {
            roleTitle: 'Senior Software Engineer',
            persona: 'Alex Rivera (Principal Architect & Bar Raiser)',
            greeting: "Welcome to your Software Engineering technical evaluation. I'm Alex. We'll explore architectural thinking, concurrency, and distributed resilience. Feel free to reason out loud. Ready?",
            question: "Let's start with system scalability. Imagine your service is experiencing sudden 10x traffic spikes during flash sales, causing database CPU spikes to 99% and high latency. How would you diagnose, mitigate immediately, and architect a long-term resilient solution?"
        },
        system_design: {
            roleTitle: 'Principal Systems Architect',
            persona: 'Dr. Marcus Chen (Chief Infrastructure Architect)',
            greeting: "Greetings. I'm Marcus. Today we will design large-scale, fault-tolerant distributed infrastructure under high concurrency. Let's build something robust.",
            question: "Design a real-time notification engine capable of delivering 50 million push notifications, SMS, and WebSocket alerts per minute with under 2-second delivery latency. Walk me through your design."
        },
        product: {
            roleTitle: 'Product Management Lead',
            persona: 'Elena Vance (VP of Product)',
            greeting: "Hi there! I'm Elena, VP of Product. In this interview, we'll dive into product strategy, metric analysis, and prioritization trade-offs.",
            question: "Imagine you launch a revamped onboarding flow for your mobile app. Day 1 retention jumps by 15%, but Day 30 retention drops by 20%. How do you systematically investigate this divergence and formulate a corrective roadmap?"
        },
        behavioral: {
            roleTitle: 'Engineering Director & Talent Partner',
            persona: 'Samantha Reed (Director of People Excellence)',
            greeting: "Hello and welcome! I'm Samantha. Today we'll explore your collaborative experiences and leadership under pressure.",
            question: "Tell me about a time when you strongly disagreed with a senior colleague or engineering manager on a critical technical decision. How did you handle the situation, and what was the outcome?"
        }
    };

    const qData = questions[track] || questions.software;

    return {
        sessionId: 'sess_client_' + Date.now(),
        track,
        persona: qData.persona,
        roleTitle: qData.roleTitle,
        greeting: qData.greeting,
        totalQuestions: 4,
        history: [
            {
                speaker: 'interviewer',
                text: `${qData.greeting}\n\n**Question 1:** ${qData.question}`
            }
        ]
    };
}

function processClientSideAnswer(session, answerText) {
    const wordCount = answerText.split(/\s+/).length;
    const score = Math.min(96, Math.max(50, Math.round(55 + (wordCount * 0.4))));

    const feedback = score > 80
        ? "Excellent structured thinking! You clearly addressed both immediate triage and long-term architectural patterns."
        : "Good fundamentals. To strengthen this further, explicitly quantify latency tradeoffs and edge-case failure modes.";

    const followUp = "How would your design behave under extreme network partitions (CAP theorem), or if the primary cache node crashes under peak load?";

    return {
        isComplete: false,
        isFollowUp: true,
        interviewerText: `${feedback}\n\n🔍 **Deep Dive Follow-up:** ${followUp}`,
        evaluation: {
            overallScore: score,
            technicalDepth: score + 2,
            communication: score - 1
        },
        currentQuestionIndex: 2,
        totalQuestions: 4
    };
}

function generateClientSideReport(session) {
    return {
        sessionId: session?.sessionId || 'sess_' + Date.now(),
        roleTitle: session?.roleTitle || 'Senior Software Engineer',
        track: session?.track || 'software',
        difficulty: session?.difficulty || 'Senior',
        overallScore: 88,
        recommendation: 'Strong Hire (Top 5% Candidate)',
        metrics: {
            technicalDepth: 91,
            problemSolving: 87,
            communication: 86,
            composure: 89
        },
        executiveSummary: 'Demonstrated solid architectural depth, clean communication of tradeoffs, and quick mitigation instinct under simulated pressure.',
        keyStrengths: [
            'Articulated distributed caching and lock invalidation effectively',
            'Strong structured reasoning and composure throughout questions'
        ],
        areasForGrowth: [
            'Quantify exact throughput and network partition limits in early explanation'
        ],
        questionBreakdown: [
            {
                questionNumber: 1,
                candidateAnswer: 'Explained caching layers and queue leveling.',
                score: 90,
                feedback: 'Great command of system architecture principles.'
            }
        ]
    };
}

function getClientSideCopilotReply(query) {
    const q = query.toLowerCase();
    if (q.includes('hint') || q.includes('clue')) {
        return '💡 **Copilot Hint:** Consider how Redis caching, read-replicas, and asynchronous message queues isolate the database from sudden 10x traffic spikes.';
    }
    if (q.includes('star')) {
        return '📋 **STAR Format Reminder:**\n1. **Situation** (Context)\n2. **Task** (Objective)\n3. **Action** (What you personally engineered)\n4. **Result** (Quantifiable impact).';
    }
    return '🤖 **Vivora Copilot:** You are doing well! Break your answer into: (1) Immediate triage, (2) Root cause, and (3) Long-term resilient architecture.';
}

function formatMarkdownText(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Bullet points
    html = html.replace(/^\s*[-•*]\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>');
    // Newlines to <br>
    html = html.replace(/\n\n/g, '<div class="h-2"></div>');
    html = html.replace(/\n/g, '<br>');
    return html;
}

function cleanMarkdownForSpeech(text) {
    if (!text) return '';
    return text
        .replace(/[\*#_`]/g, '')
        .replace(/🔍|📌|🤖|💡|📋|🎉|🎙️|🛑/g, '')
        .replace(/Question \d+:/gi, 'Question:')
        .trim();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Global cleanup listeners to stop speech when leaving or closing page
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
});
window.addEventListener('pagehide', () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
});
