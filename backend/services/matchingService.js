/**
 * Matching Service — Hybrid Scoring Algorithm
 * 
 * Final Match Score =
 *   40% → Required Technical Skills (weighted coverage)
 *   20% → Skill Proficiency (how far above/below requirement)
 *   15% → Problem Solving (from interview scores)
 *   10% → Communication (from interview scores)
 *   10% → Education/Eligibility fit
 *    5% → Projects/Experience factor
 * 
 * Returns a structured result with explanation — not just a number.
 */

/**
 * @param {Array} candidateSkills   - SkillProfile.skills[]
 * @param {Array} requiredSkills    - Opportunity.requiredSkills[]
 * @param {Array} preferredSkills   - Opportunity.preferredSkills[]
 * @param {Object} candidateProfile - User object
 * @param {Object} opportunity      - Opportunity object
 * @returns {Object} Full match result with breakdown and per-skill explanations
 */
function computeDetailedMatch(candidateSkills = [], requiredSkills = [], preferredSkills = [], candidateProfile = {}, opportunity = {}) {
    if (!requiredSkills || requiredSkills.length === 0) {
        return { score: 72, breakdown: {}, skillDetails: [], explanation: "No specific skill requirements listed." };
    }

    // ── COMPONENT 1: Technical skill coverage (40%) ──────────────────────
    const totalWeight = requiredSkills.reduce((a, r) => a + (r.weight || 1), 0);
    const achievedWeight = requiredSkills.reduce((acc, req) => {
        const cand = candidateSkills.find(s =>
            s.skillSlug === req.skillSlug ||
            normalizeSkillName(s.skillName) === normalizeSkillName(req.skillName)
        );
        const level = cand?.proficiency || 0;
        const ratio = Math.min(1, level / (req.minProficiency || 60));
        return acc + ratio * (req.weight || 1);
    }, 0);
    const technicalCoverage = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;

    // ── COMPONENT 2: Proficiency depth (20%) ─────────────────────────────
    let proficiencySum = 0, proficiencyCount = 0;
    const skillDetails = requiredSkills.map(req => {
        const cand = candidateSkills.find(s =>
            s.skillSlug === req.skillSlug ||
            normalizeSkillName(s.skillName) === normalizeSkillName(req.skillName)
        );
        const candidateLevel = cand?.proficiency || 0;
        const required = req.minProficiency || 60;
        const ratio = Math.min(1.2, candidateLevel / required); // Allow 20% bonus for exceeding

        proficiencySum += Math.min(100, ratio * 100);
        proficiencyCount++;

        let status, statusIcon;
        if (candidateLevel >= required * 1.1) { status = "exceeds"; statusIcon = "✓"; }
        else if (candidateLevel >= required) { status = "meets"; statusIcon = "✓"; }
        else if (candidateLevel >= required * 0.6) { status = "partial"; statusIcon = "⚠"; }
        else { status = "missing"; statusIcon = "✗"; }

        const estimatedMatchGain = status !== "meets" && status !== "exceeds"
            ? Math.round((required - candidateLevel) * 0.1)
            : 0;

        return {
            skillSlug: req.skillSlug,
            skillName: req.skillName || req.skillSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
            required,
            candidateLevel,
            status,
            statusIcon,
            estimatedMatchGain,
            weight: req.weight || 1
        };
    });

    const avgProficiency = proficiencyCount > 0 ? proficiencySum / proficiencyCount : 0;

    // ── COMPONENT 3: Problem Solving (15%) ────────────────────────────────
    const problemSolvingSkill = candidateSkills.find(s => s.skillSlug === "problem-solving");
    const problemSolvingScore = problemSolvingSkill?.proficiency || 50;

    // ── COMPONENT 4: Communication (10%) ─────────────────────────────────
    const commSkill = candidateSkills.find(s => s.skillSlug === "communication");
    const commScore = commSkill?.proficiency || 50;

    // ── COMPONENT 5: Education/Eligibility (10%) ──────────────────────────
    let eduScore = 70; // Default neutral score
    if (opportunity.degree && candidateProfile.degree) {
        eduScore = 85; // Degree matches
    }
    if (opportunity.eligibility && candidateProfile.graduationYear) {
        eduScore = 80;
    }

    // ── COMPONENT 6: Projects/Experience (5%) ─────────────────────────────
    const projectCount = candidateProfile.projects?.length || 0;
    const internshipCount = candidateProfile.internshipHistory?.length || 0;
    const expScore = Math.min(100, 40 + projectCount * 10 + internshipCount * 15);

    // ── WEIGHTED FINAL SCORE ──────────────────────────────────────────────
    const finalScore = Math.round(
        technicalCoverage * 0.40 +
        avgProficiency * 0.20 +
        problemSolvingScore * 0.15 +
        commScore * 0.10 +
        eduScore * 0.10 +
        expScore * 0.05
    );

    // Clamp to 10-99
    const score = Math.min(99, Math.max(10, finalScore));

    // ── IMPROVEMENT ESTIMATE ──────────────────────────────────────────────
    const missingSkills = skillDetails.filter(s => s.status === "missing" || s.status === "partial");
    const topMissing = missingSkills.sort((a, b) => b.weight - a.weight).slice(0, 2);
    const improvementPotential = topMissing.reduce((a, s) => a + s.estimatedMatchGain, 0);
    const estimatedImprovedScore = Math.min(99, score + improvementPotential);

    // ── EXPLANATION ───────────────────────────────────────────────────────
    const metSkills = skillDetails.filter(s => s.status === "meets" || s.status === "exceeds");
    const partialSkills = skillDetails.filter(s => s.status === "partial");
    const missingSkillsList = skillDetails.filter(s => s.status === "missing");

    return {
        score,
        breakdown: {
            technicalCoverage: Math.round(technicalCoverage),
            proficiencyDepth: Math.round(avgProficiency),
            problemSolving: Math.round(problemSolvingScore),
            communication: Math.round(commScore),
            education: Math.round(eduScore),
            experience: Math.round(expScore)
        },
        skillDetails,
        metSkills: metSkills.map(s => s.skillName),
        partialSkills: partialSkills.map(s => s.skillName),
        missingSkills: missingSkillsList.map(s => s.skillName),
        topImprovements: topMissing.map(s => s.skillName),
        estimatedImprovedScore: topMissing.length > 0 ? estimatedImprovedScore : null,
        explanation: generateExplanation(score, metSkills, missingSkillsList, topMissing)
    };
}

/**
 * Simple match score (backward-compatible, for listing pages)
 */
function computeMatchScore(candidateSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 75;
    if (!candidateSkills || candidateSkills.length === 0) return 20;

    const result = computeDetailedMatch(candidateSkills, requiredSkills);
    return result.score;
}

/**
 * Normalize skill names for fuzzy matching (react.js === react === reactjs)
 */
function normalizeSkillName(name = "") {
    return name.toLowerCase()
        .replace(/\.js$/, "")
        .replace(/\s+/g, "")
        .replace(/-/g, "")
        .replace(/[^a-z0-9]/g, "");
}

/**
 * Generate a human-readable match explanation
 */
function generateExplanation(score, metSkills, missingSkills, topImprovements) {
    if (score >= 85) {
        return `Excellent match! You meet all major requirements and ${metSkills.length > 0 ? "exceed expectations in " + metSkills.slice(0, 2).join(" and ") + "." : "have strong proficiency across the board."}`;
    }
    if (score >= 70) {
        const missing = missingSkills.length > 0 ? ` Key gap: ${missingSkills.slice(0, 2).join(", ")}.` : "";
        return `Good match.${missing} Improving ${topImprovements.slice(0, 2).join(" and ")} could significantly boost your score.`;
    }
    if (score >= 50) {
        return `Moderate match. You have a solid foundation but significant gaps in ${missingSkills.slice(0, 3).join(", ")}. Focus on upskilling these areas first.`;
    }
    return `This role requires skills you haven't yet demonstrated. Consider building proficiency in ${missingSkills.slice(0, 3).join(", ")} before applying.`;
}

module.exports = { computeDetailedMatch, computeMatchScore, normalizeSkillName };
