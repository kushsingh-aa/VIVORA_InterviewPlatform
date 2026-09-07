const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { getDashboard, getAllUsers, getAllCompanies, verifyCompany, deleteUser } = require("../controllers/adminController");

const adminOnly = [verifyToken, requireRole("admin")];

router.get("/dashboard", adminOnly, getDashboard);
router.get("/users", adminOnly, getAllUsers);
router.get("/companies", adminOnly, getAllCompanies);
router.put("/company/:id/verify", adminOnly, verifyCompany);
router.delete("/user/:id", adminOnly, deleteUser);

module.exports = router;
