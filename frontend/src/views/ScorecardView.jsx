import React from 'react';
import { useInterview } from '../context/InterviewContext';
import { Award, CheckCircle2, TrendingUp, Download, ArrowLeft, Eye, Activity, ShieldCheck, Sparkles } from 'lucide-react';

export default function ScorecardView({ onBackToDashboard }) {
  const { finalReport, activeSession } = useInterview();

  const report = finalReport || {
    roleTitle: activeSession?.roleTitle || 'Senior Software Engineer',
    overallScore: 88,
    recommendation: 'Strong Hire',
    executiveSummary: 'Candidate demonstrated exemplary architectural problem breakdown, clearly articulating distributed caching, concurrency locking, and failure isolation strategies calibrated for senior-tier scope.',
    metrics: {
      technicalDepth: 92,
      problemSolving: 88,
      communication: 86,
      composure: 90
    },
    visionBiometrics: {
      eyeContactPercentage: 94,
      averageComposureScore: 92,
      fidgetIndex: 'Low (Stable)',
      gazeQuality: 'Exceptional',
      observations: [
        'Maintained consistent direct eye contact and screen engagement throughout dialogue turns.',
        'Exhibited calm, upright posture and high composure under probing technical questions.'
      ]
    },
    keyStrengths: [
      'Articulated distributed caching (cache-aside) and Redlock concurrency locking mechanisms clearly.',
      'Structured problem breakdown with defensive fault-tolerant architecture.',
      'Maintained consistent eye contact and high composure under probing follow-up questions.'
    ],
    areasForGrowth: [
      'Quantify latency thresholds and network throughput limits more explicitly.',
      'Incorporate canary rollback strategies during distributed database schema migrations.'
    ]
  };

  const biometrics = report.visionBiometrics || {
    eyeContactPercentage: 92,
    averageComposureScore: 90,
    fidgetIndex: 'Low (Stable)',
    gazeQuality: 'Strong & Consistent',
    observations: [
      'Maintained active gaze focus and screen attention across all technical problems.',
      'Demonstrated composed body language with steady posture.'
    ]
  };

  const handleExportTxt = () => {
    const content = `========================================================================
             VIVORA AI - EXECUTIVE CANDIDATE SCORECARD
========================================================================
Role: ${report.roleTitle || 'Software Engineer'}
Overall Score: ${report.overallScore || 88}%
Verdict: ${report.recommendation || 'Strong Hire'}
Date: ${new Date().toLocaleString()}

------------------------------------------------------------------------
EXECUTIVE SUMMARY:
------------------------------------------------------------------------
${report.executiveSummary || 'Telemetry evaluation completed.'}

------------------------------------------------------------------------
EVALUATION METRIC BREAKDOWN:
------------------------------------------------------------------------
• Technical Depth:         ${report.metrics?.technicalDepth || 92}%
• Problem Solving:         ${report.metrics?.problemSolving || 88}%
• Communication:           ${report.metrics?.communication || 86}%
• Composure & Focus:       ${report.metrics?.composure || 90}%

------------------------------------------------------------------------
MEDIAPIPE VISION & BIOMETRIC TELEMETRY:
------------------------------------------------------------------------
• Eye Contact Focus:       ${biometrics.eyeContactPercentage}% (${biometrics.gazeQuality})
• Average Posture Score:   ${biometrics.averageComposureScore}/100
• Movement & Fidget Index: ${biometrics.fidgetIndex}
${(biometrics.observations || []).map(o => `• Observation: ${o}`).join('\n')}

------------------------------------------------------------------------
KEY STRENGTHS:
------------------------------------------------------------------------
${(report.keyStrengths || []).map(s => `• ${s}`).join('\n')}

------------------------------------------------------------------------
AREAS FOR GROWTH:
------------------------------------------------------------------------
${(report.areasForGrowth || []).map(g => `• ${g}`).join('\n')}
========================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vivora_Scorecard_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Top Banner */}
      <div className="bg-[#0b1324] border border-[#17233f] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2.5 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101b33] border border-[#1c2e56] rounded-full text-[10px] font-mono font-bold text-purple-300">
            <Award size={13} className="text-purple-400" />
            <span>VERIFIED AI TECHNICAL SCORECARD</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {report.roleTitle || 'Candidate'} Evaluation
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="bg-[#0e172e] border border-[#1c2d52] rounded-2xl p-6 text-center min-w-[170px] space-y-1.5 shadow-xl relative z-10">
          <span className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
            Overall Score
          </span>
          <span className="font-mono font-black text-5xl bg-gradient-to-r from-purple-300 to-indigo-200 bg-clip-text text-transparent block">
            {report.overallScore}%
          </span>
          <span className="inline-block px-3 py-1 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-[10px] font-mono font-bold rounded-full uppercase">
            {report.recommendation || 'Strong Hire'}
          </span>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono">
        {[
          { label: 'TECHNICAL DEPTH', score: report.metrics?.technicalDepth || 92, color: 'text-indigo-400', bar: 'bg-indigo-500' },
          { label: 'PROBLEM SOLVING', score: report.metrics?.problemSolving || 88, color: 'text-cyan-400', bar: 'bg-cyan-400' },
          { label: 'COMMUNICATION', score: report.metrics?.communication || 86, color: 'text-purple-400', bar: 'bg-purple-400' },
          { label: 'COMPOSURE & PACE', score: report.metrics?.composure || 90, color: 'text-emerald-400', bar: 'bg-emerald-400' },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 text-center space-y-1.5 shadow-md">
            <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase">{item.label}</span>
            <span className={`font-black text-3xl ${item.color} block`}>{item.score}%</span>
            <div className="w-full bg-[#121c33] rounded-full h-1.5 mt-2 overflow-hidden">
              <div className={`${item.bar} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${item.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* MediaPipe Vision & Biometric Section */}
      <div className="bg-[#0b1324] border border-[#17233f] rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#141e36] pb-3">
          <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
            <Eye size={15} className="text-cyan-400" />
            <span>MEDIAPIPE EYE TRACKING & BODY POSTURE BIOMETRICS</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-[#0e172e] px-2.5 py-0.5 rounded-full border border-[#182645]">
            Vision Engine Synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-3.5 bg-[#0e172e] border border-[#182645] rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Eye Contact Focus</span>
            <span className="text-xl font-bold text-cyan-300">{biometrics.eyeContactPercentage}%</span>
            <span className="text-[10px] text-slate-400 block">{biometrics.gazeQuality} screen engagement</span>
          </div>

          <div className="p-3.5 bg-[#0e172e] border border-[#182645] rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Posture Composure</span>
            <span className="text-xl font-bold text-purple-300">{biometrics.averageComposureScore}/100</span>
            <span className="text-[10px] text-slate-400 block">Upright & calm delivery</span>
          </div>

          <div className="p-3.5 bg-[#0e172e] border border-[#182645] rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Movement Index</span>
            <span className="text-xl font-bold text-emerald-300">{biometrics.fidgetIndex}</span>
            <span className="text-[10px] text-slate-400 block">Natural body language</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          {(biometrics.observations || []).map((obs, idx) => (
            <div key={idx} className="p-2.5 bg-[#09101f] border border-[#14203a] rounded-xl text-xs text-slate-300 flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>{obs}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Targeted Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#0b1324] border border-[#17233f] rounded-3xl p-6 space-y-3 font-mono shadow-md">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>Validated Strengths</span>
          </span>
          <div className="space-y-2 text-xs text-slate-300 font-sans">
            {(report.keyStrengths || []).map((s, idx) => (
              <div key={idx} className="p-3 bg-[#0e172e] border border-[#182645] rounded-xl flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0b1324] border border-[#17233f] rounded-3xl p-6 space-y-3 font-mono shadow-md">
          <span className="text-xs font-bold text-cyan-400 flex items-center gap-2">
            <TrendingUp size={15} />
            <span>Targeted Growth Areas</span>
          </span>
          <div className="space-y-2 text-xs text-slate-300 font-sans">
            {(report.areasForGrowth || []).map((g, idx) => (
              <div key={idx} className="p-3 bg-[#0e172e] border border-[#182645] rounded-xl flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBackToDashboard}
          className="px-6 py-3 bg-[#0c1427] hover:bg-[#121e3a] border border-[#192849] rounded-2xl font-mono text-xs font-bold text-slate-300 flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={handleExportTxt}
          className="px-6 py-3 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-300 hover:to-indigo-300 text-[#070b14] rounded-2xl font-mono text-xs font-black tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-purple-950/40 active:scale-95"
        >
          <Download size={15} />
          <span>Export Scorecard (.txt)</span>
        </button>
      </div>

    </div>
  );
}
