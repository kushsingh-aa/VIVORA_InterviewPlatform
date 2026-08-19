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
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      id: 'system_design',
      title: 'System Design & Architecture',
      badge: 'Planetary Topologies',
      desc: 'Architecting multi-region active-active clusters, conflict-free replicated data types (CRDTs), high-throughput event streaming, and strict SLAs.',
      icon: Database,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      id: 'product',
      title: 'Product Management Lead',
      badge: 'Strategy & GTM',
      desc: 'Diagnosing retention funnel degradation, RICE scoring matrix prioritization, North Star metric mapping, and cross-functional trade-offs.',
      icon: TrendingUp,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      id: 'behavioral',
      title: 'Behavioral & Leadership',
      badge: 'Executive EQ & STAR',
      desc: 'Leadership in high-stakes production crises, cross-organizational alignment, post-mortem retrospectives, and navigating conflict under pressure.',
      icon: Users,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  const handleTrackSelect = async (trackId) => {
    const res = await startSession(trackId);
    if (res.success && onStartInterview) {
      onStartInterview();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Sleek Hero Banner */}
      <div className="bg-[#0b1326] border border-[#162340] rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-300">
            <Sparkles size={13} className="text-amber-400" />
            <span>AI-Powered Technical Assessment Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Interactive AI Technical Interviews
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Practice real engineering interviews with dynamic multi-turn follow-ups, real-time MediaPipe eye tracking, speech recognition, and instant rubric scoring.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-[#0e1830] border border-[#192a50] px-3 py-1.5 rounded-xl">
              <Cpu size={14} className="text-indigo-400" /> GPT-4o-Mini
            </span>
            <span className="flex items-center gap-1.5 bg-[#0e1830] border border-[#192a50] px-3 py-1.5 rounded-xl">
              <Activity size={14} className="text-cyan-400" /> MediaPipe Eye Tracking
            </span>
            <span className="flex items-center gap-1.5 bg-[#0e1830] border border-[#192a50] px-3 py-1.5 rounded-xl">
              <ShieldCheck size={14} className="text-emerald-400" /> MongoDB Atlas Cloud
            </span>
          </div>

        </div>
      </div>

      {/* Seniority Calibration Deck */}
      <div className="bg-[#0b1326] border border-[#162340] rounded-3xl p-6 md:p-8 space-y-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Select Experience Level</h2>
            <p className="text-xs text-slate-400">Questions and evaluation criteria will calibrate to your selected seniority.</p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            Current Tier: <strong className="text-indigo-300 font-bold">{selectedDifficulty}</strong>
          </span>
        </div>

        {/* 4 Segmented Buttons */}
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
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                    : 'bg-[#0e172e] hover:bg-[#131f3d] text-slate-300 border-[#192849]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{tier.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#152240] text-slate-400'
                  }`}>
                    {tier.sub}
                  </span>
                </div>
                <p className={`text-xs ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {tier.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Rubric Description */}
        <div className="p-4 bg-[#0e172e] border border-[#192849] rounded-2xl text-xs flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-bold text-indigo-300">{seniorityData.title}</span>
            <p className="text-slate-400 leading-relaxed">{seniorityData.desc}</p>
          </div>
          <span className="px-3 py-1 bg-[#152345] border border-[#1e3260] text-indigo-300 font-bold text-[10px] uppercase tracking-wider rounded-xl shrink-0">
            Active Rubric
          </span>
        </div>
      </div>

      {/* Assessment Tracks Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Choose Interview Track</h2>
          <p className="text-xs text-slate-400">Select a technical domain to start your session.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tracks.map((track) => {
            const Icon = track.icon;

            return (
              <div
                key={track.id}
                onClick={() => handleTrackSelect(track.id)}
                className="group bg-[#0b1326] border border-[#162340] hover:border-indigo-500/80 rounded-3xl p-6 cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${track.iconBg} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon size={24} className={track.iconColor} />
                  </div>
                  <span className="px-3 py-1 bg-[#0e172e] border border-[#192849] rounded-full text-xs font-semibold text-slate-300">
                    {track.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {track.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#141f38] flex items-center justify-between text-xs font-bold text-indigo-400">
                  <span>Start Interview</span>
                  <div className="w-7 h-7 rounded-full bg-[#0e172e] border border-[#192849] flex items-center justify-center group-hover:translate-x-1 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight size={15} />
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
