import React, { useState, useEffect } from 'react';
import { Mic, Send, Bot, Volume2, AlertCircle } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function ChatInput({ onComplete, onToggleCopilot }) {
  const [inputText, setInputText] = useState('');
  const [livePreviewText, setLivePreviewText] = useState('');
  const { submitAnswer, isAiThinking } = useInterview();

  const { isRecording, toggleRecording, stopRecording, isSupported, micVolume, micError } = useSpeechRecognition({
    onTranscriptUpdate: (finalText) => {
      setInputText(prev => {
        const trimmedPrev = prev.trim();
        return trimmedPrev ? `${trimmedPrev} ${finalText}` : finalText;
      });
      setLivePreviewText('');
    },
    onLivePreview: (interimText) => {
      setLivePreviewText(interimText);
    }
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isRecording) {
      stopRecording();
    }

    const fullText = (inputText + (livePreviewText ? ` ${livePreviewText}` : '')).trim();
    if (!fullText || isAiThinking) return;

    setInputText('');
    setLivePreviewText('');

    const result = await submitAnswer(fullText);
    if (result?.isComplete && onComplete) {
      onComplete(result.report);
    }
  };

  const displayedText = inputText + (livePreviewText ? (inputText ? ` ${livePreviewText}` : livePreviewText) : '');

  return (
    <div className="space-y-1.5 pt-2">
      
      {/* Main Unified Input Dock */}
      <div className="flex items-center gap-3">
        <div className={`flex-1 bg-[#0b1324] border ${isRecording ? 'border-rose-500/50 shadow-rose-950/30' : 'border-[#17233f]'} rounded-2xl p-2 flex items-center gap-3 shadow-lg transition-all`}>
          
          {/* Microphone Button with Noise Suppression */}
          {isSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2.5 rounded-xl transition-all relative ${
                isRecording
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-[#101b33]'
              }`}
              title={isRecording ? 'Stop Voice Recording' : 'Start Voice Recording (Hardware Noise Suppressed)'}
            >
              <Mic size={16} />
              {isRecording && micVolume > 15 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
          )}

          {/* Real Audio Volume Waveform Graphic */}
          <div className="flex items-end gap-1 px-1 h-5 select-none" title={`Live Mic Signal: ${micVolume}%`}>
            <span
              className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-500/40'}`}
              style={{ height: isRecording ? `${Math.max(4, (micVolume / 100) * 18)}px` : '6px' }}
            ></span>
            <span
              className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-500/60'}`}
              style={{ height: isRecording ? `${Math.max(6, (micVolume / 100) * 22)}px` : '10px' }}
            ></span>
            <span
              className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-500/80'}`}
              style={{ height: isRecording ? `${Math.max(5, (micVolume / 100) * 16)}px` : '14px' }}
            ></span>
            <span
              className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-500'}`}
              style={{ height: isRecording ? `${Math.max(8, (micVolume / 100) * 24)}px` : '8px' }}
            ></span>
            <span
              className={`mini-equalizer-bar transition-all duration-75 ${isRecording ? 'bg-rose-400' : 'bg-indigo-500/50'}`}
              style={{ height: isRecording ? `${Math.max(4, (micVolume / 100) * 14)}px` : '12px' }}
            ></span>
          </div>

          {/* Text Input with Real-time Speech-to-Text Preview */}
          <input
            type="text"
            value={displayedText}
            onChange={(e) => {
              setInputText(e.target.value);
              setLivePreviewText('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
            placeholder={isRecording ? "Listening to your voice (speak clearly)..." : "Type or speak your architectural response..."}
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none font-normal px-1"
          />

          {/* Submit Button */}
          <button
            type="button"
            disabled={!displayedText.trim() || isAiThinking}
            onClick={handleSubmit}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono font-bold text-xs tracking-wider transition-all shadow-md ${
              !displayedText.trim() || isAiThinking
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

      {/* Mic Warning or Signal Info */}
      {micError && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 px-2">
          <AlertCircle size={12} />
          <span>{micError} Ensure microphone permissions are enabled in your browser.</span>
        </div>
      )}
      {isRecording && (
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-2">
          <span className="flex items-center gap-1 text-rose-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Hardware Noise Suppression Active
          </span>
          <span className="text-cyan-400 font-bold">Signal Level: {micVolume}%</span>
        </div>
      )}

    </div>
  );
}
