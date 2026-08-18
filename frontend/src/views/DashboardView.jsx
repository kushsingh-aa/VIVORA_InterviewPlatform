import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useInterview, SENIORITY_INFO } from '../context/InterviewContext';
import { Terminal, Database, TrendingUp, Users, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function DashboardView({ onStartInterview }) {
  const { user } = useAuth();
  const { selectedDifficulty, setSelectedDifficulty, startSession } = useInterview();

  const seniorityData = SENIORITY_INFO[selectedDifficulty] || SENIORITY_INFO['Senior'];

  const tracks = [
    {
      id: 'software',
      title: 'Software Engineering Core',
      badge: 'Core Engineering',
      desc: 'Deep-dive into distributed caching, concurrency locking, microservices resilience, and fault-tolerant architecture.',
      icon: Terminal,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950',
      border: 'hover:border-indigo-600 dark:hover:border-indigo-500'
    },
    {
      id: 'system_design',
      title: 'System Design & Scalability',
      badge: 'Architecture',
      desc: 'Design planetary-scale multi-region topologies, write-heavy event streams, global rate limiting, and CAP tradeoffs.',
      icon: Database,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      border: 'hover:border-emerald-600 dark:hover:border-emerald-500'
    },
    {
      id: 'product',
      title: 'Product Management Lead',
      badge: 'Strategy & Execution',
      desc: 'Evaluate product retention root cause analysis, RICE/Kano framework prioritization, GTM strategies, and North Star metrics.',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950',
      border: 'hover:border-purple-600 dark:hover:border-purple-500'
    },
    {
      id: 'behavioral',
      title: 'Behavioral & Leadership',
      badge: 'Executive EQ',
      desc: 'Evaluated on conflict resolution, stakeholder alignment under high pressure, and post-mortem accountability using STAR.',
      icon: Users,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950',
      border: 'hover:border-amber-600 dark:hover:border-amber-500'
    }
  ];

  const handleTrackSelect = async (trackId) => {
    const res = await startSession(trackId);
    if (res.success && onStartInterview) {
      onStartInterview();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Candidate Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-200">
            <Zap size={14} className="text-amber-400" />
            <span>AI Assessment Channel Active</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Welcome, {user?.name || 'Candidate'} 👋
          </h2>
          <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
            Select a target seniority level and choose an interview track below. The autonomous AI interviewer will conduct real-time conversational vetting with dynamic follow-ups based on your exact answers.
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Target Seniority Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Target Seniority:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'Junior', label: 'Junior (0-2 YOE)' },
                { id: 'Mid-Level', label: 'Mid-Level (3-5 YOE)' },
                { id: 'Senior', label: 'Senior (5-8 YOE)' },
                { id: 'Staff/Lead', label: 'Staff / Principal (8+ YOE)' }
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedDifficulty(tier.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDifficulty === tier.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>⏱️ Duration: <strong>15-20 mins</strong></span>
            <span>•</span>
            <span>🎙️ Voice + STT Enabled</span>
          </div>
        </div>

        {/* Dynamic Focus Description Card */}
        <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-xs flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
          <div>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {seniorityData.title}
            </span>
            <span className="ml-1 text-slate-600 dark:text-slate-400">
              {seniorityData.desc}
            </span>
          </div>
          <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-md whitespace-nowrap">
            Calibrated
          </span>
        </div>
      </div>

      {/* Track Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tracks.map((track) => {
          const Icon = track.icon;

          return (
            <div
              key={track.id}
              onClick={() => handleTrackSelect(track.id)}
              className={`group relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 ${track.border} rounded-2xl p-6 cursor-pointer transition-all shadow-sm hover:shadow-xl hover:-translate-y-0.5 space-y-4`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 ${track.bg} ${track.color} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                  <Icon size={28} />
                </div>
                <span className={`px-3 py-1 ${track.bg} ${track.color} rounded-full text-xs font-bold`}>
                  {track.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {track.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                  {track.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Start Assessment Chamber</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
