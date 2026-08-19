import React, { useState, useEffect } from 'react';
import { Clock, Radio, LogOut } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';

export default function PersonaHeader({ onEndInterview }) {
  const { activeSession } = useInterview();
  const [secondsLeft, setSecondsLeft] = useState(863); // 14:23

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

  const personaName = activeSession?.persona ? activeSession.persona.split('(')[0].trim() : 'Alex Rivera';

  return (
    <div className="flex items-center justify-between py-3 px-5 bg-white/90 backdrop-blur-xl border border-indigo-100/90 rounded-3xl shadow-sm shadow-indigo-900/5 mb-4 select-none">
      
      {/* Left Persona Info */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-600 p-[1.5px] shadow-md shadow-indigo-500/25">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-xs font-black text-indigo-600">
              AR
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-slate-800">{personaName}</span>
            <span className="text-[10px] text-slate-400 font-semibold">• AI Interviewer</span>
          </div>
          <h2 className="font-extrabold text-xs tracking-wider text-indigo-700 uppercase">
            {activeSession?.roleTitle || 'PRINCIPAL ARCHITECT AI'}
          </h2>
        </div>
      </div>

      {/* Right Recording Badge, Timer & Exit Button */}
      <div className="flex items-center gap-3 text-xs font-bold">
        
        {/* Live Recording Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-rose-700 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Live Session</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50/80 border border-indigo-100 rounded-full text-indigo-900 text-[11px]">
          <Clock size={13} className="text-indigo-600" />
          <span>{timeFormatted}</span>
        </div>

        {/* End Chamber Action */}
        <button
          onClick={onEndInterview}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
          title="Conclude Interview Session"
        >
          <LogOut size={13} />
          <span>End Chamber</span>
        </button>

      </div>

    </div>
  );
}
