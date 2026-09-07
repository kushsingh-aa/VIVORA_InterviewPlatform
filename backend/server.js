require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const skillRoutes = require("./routes/skillRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const workshopRoutes = require("./routes/workshopRoutes");

const app = express();

// Initialize MongoDB connection
connectDB();

// Validate critical environment variables on startup
if (!process.env.JWT_SECRET) {
    console.warn("⚠️  WARNING: JWT_SECRET is not set in environment variables. Set it in .env before deploying to production.");
}

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "http://localhost:5000", "http://localhost:5173"];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in dev; restrict in production
        }
    },
    credentials: true
}));

// Body parser with size limit
app.use(express.json({ limit: "2mb" }));

// In-memory rate limiter with per-route isolated store
function rateLimit(maxRequests = 60, windowMs = 60000) {
    const store = new Map();
    return (req, res, next) => {
        const key = req.ip || req.connection?.remoteAddress || "127.0.0.1";
        const now = Date.now();
        const record = store.get(key) || { count: 0, resetAt: now + windowMs };

        if (now > record.resetAt) {
            record.count = 0;
            record.resetAt = now + windowMs;
        }

        record.count++;
        store.set(key, record);

        if (record.count > maxRequests) {
            return res.status(429).json({ message: "Too many requests. Please slow down." });
        }
        next();
    };
}

// Serve compiled React build (dist/)
const distPath = path.join(__dirname, "../frontend/dist");
const frontendPath = fs.existsSync(distPath) ? distPath : null;

if (frontendPath) {
    app.use(express.static(frontendPath, {
        index: "index.html",
        maxAge: "1d",
        setHeaders: (res, filePath) => {
            if (filePath.endsWith("index.html")) {
                res.setHeader("Cache-Control", "no-cache");
            }
        }
    }));
} else {
    console.warn("⚠️  frontend/dist not found. Build the frontend: cd frontend && npm run build");
}

// API health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "online",
        service: "Vivora SIH Platform",
        version: "4.0.0-SIH",
        timestamp: new Date().toISOString(),
        modules: ["auth", "interview", "skill", "opportunity", "analytics", "profile", "admin", "workshop", "notification"]
    });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/auth", rateLimit(60, 60000), authRoutes);
app.use("/interview", rateLimit(120, 60000), interviewRoutes);
app.use("/skill", rateLimit(60, 60000), skillRoutes);
app.use("/opportunity", rateLimit(60, 60000), opportunityRoutes);
app.use("/analytics", rateLimit(60, 60000), analyticsRoutes);
app.use("/profile", rateLimit(60, 60000), profileRoutes);
app.use("/admin", rateLimit(30, 60000), adminRoutes);
app.use("/community", rateLimit(60, 60000), workshopRoutes); // workshops + notifications

// SPA fallback — serve index.html for non-API routes
const API_PREFIXES = ["/auth", "/interview", "/skill", "/opportunity", "/analytics", "/profile", "/admin", "/community", "/api"];

if (frontendPath) {
    app.use((req, res, next) => {
        if (
            req.method === "GET" &&
            !API_PREFIXES.some(prefix => req.path.startsWith(prefix))
        ) {
            const indexPath = path.join(frontendPath, "index.html");
            if (fs.existsSync(indexPath)) {
                return res.sendFile(indexPath);
            }
        }
        next();
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Vivora SIH Platform running on http://localhost:${PORT}`);
    console.log(`📡 Routes: /auth  /interview  /skill  /opportunity  /analytics  /profile  /admin  /community`);
});