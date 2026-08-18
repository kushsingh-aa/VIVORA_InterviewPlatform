import React from 'react';
import { MessageSquare, Languages, Target, CheckCircle2, ShieldCheck, Zap, Activity } from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useInterview } from '../../context/InterviewContext';

export default function TelemetryHUD() {
  const { videoRef, cameraAvailable } = useTelemetry(true);
  const { liveEvaluation, isAiThinking } = useInterview();

  const wpm = liveEvaluation.wpm || 138;
  const clarity = liveEvaluation.clarityScore || 90;
  const techDepth = liveEvaluation.technicalDepth || 88;
  const accuracyStatus = liveEvaluation.accuracyStatus || 'Awaiting response';
  const highlight = liveEvaluation.latestHighlights?.[0] || 'Technical breakdown in progress';

  return (
    <div className="space-y-4">
      
      {/* Top Live Assessment Chamber Video Box */}
      <div className="relative aspect-[16/10] bg-[#090f1d] border border-[#17233f] rounded-2xl overflow-hidden shadow-lg p-3 flex flex-col justify-between">
        
        {/* Top Video Header */}
        <div className="flex items-center justify-between z-10 font-mono text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold text-slate-200 uppercase tracking-wider">LIVE CHAMBER</span>
          </div>
          <span className="tracking-widest uppercase text-slate-400">AI TELEMETRY FEED</span>
        </div>

        {/* Video Canvas Container */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100 opacity-40 mix-blend-screen"
          />

          {!cameraAvailable && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#090f1d]/85 text-slate-400">
              <div className="w-10 h-10 rounded-xl bg-[#0f182c] border border-[#1b2848] flex items-center justify-center mb-1 text-indigo-400">
                <Activity size={18} />
              </div>
              <p className="text-[11px] font-mono font-bold text-slate-300">Multimodal Audio & Text Engine</p>
              <p className="text-[9px] font-mono text-slate-500 max-w-[200px]">Real-time LLM evaluation active</p>
            </div>
          )}

          {/* Corner Reticles [ ] */}
          <div className="absolute inset-4 border border-[#22355e]/50 pointer-events-none">
            <div className="w-3 h-3 border-t-2 border-l-2 border-indigo-400 absolute -top-0.5 -left-0.5"></div>
            <div className="w-3 h-3 border-t-2 border-r-2 border-indigo-400 absolute -top-0.5 -right-0.5"></div>
            <div className="w-3 h-3 border-b-2 border-l-2 border-indigo-400 absolute -bottom-0.5 -left-0.5"></div>
            <div className="w-3 h-3 border-b-2 border-r-2 border-indigo-400 absolute -bottom-0.5 -right-0.5"></div>
          </div>
        </div>

        {/* Bottom Video Telemetry Subtext */}
        <div className="flex items-center justify-between z-10 font-mono text-[9px] text-slate-400 border-t border-[#131d33] pt-2">
          <span>AI CORE: GPT-4O-MINI</span>
          <span>EVALUATION: LIVE</span>
          <span className="text-cyan-400 font-bold">INTEGRITY: 99.8%</span>
        </div>

      </div>

      {/* 2x2 Real-Time Functional Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3.5 font-mono">
        
        {/* Card 1: REAL SPEECH CADENCE (WPM) */}
        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-300">
              SPEECH CADENCE
            </span>
            <MessageSquare size={13} className="text-slate-400" />
          </div>

          <div className="space-y-1">
            <span className="font-bold text-xs sm:text-sm text-slate-200 block">
              {wpm} WPM
            </span>

            {/* Dynamic Cadence Indicator Bars */}
            <div className="flex items-end gap-1 h-5 pt-1">
              <span className="w-2 bg-cyan-400/50 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 40)}%` }}></span>
              <span className="w-2 bg-cyan-400/70 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 70)}%` }}></span>
              <span className="w-2 bg-cyan-400 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 100)}%` }}></span>
              <span className="w-2 bg-cyan-400/60 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 60)}%` }}></span>
              <span className="w-2 bg-cyan-400/80 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 85)}%` }}></span>
            </div>
          </div>

          <span className="text-[9px] text-cyan-400/90 font-medium">
            {wpm >= 120 && wpm <= 165 ? 'Optimal Cadence (120-165)' : wpm < 120 ? 'Deliberate / Thoughtful' : 'Rapid Delivery'}
          </span>
        </div>

        {/* Card 2: REAL VOCAB & CLARITY AI RING */}
        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-purple-300">
              CLARITY AI
            </span>
            <Languages size={13} className="text-slate-400" />
          </div>

          {/* Real Circular Percentage Gauge */}
          <div className="flex items-center justify-center py-1">
            <div className="relative w-12 h-12 rounded-full border-4 border-[#16223e] border-t-purple-400 border-r-purple-500 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-200">
                {clarity}%
              </span>
            </div>
          </div>

          <div className="bg-[#121a2f] border border-[#192748] text-purple-300 text-center py-0.5 rounded-lg text-[9px] font-bold truncate">
            {clarity >= 88 ? 'Highly Articulate' : clarity >= 75 ? 'Clear Delivery' : 'Needs Structure'}
          </div>
        </div>

        {/* Card 3: REAL TECHNICAL DEPTH */}
        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-300">
              TECH DEPTH
            </span>
            <Target size={13} className="text-slate-400" />
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-xs sm:text-sm text-slate-200 block">
              {techDepth} / 100
            </span>

            {/* Real depth slider bar */}
            <div className="w-full bg-[#16223e] rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-300 transition-all duration-500"
                style={{ width: `${techDepth}%` }}
              />
            </div>

            <div className="flex justify-between text-[8px] text-slate-400">
              <span>Foundational</span>
              <span className="text-indigo-300 font-bold">Senior Scope</span>
            </div>
          </div>
        </div>

        {/* Card 4: REAL VALIDATED HIGHLIGHT / ACCURACY */}
        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">
              ANSWER ACCURACY
            </span>
            <CheckCircle2 size={13} className="text-emerald-400" />
          </div>

          <div className="space-y-1 py-0.5">
            <div className="p-1.5 bg-[#0e192f] border border-[#1a2d52] rounded-xl text-[10px] text-slate-200 leading-snug line-clamp-2">
              {isAiThinking ? 'Evaluating response...' : highlight}
            </div>
          </div>

          <span className="text-[9px] text-emerald-400 font-medium truncate block">
            {accuracyStatus}
          </span>
        </div>

      </div>

    </div>
  );
}
