const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { getMyProfile, updateMyProfile, getPublicProfile } = require("../controllers/profileController");

router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);
router.get("/:userId", verifyToken, getPublicProfile);

module.exports = router;
