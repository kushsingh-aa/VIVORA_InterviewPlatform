import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';

export default function PersonaHeader({ onEndInterview }) {
  const { activeSession, isSpeaking } = useInterview();
  const [secondsLeft, setSecondsLeft] = useState(863); // 14:23 default like screenshot

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
    <div className="flex items-center justify-between py-2 border-b border-[#141d33] mb-4">
      
      {/* Left Persona Info */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px]">
            <div className="w-full h-full rounded-full bg-[#0d1527] flex items-center justify-center text-sm font-mono font-bold text-white">
              AR
            </div>
          </div>
          <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-cyan-400 border-2 border-[#070b14] rounded-full"></span>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xs text-slate-400">{personaName}</span>
          </div>
          <h2 className="font-mono font-black text-xs sm:text-sm tracking-wider text-purple-300">
            PRINCIPAL ARCHITECT AI
          </h2>
        </div>
      </div>

      {/* Right Recording Badge & Timer */}
      <div className="flex items-center gap-3 font-mono text-xs">
        
        {/* Live Recording Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0b1324] border border-[#162340] rounded-full text-slate-300 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Recording</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0b1324] border border-[#162340] rounded-full text-slate-300 text-[11px] font-bold">
          <Clock size={13} className="text-slate-400" />
          <span>{timeFormatted}</span>
        </div>

        {/* Sleek End Chamber Action */}
        <button
          onClick={onEndInterview}
          className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-full text-[11px] font-mono font-bold transition-all"
          title="Conclude Interview Session"
        >
          End
        </button>

      </div>

    </div>
  );
}
