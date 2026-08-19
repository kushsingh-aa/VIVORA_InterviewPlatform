import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInterview } from '../../context/InterviewContext';
import { LogOut, Volume2, VolumeX, ShieldCheck, LayoutDashboard, Radio, Award, History, Settings, Info } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const { user, logout } = useAuth();
  const { aiStatus, isSpeaking, voiceEnabled, toggleVoice, activeSession } = useInterview();
  const [showDropdown, setShowDropdown] = useState(false);

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interview', label: 'Live Chamber', icon: Radio, badge: activeSession ? 'ACTIVE' : null, disabled: !activeSession },
    { id: 'complete', label: 'Scorecards', icon: Award },
    { id: 'analytics', label: 'History', icon: History },
    { id: 'about', label: 'About', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-indigo-100/80 shadow-sm shadow-indigo-950/5 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Branding */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-600 p-[1.5px] shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-tr from-indigo-600 to-purple-600 text-lg">
              V
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              VIVORA
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm">
              AI
            </span>
          </div>
        </div>

        {/* Center Primary Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f1f5fd] border border-indigo-100/80 p-1.5 rounded-2xl shadow-inner">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;

            return (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setCurrentView(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-md shadow-indigo-500/30'
                    : tab.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-white/80'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right System Indicators & Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Status Capsule */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-[#f4f7fe] border border-indigo-100 rounded-2xl text-xs font-semibold text-slate-700 shadow-sm">
            {isSpeaking ? (
              <div className="flex items-center gap-0.5 h-3.5">
                <span className="live-bar"></span>
                <span className="live-bar"></span>
                <span className="live-bar"></span>
              </div>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
            <span className="text-slate-500 text-[11px]">AI Engine:</span>
            <span className="text-indigo-600 font-bold text-[11px]">{aiStatus}</span>
          </div>

          {/* Voice Toggle */}
          <button
            onClick={toggleVoice}
            className={`p-2.5 rounded-2xl border transition-all ${
              voiceEnabled 
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm'
                : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
            }`}
            title={voiceEnabled ? 'Voice Output Active' : 'Voice Output Muted'}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className="flex items-center gap-2 pl-2 pr-3.5 py-1.5 bg-white hover:bg-slate-50 border border-indigo-100 hover:border-indigo-300 rounded-2xl transition-all text-xs font-bold text-slate-800 shadow-sm"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                {user?.name ? user.name[0].toUpperCase() : 'C'}
              </div>
              <span className="hidden md:inline max-w-[100px] truncate">{user?.name || 'Candidate'}</span>
            </button>

            {showDropdown && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-2xl border border-indigo-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-bold text-xs text-slate-900 truncate">{user?.name || 'Candidate'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email || 'demo@vivora.ai'}</p>
                </div>

                <button
                  onClick={() => { setCurrentView('settings'); setShowDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                >
                  <Settings size={14} className="text-indigo-500" /> Platform Settings
                </button>

                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 border-t border-slate-100 mt-1"
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
