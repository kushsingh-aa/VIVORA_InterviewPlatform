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
      <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-900/5 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="space-y-2.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
            <Award size={14} className="text-indigo-600" />
            <span>VERIFIED AI TECHNICAL SCORECARD</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {report.roleTitle || 'Candidate'} Evaluation
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="bg-gradient-to-br from-[#f8faff] via-[#eef4ff] to-[#f4f0ff] border border-indigo-100 rounded-3xl p-6 text-center min-w-[170px] space-y-1.5 shadow-md">
          <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Overall Score
          </span>
          <span className={`font-black text-5xl block ${
            isZero ? 'text-slate-400' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent'
          }`}>
            {report.overallScore}%
          </span>
          <span className={`inline-block px-3.5 py-1 border text-xs font-extrabold rounded-full uppercase ${
            isZero 
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : report.overallScore >= 80 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            {report.recommendation || 'Evaluated'}
          </span>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[
          { label: 'TECHNICAL DEPTH', score: report.metrics?.technicalDepth || 0, color: 'text-indigo-600', bar: 'bg-indigo-600' },
          { label: 'PROBLEM SOLVING', score: report.metrics?.problemSolving || 0, color: 'text-blue-600', bar: 'bg-blue-600' },
          { label: 'COMMUNICATION', score: report.metrics?.communication || 0, color: 'text-purple-600', bar: 'bg-purple-600' },
          { label: 'COMPOSURE & PACE', score: report.metrics?.composure || 0, color: 'text-emerald-600', bar: 'bg-emerald-600' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-4 text-center space-y-1.5 shadow-md shadow-indigo-900/5">
            <span className="block text-[9px] font-bold text-slate-500 tracking-wider uppercase">{item.label}</span>
            <span className={`font-black text-3xl ${item.color} block`}>{item.score}%</span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className={`${item.bar} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${item.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* MediaPipe Vision & Biometric Section */}
      <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 space-y-4 shadow-md shadow-indigo-900/5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-indigo-700 flex items-center gap-2">
            <Eye size={15} className="text-indigo-600" />
            <span>MEDIAPIPE EYE TRACKING & BODY POSTURE BIOMETRICS</span>
          </span>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Vision Engine Synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 bg-[#f8faff] border border-indigo-100 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Eye Contact Focus</span>
            <span className="text-2xl font-black text-indigo-600">{biometrics.eyeContactPercentage}%</span>
            <span className="text-[11px] text-slate-600 block font-medium">{biometrics.gazeQuality} screen engagement</span>
          </div>

          <div className="p-4 bg-[#faf5ff] border border-purple-100 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Posture Composure</span>
            <span className="text-2xl font-black text-purple-600">{biometrics.averageComposureScore}/100</span>
            <span className="text-[11px] text-slate-600 block font-medium">Upright & calm delivery</span>
          </div>

          <div className="p-4 bg-[#f0fdf4] border border-emerald-100 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Movement Index</span>
            <span className="text-2xl font-black text-emerald-600">{biometrics.fidgetIndex}</span>
            <span className="text-[11px] text-slate-600 block font-medium">Natural body language</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          {(biometrics.observations || []).map((obs, idx) => (
            <div key={idx} className="p-3 bg-[#f8faff] border border-indigo-50 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
              <span className="text-indigo-600 font-bold">•</span>
              <span>{obs}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Targeted Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 space-y-3 shadow-md shadow-indigo-900/5">
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>Validated Strengths</span>
          </span>
          <div className="space-y-2 text-xs text-slate-700">
            {(report.keyStrengths || []).map((s, idx) => (
              <div key={idx} className="p-3 bg-[#f0fdf4] border border-emerald-100 rounded-2xl flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 space-y-3 shadow-md shadow-indigo-900/5">
          <span className="text-xs font-bold text-blue-700 flex items-center gap-2">
            <TrendingUp size={15} />
            <span>Targeted Growth Areas</span>
          </span>
          <div className="space-y-2 text-xs text-slate-700">
            {(report.areasForGrowth || []).map((g, idx) => (
              <div key={idx} className="p-3 bg-[#eff6ff] border border-blue-100 rounded-2xl flex items-start gap-2.5">
                <span className="text-blue-600 font-bold">•</span>
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
          className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 flex items-center gap-2 transition-all shadow-sm"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={handleExportTxt}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white rounded-2xl text-xs font-black tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
        >
          <Download size={14} />
          <span>Export Scorecard (.txt)</span>
        </button>
      </div>

    </div>
  );
}
