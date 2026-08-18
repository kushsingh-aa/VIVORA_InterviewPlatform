import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onTranscriptUpdate, onLivePreview } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [micVolume, setMicVolume] = useState(0);
  const [micError, setMicError] = useState(null);

  const recognitionRef = useRef(null);
  const shouldRecordRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Initialize SpeechRecognition engine
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
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }

      if (finalTranscript && onTranscriptUpdate) {
        onTranscriptUpdate(finalTranscript.trim());
      } else if (interimTranscript && onLivePreview) {
        onLivePreview(interimTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error event:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setMicError('Microphone permission denied.');
        shouldRecordRef.current = false;
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart if user has not explicitly stopped recording
      if (shouldRecordRef.current) {
        try {
          recognition.start();
        } catch (err) {
          // Ignore if already starting
        }
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRecordRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      stopAudioAnalysis();
    };
  }, [onTranscriptUpdate, onLivePreview]);

  // Start Web Audio API for noise suppression & real-time volume detection
  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      micStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          if (!shouldRecordRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      }
      setMicError(null);
    } catch (err) {
      console.warn('Microphone stream error:', err.message);
      setMicError('Microphone access unavailable or blocked.');
    }
  };

  const stopAudioAnalysis = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    setMicVolume(0);
  };

  const startRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        shouldRecordRef.current = true;
        recognitionRef.current.start();
        setIsRecording(true);
        startAudioAnalysis();
      } catch (e) {
        console.warn('Error starting speech recognition:', e);
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    shouldRecordRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    stopAudioAnalysis();
  }, []);

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
    micVolume,
    micError,
    startRecording,
    stopRecording,
    toggleRecording
  };
}
