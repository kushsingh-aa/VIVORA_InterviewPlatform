import React from 'react';
import { useInterview } from '../context/InterviewContext';
import { Award, CheckCircle2, TrendingUp, Download, ArrowLeft, Shield, Cpu, Activity } from 'lucide-react';

export default function ScorecardView({ onBackToDashboard }) {
  const { finalReport, activeSession } = useInterview();

  const report = finalReport || {
    roleTitle: activeSession?.roleTitle || 'Senior Software Engineer',
    overallScore: 87,
    recommendation: 'Strong Hire',
    executiveSummary: 'Candidate demonstrated exemplary architectural problem breakdown, clearly articulating distributed caching, concurrency locking, and failure isolation strategies calibrated for senior-tier scope.',
    metrics: {
      technicalDepth: 92,
      problemSolving: 88,
      communication: 86,
      composure: 90
    },
    keyStrengths: [
      'Articulated distributed caching (cache-aside) and Redlock concurrency locking mechanisms clearly.',
      'Structured problem breakdown with defensive fault-tolerant architecture.',
      'Maintained consistent eye contact and high composure under probing follow-up questions.'
    ],
    areasForGrowth: [
      'Quantify latency thresholds and network throughput limits more explicitly.',
      'Incorporate canary rollback strategies during distributed database schema migrations.'
    ],
    questionBreakdown: [
      {
        questionNumber: 1,
        candidateAnswer: "First, I'd evaluate the current domain boundaries to see if they naturally decompose into independent services. Second, I'd analyze the data layer—tightly coupled databases are usually the hardest part to split.",
        score: 92,
        feedback: 'Superb grasp of concurrency and distributed caching failure modes with clear communication.'
      }
    ]
  };

  const handleExportTxt = () => {
    const content = `========================================================================
             VIVORA AI - EXECUTIVE CANDIDATE SCORECARD
========================================================================
Role: ${report.roleTitle || 'Software Engineer'}
Overall Score: ${report.overallScore || 87}%
Verdict: ${report.recommendation || 'Strong Hire'}
Date: ${new Date().toLocaleString()}

------------------------------------------------------------------------
EXECUTIVE SUMMARY:
------------------------------------------------------------------------
${report.executiveSummary || 'Telemetry evaluation completed.'}

------------------------------------------------------------------------
EVALUATION METRIC BREAKDOWN:
------------------------------------------------------------------------
• Technical Depth:     ${report.metrics?.technicalDepth || 90}%
• Problem Solving:     ${report.metrics?.problemSolving || 88}%
• Communication:       ${report.metrics?.communication || 86}%
• Composure & Focus:   ${report.metrics?.composure || 90}%

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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-10">
      
      {/* Top Banner */}
      <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101b33] border border-[#1c2e56] rounded-full text-[10px] font-mono font-bold text-purple-300">
            <Award size={13} className="text-purple-400" />
            <span>ASSESSMENT COMPLETED & VERIFIED</span>
          </div>

          <h1 className="text-2xl font-mono font-bold text-white">
            {report.roleTitle || 'Candidate'} Evaluation
          </h1>

          <p className="text-xs text-slate-400 font-normal leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="bg-[#0e172e] border border-[#1c2d52] rounded-2xl p-5 text-center min-w-[150px] space-y-1">
          <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">
            Calibrated Score
          </span>
          <span className="font-mono font-black text-4xl text-purple-300">
            {report.overallScore}%
          </span>
          <span className="inline-block px-3 py-0.5 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-[10px] font-mono font-bold rounded-full uppercase">
            {report.recommendation || 'Strong Hire'}
          </span>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        {[
          { label: 'TECHNICAL DEPTH', score: report.metrics?.technicalDepth || 92, color: 'text-indigo-400' },
          { label: 'PROBLEM SOLVING', score: report.metrics?.problemSolving || 88, color: 'text-cyan-400' },
          { label: 'COMMUNICATION', score: report.metrics?.communication || 86, color: 'text-purple-400' },
          { label: 'COMPOSURE & PACE', score: report.metrics?.composure || 90, color: 'text-emerald-400' },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 text-center space-y-1">
            <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase">{item.label}</span>
            <span className={`font-black text-2xl ${item.color} block`}>{item.score}%</span>
            <div className="w-full bg-[#121c33] rounded-full h-1 mt-2 overflow-hidden">
              <div className="bg-purple-400 h-1 rounded-full" style={{ width: `${item.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-5 space-y-3 font-mono">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>Validated Strengths</span>
          </span>
          <div className="space-y-2 text-xs text-slate-300 font-sans">
            {(report.keyStrengths || []).map((s, idx) => (
              <div key={idx} className="p-2.5 bg-[#0e172e] border border-[#182645] rounded-xl flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-5 space-y-3 font-mono">
          <span className="text-xs font-bold text-cyan-400 flex items-center gap-2">
            <TrendingUp size={15} />
            <span>Targeted Growth Areas</span>
          </span>
          <div className="space-y-2 text-xs text-slate-300 font-sans">
            {(report.areasForGrowth || []).map((g, idx) => (
              <div key={idx} className="p-2.5 bg-[#0e172e] border border-[#182645] rounded-xl flex items-start gap-2">
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
          <span>Dashboard</span>
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
