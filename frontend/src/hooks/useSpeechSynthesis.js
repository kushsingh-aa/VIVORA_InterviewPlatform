import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    // Cleanup any speech on unmount
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const cleanTextForSpeech = (text) => {
    if (!text) return '';
    return text
      .replace(/[\*#_`]/g, '')
      .replace(/🔍|📌|🤖|💡|📋|🎉|🎙️|🛑/g, '')
      .replace(/Question \d+:/gi, 'Question:')
      .trim();
  };

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, []);

  const speak = useCallback((rawText) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis || !rawText) {
      return;
    }

    const cleanText = cleanTextForSpeech(rawText);
    if (!cleanText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, speechRate]);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => {
      const next = !prev;
      if (!next && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  return {
    voiceEnabled,
    isSpeaking,
    speechRate,
    setSpeechRate,
    speak,
    cancel,
    toggleVoice
  };
}
