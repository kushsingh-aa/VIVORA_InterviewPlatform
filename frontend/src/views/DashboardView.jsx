import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useInterview, SENIORITY_INFO } from '../context/InterviewContext';
import { Terminal, Database, TrendingUp, Users, ArrowRight, ShieldCheck, Zap, Activity, Cpu, Award } from 'lucide-react';

export default function DashboardView({ onStartInterview }) {
  const { user } = useAuth();
  const { selectedDifficulty, setSelectedDifficulty, startSession, historyArchive } = useInterview();

  const seniorityData = SENIORITY_INFO[selectedDifficulty] || SENIORITY_INFO['Senior'];

  const tracks = [
    {
      id: 'software',
      title: 'Software Engineering Core',
      badge: 'Distributed Scalability',
      desc: 'Systematic diagnosis of 10x traffic spikes, distributed locking (Redlock), multi-tier cache stampede isolation, and circuit breaker patterns.',
      icon: Terminal,
      gradient: 'from-indigo-600 via-indigo-700 to-purple-700',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-500/10 text-indigo-500',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    },
    {
      id: 'system_design',
      title: 'System Design & Architecture',
      badge: 'Planetary Topologies',
      desc: 'Architecting multi-region active-active clusters, conflict-free replicated data types (CRDTs), high-throughput event streaming, and strict SLAs.',
      icon: Database,
      gradient: 'from-emerald-600 via-teal-700 to-cyan-700',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'product',
      title: 'Product Management Lead',
      badge: 'Strategy & GTM',
      desc: 'Diagnosing retention funnel degradation, RICE scoring matrix prioritization, North Star metric mapping, and cross-functional trade-offs.',
      icon: TrendingUp,
      gradient: 'from-purple-600 via-pink-700 to-rose-700',
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-500/10 text-purple-500',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    },
    {
      id: 'behavioral',
      title: 'Behavioral & Leadership',
      badge: 'Executive EQ & STAR',
      desc: 'Leadership in high-stakes production crises, cross-organizational alignment, post-mortem retrospectives, and navigating conflict under pressure.',
      icon: Users,
      gradient: 'from-amber-600 via-orange-700 to-yellow-600',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-500',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
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
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-white/10 p-8 md:p-10 shadow-2xl text-white">
        
        {/* Glowing Background Mesh Orbs */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-md rounded-full text-xs font-bold text-indigo-300">
              <Zap size={14} className="text-amber-400 animate-pulse" />
              <span>Generative AI Conversational Assessment Engine v2.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Master Your Next Interview with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Adaptive AI Intelligence
              </span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base font-normal max-w-2xl leading-relaxed">
              Experience dynamic scenario-based questions generated live from your responses. Live voice synthesis, speech-to-text transcription, biometric telemetry HUD, and in-session AI coaching.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Cpu size={14} className="text-indigo-400" /> OpenRouter LLM Active
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Activity size={14} className="text-emerald-400" /> Live Biometric HUD
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <ShieldCheck size={14} className="text-purple-400" /> Persistent MongoDB Cloud
              </span>
            </div>
          </div>

          {/* Quick Metrics Badge on Hero */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Candidate Session</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-md uppercase">Ready</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Candidate:</span>
                <span className="font-bold text-white truncate">{user?.name || 'Candidate'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Target Seniority:</span>
                <span className="font-bold text-indigo-300">{selectedDifficulty} Level</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Past Scorecards:</span>
                <span className="font-mono font-bold text-emerald-400">{historyArchive.length} Completed</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Target Seniority Selector Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🎯 Calibrate Assessment Seniority</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Questions, failure domain probes, and rubric criteria adapt dynamically to your chosen career tier.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>⏱️ <strong>15-20 mins</strong></span>
            <span>•</span>
            <span>🎙️ <strong>Voice Enabled</strong></span>
          </div>
        </div>

        {/* Tier Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            { id: 'Junior', label: 'Junior', sub: '0-2 YOE', desc: 'Fundamentals & CRUD' },
            { id: 'Mid-Level', label: 'Mid-Level', sub: '3-5 YOE', desc: 'Services & Caching' },
            { id: 'Senior', label: 'Senior', sub: '5-8 YOE', desc: 'Distributed Scale' },
            { id: 'Staff/Lead', label: 'Staff / Lead', sub: '8+ YOE', desc: 'Planetary Architectures' }
          ].map((tier) => {
            const isSelected = selectedDifficulty === tier.id;

            return (
              <button
                key={tier.id}
                onClick={() => setSelectedDifficulty(tier.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-indigo-500 shadow-lg shadow-indigo-500/25 scale-[1.02]'
                    : 'bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs md:text-sm">{tier.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {tier.sub}
                  </span>
                </div>
                <p className={`text-[11px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {tier.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Scope Detail Card */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl text-xs flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-black text-indigo-700 dark:text-indigo-300">
              {seniorityData.title}
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {seniorityData.desc}
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shrink-0 shadow-sm">
            Active Rubric
          </span>
        </div>
      </div>

      {/* Assessment Channels Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Assessment Channels</h2>
            <p className="text-xs text-slate-400 font-medium">Select a vertical to enter the live AI evaluation chamber.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tracks.map((track) => {
            const Icon = track.icon;

            return (
              <div
                key={track.id}
                onClick={() => handleTrackSelect(track.id)}
                className="group relative bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl p-7 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1 space-y-4 overflow-hidden backdrop-blur-xl"
              >
                {/* Glow Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all"></div>

                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl ${track.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                    <Icon size={28} />
                  </div>
                  <span className={`px-3 py-1 border rounded-full text-xs font-black ${track.badgeColor}`}>
                    {track.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {track.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="flex items-center gap-1.5">
                    Launch Assessment Chamber
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={16} />
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
