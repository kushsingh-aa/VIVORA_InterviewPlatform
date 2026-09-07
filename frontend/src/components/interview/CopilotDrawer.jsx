import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';

export default function CopilotDrawer({ isOpen, onClose }) {
  const [inputQuery, setInputQuery] = useState('');
  const { copilotMessages, sendCopilotMessage } = useInterview();
  const streamEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages, isOpen]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;
    sendCopilotMessage(inputQuery.trim());
    setInputQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-slate-200 shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <Bot size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900">Interview Copilot</h3>
            <p className="text-[10px] text-slate-400">Ask for hints or frameworks</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {copilotMessages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={idx} className={`text-xs leading-relaxed p-3 rounded-lg ${isUser ? 'bg-indigo-600 text-white ml-8' : 'bg-slate-50 border border-slate-200 text-slate-700 mr-4'}`}>
              {msg.text}
            </div>
          );
        })}
        <div ref={streamEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-3 py-2 border-t border-slate-100 flex flex-wrap gap-1.5">
        <button onClick={() => sendCopilotMessage('Give me a STAR structure for this question.')} className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-600 hover:text-indigo-600">STAR Framework</button>
        <button onClick={() => sendCopilotMessage('What trade-offs should I consider?')} className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-600 hover:text-indigo-600">Trade-offs</button>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask for help..."
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
        />
        <button type="submit" disabled={!inputQuery.trim()} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs disabled:opacity-40 hover:bg-indigo-700">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
