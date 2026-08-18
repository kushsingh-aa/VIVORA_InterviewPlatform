import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useInterview } from '../../context/InterviewContext';
import { Moon, Sun, Bot, LogOut, User, Sparkles, Volume2, VolumeX } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { aiStatus, isSpeaking, voiceEnabled, toggleVoice } = useInterview();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Branding */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">VIVORA</span>
              <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Assessment Portal</p>
          </div>
        </div>

        {/* Center Live AI Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold">
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`}></span>
          <span className="text-slate-600 dark:text-slate-300">AI Core:</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{aiStatus}</span>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2.5">
          
          {/* Voice Toggle */}
          <button
            onClick={toggleVoice}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={voiceEnabled ? 'AI Voice Enabled' : 'AI Voice Muted'}
          >
            {voiceEnabled ? <Volume2 size={18} className="text-indigo-600 dark:text-indigo-400" /> : <VolumeX size={18} className="text-slate-400" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline max-w-[120px] truncate">{user?.name || 'Candidate'}</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => { setCurrentView('settings'); setShowDropdown(false); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-indigo-600" /> Platform Settings
                </button>

                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
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
