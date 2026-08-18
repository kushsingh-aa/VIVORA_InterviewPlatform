import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onTranscriptUpdate, onLivePreview } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [micVolume, setMicVolume] = useState(0);
  const [micError, setMicError] = useState(null);
  const [isNoiseFiltered, setIsNoiseFiltered] = useState(true);

  const recognitionRef = useRef(null);
  const shouldRecordRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const restartTimeoutRef = useRef(null);

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
      console.warn('Speech recognition status/error:', event.error);
      // For temporary no-speech or network glitches in noisy rooms, auto-recover
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        if (shouldRecordRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldRecordRef.current) {
              try { recognition.start(); } catch (e) {}
            }
          }, 80);
        }
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setMicError('Microphone permission denied.');
        shouldRecordRef.current = false;
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart immediately if user has not explicitly clicked stop
      if (shouldRecordRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldRecordRef.current) {
            try {
              recognition.start();
            } catch (err) {}
          }
        }, 80);
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRecordRef.current = false;
      clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      stopAudioAnalysis();
    };
  }, [onTranscriptUpdate, onLivePreview]);

  // Start Web Audio API DSP pipeline with hardware filters & compressor for high noise rejection
  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
          channelCount: 1,
          sampleRate: { ideal: 48000 }
        }
      });
      micStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        // 1. Highpass filter: cuts ambient low rumble, fan hum, desk thumps (< 95Hz)
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(95, ctx.currentTime);

        // 2. Lowpass filter: cuts high-frequency hiss, keyboard clatter (> 3800Hz)
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(3800, ctx.currentTime);

        // 3. Dynamics Compressor: squashes noise bursts & normalizes speech volume
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-45, ctx.currentTime);
        compressor.knee.setValueAtTime(30, ctx.currentTime);
        compressor.ratio.setValueAtTime(10, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.25, ctx.currentTime);

        // 4. Analyser Node
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        // Connect DSP Graph
        const source = ctx.createMediaStreamSource(stream);
        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(compressor);
        compressor.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          if (!shouldRecordRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          // Apply noise floor threshold filter (ignore ambient room noise under 10)
          const adjusted = avg < 10 ? 0 : avg;
          setMicVolume(Math.min(100, Math.round((adjusted / 110) * 100)));
          animFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      }
      setMicError(null);
      setIsNoiseFiltered(true);
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
    clearTimeout(restartTimeoutRef.current);
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
    isNoiseFiltered,
    startRecording,
    stopRecording,
    toggleRecording
  };
}
