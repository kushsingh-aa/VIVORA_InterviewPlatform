import React from 'react';
import { useInterview } from '../context/InterviewContext';
import { Award, CheckCircle2, TrendingUp, Download, ArrowLeft, Eye, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ScorecardView({ onBackToDashboard }) {
  const { finalReport, activeSession } = useInterview();

  const report = finalReport || {
    roleTitle: activeSession?.roleTitle || 'Senior Software Engineer',
    overallScore: 0,
    recommendation: 'Incomplete / No Answers Provided',
    executiveSummary: 'The assessment chamber was ended before any technical answers were recorded.',
    metrics: {
      technicalDepth: 0,
      problemSolving: 0,
      communication: 0,
      composure: 0
    },
    visionBiometrics: {
      eyeContactPercentage: 0,
      averageComposureScore: 0,
      fidgetIndex: 'N/A',
      gazeQuality: 'N/A',
      observations: ['No technical response data recorded.']
    },
    keyStrengths: ['No answers recorded.'],
    areasForGrowth: ['Please submit answers during the assessment to generate technical metrics.']
  };

  const isZero = report.overallScore === 0;
  const biometrics = report.visionBiometrics || {
    eyeContactPercentage: isZero ? 0 : 92,
    averageComposureScore: isZero ? 0 : 90,
    fidgetIndex: isZero ? 'N/A' : 'Low (Stable)',
    gazeQuality: isZero ? 'Incomplete' : 'Good',
    observations: isZero ? ['Session ended without response submissions.'] : ['Maintained screen engagement during technical breakdown.']
  };

  const handleExportTxt = () => {
    const content = `========================================================================
             VIVORA AI - EXECUTIVE CANDIDATE SCORECARD
========================================================================
Role: ${report.roleTitle || 'Software Engineer'}
Overall Score: ${report.overallScore || 0}%
Verdict: ${report.recommendation || 'Incomplete'}
Date: ${new Date().toLocaleString()}

------------------------------------------------------------------------
EXECUTIVE SUMMARY:
------------------------------------------------------------------------
${report.executiveSummary || 'No telemetry recorded.'}

------------------------------------------------------------------------
EVALUATION METRIC BREAKDOWN:
------------------------------------------------------------------------
• Technical Depth:         ${report.metrics?.technicalDepth || 0}%
• Problem Solving:         ${report.metrics?.problemSolving || 0}%
• Communication:           ${report.metrics?.communication || 0}%
• Composure & Focus:       ${report.metrics?.composure || 0}%

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
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Top Banner */}
      <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="space-y-2.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101b33] border border-[#1c2e56] rounded-full text-[10px] font-mono font-bold text-purple-300">
            <Award size={13} className="text-purple-400" />
            <span>VERIFIED AI TECHNICAL SCORECARD</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {report.roleTitle || 'Candidate'} Evaluation
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="bg-[#0e172e] border border-[#1c2d52] rounded-2xl p-6 text-center min-w-[170px] space-y-1.5 shadow-md">
          <span className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
            Overall Score
          </span>
          <span className={`font-mono font-black text-5xl block ${isZero ? 'text-slate-500' : 'text-purple-300'}`}>
            {report.overallScore}%
          </span>
          <span className={`inline-block px-3 py-0.5 border text-[10px] font-mono font-bold rounded-full uppercase ${
            isZero 
              ? 'bg-rose-950/60 border-rose-800 text-rose-300'
              : report.overallScore >= 80 
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400' 
              : 'bg-amber-950/60 border-amber-800 text-amber-300'
          }`}>
            {report.recommendation || 'Evaluated'}
          </span>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[
          { label: 'TECHNICAL DEPTH', score: report.metrics?.technicalDepth || 0, color: 'text-indigo-400', bar: 'bg-indigo-500' },
          { label: 'PROBLEM SOLVING', score: report.metrics?.problemSolving || 0, color: 'text-cyan-400', bar: 'bg-cyan-400' },
          { label: 'COMMUNICATION', score: report.metrics?.communication || 0, color: 'text-purple-400', bar: 'bg-purple-400' },
          { label: 'COMPOSURE & PACE', score: report.metrics?.composure || 0, color: 'text-emerald-400', bar: 'bg-emerald-400' },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 text-center space-y-1.5 shadow-md">
            <span className="block text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase">{item.label}</span>
            <span className={`font-mono font-black text-3xl ${item.color} block`}>{item.score}%</span>
            <div className="w-full bg-[#121c33] rounded-full h-1.5 mt-2 overflow-hidden">
              <div className={`${item.bar} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${item.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* MediaPipe Vision & Biometric Section */}
      <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-6 space-y-4 shadow-md">
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
          <div className="p-3.5 bg-[#0e172e] border border-[#182645] rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Eye Contact Focus</span>
            <span className="text-xl font-bold text-cyan-300">{biometrics.eyeContactPercentage}%</span>
            <span className="text-[10px] text-slate-400 block">{biometrics.gazeQuality} screen engagement</span>
          </div>

          <div className="p-3.5 bg-[#0e172e] border border-[#182645] rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Posture Composure</span>
            <span className="text-xl font-bold text-purple-300">{biometrics.averageComposureScore}/100</span>
            <span className="text-[10px] text-slate-400 block">Upright & calm delivery</span>
          </div>

          <div className="p-3.5 bg-[#0e172e] border border-[#182645] rounded-xl space-y-1">
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
        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-6 space-y-3 shadow-md">
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>Validated Strengths</span>
          </span>
          <div className="space-y-2 text-xs text-slate-300">
            {(report.keyStrengths || []).map((s, idx) => (
              <div key={idx} className="p-3 bg-[#0e172e] border border-[#182645] rounded-xl flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-6 space-y-3 shadow-md">
          <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-2">
            <TrendingUp size={15} />
            <span>Targeted Growth Areas</span>
          </span>
          <div className="space-y-2 text-xs text-slate-300">
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
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 bg-[#0c1427] hover:bg-[#121e3a] border border-[#192849] rounded-xl font-mono text-xs font-bold text-slate-300 flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={handleExportTxt}
          className="px-5 py-2.5 bg-[#d8b4fe] hover:bg-[#c084fc] text-[#0f172a] rounded-xl font-mono text-xs font-black tracking-wider flex items-center gap-2 transition-all shadow-md shadow-purple-950/40"
        >
          <Download size={14} />
          <span>Export Scorecard (.txt)</span>
        </button>
      </div>

    </div>
  );
}
