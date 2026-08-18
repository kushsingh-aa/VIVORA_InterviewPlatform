import React from 'react';
import { Info, Brain, Activity, Cpu, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutView({ onStartAssessment }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-300">
          <Sparkles size={14} className="text-amber-400" />
          <span>Next-Generation Technical Evaluation Architecture</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          About VIVORA AI Engine
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-normal">
          VIVORA evaluates professional competency profiles without rigid multiple-choice filters or hardcoded scripts. Our deep conversational stack operates like an authentic technical interview, formulating dynamic follow-ups based directly on your architectural reasoning.
        </p>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Core Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="bg-white/80 dark:bg-[#0c1427]/80 backdrop-blur-xl border border-slate-200 dark:border-[#17233f] rounded-3xl p-7 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Brain size={24} />
          </div>
          <h3 className="font-black text-base text-slate-900 dark:text-white">
            Conversational Intelligence
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            No fixed arrays. Candidate answers run straight into custom LLM context loops to construct targeted, situational logic inquiries, deep-dive probes, and real-time failure domain analysis.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-[#0c1427]/80 backdrop-blur-xl border border-slate-200 dark:border-[#17233f] rounded-3xl p-7 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Activity size={24} />
          </div>
          <h3 className="font-black text-base text-slate-900 dark:text-white">
            Live Telemetry & Clarity AI
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Real-time speech cadence (WPM), voice synthesis, speech-to-text recognition, and structured rubric metrics (Technical Depth, Problem Solving, Communication) provide actionable candidate scorecards.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-[#0c1427]/80 backdrop-blur-xl border border-slate-200 dark:border-[#17233f] rounded-3xl p-7 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Cpu size={24} />
          </div>
          <h3 className="font-black text-base text-slate-900 dark:text-white">
            Calibrated Seniority Archetypes
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Dynamic system prompt calibration tunes the bar across Junior (fundamentals & CRUD), Mid-Level (services & caching), Senior (distributed systems & concurrency), and Staff/Principal (multi-region architectures).
          </p>
        </div>

        <div className="bg-white/80 dark:bg-[#0c1427]/80 backdrop-blur-xl border border-slate-200 dark:border-[#17233f] rounded-3xl p-7 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-black text-base text-slate-900 dark:text-white">
            MongoDB Atlas Cloud Persistence
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Complete dialogues, scoring matrices, and finalized executive scorecards are stored persistently in cloud collections for post-interview auditing and review.
          </p>
        </div>

      </div>

      {/* CTA Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onStartAssessment}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-xs md:text-sm shadow-lg shadow-indigo-500/25 transition-all"
        >
          <span>Go to Assessment Dashboard</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}
