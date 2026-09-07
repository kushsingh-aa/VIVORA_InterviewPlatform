require('dotenv').config();
const jwt = require('jsonwebtoken');

async function run() {
    const JWT_SECRET = process.env.JWT_SECRET || 'vivora_jwt_super_secret_key_sih_2026_production_grade';
    const testToken = jwt.sign(
        { id: '60d0fe4f5311236168a109ca', email: 'telemetry_tester@vivora.ai', role: 'candidate' },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    console.log('1. Starting Interview Session...');
    const startRes = await fetch('http://localhost:5000/interview/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testToken}`
        },
        body: JSON.stringify({ track: 'software', difficulty: 'Senior', role: 'Full Stack Engineer' })
    });
    const sessionData = await startRes.json();
    console.log('Session initialized:', sessionData.sessionId);
    const sessionId = sessionData.sessionId;

    console.log('2. Streaming Precision Telemetry Frames...');
    // Stream 2 direct frames (focused)
    for (let i = 0; i < 2; i++) {
        await fetch('http://localhost:5000/interview/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${testToken}` },
            body: JSON.stringify({
                sessionId,
                telemetryData: {
                    faceDetected: true,
                    faceCount: 1,
                    isEyeContact: true,
                    gazeDirection: 'Direct Eye Contact',
                    gazeVector: { x: 0.05, y: -0.02 },
                    gazeFocus: 96,
                    headPose: { yaw: 2, pitch: 0, roll: 0 },
                    movementRate: 10,
                    composureScore: 95,
                    postureStatus: 'Upright & Composed'
                }
            })
        });
    }

    // Stream 6 looking-away frames (candidate seeing here and there)
    for (let i = 0; i < 6; i++) {
        await fetch('http://localhost:5000/interview/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${testToken}` },
            body: JSON.stringify({
                sessionId,
                telemetryData: {
                    faceDetected: true,
                    faceCount: 1,
                    isEyeContact: false,
                    gazeDirection: 'Looking Right',
                    gazeVector: { x: 0.65, y: 0.1 },
                    gazeFocus: 15,
                    headPose: { yaw: 26, pitch: 5, roll: 0 },
                    movementRate: 14,
                    composureScore: 50,
                    postureStatus: 'Looking Away'
                }
            })
        });
    }

    // Stream 2 frames where an unauthorized person enters the camera feed (faceCount: 2)
    for (let i = 0; i < 2; i++) {
        await fetch('http://localhost:5000/interview/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${testToken}` },
            body: JSON.stringify({
                sessionId,
                telemetryData: {
                    faceDetected: true,
                    faceCount: 2,
                    isEyeContact: false,
                    gazeDirection: 'Looking Left',
                    gazeVector: { x: -0.5, y: 0 },
                    gazeFocus: 10,
                    headPose: { yaw: -20, pitch: 0, roll: 0 },
                    movementRate: 22,
                    composureScore: 30,
                    postureStatus: 'Unauthorized Person Present'
                }
            })
        });
    }

    console.log('3. Completing Interview & Generating Scorecard...');
    const completeRes = await fetch('http://localhost:5000/interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${testToken}` },
        body: JSON.stringify({ sessionId })
    });
    const completeData = await completeRes.json();
    const report = completeData.report;

    console.log('\n================ SCORECARD AUDIT ================');
    console.log('Eye Contact Percentage:', report.visionBiometrics.eyeContactPercentage, '%');
    console.log('Average Composure Score:', report.visionBiometrics.averageComposureScore, '/100');
    console.log('Fidget Index:', report.visionBiometrics.fidgetIndex);
    console.log('Gaze Quality:', report.visionBiometrics.gazeQuality);
    console.log('Observations:', report.visionBiometrics.observations);
    console.log('Behavior Integrity Score:', report.behaviorIntegrity.integrityScore, '/100');
    console.log('Face Count Violations:', report.behaviorIntegrity.faceCountViolations);
    console.log('Total Integrity Flags:', report.behaviorIntegrity.totalFlags);
    console.log('Integrity Recommendation:', report.behaviorIntegrity.recommendation);
    console.log('=================================================\n');

    // Strict verifications:
    // Out of 10 frames: 2 direct, 8 looking away = exactly 20% eye contact!
    if (report.visionBiometrics.eyeContactPercentage !== 20) {
        throw new Error(`FAIL: Expected exactly 20% eye contact, got ${report.visionBiometrics.eyeContactPercentage}%!`);
    }
    // Face violations must equal 2
    if (report.behaviorIntegrity.faceCountViolations !== 2) {
        throw new Error(`FAIL: Expected 2 face violations, got ${report.behaviorIntegrity.faceCountViolations}!`);
    }
    // Integrity score must be penalized below 70
    if (report.behaviorIntegrity.integrityScore > 70) {
        throw new Error(`FAIL: Integrity score not penalized properly! Score: ${report.behaviorIntegrity.integrityScore}`);
    }

    console.log('\n4. Testing Empty / Zero-Telemetry Session...');
    const emptyStartRes = await fetch('http://localhost:5000/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${testToken}` },
        body: JSON.stringify({ track: 'system_design', difficulty: 'Senior', role: 'System Architect' })
    });
    const emptyStartData = await emptyStartRes.json();
    const emptySessionId = emptyStartData.sessionId;

    // Conclude immediately with NO telemetry
    const emptyCompleteRes = await fetch('http://localhost:5000/interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${testToken}` },
        body: JSON.stringify({ sessionId: emptySessionId })
    });
    const emptyCompleteData = await emptyCompleteRes.json();
    const emptyReport = emptyCompleteData.report;

    console.log('Empty Session Eye Contact:', emptyReport.visionBiometrics.eyeContactPercentage, '% (Expected: 0)');
    console.log('Empty Session Composure:', emptyReport.visionBiometrics.averageComposureScore, '/100 (Expected: 0)');
    if (emptyReport.visionBiometrics.eyeContactPercentage !== 0 || emptyReport.visionBiometrics.averageComposureScore !== 0) {
        throw new Error(`FAIL: Expected 0% eye contact and 0 composure, got ${emptyReport.visionBiometrics.eyeContactPercentage}% and ${emptyReport.visionBiometrics.averageComposureScore}!`);
    }

    console.log('\nALL TELEMETRY PRECISION & PROCTORING VERIFICATIONS PASSED 100%! 🎯');
}

run().catch(err => {
    console.error('Error running E2E test:', err);
    process.exit(1);
});
