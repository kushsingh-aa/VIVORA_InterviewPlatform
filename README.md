# VIVORA — SIH26044 Employability Intelligence Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen)](https://mongodb.com)
[![SIH](https://img.shields.io/badge/Smart_India_Hackathon-SIH26044-orange)](https://sih.gov.in)

> AI-powered interview assessment, skill intelligence, and opportunity matching platform built for SIH 2026 Problem Statement **SIH26044**.

---

## 🎯 What is Vivora?

Vivora bridges the gap between academia and industry by providing:

| Module | Description |
|--------|-------------|
| 🤖 **AI Interview Engine** | Multi-turn, LLM-powered interviews (Software, System Design, Product, Behavioral) |
| 📜 **Skill Passport** | AI-verified competency profile auto-populated from interview performance |
| 🎯 **Skill Gap Engine** | Role-to-candidate gap analysis across 7 industry-standard roles |
| 💼 **Opportunity Marketplace** | Internship/job listings with skill-matched scores per candidate |
| 🏢 **Recruiter Dashboard** | Post listings, view applicants, shortlist by match score |
| 🎓 **Academia Analytics** | Cohort skill heatmap, critical gaps, industry demand alignment |
| 👁️ **MediaPipe Telemetry** | Real-time gaze tracking, posture detection, behavior integrity scoring |

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite 6** — SPA with code splitting
- **Tailwind CSS v3** — utility-first styling with dark mode
- **Custom CSS Design System** — glassmorphism, gradient text, premium animations
- **MediaPipe FaceMesh** — real camera-based eye/posture tracking (CDN)
- **Lucide React** — icon set

### Backend
- **Node.js 18+** + **Express 5** — REST API
- **MongoDB** + **Mongoose 8** — primary datastore
- **JWT + bcrypt** — authentication with role-based access control
- **In-memory fallback** — runs without MongoDB (sessions only)

### AI / LLM
- **OpenRouter** (primary, supports 200+ models)
- **Google Gemini** (fallback)
- **OpenAI** (fallback)

---

## 📦 Project Structure

```
VIVORA/
├── backend/
│   ├── config/db.js              # MongoDB + in-memory fallback
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile (role-aware)
│   │   ├── interviewController.js # Interview lifecycle, auto skill extraction
│   │   ├── skillController.js    # Skill passport, gap analysis
│   │   ├── opportunityController.js # Marketplace, match scoring
│   │   └── analyticsController.js # Cohort analytics
│   ├── data/
│   │   └── skillTaxonomy.js      # ~75 curated canonical skills
│   ├── middleware/
│   │   └── authMiddleware.js     # verifyToken + requireRole()
│   ├── models/
│   │   ├── User.js               # candidate | recruiter | faculty | admin
│   │   ├── Interview.js          # Session history + report
│   │   ├── Skill.js              # Canonical skill taxonomy
│   │   ├── SkillProfile.js       # Per-candidate skill passport
│   │   ├── Opportunity.js        # Job/internship listings
│   │   └── Application.js        # Applications with match score
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── skillRoutes.js
│   │   ├── opportunityRoutes.js
│   │   └── analyticsRoutes.js
│   ├── scripts/
│   │   └── seed.js               # Seeds taxonomy + 15 demo opportunities
│   ├── services/
│   │   ├── gptService.js         # LLM gateway (OpenRouter/Gemini/OpenAI)
│   │   ├── visionService.js      # MediaPipe backend analysis
│   │   └── behaviorService.js    # Behavior integrity scoring
│   └── server.js
│
└── frontend/src/
    ├── context/
    │   ├── AuthContext.jsx        # JWT auth + register/login/role
    │   ├── InterviewContext.jsx   # Interview state, speech, telemetry
    │   ├── SkillContext.jsx       # Skill passport, gap, marketplace state
    │   └── ThemeContext.jsx
    ├── views/
    │   ├── LoginView.jsx          # Split-panel auth with role selector
    │   ├── DashboardView.jsx      # Track + seniority selection
    │   ├── InterviewView.jsx      # Live AI interview
    │   ├── ScorecardView.jsx      # Animated score ring + behavior report
    │   ├── HistoryView.jsx        # Session archive with mini rings
    │   ├── SkillPassportView.jsx  # Verified skill profile with category filter
    │   ├── SkillGapView.jsx       # SVG radar chart + skill gap table
    │   ├── MarketplaceView.jsx    # Opportunity cards with match scores
    │   ├── RecruiterView.jsx      # Recruiter-only: post + shortlist
    │   ├── AcademiaView.jsx       # Faculty-only: cohort analytics
    │   ├── SettingsView.jsx
    │   └── AboutView.jsx
    └── hooks/
        └── useTelemetry.js       # MediaPipe FaceMesh real implementation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI (or local MongoDB)
- At least one LLM API key (OpenRouter recommended)

### 1. Clone & Install

```bash
# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vivora

# Auth (required — use a long random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# LLM (at least one required)
OPENROUTER_API_KEY=sk-or-...
GEMINI_API_KEY=AI...
OPENAI_API_KEY=sk-...

# Server
PORT=5000
```

### 3. Seed Database

```bash
node backend/scripts/seed.js
```

This populates:
- ~75 canonical skills (skill taxonomy)
- 15 realistic Indian startup internship/job listings (Zepto, Razorpay, Google, Microsoft, etc.)

### 4. Run Development

```bash
# Terminal 1 — Backend
cd backend
node server.js

# Terminal 2 — Frontend
cd frontend
npx vite
```

Visit `http://localhost:5173`

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| **candidate** (default) | Interviews, Skill Passport, Gap Analysis, Marketplace |
| **recruiter** | All candidate views + Recruiter Dashboard (post listings, view applicants) |
| **faculty** | All candidate views + Academia Analytics (cohort heatmap) |
| **admin** | All views (MongoDB-only, promote via direct DB update) |

Register with role selector on the signup screen.

---

## 🌐 API Reference

| Route | Auth | Description |
|-------|------|-------------|
| `POST /auth/register` | None | Register with role (candidate/recruiter/faculty) |
| `POST /auth/login` | None | Login, returns JWT |
| `POST /interview/start` | JWT | Start new interview session |
| `POST /interview/message` | JWT | Submit candidate answer |
| `POST /interview/complete` | JWT | Generate final scorecard + auto-update skill passport |
| `GET /skill/passport` | JWT | Get candidate's verified skill profile |
| `PUT /skill/passport` | JWT | Manual self-assessment update |
| `GET /skill/gap?roleSlug=backend-developer` | JWT | Gap analysis for target role |
| `GET /skill/taxonomy` | JWT | Full skill list |
| `GET /opportunity` | JWT | Opportunity list with match scores |
| `POST /opportunity/:id/apply` | JWT | Apply to opportunity |
| `POST /opportunity` | recruiter/admin | Post new opportunity |
| `GET /opportunity/recruiter/listings` | recruiter | Recruiter's own listings + applicants |
| `GET /analytics/cohort` | faculty/admin | Cohort skill distribution |
| `GET /analytics/demand` | JWT | Industry skill demand from active listings |

---

## 🧠 AI Architecture

```
Frontend ──→ /interview/message ──→ gptService.js
                                       │
                                       ├── OpenRouter (primary)
                                       ├── Gemini (fallback)
                                       └── OpenAI (fallback)

interview/complete ──→ extractAndUpdateSkillsFromReport()
                            └── Auto-updates SkillProfile in MongoDB
```

The LLM performs:
- Multi-turn technical interviews with adaptive follow-ups
- Real-time hint generation
- Copilot assistant (side-by-side coaching)
- Final report generation with score rubrics

---

## 📄 License

Built for Smart India Hackathon 2026 · Problem SIH26044.
