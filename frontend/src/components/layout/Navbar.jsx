import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInterview } from '../../context/InterviewContext';
import { Search, Bell, LogOut, Settings, Shield } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const { user, logout } = useAuth();
  const { activeSession } = useInterview();
  const [showDropdown, setShowDropdown] = useState(false);

  const userName = user?.name || 'Dr. Aris Thorne';
  const userRole = user?.role === 'candidate' ? 'Lead Architect' : 'Lead Architect';

  return (
    <header className="h-16 bg-[#070b14] border-b border-[#141d33] px-6 flex items-center justify-between sticky top-0 z-50">
      
      {/* Left Logo */}
      <div 
        onClick={() => setCurrentView('dashboard')}
        className="flex items-center gap-3 cursor-pointer select-none"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-purple-500/20">
          ⚡
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono font-black text-sm tracking-wider text-white">VIVORA</span>
          <span className="font-mono font-bold text-xs tracking-widest text-indigo-400">AI</span>
        </div>
      </div>

      {/* Center Search Pill */}
      <div className="hidden md:flex items-center w-full max-w-md mx-8">
        <div className="w-full relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search neural network..."
            className="w-full bg-[#0b1222] border border-[#17233f] text-slate-200 placeholder-slate-500 text-xs rounded-full pl-10 pr-4 py-2 outline-none focus:border-indigo-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right User & Notification */}
      <div className="flex items-center gap-5">
        
        {/* Notification Bell */}
        <button 
          className="relative p-2 text-slate-400 hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <div 
            onClick={() => setShowDropdown(prev => !prev)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-mono font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                {userName}
              </p>
              <p className="text-[10px] font-mono text-slate-400 tracking-wider">
                {userRole}
              </p>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] shadow-sm">
              <div className="w-full h-full rounded-full bg-[#0b1222] flex items-center justify-center text-xs font-mono font-bold text-slate-200">
                {userName.charAt(0)}
              </div>
            </div>
          </div>

          {/* User Dropdown */}
          {showDropdown && (
            <div 
              className="absolute right-0 mt-2 w-52 bg-[#0c1427] border border-[#1b2848] rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowDropdown(false)}
            >
              <div className="px-4 py-2 border-b border-[#141f38]">
                <p className="text-xs font-mono font-bold text-white truncate">{userName}</p>
                <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email || 'authenticated'}</p>
              </div>

              <button
                onClick={() => { setCurrentView('settings'); setShowDropdown(false); }}
                className="w-full px-4 py-2 text-left text-xs font-mono text-slate-300 hover:bg-[#152242] hover:text-white flex items-center gap-2"
              >
                <Settings size={13} /> Settings & API
              </button>

              <button
                onClick={() => { logout(); setShowDropdown(false); }}
                className="w-full px-4 py-2 text-left text-xs font-mono font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 border-t border-[#141f38] mt-1"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
