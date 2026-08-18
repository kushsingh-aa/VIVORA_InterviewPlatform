import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, RotateCcw, Sparkles, Volume2, AlertCircle, CornerDownLeft } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function ChatInput({ onComplete, onToggleCopilot }) {
  const [inputText, setInputText] = useState('');
  const [livePreviewText, setLivePreviewText] = useState('');
  const textareaRef = useRef(null);
  const { submitAnswer, isAiThinking, activeSession } = useInterview();

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

  // Auto-expand textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(180, Math.max(88, scrollHeight))}px`;
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
      textareaRef.current.style.height = '88px';
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
      textareaRef.current.style.height = '88px';
    }
  };

  return (
    <div className="space-y-2 pt-2">
      
      {/* Spacious Technical Response Card */}
      <div className={`bg-[#0b1324] border ${
        isRecording 
          ? 'border-rose-500/60 shadow-lg shadow-rose-950/30' 
          : 'border-[#17233f] hover:border-[#22355e] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30'
      } rounded-2xl p-3 sm:p-4 shadow-xl transition-all relative flex flex-col justify-between`}>
        
        {/* Top Helper Header inside Answer Box */}
        <div className="flex items-center justify-between pb-2 border-b border-[#141e36] text-[11px] font-mono select-none">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span className="font-bold tracking-wider text-slate-300 uppercase">CANDIDATE RESPONSE DESK</span>
            {isRecording && (
              <span className="px-2 py-0.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-[10px] font-bold rounded-full animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                LIVE VOICE CAPTURE
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            {wordCount > 0 && (
              <>
                <span className="text-slate-300 font-semibold">{wordCount} words</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400 font-semibold">~{estimatedSeconds}s delivery</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
                  title="Clear text"
                >
                  <RotateCcw size={12} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Generous Multi-line Textarea Answer Input */}
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
                ? "🎙️ Listening to your voice... Speak clearly, your speech will transcribe in real-time."
                : "Formulate your technical solution, system architecture, or trade-offs here...\n(Press Enter ↵ to submit, Shift+Enter for new line)"
            }
            className="w-full bg-transparent text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none resize-none font-normal leading-relaxed custom-scrollbar"
            style={{ minHeight: '88px', maxHeight: '180px' }}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#141e36] gap-3 select-none">
          
          {/* Left Actions: Mic & Waveform & Copilot Quick Button */}
          <div className="flex items-center gap-2">
            
            {/* Mic Toggle Button */}
            {isSupported && (
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/40 animate-pulse'
                    : 'bg-[#101b33] hover:bg-[#162547] text-slate-300 hover:text-white border border-[#1b2a4d]'
                }`}
                title={isRecording ? 'Stop Voice Recording' : 'Start Voice Recording (Hardware Noise Suppressed)'}
              >
                <Mic size={15} />
                <span className="hidden sm:inline">{isRecording ? 'Stop Mic' : 'Voice Input'}</span>
              </button>
            )}

            {/* Audio Waveform Meter */}
            <div className="flex items-end gap-1 px-1.5 h-5 select-none" title={`Live Mic Signal: ${micVolume}%`}>
              <span
                className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-500/30'}`}
                style={{ height: isRecording ? `${Math.max(4, (micVolume / 100) * 18)}px` : '5px' }}
              ></span>
              <span
                className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-500/50'}`}
                style={{ height: isRecording ? `${Math.max(6, (micVolume / 100) * 22)}px` : '9px' }}
              ></span>
              <span
                className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-500/70'}`}
                style={{ height: isRecording ? `${Math.max(5, (micVolume / 100) * 16)}px` : '13px' }}
              ></span>
              <span
                className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-500'}`}
                style={{ height: isRecording ? `${Math.max(8, (micVolume / 100) * 24)}px` : '7px' }}
              ></span>
            </div>

            {/* In-Session Copilot Coaching Launcher */}
            <button
              type="button"
              onClick={onToggleCopilot}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e172e] hover:bg-[#152345] border border-[#192747] text-slate-300 hover:text-purple-300 text-xs font-mono font-semibold transition-all"
              title="Open Vivora Copilot for hints & framework coaching"
            >
              <Bot size={14} className="text-purple-400" />
              <span className="hidden md:inline">Copilot Coach</span>
            </button>

          </div>

          {/* Right Action: Submit Button & Keyboard Shortcut Hint */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-[#121c33] border border-[#1e2d52] rounded text-[9px] text-slate-300 font-bold">↵ Enter</kbd>
            </span>

            <button
              type="button"
              disabled={!displayedText.trim() || isAiThinking}
              onClick={handleSubmit}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs tracking-wider transition-all shadow-md ${
                !displayedText.trim() || isAiThinking
                  ? 'bg-[#18233c] text-slate-500 cursor-not-allowed opacity-50'
                  : 'bg-[#d8b4fe] hover:bg-[#c084fc] text-[#0f172a] shadow-lg shadow-purple-950/40 active:scale-95'
              }`}
            >
              <span>Submit Answer</span>
              <span className="text-sm">▷</span>
            </button>
          </div>

        </div>

      </div>

      {/* Error or Active Noise Status */}
      {micError && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 px-2">
          <AlertCircle size={12} />
          <span>{micError}</span>
        </div>
      )}

    </div>
  );
}
