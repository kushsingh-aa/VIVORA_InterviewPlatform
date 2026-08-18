import React, { useEffect, useRef } from 'react';
import { useInterview } from '../../context/InterviewContext';
import { Bot, User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ChatStream() {
  const { history, isAiThinking } = useInterview();
  const streamEndRef = useRef(null);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAiThinking]);

  // Format markdown helper
  const renderFormattedText = (text) => {
    if (!text) return null;
    const paragraphs = text.split('\n\n');

    return paragraphs.map((p, pIdx) => {
      // Bold rendering
      const parts = p.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={pIdx} className="mb-2 last:mb-0 leading-relaxed text-sm">
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx} className="font-bold text-indigo-900 dark:text-indigo-200">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 h-[460px] overflow-y-auto space-y-4 relative">
      
      {history.map((msg, index) => {
        const isInterviewer = msg.speaker === 'interviewer';

        return (
          <div
            key={index}
            className={`flex items-start gap-3 ${isInterviewer ? 'justify-start' : 'justify-end'}`}
          >
            {/* Interviewer Avatar */}
            {isInterviewer && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-indigo-500/20">
                🤖
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-2xl rounded-2xl p-4 space-y-2 text-sm shadow-sm ${
                isInterviewer
                  ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                  : 'bg-indigo-600 text-white rounded-tr-sm'
              }`}
            >
              {/* Optional Badges for Interviewer */}
              {isInterviewer && msg.isFollowUp && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-md text-[11px] font-bold uppercase tracking-wider mb-1">
                  🔍 Deep-Dive Follow-up Probe
                </div>
              )}

              {/* Message Content */}
              <div>
                {renderFormattedText(msg.text)}
              </div>

              {/* Real-time Evaluation Rubric Chips */}
              {msg.evaluation && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/80 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-bold">
                      ⭐ Rubric: {msg.evaluation.overallScore}%
                    </span>
                    <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold">
                      🛠️ Tech Depth: {msg.evaluation.technicalDepth}%
                    </span>
                    <span className="px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-md text-xs font-bold">
                      💡 Problem Solving: {msg.evaluation.problemSolving}%
                    </span>
                  </div>

                  {msg.evaluation.highlights?.length > 0 && (
                    <div className="flex items-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                      <span>{msg.evaluation.highlights[0]}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className={`text-[10px] font-medium text-right ${isInterviewer ? 'text-slate-400' : 'text-indigo-200'}`}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>

            {/* Candidate Avatar */}
            {!isInterviewer && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold text-sm shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        );
      })}

      {/* AI Thinking / Typing Indicator */}
      {isAiThinking && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm shrink-0 shadow-md">
            🤖
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
            <span>AI Interviewer is analyzing response & drafting follow-up...</span>
          </div>
        </div>
      )}

      <div ref={streamEndRef} />
    </div>
  );
}
