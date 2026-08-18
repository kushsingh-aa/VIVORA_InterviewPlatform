import React from 'react';
import { LayoutDashboard, Radio, Award, History, Settings, LifeBuoy } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';

export default function Sidebar({ currentView, setCurrentView }) {
  const { activeSession } = useInterview();

  const navItems = [
    { id: 'dashboard', label: 'Assessment Dashboard', icon: LayoutDashboard },
    { 
      id: 'interview', 
      label: 'Live Chamber', 
      icon: Radio, 
      badge: activeSession ? 'ACTIVE' : null,
      disabled: !activeSession 
    },
    { id: 'complete', label: 'Evaluation Scorecards', icon: Award },
    { id: 'analytics', label: 'History Archive', icon: History },
    { id: 'support', label: 'Assistance Matrix', icon: LifeBuoy },
    { id: 'settings', label: 'Settings & API Keys', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 dark:border-[#141d33] bg-white/40 dark:bg-[#070b14]/40 backdrop-blur-xl p-5 space-y-6 select-none">
      
      {/* Platform Channel Badge */}
      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50/50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-3xl shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
            Autonomous Core
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-200 font-bold">
          Vivora AI Platform v2.0
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-bold text-xs md:text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                  : item.disabled
                  ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#0c1427] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-black tracking-wider animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-6 border-t border-slate-200 dark:border-[#141d33] text-[11px] text-slate-400 font-medium space-y-1.5">
        <p className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span>OpenRouter Multi-Model</span>
        </p>
        <p className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Full Multimodal Voice & STT</span>
        </p>
      </div>
    </aside>
  );
}
