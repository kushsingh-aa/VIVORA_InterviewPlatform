import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { Code, Compass, GitMerge, Brain, Check, TrendingUp, LayoutGrid } from 'lucide-react';

export default function DashboardView({ onStartInterview }) {
  const { user } = useAuth();
  const { selectedDifficulty, setSelectedDifficulty, startSession, historyArchive } = useInterview();

  const userName = user?.name || 'Dr. Aris Thorne';

  // Seniority levels matching the screenshot
  const experienceTiers = [
    {
      id: 'Junior',
      code: 'L3 - L4',
      title: 'EARLY CAREER',
      desc: 'Focus on core fundamentals, data structures, and clean implementation.'
    },
    {
      id: 'Senior',
      code: 'L5',
      title: 'MID-LEVEL / SENIOR',
      desc: 'Deep architectural knowledge, cross-cutting systems, and resilience.'
    },
    {
      id: 'Staff/Lead',
      code: 'L6',
      title: 'STAFF / LEAD',
      desc: 'Organizational scope, multi-region scalability, and high-concurrency.'
    },
    {
      id: 'Principal',
      code: 'L7+',
      title: 'PRINCIPAL / DIR',
      desc: 'Industry-level impact, business strategy, and consensus protocols.'
    }
  ];

  // Assessment tracks matching the screenshot
  const tracks = [
    {
      id: 'software',
      title: 'SWE Core',
      badge: 'ALGORITHMS',
      desc: 'Advanced data structures, algorithmic complexity, and optimal solution derivation under time constraints.',
      est: 'EST. 45 MINS',
      icon: Code,
      iconColor: 'text-indigo-400'
    },
    {
      id: 'system_design',
      title: 'System Design',
      badge: 'ARCHITECTURE',
      desc: 'Scalability, distributed systems, database selection, and trade-off analysis for global services.',
      est: 'EST. 60 MINS',
      icon: Compass,
      iconColor: 'text-cyan-400'
    },
    {
      id: 'product',
      title: 'Product Strategy',
      badge: 'PM LEAD',
      desc: 'Product sense, metric design, prioritization frameworks, and cross-functional leadership scenarios.',
      est: 'EST. 45 MINS',
      icon: GitMerge,
      iconColor: 'text-purple-400'
    },
    {
      id: 'behavioral',
      title: 'Behavioral Dynamics',
      badge: 'CULTURE',
      desc: 'Conflict resolution, past project deep-dives, ambiguity navigation, and team building.',
      est: 'EST. 30 MINS',
      icon: Brain,
      iconColor: 'text-rose-400'
    }
  ];

  const handleStartTrack = async (trackId) => {
    const res = await startSession(trackId);
    if (res.success && onStartInterview) {
      onStartInterview();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-9 py-2">
      
      {/* Top Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Headline Column (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            
            {/* System Ready Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#0b1324] border border-[#162342] rounded-full text-[11px] font-mono tracking-wider text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse"></span>
              <span className="uppercase font-bold">SYSTEM READY</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Master Your Next Interview with Adaptive AI Intelligence.
            </h1>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-xl">
              VIVORA's neural engine recalibrates question complexity in real-time based on your responses, mirroring the dynamic pressure of top-tier technical interviews.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleStartTrack('software')}
              className="px-6 py-2.5 bg-[#d8b4fe] hover:bg-[#c084fc] text-[#0f172a] font-mono font-black text-xs tracking-wider rounded-xl transition-all shadow-md shadow-purple-950/40 active:scale-95"
            >
              INITIALIZE SIMULATION
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('assessment-tracks');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 bg-[#0d1527] hover:bg-[#14203d] border border-[#1a2642] text-slate-300 font-mono font-bold text-xs tracking-wider rounded-xl transition-all"
            >
              VIEW METRICS
            </button>
          </div>
        </div>

        {/* Right Candidate Profile Card (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0b1325] border border-[#17233f] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-[#141f38] pb-3">
            <div>
              <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                CANDIDATE PROFILE
              </span>
              <span className="font-mono text-sm font-bold text-slate-200">
                {userName}
              </span>
            </div>

            <span className="px-2.5 py-1 bg-[#101b33] border border-[#1c2e56] text-purple-300 text-[10px] font-mono font-bold rounded-lg tracking-wider">
              L6 STAFF / ENG
            </span>
          </div>

          {/* Competency Metric */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Overall Competency Matrix</span>
              <span className="font-bold text-slate-200">87.4%</span>
            </div>
            
            <div className="w-full bg-[#121c33] rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-300"
                style={{ width: '87.4%' }}
              />
            </div>
          </div>

          {/* Sub-grid of scores */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#0e172c] border border-[#172544] rounded-xl p-3 space-y-1">
              <span className="block text-[9px] font-mono font-bold text-slate-400 tracking-wider">
                SYSTEM DESIGN
              </span>
              <span className="font-mono font-black text-sm text-slate-200">P92</span>
            </div>

            <div className="bg-[#0e172c] border border-[#172544] rounded-xl p-3 space-y-1">
              <span className="block text-[9px] font-mono font-bold text-slate-400 tracking-wider">
                ALGORITHMS
              </span>
              <span className="font-mono font-black text-sm text-slate-200">P84</span>
            </div>
          </div>

        </div>

      </div>

      {/* Experience Vector (Seniority Selection) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <TrendingUp size={15} className="text-purple-400" />
            <span className="tracking-wider">Experience Vector</span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-widest uppercase">
            SELECT TARGET CALIBRATION
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {experienceTiers.map((tier) => {
            const isSelected = selectedDifficulty === tier.id || (selectedDifficulty === 'Senior' && tier.id === 'Senior');

            return (
              <div
                key={tier.id}
                onClick={() => setSelectedDifficulty(tier.id)}
                className={`relative bg-[#0c1427] rounded-2xl p-5 cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-purple-500/80 bg-[#0e172e] shadow-lg shadow-purple-950/40'
                    : 'border-[#17233f] hover:border-[#22355e]'
                }`}
              >
                {/* Checked Badge in Top-Right if Selected */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden rounded-tr-2xl">
                    <div className="absolute transform rotate-45 bg-purple-500 text-slate-950 font-bold text-[9px] py-0.5 right-[-24px] top-[4px] w-[70px] text-center flex items-center justify-center">
                      <Check size={9} className="text-slate-950 stroke-[3]" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="block text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                    {tier.title}
                  </span>
                  
                  <span className="block font-mono font-bold text-xs text-slate-200">
                    {tier.code}
                  </span>

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    {tier.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assessment Tracks (Module Selection) */}
      <div id="assessment-tracks" className="space-y-4 pt-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <LayoutGrid size={15} className="text-cyan-400" />
            <span className="tracking-wider">Assessment Tracks</span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-widest uppercase">
            MODULE SELECTION
          </span>
        </div>

        {/* 4 Track Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track) => {
            const Icon = track.icon;

            return (
              <div
                key={track.id}
                onClick={() => handleStartTrack(track.id)}
                className="group bg-[#0b1324] border border-[#162340] hover:border-purple-500/70 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex items-start gap-4 shadow-md hover:shadow-xl hover:shadow-purple-950/30"
              >
                <div className="w-10 h-10 rounded-xl bg-[#101b33] border border-[#192a4f] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Icon size={18} className={track.iconColor} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono font-bold text-xs text-slate-200 group-hover:text-purple-300 transition-colors">
                      {track.title}
                    </h3>
                    <span className="px-2 py-0.5 bg-[#121e38] border border-[#1c2d52] text-slate-400 group-hover:text-purple-300 text-[9px] font-mono font-bold rounded">
                      {track.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                    {track.desc}
                  </p>

                  <div className="pt-2 border-t border-[#131e36] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">{track.est}</span>
                    <span className="font-bold text-slate-300 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                      INITIATE ➔
                    </span>
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
