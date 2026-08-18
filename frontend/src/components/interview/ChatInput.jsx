import React, { useState } from 'react';
import { Mic, Send, Lightbulb, Trash2, LayoutTemplate } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function ChatInput({ onComplete }) {
  const [inputText, setInputText] = useState('');
  const [hintText, setHintText] = useState(null);
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const { submitAnswer, requestHint, isAiThinking } = useInterview();

  const { isRecording, toggleRecording, isSupported } = useSpeechRecognition({
    onTranscriptUpdate: (newText) => {
      setInputText(prev => (prev ? `${prev} ${newText}` : newText));
    }
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isAiThinking) return;

    const text = inputText.trim();
    setInputText('');
    setHintText(null);

    const result = await submitAnswer(text);
    if (result?.isComplete && onComplete) {
      onComplete(result.report);
    }
  };

  const insertTemplate = (type) => {
    if (type === 'star') {
      setInputText(prev => (prev ? prev + '\n\n' : '') + 
        `**1. Situation:** (Describe the context & business impact)\n**2. Task:** (The core architectural problem)\n**3. Action:** (Concrete tools, algorithms, patterns I designed)\n**4. Result:** (Quantifiable outcome, e.g. 40% latency reduction)`);
    } else if (type === 'tradeoff') {
      setInputText(prev => (prev ? prev + '\n\n' : '') + 
        `**Immediate Mitigation:** (Triage & rate limit)\n**Architectural Root Cause:** (System bottleneck analysis)\n**Long-term Resilient Design:** (Caching, Event streaming, Read replicas)\n**Tradeoffs & Failure Modes:** (Consistency vs Availability)`);
    }
  };

  const handleHintClick = async () => {
    setIsRequestingHint(true);
    const hint = await requestHint();
    setHintText(hint);
    setIsRequestingHint(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
      
      {/* Targeted Hint Card */}
      {hintText && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Interviewer Hint: </span>
              <span>{hintText}</span>
            </div>
          </div>
          <button 
            onClick={() => setHintText(null)}
            className="text-amber-500 hover:text-amber-700 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
          placeholder="Type your technical response, reasoning, and architectural trade-offs (or click 'Record Voice')..."
          className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 transition-all text-sm resize-y"
        />

        {/* Word count */}
        <div className="absolute right-3 bottom-3 text-[11px] text-slate-400 font-medium select-none pointer-events-none">
          {inputText.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Helpers */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Microphone STT Button */}
          {isSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                isRecording
                  ? 'bg-red-500 text-white border-red-600 shadow-md shadow-red-500/20 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Mic size={16} />
              <span>{isRecording ? 'Listening... (Speak Now)' : 'Record Voice'}</span>
            </button>
          )}

          {/* Template Buttons */}
          <button
            type="button"
            onClick={() => insertTemplate('star')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-all"
            title="Insert STAR Template"
          >
            <LayoutTemplate size={13} />
            <span>STAR Template</span>
          </button>

          <button
            type="button"
            onClick={() => insertTemplate('tradeoff')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-all"
            title="Insert Architecture Tradeoff Template"
          >
            <span>⚖️ Tradeoffs</span>
          </button>

          {/* Need a Hint */}
          <button
            type="button"
            disabled={isRequestingHint}
            onClick={handleHintClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold transition-all"
          >
            <Lightbulb size={13} />
            <span>{isRequestingHint ? 'Fetching...' : 'Need a Hint?'}</span>
          </button>

          {/* Clear */}
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Clear text"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          disabled={!inputText.trim() || isAiThinking}
          onClick={handleSubmit}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white transition-all shadow-md ${
            !inputText.trim() || isAiThinking
              ? 'bg-slate-400 cursor-not-allowed opacity-60'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 active:scale-95'
          }`}
        >
          <span>Submit Response</span>
          <Send size={15} />
        </button>

      </div>

    </div>
  );
}
