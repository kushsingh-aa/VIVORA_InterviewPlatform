import React, { useState, useEffect } from 'react';
import { Volume2, StopCircle, Clock, Sparkles } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';

export default function PersonaHeader({ onEndInterview }) {
  const { activeSession, aiStatus, repeatVoice, isSpeaking } = useInterview();
  const [secondsLeft, setSecondsLeft] = useState(1200);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onEndInterview]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const personaAvatar = activeSession?.track === 'product' ? '📊' :
                        activeSession?.track === 'system_design' ? '🏗️' :
                        activeSession?.track === 'behavioral' ? '🤝' : '🤖';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      
      {/* Left Persona Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-md shadow-indigo-500/20">
            {personaAvatar}
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              {activeSession?.persona ? activeSession.persona.split('(')[0].trim() : 'Alex Rivera'}
            </h3>
            <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md text-[11px] font-bold">
              🎯 {activeSession?.difficulty || 'Senior'} Level
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            {activeSession?.roleTitle || 'Senior Software Engineer'}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        
        {/* Replay Voice */}
        <button
          onClick={repeatVoice}
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5"
          title="Replay Voice"
        >
          <Volume2 size={15} className={isSpeaking ? "text-indigo-600 animate-bounce" : ""} />
          <span>Replay Voice</span>
        </button>

        {/* Countdown Timer */}
        <div className="flex items-center gap-1.5 font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
          <Clock size={14} />
          <span>{timeFormatted} remaining</span>
        </div>

        {/* End Chamber Button */}
        <button
          onClick={onEndInterview}
          className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
        >
          <StopCircle size={14} />
          <span>End Chamber 🛑</span>
        </button>
      </div>

    </div>
  );
}
