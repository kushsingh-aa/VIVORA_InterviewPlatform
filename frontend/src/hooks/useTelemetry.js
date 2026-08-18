import { useState, useEffect, useRef } from 'react';

export function useTelemetry(isActive) {
  const [metrics, setMetrics] = useState({
    focus: 94,
    wpm: 128,
    clarity: 92,
    stressIndex: 28
  });
  const [webcamStream, setWebcamStream] = useState(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop());
        setWebcamStream(null);
      }
      return;
    }

    // Start webcam
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setWebcamStream(stream);
        setCameraAvailable(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraAvailable(false);
      }
    }

    startCamera();

    // Telemetry loop for biometric fluctuations
    const interval = setInterval(() => {
      setMetrics({
        focus: Math.floor(Math.random() * 6) + 92,
        wpm: Math.floor(Math.random() * 20) + 120,
        clarity: Math.floor(Math.random() * 5) + 90,
        stressIndex: Math.floor(Math.random() * 8) + 24
      });
    }, 4000);

    return () => {
      clearInterval(interval);
      if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isActive]);

  return {
    metrics,
    videoRef,
    cameraAvailable,
    webcamStream
  };
}
