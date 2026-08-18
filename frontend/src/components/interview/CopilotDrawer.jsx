import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';

export default function CopilotDrawer({ isOpen, onClose }) {
  const [inputQuery, setInputQuery] = useState('');
  const { copilotMessages, sendCopilotMessage } = useInterview();
  const streamEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotMessages, isOpen]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;
    const q = inputQuery.trim();
    setInputQuery('');
    sendCopilotMessage(q);
  };

  const renderFormatted = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-indigo-900 dark:text-indigo-200">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-sm">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Vivora AI Copilot</h3>
            <p className="text-[10px] text-slate-400">In-Session Coaching Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {copilotMessages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={index}
              className={`p-3 rounded-xl text-xs leading-relaxed ${
                isUser
                  ? 'bg-indigo-600 text-white ml-6 font-medium'
                  : 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-slate-700 dark:text-slate-300 mr-4'
              }`}
            >
              {renderFormatted(msg.text)}
            </div>
          );
        })}
        <div ref={streamEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap gap-1.5">
        <button
          onClick={() => sendCopilotMessage('Give me a quick STAR structure for this question.')}
          className="text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-indigo-600"
        >
          📋 STAR Framework
        </button>
        <button
          onClick={() => sendCopilotMessage('What trade-offs should I consider for this architecture?')}
          className="text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-indigo-600"
        >
          ⚖️ Key Trade-offs
        </button>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask Copilot for tips, structure, or hints..."
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim()}
          className="px-3 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs disabled:opacity-50 hover:bg-indigo-700 shadow-sm"
        >
          <Send size={14} />
        </button>
      </form>

    </div>
  );
}
