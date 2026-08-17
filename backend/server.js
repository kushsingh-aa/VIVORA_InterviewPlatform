require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files
const frontendPath = path.join(__dirname, "../frontend");
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
        return res.sendFile(path.join(frontendPath, "index.html"));
    }
    next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Vivora Server running on http://localhost:${PORT}`);
    console.log(`📡 Frontend served at http://localhost:${PORT}`);
});