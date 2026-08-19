import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useInterview } from '../../context/InterviewContext';
import { Moon, Sun, LogOut, Volume2, VolumeX, ShieldCheck, Sparkles, LayoutDashboard, Radio, Award, History, Settings, Info } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { aiStatus, isSpeaking, voiceEnabled, toggleVoice, activeSession } = useInterview();
  const [showDropdown, setShowDropdown] = useState(false);

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interview', label: 'Live Interview', icon: Radio, badge: activeSession ? 'ACTIVE' : null, disabled: !activeSession },
    { id: 'complete', label: 'Scorecards', icon: Award },
    { id: 'analytics', label: 'History', icon: History },
    { id: 'about', label: 'About', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070c18]/90 backdrop-blur-xl border-b border-[#141f38] transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Branding */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[10px] bg-[#090e1c] flex items-center justify-center font-bold text-white text-base">
              V
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-white">
              VIVORA
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
              AI
            </span>
          </div>
        </div>

        {/* Center Primary Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0b1326] border border-[#162444] p-1 rounded-2xl">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;

            return (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setCurrentView(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : tab.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : 'text-slate-400 hover:text-white hover:bg-[#121d38]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right System Indicators & Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Status Capsule */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0b1326] border border-[#162444] rounded-xl text-xs">
            {isSpeaking ? (
              <div className="flex items-center gap-0.5 h-3.5">
                <span className="live-bar"></span>
                <span className="live-bar"></span>
                <span className="live-bar"></span>
              </div>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
            <span className="text-slate-400 text-[11px]">Core:</span>
            <span className="text-indigo-300 font-bold text-[11px]">{aiStatus}</span>
          </div>

          {/* Voice Toggle */}
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-xl border transition-all ${
              voiceEnabled 
                ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800 shadow-sm'
                : 'bg-[#0b1326] text-slate-400 border-[#162444]'
            }`}
            title={voiceEnabled ? 'Voice Synthesis Enabled' : 'Voice Muted'}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-[#0b1326] hover:bg-[#121d38] border border-[#162444] hover:border-indigo-500/50 rounded-xl transition-all text-xs font-semibold text-slate-200 shadow-sm"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
                {user?.name ? user.name[0].toUpperCase() : 'C'}
              </div>
              <span className="hidden md:inline max-w-[100px] truncate">{user?.name || 'Candidate'}</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div 
                className="absolute right-0 mt-2 w-52 bg-[#0c1427] backdrop-blur-xl border border-[#1b2848] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div className="px-4 py-2 border-b border-[#141f38]">
                  <p className="font-bold text-xs text-white truncate">{user?.name || 'Candidate'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'demo@vivora.ai'}</p>
                </div>

                <button
                  onClick={() => { setCurrentView('settings'); setShowDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-300 hover:bg-[#131f3b] hover:text-white transition-colors flex items-center gap-2"
                >
                  <Settings size={14} className="text-indigo-400" /> Settings
                </button>

                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors flex items-center gap-2 border-t border-[#141f38] mt-1"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
