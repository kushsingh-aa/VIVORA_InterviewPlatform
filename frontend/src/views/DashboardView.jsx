import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useInterview, SENIORITY_INFO } from '../context/InterviewContext';
import { Terminal, Database, TrendingUp, Users, ArrowRight, ShieldCheck, Zap, Activity, Cpu, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

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
      color: 'from-cyan-500 to-blue-600',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/30',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'system_design',
      title: 'System Design & Architecture',
      badge: 'Planetary Topologies',
      desc: 'Architecting multi-region active-active clusters, conflict-free replicated data types (CRDTs), high-throughput event streaming, and strict SLAs.',
      icon: Database,
      color: 'from-emerald-500 to-teal-600',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/30',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'product',
      title: 'Product Management Lead',
      badge: 'Strategy & GTM',
      desc: 'Diagnosing retention funnel degradation, RICE scoring matrix prioritization, North Star metric mapping, and cross-functional trade-offs.',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/30',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
    },
    {
      id: 'behavioral',
      title: 'Behavioral & Leadership',
      badge: 'Executive EQ & STAR',
      desc: 'Leadership in high-stakes production crises, cross-organizational alignment, post-mortem retrospectives, and navigating conflict under pressure.',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/30',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
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
      
      {/* Eye-Catching Holographic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1427] via-[#101b33] to-[#080d1a] border border-indigo-500/20 p-8 md:p-10 shadow-2xl">
        
        {/* Glowing Background Mesh Orbs */}
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 bottom-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md rounded-full text-xs font-mono font-bold text-indigo-300">
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
              <span>NEXT-GEN AI TECHNICAL INTERVIEW PLATFORM 2.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              Simulate Real World Interviews with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Adaptive AI Intelligence
              </span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base font-normal max-w-2xl leading-relaxed">
              Experience dynamic, multi-turn technical assessments with real-time MediaPipe Eye Tracking, Posture Biometrics, live voice synthesis, and in-depth rubric scoring.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 bg-[#0e172e]/80 border border-[#1b2848] px-3.5 py-2 rounded-xl shadow-sm">
                <Cpu size={14} className="text-indigo-400" /> GPT-4o-Mini Engine
              </span>
              <span className="flex items-center gap-1.5 bg-[#0e172e]/80 border border-[#1b2848] px-3.5 py-2 rounded-xl shadow-sm">
                <Activity size={14} className="text-cyan-400" /> MediaPipe Iris & Pose
              </span>
              <span className="flex items-center gap-1.5 bg-[#0e172e]/80 border border-[#1b2848] px-3.5 py-2 rounded-xl shadow-sm">
                <ShieldCheck size={14} className="text-emerald-400" /> MongoDB Atlas Synced
              </span>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="lg:col-span-4 bg-[#0a1122]/90 border border-[#17233f] backdrop-blur-xl rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#141e36] pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Candidate Session</span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-black rounded-full uppercase">
                Ready
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate:</span>
                <span className="font-bold text-white truncate">{user?.name || 'Candidate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Tier:</span>
                <span className="font-bold text-purple-300">{selectedDifficulty} Level</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Completed Sessions:</span>
                <span className="font-bold text-emerald-400">{historyArchive.length} scorecards</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Target Seniority Selector Section */}
      <div className="bg-[#0a1122]/80 backdrop-blur-xl border border-[#17233f] rounded-3xl p-6 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400">🎯</span>
              <span>Calibrate Assessment Seniority</span>
            </h2>
            <p className="text-xs text-slate-400">
              Questions, failure domain probes, and rubric criteria adapt dynamically to your chosen career tier.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono font-semibold text-slate-400">
            <span>⏱️ <strong>6 Rapid Turns</strong></span>
            <span>•</span>
            <span>🎙️ <strong>Voice Enabled</strong></span>
          </div>
        </div>

        {/* Tier Selection Buttons */}
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
                    ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white border-indigo-400 shadow-lg shadow-indigo-500/30 scale-[1.02]'
                    : 'bg-[#0c1427] hover:bg-[#101b33] text-slate-300 border-[#192747] hover:border-indigo-500/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-xs md:text-sm">{tier.label}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#152240] text-slate-400'
                  }`}>
                    {tier.sub}
                  </span>
                </div>
                <p className={`text-[11px] truncate font-normal ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {tier.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Scope Detail Card */}
        <div className="p-4 bg-gradient-to-r from-[#0d162d] to-[#121c38] border border-[#1b2848] rounded-2xl text-xs flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-bold text-indigo-300 font-mono">
              {seniorityData.title}
            </span>
            <p className="text-slate-300 leading-relaxed font-normal">
              {seniorityData.desc}
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-600/80 border border-indigo-500 text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl shrink-0 shadow-sm">
            Active Rubric
          </span>
        </div>
      </div>

      {/* Assessment Channels Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white">Assessment Channels</h2>
            <p className="text-xs text-slate-400 font-medium">Select an engineering vertical to launch the live AI evaluation chamber.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tracks.map((track) => {
            const Icon = track.icon;

            return (
              <div
                key={track.id}
                onClick={() => handleTrackSelect(track.id)}
                className="group relative bg-[#0a1122]/90 border border-[#17233f] hover:border-indigo-500/80 rounded-3xl p-7 cursor-pointer transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-indigo-950/40 hover:-translate-y-1 space-y-4 overflow-hidden backdrop-blur-xl"
              >
                {/* Glow Accent on Hover */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>

                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl ${track.iconBg} border flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                    <Icon size={28} className={track.iconColor} />
                  </div>
                  <span className={`px-3 py-1 border rounded-full text-xs font-mono font-bold ${track.badgeColor}`}>
                    {track.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">
                    {track.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#141f38] flex items-center justify-between text-xs font-mono font-bold text-indigo-400">
                  <span className="flex items-center gap-1.5">
                    Launch Assessment Chamber
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#111c36] border border-[#1d2d52] flex items-center justify-center group-hover:translate-x-1 group-hover:bg-indigo-600 group-hover:text-white transition-all">
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
