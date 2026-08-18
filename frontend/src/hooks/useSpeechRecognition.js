import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onTranscriptUpdate, onLivePreview } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [micVolume, setMicVolume] = useState(0);
  const [micError, setMicError] = useState(null);

  const recognitionRef = useRef(null);
  const shouldRecordRef = useRef(false);
  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  const onLivePreviewRef = useRef(onLivePreview);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  // Keep callback refs up to date without triggering useEffect rebuilds
  useEffect(() => {
    onTranscriptUpdateRef.current = onTranscriptUpdate;
    onLivePreviewRef.current = onLivePreview;
  });

  // Initialize SpeechRecognition engine ONCE on mount
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setMicError(null);
      };

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

        if (finalTranscript && onTranscriptUpdateRef.current) {
          onTranscriptUpdateRef.current(finalTranscript.trim());
        }
        if (onLivePreviewRef.current) {
          onLivePreviewRef.current(interimTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status/error event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Microphone permission denied. Please allow microphone access in your browser.');
          shouldRecordRef.current = false;
          setIsRecording(false);
        } else if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'network') {
          // Auto-recover if user is still in recording mode
          if (shouldRecordRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = setTimeout(() => {
              if (shouldRecordRef.current && recognitionRef.current) {
                try { recognitionRef.current.start(); } catch (e) {}
              }
            }, 100);
          }
        }
      };

      recognition.onend = () => {
        // Auto-restart if user has not explicitly clicked stop
        if (shouldRecordRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldRecordRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {}
            }
          }, 100);
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to initialize SpeechRecognition:', e);
      setIsSupported(false);
    }

    return () => {
      shouldRecordRef.current = false;
      clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      stopAudioAnalysis();
    };
  }, []); // Run ONLY ONCE on mount

  // Start Web Audio API volume detection
  const startAudioAnalysis = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

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

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(80, ctx.currentTime);

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.6;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(highpass);
        highpass.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          if (!shouldRecordRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicVolume(Math.min(100, Math.round((avg / 120) * 100)));
          animFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      }
    } catch (err) {
      console.warn('Optional audio analyser could not start:', err.message);
    }
  };

  const stopAudioAnalysis = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
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
    setMicError(null);
    shouldRecordRef.current = true;
    setIsRecording(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // May already be started
      }
    }

    startAudioAnalysis();
  }, []);

  const stopRecording = useCallback(() => {
    shouldRecordRef.current = false;
    clearTimeout(restartTimeoutRef.current);
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    stopAudioAnalysis();
  }, []);

  const toggleRecording = useCallback(() => {
    if (shouldRecordRef.current || isRecording) {
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
