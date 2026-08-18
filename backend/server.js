require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Initialize MongoDB connection
connectDB();

// Determine static frontend path (prioritize compiled React build in dist/)
const distPath = path.join(__dirname, "../frontend/dist");
const fallbackPath = path.join(__dirname, "../frontend");
const frontendPath = fs.existsSync(distPath) ? distPath : fallbackPath;

app.use(express.static(frontendPath));

// API health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "online",
        service: "Vivora AI Assessment Backend",
        version: "2.0.0",
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/auth", authRoutes);
app.use("/interview", interviewRoutes);

// Fallback to index.html for direct SPA routing in Express 5
app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/auth") && !req.path.startsWith("/interview") && !req.path.startsWith("/api")) {
        const indexPath = path.join(frontendPath, "index.html");
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    }
    next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Vivora Server running on http://localhost:${PORT}`);
    console.log(`📡 Frontend (React App) served at http://localhost:${PORT}`);
});