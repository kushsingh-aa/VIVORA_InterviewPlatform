/**
 * Behavior Detection & Integrity Monitoring Service
 * Analyzes real-time telemetry for suspicious activity:
 * - Multiple faces in frame (proxy/helper detected)
 * - Excessive looking away from screen
 * - Head-down posture (phone usage indicator)
 * - Abnormal movement patterns
 * - Low engagement signals
 */

const behaviorService = {
    /**
     * Analyze a single telemetry frame for suspicious behavior signals
     */
    analyzeFrame: (telemetry = {}) => {
        const {
            faceCount = 1,
            gazeDirection = 'Direct Eye Contact',
            gazeVector = { x: 0, y: 0 },
            gazeFocus = 95,
            headPose = { yaw: 0, pitch: 0, roll: 0 },
            movementRate = 10,
            composureScore = 90,
            postureStatus = 'Upright & Composed'
        } = telemetry;

        const flags = [];

        // 0. No face in frame (candidate stepped away)
        if (faceCount === 0) {
            flags.push({
                type: 'NO_FACE',
                severity: 'medium',
                message: 'Candidate absent / no face detected in frame',
                timestamp: new Date().toISOString()
            });
        }

        // 1. Multiple faces detected - unauthorized person present / proxy
        if (faceCount > 1) {
            flags.push({
                type: 'MULTIPLE_FACES',
                severity: 'critical',
                message: `Unauthorized person detected! Multiple faces in camera feed (${faceCount} faces)`,
                timestamp: new Date().toISOString()
            });
        }

        // 2. Steep head-down posture - possible phone or notes in lap
        // Natural screen viewing has pitch up to ~30deg; only flag deep sustained downward tilt (>36deg)
        if (headPose.pitch > 36 && (gazeDirection.includes('Down') || (gazeVector && gazeVector.y > 0.5))) {
            flags.push({
                type: 'PHONE_USAGE_SUSPECTED',
                severity: 'high',
                message: 'Prolonged head-down posture into lap - possible phone/notes usage',
                timestamp: new Date().toISOString()
            });
        }

        // 3. Looking completely off-screen
        // Candidates naturally look around the screen and look up/sideways while thinking.
        // Only flag if gaze focus drops below 25% AND head is turned far away from screen.
        if (gazeFocus < 25 && (Math.abs(headPose.yaw) > 36 || headPose.pitch > 38 || headPose.pitch < -36)) {
            flags.push({
                type: 'LOOKING_AWAY',
                severity: 'low',
                message: `Off-screen gaze: ${gazeDirection} (focus: ${gazeFocus}%)`,
                timestamp: new Date().toISOString()
            });
        }

        // 4. Excessive movement / chaotic shaking
        // Normal talking & nodding gestures reach 40-90 mm/s. Only flag violent/rapid movement > 120 mm/s.
        if (movementRate > 120) {
            flags.push({
                type: 'EXCESSIVE_MOVEMENT',
                severity: 'low',
                message: `Elevated movement detected: ${movementRate} mm/s`,
                timestamp: new Date().toISOString()
            });
        }

        return {
            timestamp: new Date().toISOString(),
            faceCount,
            flags,
            hasCriticalFlags: flags.some(f => f.severity === 'critical'),
            hasHighFlags: flags.some(f => f.severity === 'high'),
            overallSuspicionScore: behaviorService.computeSuspicionScore(flags)
        };
    },

    /**
     * Compute a suspicion score from 0 (clean) to 100 (highly suspicious)
     */
    computeSuspicionScore: (flags = []) => {
        let score = 0;
        for (const flag of flags) {
            switch (flag.severity) {
                case 'critical': score += 35; break;
                case 'high': score += 15; break;
                case 'medium': score += 5; break;
                case 'low': score += 1; break;
            }
        }
        return Math.min(100, score);
    },

    /**
     * Generate a comprehensive session behavior report from all recorded telemetry
     */
    generateSessionReport: (telemetryLog = []) => {
        if (!telemetryLog || telemetryLog.length === 0) {
            return {
                integrityScore: 100,
                totalFlags: 0,
                criticalEvents: 0,
                highEvents: 0,
                mediumEvents: 0,
                lowEvents: 0,
                faceCountViolations: 0,
                phoneUsageEvents: 0,
                lookingAwayEvents: 0,
                excessiveMovementEvents: 0,
                flags: [],
                summary: 'No behavioral telemetry recorded during this session.',
                recommendation: 'Clean - No integrity concerns detected.'
            };
        }

        const allFlags = [];
        let faceCountViolations = 0;
        let phoneUsageEvents = 0;
        let lookingAwayEvents = 0;
        let excessiveMovementEvents = 0;
        let maxFacesSeen = 1;
        let totalSuspicion = 0;

        for (const record of telemetryLog) {
            if (record.flags) {
                for (const flag of record.flags) {
                    allFlags.push(flag);
                    switch (flag.type) {
                        case 'MULTIPLE_FACES': faceCountViolations++; break;
                        case 'PHONE_USAGE_SUSPECTED': phoneUsageEvents++; break;
                        case 'LOOKING_AWAY': lookingAwayEvents++; break;
                        case 'EXCESSIVE_MOVEMENT': excessiveMovementEvents++; break;
                    }
                }
            }
            if (typeof record.faceCount === 'number' && record.faceCount > maxFacesSeen) {
                maxFacesSeen = record.faceCount;
            }
            totalSuspicion += (record.overallSuspicionScore || 0);
        }

        const avgSuspicion = Math.round(totalSuspicion / telemetryLog.length);
        const criticalEvents = allFlags.filter(f => f.severity === 'critical').length;
        const highEvents = allFlags.filter(f => f.severity === 'high').length;
        const mediumEvents = allFlags.filter(f => f.severity === 'medium').length;
        const lowEvents = allFlags.filter(f => f.severity === 'low').length;

        // Fair and realistic violation penalties:
        // - Multiple faces (unauthorized helpers): major penalty
        // - Sustained phone in lap: moderate penalty
        // - Glancing around or natural head gestures: normal human behavior, minimal capped penalty
        const facePenalty = faceCountViolations * 25;
        const phonePenalty = Math.min(25, phoneUsageEvents * 5);
        const lookAwayPenalty = Math.min(8, Math.floor(lookingAwayEvents * 0.3));
        const movementPenalty = Math.min(4, Math.floor(excessiveMovementEvents * 0.2));

        const totalPenalty = facePenalty + phonePenalty + lookAwayPenalty + movementPenalty;
        const integrityScore = Math.max(0, Math.min(100, 100 - totalPenalty));

        // Generate summary
        const summaryParts = [];
        if (faceCountViolations > 0) {
            summaryParts.push(`${faceCountViolations} instance(s) of multiple people detected in frame`);
        }
        if (phoneUsageEvents > 0) {
            summaryParts.push(`${phoneUsageEvents} instance(s) of suspected phone/notes usage`);
        }
        if (lookingAwayEvents > 0) {
            summaryParts.push(`${lookingAwayEvents} instance(s) of off-screen gaze during formulation`);
        }
        if (excessiveMovementEvents > 0) {
            summaryParts.push(`${excessiveMovementEvents} instance(s) of high movement`);
        }
        if (summaryParts.length === 0) {
            summaryParts.push('Natural candidate engagement and composed posture throughout the session');
        }

        // Recommendation
        let recommendation;
        if (criticalEvents > 1 || faceCountViolations > 1) {
            recommendation = 'Integrity Concern - Multiple people detected in camera frame. Manual review recommended.';
        } else if (phoneUsageEvents > 5) {
            recommendation = 'Minor Concern - Sustained head-down posture flagged. Review recommended.';
        } else if (integrityScore < 70) {
            recommendation = 'Attention Needed - Irregular behavioral telemetry noted during interview.';
        } else {
            recommendation = 'Clean - Verified natural candidate engagement and composure.';
        }

        return {
            integrityScore,
            totalFlags: allFlags.length,
            criticalEvents,
            highEvents,
            mediumEvents,
            lowEvents,
            faceCountViolations,
            phoneUsageEvents,
            lookingAwayEvents,
            excessiveMovementEvents,
            maxFacesSeen,
            flags: allFlags.slice(0, 50), // Cap at 50 for storage
            summary: summaryParts.join('. ') + '.',
            recommendation
        };
    }
};

module.exports = behaviorService;
