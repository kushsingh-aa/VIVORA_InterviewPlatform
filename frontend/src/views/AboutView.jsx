import React from 'react';
import { Info, Brain, Activity, Cpu, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutView({ onStartAssessment }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-white via-[#f0f5ff] to-[#f5f0ff] border border-indigo-100/90 text-slate-900 rounded-3xl p-8 md:p-10 shadow-xl shadow-indigo-900/5 space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
          <Sparkles size={14} className="text-purple-600" />
          <span>Next-Generation Technical Assessment Engine</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          About VIVORA <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI</span>
        </h1>

        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed font-normal">
          VIVORA evaluates professional competency profiles without rigid multiple-choice filters. Our conversational engine conducts authentic technical interviews, formulating dynamic follow-ups based directly on your architectural reasoning.
        </p>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Core Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-7 space-y-3 shadow-md shadow-indigo-900/5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
            <Brain size={24} />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">
            Conversational Intelligence
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            No fixed question lists. Candidate responses feed into dynamic context loops to construct targeted inquiries, deep-dive probes, and failure domain inquiries.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-7 space-y-3 shadow-md shadow-indigo-900/5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
            <Activity size={24} />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">
            Live Telemetry & MediaPipe Vision
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Real-time eye tracking, iris gaze estimation, body posture stability, speech cadence (WPM), and rubric metrics provide comprehensive candidate scorecards.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-7 space-y-3 shadow-md shadow-indigo-900/5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
            <Cpu size={24} />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">
            Calibrated Seniority Archetypes
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Dynamic system prompt calibration tunes the evaluation bar across Junior (fundamentals & CRUD), Mid-Level (services & caching), Senior (distributed systems & concurrency), and Staff/Principal (multi-region architectures).
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-7 space-y-3 shadow-md shadow-indigo-900/5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">
            MongoDB Atlas Cloud Persistence
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Complete dialogues, scoring matrices, and finalized executive scorecards are stored persistently in cloud collections for post-interview review and talent analytics.
          </p>
        </div>

      </div>

      {/* CTA Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onStartAssessment}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white rounded-2xl font-bold text-xs md:text-sm shadow-lg shadow-indigo-500/25 transition-all"
        >
          <span>Go to Assessment Dashboard</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}
