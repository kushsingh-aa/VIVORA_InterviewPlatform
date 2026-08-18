import React from 'react';
import { LayoutGrid, Cpu, RotateCcw, HelpCircle } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';

export default function Sidebar({ currentView, setCurrentView }) {
  const { activeSession } = useInterview();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { 
      id: 'interview', 
      label: 'Assessments', 
      icon: Cpu,
      disabled: false 
    },
    { id: 'analytics', label: 'History', icon: RotateCcw },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <aside className="w-56 shrink-0 hidden md:flex flex-col justify-between border-r border-[#141d33] bg-[#070b14] p-4 select-none">
      
      {/* Navigation Links */}
      <nav className="space-y-2 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            (item.id === 'dashboard' && currentView === 'dashboard') ||
            (item.id === 'interview' && (currentView === 'interview' || currentView === 'complete')) ||
            (item.id === 'analytics' && currentView === 'analytics') ||
            (item.id === 'support' && currentView === 'support');

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'interview' && !activeSession) {
                  setCurrentView('dashboard');
                } else {
                  setCurrentView(item.id);
                }
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-mono text-xs tracking-wider transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-950/80 via-indigo-950/60 to-purple-900/40 text-purple-300 border border-purple-800/60 shadow-lg shadow-purple-950/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1427]'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-purple-400' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Chip */}
      <div className="p-3 bg-[#0c1322] border border-[#17233f] rounded-xl flex items-center gap-2.5 text-[11px] font-mono text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse"></span>
        <span className="tracking-wider">System: Online</span>
      </div>

    </aside>
  );
}
