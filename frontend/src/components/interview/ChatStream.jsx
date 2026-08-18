import React, { useEffect, useRef } from 'react';
import { useInterview } from '../../context/InterviewContext';
import { Activity } from 'lucide-react';

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
              /* Candidate Message Structure */
              <div className="max-w-xl space-y-1.5">
                <div className="bg-[#101a2f] border border-[#1c2d52] rounded-2xl rounded-tr-sm p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal shadow-md">
                  {msg.text}
                </div>

                {/* Sub-telemetry clarity marker */}
                <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-slate-500">
                  <Activity size={11} className="text-cyan-400" />
                  <span>Clarity: 92%</span>
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
