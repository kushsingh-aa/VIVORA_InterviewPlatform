import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useInterview, SENIORITY_INFO } from '../context/InterviewContext';
import { Terminal, Database, TrendingUp, Users, ArrowRight, ShieldCheck, Zap, Activity, Cpu, Sparkles, ChevronRight } from 'lucide-react';

export default function DashboardView({ onStartInterview }) {
  const { user } = useAuth();
  const { selectedDifficulty, setSelectedDifficulty, startSession, historyArchive } = useInterview();

  const seniorityData = SENIORITY_INFO[selectedDifficulty] || SENIORITY_INFO['Senior'];

  const tracks = [
    {
      id: 'software',
      title: 'Software Engineering Core',
      badge: 'Distributed Systems',
      desc: 'Systematic diagnosis of 10x traffic spikes, distributed locking (Redlock), multi-tier cache stampede isolation, and circuit breaker patterns.',
      icon: Terminal,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-100',
      hoverGradient: 'hover:border-indigo-300 hover:shadow-indigo-500/10'
    },
    {
      id: 'system_design',
      title: 'System Design & Architecture',
      badge: 'Planetary Scale',
      desc: 'Architecting multi-region active-active clusters, conflict-free replicated data types (CRDTs), high-throughput event streaming, and strict SLAs.',
      icon: Database,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-100',
      hoverGradient: 'hover:border-blue-300 hover:shadow-blue-500/10'
    },
    {
      id: 'product',
      title: 'Product Management Lead',
      badge: 'Strategy & GTM',
      desc: 'Diagnosing retention funnel degradation, RICE scoring matrix prioritization, North Star metric mapping, and cross-functional trade-offs.',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 border-purple-100',
      hoverGradient: 'hover:border-purple-300 hover:shadow-purple-500/10'
    },
    {
      id: 'behavioral',
      title: 'Behavioral & Leadership',
      badge: 'Executive EQ & STAR',
      desc: 'Leadership in high-stakes production crises, cross-organizational alignment, post-mortem retrospectives, and navigating conflict under pressure.',
      icon: Users,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50 border-sky-100',
      hoverGradient: 'hover:border-sky-300 hover:shadow-sky-500/10'
    }
  ];

  const handleTrackSelect = async (trackId) => {
    const res = await startSession(trackId);
    if (res.success && onStartInterview) {
      onStartInterview();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner with White / Light Blue / Purple Fade */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#f0f5ff] to-[#f5f0ff] border border-indigo-100/80 p-8 md:p-12 shadow-xl shadow-indigo-900/5">
        
        {/* Soft Ambient Glow Orbs */}
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 bottom-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-indigo-200/80 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
              <Sparkles size={14} className="text-purple-600" />
              <span>Next-Gen Autonomous AI Technical Assessment</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-slate-900">
              Master Technical Interviews with{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Adaptive AI Dialogue
              </span>
            </h1>

            <p className="text-slate-600 text-sm md:text-base font-normal max-w-2xl leading-relaxed">
              Experience dynamic multi-turn technical assessments with real-time MediaPipe Eye Tracking, Posture Biometrics, live speech synthesis, and rigorous rubric scoring.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 bg-white border border-indigo-100 px-3.5 py-2 rounded-2xl shadow-sm">
                <Cpu size={14} className="text-indigo-600" /> GPT-4o-Mini Engine
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-indigo-100 px-3.5 py-2 rounded-2xl shadow-sm">
                <Activity size={14} className="text-purple-600" /> MediaPipe Eye & Posture
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-indigo-100 px-3.5 py-2 rounded-2xl shadow-sm">
                <ShieldCheck size={14} className="text-blue-600" /> MongoDB Atlas Cloud
              </span>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="lg:col-span-4 bg-white/90 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 space-y-4 shadow-lg shadow-indigo-900/5">
            <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Candidate Session</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full uppercase">
                Active & Ready
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Candidate:</span>
                <span className="font-bold text-slate-900 truncate">{user?.name || 'Candidate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Seniority:</span>
                <span className="font-bold text-indigo-600">{selectedDifficulty} Level</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Completed Sessions:</span>
                <span className="font-bold text-purple-600">{historyArchive.length} scorecards</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Seniority Calibration Deck */}
      <div className="bg-white/85 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 md:p-8 space-y-5 shadow-lg shadow-indigo-900/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">🎯</span>
              <span>Calibrate Assessment Seniority</span>
            </h2>
            <p className="text-xs text-slate-500">
              Questions, failure domain probes, and rubric criteria adapt dynamically to your selected career tier.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <span>⏱️ <strong>6 Rapid Turns</strong></span>
            <span>•</span>
            <span>🎙️ <strong>Voice Enabled</strong></span>
          </div>
        </div>

        {/* 4 Tier Buttons with Purple-to-Blue Fades */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'Junior', label: 'Junior', sub: '0-2 YOE', desc: 'Fundamentals & CRUD' },
            { id: 'Mid-Level', label: 'Mid-Level', sub: '3-5 YOE', desc: 'Services & Caching' },
            { id: 'Senior', label: 'Senior', sub: '5-8 YOE', desc: 'Distributed Scale' },
            { id: 'Staff/Lead', label: 'Staff / Lead', sub: '8+ YOE', desc: 'Planetary Architecture' }
          ].map((tier) => {
            const isSelected = selectedDifficulty === tier.id;

            return (
              <button
                key={tier.id}
                onClick={() => setSelectedDifficulty(tier.id)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white border-transparent shadow-lg shadow-indigo-500/30 scale-[1.02]'
                    : 'bg-[#f8faff] hover:bg-[#edf2fe] text-slate-700 border-indigo-100 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm">{tier.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-indigo-700 border border-indigo-100 shadow-sm'
                  }`}>
                    {tier.sub}
                  </span>
                </div>
                <p className={`text-xs ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {tier.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Scope Detail Card */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 rounded-2xl text-xs flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-extrabold text-indigo-900">{seniorityData.title}</span>
            <p className="text-slate-600 leading-relaxed font-normal">{seniorityData.desc}</p>
          </div>
          <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shrink-0 shadow-sm">
            Active Rubric
          </span>
        </div>
      </div>

      {/* Assessment Tracks Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Choose Interview Track</h2>
          <p className="text-xs text-slate-500">Select a technical vertical to launch your live assessment session.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tracks.map((track) => {
            const Icon = track.icon;

            return (
              <div
                key={track.id}
                onClick={() => handleTrackSelect(track.id)}
                className={`group bg-white/90 backdrop-blur-xl border border-indigo-100 rounded-3xl p-7 cursor-pointer transition-all duration-300 shadow-md shadow-indigo-900/5 hover:shadow-xl hover:-translate-y-1 space-y-4 ${track.hoverGradient}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl ${track.iconBg} border flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm`}>
                    <Icon size={26} className={track.iconColor} />
                  </div>
                  <span className="px-3.5 py-1 bg-indigo-50/80 border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold shadow-sm">
                    {track.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    {track.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>Launch Assessment Chamber</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-all shadow-sm">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
