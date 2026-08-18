import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useInterview } from '../../context/InterviewContext';
import { Moon, Sun, Bot, LogOut, Sparkles, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { aiStatus, isSpeaking, voiceEnabled, toggleVoice } = useInterview();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#141d33] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Branding */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              🤖
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#070b14] rounded-full animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-white dark:via-slate-200 dark:to-indigo-300 bg-clip-text text-transparent">
                VIVORA
              </span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
              Assessment Portal
            </p>
          </div>
        </div>

        {/* Center Live AI Status Pill */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-slate-100/80 dark:bg-[#0c1427] border border-slate-200 dark:border-[#17233f] rounded-full text-xs font-semibold backdrop-blur-md shadow-inner">
          <div className="flex items-center gap-1.5">
            {isSpeaking ? (
              <div className="flex items-center gap-0.5 h-4">
                <span className="live-bar"></span>
                <span className="live-bar"></span>
                <span className="live-bar"></span>
                <span className="live-bar"></span>
                <span className="live-bar"></span>
              </div>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">AI Core:</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{aiStatus}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck size={13} /> MongoDB Atlas
          </span>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          
          {/* Voice Toggle */}
          <button
            onClick={toggleVoice}
            className={`p-2.5 rounded-xl border transition-all ${
              voiceEnabled 
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/80 shadow-sm'
                : 'bg-slate-100 dark:bg-[#0c1427] text-slate-400 border-slate-200 dark:border-[#17233f]'
            }`}
            title={voiceEnabled ? 'AI Voice Enabled (Click to Mute)' : 'AI Voice Muted (Click to Enable)'}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#0c1427] border border-slate-200 dark:border-[#17233f] text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-gradient-to-r from-slate-100 to-indigo-50/50 dark:from-[#0c1427] dark:to-indigo-950/40 hover:border-indigo-500/50 rounded-xl transition-all text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#17233f] shadow-sm"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black shadow-inner">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline max-w-[120px] truncate">{user?.name || 'Candidate'}</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#0c1427]/95 backdrop-blur-xl border border-slate-200 dark:border-[#1b2848] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#141f38]">
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{user?.name || 'Candidate'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || 'demo@vivora.ai'}</p>
                </div>

                <button
                  onClick={() => { setCurrentView('settings'); setShowDropdown(false); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors flex items-center gap-2.5"
                >
                  <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" /> Platform Settings
                </button>

                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2.5 border-t border-slate-100 dark:border-[#141f38] mt-1"
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
