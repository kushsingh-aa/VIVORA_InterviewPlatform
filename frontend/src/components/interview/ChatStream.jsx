import React, { useEffect, useRef } from 'react';
import { useInterview } from '../../context/InterviewContext';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ChatStream() {
  const { history, isAiThinking, activeSession } = useInterview();
  const streamEndRef = useRef(null);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAiThinking]);

  const personaName = activeSession?.persona ? activeSession.persona.split('(')[0].trim() : 'Interviewer';

  return (
    <div className="h-[460px] overflow-y-auto space-y-4 pr-1">
      {history.map((msg, index) => {
        const isInterviewer = msg.speaker === 'interviewer';
        const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        return (
          <div key={index} className={`flex ${isInterviewer ? 'justify-start' : 'justify-end'} animate-fade-up`}>
            <div className={`max-w-[85%] ${isInterviewer ? '' : 'flex flex-col items-end'}`}>
              {isInterviewer && (
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-md flex items-center justify-center text-[10px] font-bold">
                    {personaName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium text-slate-700">{personaName}</span>
                  <span className="text-[10px] text-slate-400">{timeStr}</span>
                </div>
              )}

              {!isInterviewer && (
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] text-slate-400">{timeStr}</span>
                  <span className="text-xs font-medium text-slate-700">You</span>
                </div>
              )}

              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                isInterviewer
                  ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  : 'bg-indigo-600 text-white rounded-tr-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>

              {/* Candidate evaluation tag */}
              {!isInterviewer && msg.clarityScore !== null && msg.clarityScore !== undefined && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                  {msg.isOffTopic ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-full">
                      <AlertTriangle size={10} /> Off-topic
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-full">
                      <CheckCircle2 size={10} className={msg.clarityScore >= 80 ? 'text-emerald-500' : 'text-amber-500'} />
                      {msg.accuracyLabel || `Score: ${msg.clarityScore}%`}
                      <span className="text-slate-400 ml-1">{msg.wpm || 135} WPM</span>
                    </span>
                  )}
                </div>
              )}

              {!isInterviewer && msg.clarityScore === null && msg.clarityScore !== undefined && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  Evaluating...
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {isAiThinking && (
        <div className="flex justify-start animate-fade-up">
          <div className="max-w-[85%]">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-md flex items-center justify-center text-[10px] font-bold">
                {personaName.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <span className="text-xs font-medium text-slate-700">{personaName}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300 typing-dot"></span>
              <span className="w-2 h-2 rounded-full bg-slate-300 typing-dot"></span>
              <span className="w-2 h-2 rounded-full bg-slate-300 typing-dot"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={streamEndRef} />
    </div>
  );
}
