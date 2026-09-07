const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
    listWorkshops, createWorkshop, registerForWorkshop,
    getNotifications, markAllRead
} = require("../controllers/workshopController");

// Workshop routes
router.get("/workshops", verifyToken, listWorkshops);
router.post("/workshops", verifyToken, requireRole("faculty", "admin"), createWorkshop);
router.post("/workshops/:id/register", verifyToken, registerForWorkshop);

// Notification routes
router.get("/notifications", verifyToken, getNotifications);
router.put("/notifications/read-all", verifyToken, markAllRead);

module.exports = router;
