import React from 'react';
import { LayoutDashboard, Radio, Award, History, Settings } from 'lucide-react';
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
    { id: 'settings', label: 'Settings & API Keys', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 space-y-6">
      
      {/* Platform Channel Badge */}
      <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">Live AI Engine</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Multimodal AI Interview Chamber v2.0</p>
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
              className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : item.disabled
                  ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
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
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-medium space-y-1">
        <p>⚡ Powered by OpenRouter</p>
        <p>🎙️ Multimodal Voice & STT</p>
      </div>
    </aside>
  );
}
