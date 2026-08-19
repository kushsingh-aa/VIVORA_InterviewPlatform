import React, { useEffect, useRef } from 'react';
import { useInterview } from '../../context/InterviewContext';
import { Activity, Sparkles, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

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
            
            {/* Interviewer Message */}
            {isInterviewer ? (
              <div className="flex items-start gap-3 max-w-2xl">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-[1.5px] shrink-0 mt-0.5 shadow-md shadow-indigo-500/20">
                  <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center text-xs font-bold text-indigo-600">
                    AR
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900">{personaName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{timeStr}</span>
                  </div>

                  {/* Interviewer White Speech Bubble */}
                  <div className="bg-white/95 backdrop-blur-md border border-indigo-100 border-l-4 border-l-indigo-600 rounded-3xl rounded-tl-sm p-4 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-sm shadow-indigo-950/5">
                    {msg.text}
                  </div>
                </div>
              </div>
            ) : (
              /* Candidate Message */
              <div className="max-w-2xl space-y-1.5 w-full flex flex-col items-end">
                <div className="flex items-center gap-2 text-xs pr-1">
                  <span className="text-[10px] text-slate-400 font-medium">{timeStr}</span>
                  <span className="font-bold text-indigo-700">You (Candidate)</span>
                </div>

                {/* Candidate Light Blue/Purple Bubble */}
                <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/90 to-purple-50/90 border border-indigo-200/90 border-r-4 border-r-indigo-600 rounded-3xl rounded-tr-sm p-4 text-xs sm:text-sm text-slate-900 leading-relaxed shadow-sm shadow-indigo-950/5 w-full max-w-xl">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Dynamic Accuracy & Clarity Status */}
                <div className="flex items-center justify-end gap-2 text-[10px] font-semibold pr-1">
                  {msg.isOffTopic ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-rose-700 shadow-sm">
                      <AlertTriangle size={11} className="text-rose-600" />
                      <span>⚠️ Off-Topic / Non-Answer</span>
                    </div>
                  ) : msg.clarityScore !== null && msg.clarityScore !== undefined ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-100 rounded-full shadow-sm text-slate-700">
                      {msg.clarityScore >= 80 ? (
                        <CheckCircle2 size={12} className="text-emerald-600" />
                      ) : msg.clarityScore >= 65 ? (
                        <Zap size={12} className="text-purple-600" />
                      ) : (
                        <AlertTriangle size={12} className="text-amber-600" />
                      )}
                      <span className={`font-bold ${
                        msg.clarityScore >= 80 ? 'text-emerald-700' : msg.clarityScore >= 65 ? 'text-purple-700' : 'text-amber-700'
                      }`}>
                        {msg.accuracyLabel || `Clarity: ${msg.clarityScore}%`}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-indigo-600 font-bold">{msg.wpm || 135} WPM</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-slate-500 animate-pulse text-[11px]">
                      <Sparkles size={12} className="text-purple-600" />
                      <span>Evaluating Response Quality...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        );
      })}

      {/* AI Thinking Indicator */}
      {isAiThinking && (
        <div className="flex items-start gap-3 max-w-xl animate-in fade-in duration-150">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-[1.5px] shrink-0 mt-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center text-xs font-bold text-indigo-600">
              AR
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-900">{personaName}</span>
              <span className="text-[10px] text-slate-400 font-medium">Formulating follow-up...</span>
            </div>

            <div className="bg-white border border-indigo-100 rounded-3xl rounded-tl-sm px-4 py-3 text-xs flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={streamEndRef} />
    </div>
  );
}
