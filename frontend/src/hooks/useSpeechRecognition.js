import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onTranscriptUpdate } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript && onTranscriptUpdate) {
        onTranscriptUpdate(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error event:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, [onTranscriptUpdate]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.warn('Error starting speech recognition:', e);
      }
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording
  };
}
