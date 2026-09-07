import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot } from 'lucide-react';
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(150, Math.max(72, scrollHeight))}px`;
    }
  }, [inputText, livePreviewText]);

  const displayedText = inputText + (livePreviewText ? (inputText ? ` ${livePreviewText}` : livePreviewText) : '');
  const wordCount = displayedText.trim() ? displayedText.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isRecording) stopRecording();
    const fullText = displayedText.trim();
    if (!fullText || isAiThinking) return;
    setInputText('');
    setLivePreviewText('');
    if (textareaRef.current) textareaRef.current.style.height = '72px';
    const result = await submitAnswer(fullText);
    if (result?.isComplete && onComplete) onComplete(result.report);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <textarea
        ref={textareaRef}
        rows={3}
        value={displayedText}
        onChange={(e) => { setInputText(e.target.value); setLivePreviewText(''); }}
        onKeyDown={handleKeyDown}
        placeholder={isRecording ? 'Listening... speak clearly.' : 'Type your answer here. Press Enter to submit, Shift+Enter for new line.'}
        className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none resize-none leading-relaxed"
        style={{ minHeight: '72px', maxHeight: '150px' }}
      />

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-2">
          {isSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Mic size={14} />
              <span>{isRecording ? 'Stop' : 'Voice'}</span>
            </button>
          )}

          {/* Waveform */}
          <div className="flex items-end gap-0.5 h-4 px-1">
            <span className="w-1.5 rounded-sm transition-all duration-75" style={{ height: isRecording ? `${Math.max(3, (micVolume / 100) * 16)}px` : '4px', background: isRecording ? '#ef4444' : '#cbd5e1' }}></span>
            <span className="w-1.5 rounded-sm transition-all duration-75" style={{ height: isRecording ? `${Math.max(4, (micVolume / 100) * 20)}px` : '8px', background: isRecording ? '#ef4444' : '#cbd5e1' }}></span>
            <span className="w-1.5 rounded-sm transition-all duration-75" style={{ height: isRecording ? `${Math.max(3, (micVolume / 100) * 14)}px` : '12px', background: isRecording ? '#ef4444' : '#cbd5e1' }}></span>
          </div>

          <button
            type="button"
            onClick={onToggleCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium transition-colors"
          >
            <Bot size={14} />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          {micError && (
            <span className="text-[10px] text-amber-600">{micError}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {wordCount > 0 && (
            <span className="text-xs text-slate-400">{wordCount} words</span>
          )}
          <button
            type="button"
            disabled={!displayedText.trim() || isAiThinking}
            onClick={handleSubmit}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              !displayedText.trim() || isAiThinking
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <span>Submit</span>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
