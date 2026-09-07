const visionService = require('../services/visionService');
const behaviorService = require('../services/behaviorService');

console.log('--- Testing Telemetry & Gaze Precision ---');

// Test 1: Empty Telemetry Log
const emptySummary = visionService.generateSessionSummary([]);
console.log('Test 1 - Empty Telemetry Eye Contact:', emptySummary.eyeContactPercentage, '% (Expected: 0)');
console.log('Test 1 - Empty Telemetry Composure:', emptySummary.averageComposureScore, '(Expected: 0)');
if (emptySummary.eyeContactPercentage !== 0 || emptySummary.averageComposureScore !== 0) {
    console.error('FAIL: Empty summary returned non-zero defaults!');
    process.exit(1);
}

// Test 2: Looking Away Frame (yaw = 25)
const lookingRightFrame = visionService.analyzeFrame({
    faceDetected: true,
    faceCount: 1,
    gazeVector: { x: 0.6, y: 0.1 },
    headPose: { yaw: 25, pitch: 0, roll: 0 },
    gazeDirection: 'Looking Right',
    gazeFocus: 20
});
console.log('Test 2 - Looking Away isEyeContact:', lookingRightFrame.isEyeContact, '(Expected: false)');
console.log('Test 2 - Looking Away Classification:', lookingRightFrame.gazeClassification, '(Expected: Looking Right)');
if (lookingRightFrame.isEyeContact !== false) {
    console.error('FAIL: Looking away frame was classified as eye contact!');
    process.exit(1);
}

// Test 3: Direct Eye Contact Frame
const directFrame = visionService.analyzeFrame({
    faceDetected: true,
    faceCount: 1,
    isEyeContact: true,
    gazeVector: { x: 0.05, y: -0.02 },
    headPose: { yaw: 2, pitch: 4, roll: 0 },
    gazeDirection: 'Direct Eye Contact',
    gazeFocus: 98
});
console.log('Test 3 - Direct Eye Contact isEyeContact:', directFrame.isEyeContact, '(Expected: true)');
console.log('Test 3 - Direct Focus Score:', directFrame.gazeFocusScore, '(Expected: >= 90)');
if (directFrame.isEyeContact !== true || directFrame.gazeFocusScore < 90) {
    console.error('FAIL: Direct eye contact was not recognized!');
    process.exit(1);
}

// Test 4: Weighted Gaze Accuracy (5 direct, 15 looking away = 25% eye contact)
const mockLog = [];
for (let i = 0; i < 5; i++) mockLog.push(directFrame);
for (let i = 0; i < 15; i++) mockLog.push(lookingRightFrame);
const weightedSummary = visionService.generateSessionSummary(mockLog);
console.log('Test 4 - Measured Eye Contact Percentage:', weightedSummary.eyeContactPercentage, '% (Expected: 25)');
if (weightedSummary.eyeContactPercentage !== 25) {
    console.error(`FAIL: Expected 25% eye contact, got ${weightedSummary.eyeContactPercentage}%!`);
    process.exit(1);
}

// Test 5: Multi-Face Detection Warning & Integrity Penalty
const multiFaceFrame = behaviorService.analyzeFrame({
    faceCount: 2,
    gazeDirection: 'Direct Eye Contact'
});
console.log('Test 5 - Multi-Face Flags:', multiFaceFrame.flags.map(f => f.type));
const hasMultiFaceFlag = multiFaceFrame.flags.some(f => f.type === 'MULTIPLE_FACES');
if (!hasMultiFaceFlag) {
    console.error('FAIL: Multiple faces were not flagged!');
    process.exit(1);
}

const multiFaceLog = [
    { faceCount: 2, flags: multiFaceFrame.flags, overallSuspicionScore: 40 },
    { faceCount: 1, flags: [], overallSuspicionScore: 0 }
];
const behaviorReport = behaviorService.generateSessionReport(multiFaceLog);
console.log('Test 5 - Integrity Score with Multi-Face Violation:', behaviorReport.integrityScore, '(Expected: <= 70)');
console.log('Test 5 - Face Count Violations:', behaviorReport.faceCountViolations, '(Expected: 1)');
if (behaviorReport.integrityScore > 70 || behaviorReport.faceCountViolations !== 1) {
    console.error('FAIL: Multi-face violation did not penalize integrity score properly!');
    process.exit(1);
}

console.log('ALL BACKEND TELEMETRY PRECISION TESTS PASSED SUCCESSFULLY! ✅');
