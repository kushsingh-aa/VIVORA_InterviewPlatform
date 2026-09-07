import React, { useState, useEffect, useRef } from 'react';
import { Clock, LogOut } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';

export default function PersonaHeader({ onEndInterview }) {
  const { activeSession } = useInterview();
  const [secondsLeft, setSecondsLeft] = useState(863); // ~14 min
  const onEndRef = useRef(onEndInterview);
  onEndRef.current = onEndInterview;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onEndRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const personaName = activeSession?.persona ? activeSession.persona.split('(')[0].trim() : 'Interviewer';

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-white border border-slate-200 rounded-xl mb-2">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold">
          {personaName.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{personaName}</p>
          <p className="text-xs text-slate-500">{activeSession?.roleTitle || 'AI Interviewer'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-rose-600 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="hidden sm:inline">Live</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700">
          <Clock size={13} className="text-slate-400" />
          <span>{timeFormatted}</span>
        </div>

        <button
          onClick={onEndInterview}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-xs font-medium transition-colors"
        >
          <LogOut size={13} />
          <span>End</span>
        </button>
      </div>
    </div>
  );
}
