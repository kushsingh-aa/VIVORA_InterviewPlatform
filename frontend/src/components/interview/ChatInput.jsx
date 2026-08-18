import React, { useState } from 'react';
import { Mic, Send, Bot } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function ChatInput({ onComplete, onToggleCopilot }) {
  const [inputText, setInputText] = useState('');
  const { submitAnswer, isAiThinking } = useInterview();

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

    const result = await submitAnswer(text);
    if (result?.isComplete && onComplete) {
      onComplete(result.report);
    }
  };

  return (
    <div className="flex items-center gap-3 pt-3">
      
      {/* Main Unified Input Dock */}
      <div className="flex-1 bg-[#0b1324] border border-[#17233f] rounded-2xl p-2 flex items-center gap-3 shadow-lg">
        
        {/* Microphone Button */}
        {isSupported && (
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 rounded-xl transition-all ${
              isRecording
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-[#101b33]'
            }`}
            title="Record Voice"
          >
            <Mic size={16} />
          </button>
        )}

        {/* Audio Waveform Graphic */}
        <div className="hidden sm:flex items-center gap-1 px-1 h-5 select-none">
          <span className="mini-equalizer-bar" style={{ height: isRecording ? '14px' : '6px' }}></span>
          <span className="mini-equalizer-bar" style={{ height: isRecording ? '18px' : '10px' }}></span>
          <span className="mini-equalizer-bar" style={{ height: isRecording ? '12px' : '16px' }}></span>
          <span className="mini-equalizer-bar" style={{ height: isRecording ? '20px' : '8px' }}></span>
          <span className="mini-equalizer-bar" style={{ height: isRecording ? '10px' : '12px' }}></span>
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
          placeholder="Type your response..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none font-normal px-1"
        />

        {/* Submit Button */}
        <button
          type="button"
          disabled={!inputText.trim() || isAiThinking}
          onClick={handleSubmit}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono font-bold text-xs tracking-wider transition-all shadow-md ${
            !inputText.trim() || isAiThinking
              ? 'bg-[#18233c] text-slate-500 cursor-not-allowed opacity-50'
              : 'bg-[#d8b4fe] hover:bg-[#c084fc] text-[#0f172a] shadow-purple-950/40 active:scale-95'
          }`}
        >
          <span>Submit</span>
          <span>▷</span>
        </button>

      </div>

      {/* Floating AI Copilot Icon Button */}
      <button
        type="button"
        onClick={onToggleCopilot}
        className="w-11 h-11 rounded-2xl bg-[#0c1427] border border-[#192747] hover:border-purple-500/60 text-slate-300 hover:text-purple-300 flex items-center justify-center transition-all shadow-md shrink-0"
        title="Vivora Copilot Coaching"
      >
        <Bot size={18} />
      </button>

    </div>
  );
}
