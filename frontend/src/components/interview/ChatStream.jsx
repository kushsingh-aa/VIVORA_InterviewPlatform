import React, { useEffect, useRef } from 'react';
import { useInterview } from '../../context/InterviewContext';
import { Activity, Sparkles, CheckCircle2, AlertTriangle, Zap, User } from 'lucide-react';

export default function ChatStream() {
  const { history, isAiThinking, activeSession } = useInterview();
  const streamEndRef = useRef(null);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAiThinking]);

  const personaName = activeSession?.persona ? activeSession.persona.split('(')[0].trim() : 'Alex Rivera';

  return (
    <div className="h-[460px] overflow-y-auto space-y-5 pr-2 custom-scrollbar">
      
      {history.map((msg, index) => {
        const isInterviewer = msg.speaker === 'interviewer';
        const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:05 AM';

        return (
          <div key={index} className={`flex flex-col ${isInterviewer ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}>
            
            {/* Interviewer Message Structure */}
            {isInterviewer ? (
              <div className="flex items-start gap-3 max-w-2xl">
                {/* Persona Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] shrink-0 mt-0.5 shadow-md">
                  <div className="w-full h-full rounded-full bg-[#0d1527] flex items-center justify-center text-xs font-mono font-bold text-white">
                    AR
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  {/* Speaker Name & Timestamp */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-purple-300">{personaName}</span>
                    <span className="text-[10px] text-slate-500">{timeStr}</span>
                  </div>

                  {/* Interviewer Speech Bubble */}
                  <div className="bg-[#0e1628] border border-[#1a2748] border-l-2 border-l-purple-500/80 rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal shadow-lg">
                    {msg.text}
                  </div>
                </div>
              </div>
            ) : (
              /* Candidate Message Structure with Real-Time Dynamic Clarity AI */
              <div className="max-w-2xl space-y-1.5 w-full flex flex-col items-end">
                
                <div className="flex items-center gap-2 font-mono text-xs pr-1">
                  <span className="text-[10px] text-slate-500">{timeStr}</span>
                  <span className="font-bold text-cyan-400">You (Candidate)</span>
                </div>

                {/* Candidate Answer Bubble */}
                <div className="bg-[#0f1d3a] border border-[#1c305a] border-r-2 border-r-cyan-400/90 rounded-2xl rounded-tr-sm p-4 text-xs sm:text-sm text-slate-100 leading-relaxed font-normal shadow-lg w-full max-w-xl">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Accuracy & Clarity AI Status */}
                <div className="flex items-center justify-end gap-2 text-[10px] font-mono pr-1">
                  {msg.isOffTopic ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-950/50 border border-rose-800/80 rounded-full text-rose-300">
                      <AlertTriangle size={11} className="text-rose-400" />
                      <span className="font-bold">⚠️ Off-Topic / Non-Answer</span>
                    </div>
                  ) : msg.clarityScore !== null && msg.clarityScore !== undefined ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#091124] border border-[#1b2b4e] rounded-full shadow-sm">
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
                      <span className="text-slate-600">•</span>
                      <span className="text-cyan-400 font-bold">{msg.wpm || 135} WPM</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-slate-400 animate-pulse text-[11px]">
                      <Sparkles size={12} className="text-purple-400" />
                      <span>Evaluating Technical Depth...</span>
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
        <div className="flex items-start gap-3 max-w-xl animate-in fade-in duration-150">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] shrink-0 mt-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-[#0d1527] flex items-center justify-center text-xs font-mono font-bold text-white">
              AR
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-purple-300">{personaName}</span>
              <span className="text-[10px] text-slate-500 font-normal">Analyzing your response...</span>
            </div>

            <div className="bg-[#0e1628] border border-[#1a2748] rounded-2xl rounded-tl-sm px-4 py-3 text-xs flex items-center gap-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={streamEndRef} />
    </div>
  );
}
