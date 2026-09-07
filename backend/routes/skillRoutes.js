const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
    getSkillPassport,
    getSkillGap,
    getSkillTaxonomy,
    updateSkillPassport
} = require("../controllers/skillController");

router.get("/passport", verifyToken, getSkillPassport);
router.put("/passport", verifyToken, updateSkillPassport);
router.get("/gap", verifyToken, getSkillGap);
router.get("/taxonomy", verifyToken, getSkillTaxonomy);

module.exports = router;
