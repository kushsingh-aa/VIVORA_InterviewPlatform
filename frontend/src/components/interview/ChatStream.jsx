import React, { useEffect, useRef } from 'react';
import { useInterview } from '../../context/InterviewContext';
import { Activity, Sparkles, CheckCircle2, AlertTriangle, Zap, HelpCircle } from 'lucide-react';

export default function ChatStream() {
  const { history, isAiThinking, activeSession } = useInterview();
  const streamEndRef = useRef(null);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAiThinking]);

  const personaName = activeSession?.persona ? activeSession.persona.split('(')[0].trim() : 'Alex Rivera';

  return (
    <div className="h-[430px] overflow-y-auto space-y-6 pr-2">
      
      {history.map((msg, index) => {
        const isInterviewer = msg.speaker === 'interviewer';
        const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:05 AM';

        return (
          <div key={index} className={`flex flex-col ${isInterviewer ? 'items-start' : 'items-end'}`}>
            
            {/* Interviewer Message Structure */}
            {isInterviewer ? (
              <div className="flex items-start gap-3 max-w-xl">
                {/* Persona Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] shrink-0 mt-0.5">
                  <div className="w-full h-full rounded-full bg-[#0d1527] flex items-center justify-center text-xs font-mono font-bold text-white">
                    AR
                  </div>
                </div>

                <div className="space-y-1.5">
                  {/* Speaker Name & Timestamp */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-slate-200">{personaName}</span>
                    <span className="text-[10px] text-slate-500">{timeStr}</span>
                  </div>

                  {/* Bubble */}
                  <div className="bg-[#0f172a] border border-[#1b2848] rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal shadow-md">
                    {msg.text}
                  </div>
                </div>
              </div>
            ) : (
              /* Candidate Message Structure with Real-Time Dynamic Clarity AI */
              <div className="max-w-xl space-y-1.5">
                <div className="bg-[#101a2f] border border-[#1c2d52] rounded-2xl rounded-tr-sm p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal shadow-md">
                  {msg.text}
                </div>

                {/* Accuracy & Clarity AI Status (Omitted for Off-Topic Responses) */}
                <div className="flex items-center justify-end gap-2 text-[10px] font-mono">
                  {msg.isOffTopic ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-950/40 border border-rose-900/60 rounded-full text-rose-300">
                      <AlertTriangle size={11} className="text-rose-400" />
                      <span className="font-bold">⚠️ Off-Topic / Non-Answer</span>
                    </div>
                  ) : msg.clarityScore !== null && msg.clarityScore !== undefined ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0c1426] border border-[#1a284a] rounded-full">
                      {msg.clarityScore >= 80 ? (
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      ) : msg.clarityScore >= 65 ? (
                        <Zap size={11} className="text-purple-400" />
                      ) : (
                        <AlertTriangle size={11} className="text-amber-400" />
                      )}
                      <span className={`font-bold ${
                        msg.clarityScore >= 80 ? 'text-emerald-300' : msg.clarityScore >= 65 ? 'text-purple-300' : 'text-amber-300'
                      }`}>
                        {msg.accuracyLabel || `Clarity: ${msg.clarityScore}%`}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-cyan-400 font-bold">{msg.wpm || 135} WPM</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-slate-500 animate-pulse">
                      <Sparkles size={11} className="text-purple-400" />
                      <span>Evaluating Response...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        );
      })}

      {/* AI Thinking / Typing Indicator Dots */}
      {isAiThinking && (
        <div className="flex items-start gap-3 max-w-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] shrink-0 mt-0.5">
            <div className="w-full h-full rounded-full bg-[#0d1527] flex items-center justify-center text-xs font-mono font-bold text-white">
              AR
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-slate-200">{personaName}</span>
            </div>

            <div className="bg-[#0f172a] border border-[#1b2848] rounded-2xl rounded-tl-sm px-4 py-3 text-xs flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={streamEndRef} />
    </div>
  );
}
