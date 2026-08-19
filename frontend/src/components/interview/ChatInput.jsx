import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, RotateCcw, AlertCircle } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function ChatInput({ onComplete, onToggleCopilot }) {
  const [inputText, setInputText] = useState('');
  const [livePreviewText, setLivePreviewText] = useState('');
  const textareaRef = useRef(null);
  const { submitAnswer, isAiThinking } = useInterview();

  const { isRecording, toggleRecording, stopRecording, isSupported, micVolume, micError } = useSpeechRecognition({
    onTranscriptUpdate: (finalText) => {
      setInputText(prev => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${finalText}` : finalText;
      });
      setLivePreviewText('');
    },
    onLivePreview: (interimText) => {
      setLivePreviewText(interimText);
    }
  });

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(180, Math.max(85, scrollHeight))}px`;
    }
  }, [inputText, livePreviewText]);

  const displayedText = inputText + (livePreviewText ? (inputText ? ` ${livePreviewText}` : livePreviewText) : '');
  const wordCount = displayedText.trim() ? displayedText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round((wordCount / 140) * 60);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isRecording) {
      stopRecording();
    }

    const fullText = displayedText.trim();
    if (!fullText || isAiThinking) return;

    setInputText('');
    setLivePreviewText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = '85px';
    }

    const result = await submitAnswer(fullText);
    if (result?.isComplete && onComplete) {
      onComplete(result.report);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setInputText('');
    setLivePreviewText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '85px';
    }
  };

  return (
    <div className="space-y-2 pt-2">
      
      {/* Spacious Technical Response Card */}
      <div className={`bg-white/95 backdrop-blur-xl border ${
        isRecording 
          ? 'border-rose-300 ring-2 ring-rose-200' 
          : 'border-indigo-100 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100'
      } rounded-3xl p-4 sm:p-5 shadow-xl shadow-indigo-900/5 transition-all flex flex-col justify-between`}>
        
        {/* Top Helper Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-indigo-50 text-[11px] select-none">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span className="font-bold tracking-wider text-slate-700 uppercase">CANDIDATE RESPONSE DESK</span>
            {isRecording && (
              <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-full animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                LIVE VOICE CAPTURE
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            {wordCount > 0 && (
              <>
                <span className="text-slate-800 font-bold">{wordCount} words</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600 font-bold">~{estimatedSeconds}s delivery</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
                  title="Clear text"
                >
                  <RotateCcw size={12} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Multi-line Textarea Input */}
        <div className="py-2">
          <textarea
            ref={textareaRef}
            rows={3}
            value={displayedText}
            onChange={(e) => {
              setInputText(e.target.value);
              setLivePreviewText('');
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? "🎙️ Listening to your voice... Speak clearly, speech transcribes in real-time."
                : "Formulate your technical approach, architecture trade-offs, or code considerations here...\n(Press Enter ↵ to submit, Shift+Enter for new line)"
            }
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none resize-none font-normal leading-relaxed custom-scrollbar"
            style={{ minHeight: '85px', maxHeight: '180px' }}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pt-2.5 border-t border-indigo-50 gap-3 select-none">
          
          {/* Left Actions: Voice Mic & Waveform & Copilot Coach */}
          <div className="flex items-center gap-2">
            
            {/* Mic Toggle */}
            {isSupported && (
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/30 animate-pulse'
                    : 'bg-[#f4f7fe] hover:bg-[#e9f0fe] text-slate-700 border border-indigo-100 shadow-sm'
                }`}
                title={isRecording ? 'Stop Voice Recording' : 'Start Voice Recording'}
              >
                <Mic size={15} className={isRecording ? 'text-white' : 'text-indigo-600'} />
                <span className="hidden sm:inline">{isRecording ? 'Stop Mic' : 'Voice Input'}</span>
              </button>
            )}

            {/* Waveform Meter */}
            <div className="flex items-end gap-1 px-1.5 h-5 select-none" title={`Live Mic Signal: ${micVolume}%`}>
              <span
                className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-300'}`}
                style={{ height: isRecording ? `${Math.max(4, (micVolume / 100) * 18)}px` : '5px' }}
              ></span>
              <span
                className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-400'}`}
                style={{ height: isRecording ? `${Math.max(6, (micVolume / 100) * 22)}px` : '9px' }}
              ></span>
              <span
                className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-500'}`}
                style={{ height: isRecording ? `${Math.max(5, (micVolume / 100) * 16)}px` : '13px' }}
              ></span>
              <span
                className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-600'}`}
                style={{ height: isRecording ? `${Math.max(8, (micVolume / 100) * 24)}px` : '7px' }}
              ></span>
            </div>

            {/* In-Session Copilot Coach */}
            <button
              type="button"
              onClick={onToggleCopilot}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-purple-50 border border-indigo-100 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all shadow-sm"
              title="Open Vivora Copilot for hints & framework coaching"
            >
              <Bot size={14} className="text-purple-600" />
              <span className="hidden md:inline">Copilot Coach</span>
            </button>

          </div>

          {/* Right Action: Purple-to-Blue Submit Button */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] text-slate-600 font-bold">↵ Enter</kbd>
            </span>

            <button
              type="button"
              disabled={!displayedText.trim() || isAiThinking}
              onClick={handleSubmit}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs tracking-wider transition-all shadow-md ${
                !displayedText.trim() || isAiThinking
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/25 active:scale-95'
              }`}
            >
              <span>Submit Answer</span>
              <span className="text-sm">▷</span>
            </button>
          </div>

        </div>

      </div>

      {micError && (
        <div className="flex items-center gap-1.5 text-[10px] text-amber-700 px-2 font-medium">
          <AlertCircle size={12} />
          <span>{micError}</span>
        </div>
      )}

    </div>
  );
}
