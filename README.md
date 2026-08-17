# VIVORA AI - Autonomous Conversational Assessment Platform 🤖

> Next-generation AI-powered technical and behavioral interview platform featuring dynamic LLM dialogue generation, real-time rubric evaluation, multi-seniority calibration, voice synthesis & speech recognition, in-session Copilot coaching, and biometric telemetry analytics.

---

## 🌟 Key Features

- **🧠 Live Generative AI Interviewer**: Conducts 100% dynamic, conversational interviews tailored to chosen seniority levels (Junior, Mid-Level, Senior, Staff/Principal). No rigid, hardcoded question scripts.
- **🔍 Context-Aware Deep-Dive Probes**: Actively analyzes candidate responses and probes deeper into architectural tradeoffs, concurrency mechanics, and failure modes.
- **🎙️ Web Speech API Multimodal Interaction**:
  - Voice Speech-to-Text with live audio waveform equalizers.
  - Neural Text-to-Speech voice playback for questions.
- **📊 4 Evaluation Tracks**:
  1. 💻 **Software Engineering Core** (Distributed Systems, Concurrency, Caching, Resilience)
  2. 🏗️ **System Design & Architecture** (Planetary Scale, Messaging, Global Rate Limiters)
  3. 📊 **Product Management Lead** (Retention RCA, RICE/Kano Prioritization, GTM)
  4. 🤝 **Behavioral & Leadership Excellence** (STAR Framework, Crisis Post-Mortems)
- **💡 In-Session Vivora Copilot**: Side-drawer AI coaching companion providing hints, frameworks, and technical advice.
- **📈 Biometric Telemetry & Evaluation Scorecard**: Real-time facial focus target, speech rate WPM counter, composure gauges, and comprehensive final performance scorecards with export capabilities.
- **🗄️ Historical Session Archive**: Persistent storage and audit reviews of all past candidate evaluations.

---

## 🛠️ Tech Stack

- **Frontend**: Modern Vanilla JS / HTML5, TailwindCSS, Web Speech API (STT & TTS), MediaStream Webcam HUD.
- **Backend**: Node.js, Express 5, Axios, JWT Authentication, bcrypt.
- **AI Engine**: OpenRouter (`openai/gpt-4o-mini`, `meta-llama/llama-3.3-70b-instruct`), OpenAI API, Google Gemini API, Groq.
- **Database**: PostgreSQL with automatic in-memory fallback.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd Vivora

# Install backend dependencies
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the `backend` folder:
```bash
cp .env.example .env
```
Add your API key (OpenRouter, OpenAI, or Gemini):
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### 3. Start the Platform
```bash
node server.js
```
Open **`http://localhost:5000`** in your browser!

---

## 🔒 Security
- All sensitive credentials (`.env`) are strictly ignored via `.gitignore`.
- Supports Bearer JWT authentication and safe local guest session handling.
