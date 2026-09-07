import React, { useEffect, useRef } from 'react';
import { Eye, Activity, AlertTriangle, Users, Smartphone, Monitor, ShieldAlert } from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useInterview } from '../../context/InterviewContext';

export default function TelemetryHUD() {
  const { telemetry, videoRef, canvasRef, cameraAvailable } = useTelemetry(true);
  const { liveEvaluation, isAiThinking, reportTelemetry } = useInterview();

  const latestTelemetryRef = useRef(telemetry);
  latestTelemetryRef.current = telemetry;
  const prevMultiFacesRef = useRef(false);

  // Send telemetry to backend reliably every 1 second without getting canceled on frame renders
  useEffect(() => {
    const timer = setInterval(() => {
      const currentData = latestTelemetryRef.current;
      if (!currentData || !reportTelemetry) return;

      reportTelemetry({
        faceCount: typeof currentData.faceCount === 'number' ? currentData.faceCount : (currentData.faceDetected ? 1 : 0),
        faceDetected: currentData.faceDetected,
        isEyeContact: currentData.isEyeContact,
        gazeDirection: currentData.gazeDirection,
        gazeVector: currentData.gazeVector,
        gazeFocus: currentData.gazeFocus,
        headPose: currentData.headPose,
        movementRate: currentData.movementRate,
        composureScore: currentData.composureScore,
        postureStatus: currentData.postureStatus
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [reportTelemetry]);

  // Immediate push on multi-face / unauthorized person breach + audio chime
  useEffect(() => {
    if (telemetry.multipleFacesDetected && !prevMultiFacesRef.current) {
      if (reportTelemetry) {
        reportTelemetry({
          faceCount: telemetry.faceCount,
          faceDetected: true,
          isEyeContact: false,
          gazeDirection: telemetry.gazeDirection,
          gazeVector: telemetry.gazeVector,
          gazeFocus: telemetry.gazeFocus,
          headPose: telemetry.headPose,
          movementRate: telemetry.movementRate,
          composureScore: telemetry.composureScore,
          postureStatus: telemetry.postureStatus
        });
      }

      // Audible alert chime for security warning
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        }
      } catch {}
    }
    prevMultiFacesRef.current = telemetry.multipleFacesDetected;
  }, [telemetry.multipleFacesDetected, telemetry, reportTelemetry]);

  const wpm = liveEvaluation.wpm || 138;
  const hasBehaviorFlags = telemetry.behaviorFlags && telemetry.behaviorFlags.length > 0;

  return (
    <div className="space-y-3">
      {/* Camera Feed with Proctoring Overlay */}
      <div className={`relative aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden transition-all duration-300 ${
        telemetry.multipleFacesDetected ? 'ring-4 ring-red-500 shadow-xl shadow-red-500/20' : 'ring-1 ring-slate-800'
      }`}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100 opacity-85" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

        {!cameraAvailable && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-slate-900/95 text-slate-400 z-20">
            <Monitor size={24} className="mb-2 text-slate-500" />
            <p className="text-xs font-medium text-white">Camera Stream Inactive</p>
            <p className="text-[10px] mt-1">Enable webcam permissions to activate real-time telemetry proctoring</p>
          </div>
        )}

        {/* PROCTORING SECURITY WARNING: MULTI-PERSON DETECTED */}
        {telemetry.multipleFacesDetected && (
          <div className="absolute top-0 left-0 right-0 bg-red-600/95 backdrop-blur-sm text-white px-3 py-2 flex items-center justify-between shadow-lg z-30 border-b border-red-400 animate-pulse">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-white shrink-0" />
              <div>
                <p className="text-[11px] font-black tracking-wide uppercase">Unauthorized Person Detected</p>
                <p className="text-[9px] text-red-100 font-medium">
                  {telemetry.faceCount} people in frame. Only the interviewee is permitted.
                </p>
              </div>
            </div>
            <span className="bg-black/30 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Flagged
            </span>
          </div>
        )}

        {/* PHONE / NOTES WARNING */}
        {telemetry.phoneUsageSuspected && !telemetry.multipleFacesDetected && (
          <div className="absolute top-2 left-2 right-2 bg-amber-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-2 z-20 shadow">
            <Smartphone size={14} className="shrink-0" />
            <span className="text-[11px] font-bold">Head-Down Gaze: Possible Phone/Notes Usage</span>
          </div>
        )}

        {/* Status bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-[10px] text-white z-10">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${telemetry.faceDetected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className="font-semibold">
              {telemetry.faceDetected ? `${telemetry.faceCount} Person${telemetry.faceCount > 1 ? 's' : ''}` : 'No Face'}
            </span>
          </span>
          <span className={`font-semibold px-2 py-0.5 rounded ${
            telemetry.isEyeContact ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'
          }`}>
            {telemetry.gazeDirection}
          </span>
          <span className="font-bold">
            Focus: {telemetry.gazeFocus}%
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Eye Tracking with Radar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Eye size={12} className="text-indigo-500" /> Eye Tracking
            </span>
            <span className={`text-xs font-bold ${telemetry.isEyeContact ? 'text-emerald-600' : 'text-amber-600'}`}>
              {telemetry.gazeFocus}%
            </span>
          </div>

          {/* Gaze radar */}
          <div className="flex justify-center py-1">
            <div className="relative w-14 h-14 rounded-full border border-slate-200 bg-slate-50">
              <div className="absolute inset-1.5 rounded-full border border-slate-200"></div>
              <div className="absolute w-full h-px bg-slate-200"></div>
              <div className="absolute h-full w-px bg-slate-200"></div>
              <div
                className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full shadow-sm transition-all duration-100 ${
                  telemetry.isEyeContact ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{
                  left: `${Math.min(85, Math.max(15, 50 + (telemetry.gazeVector?.x || 0) * 35))}%`,
                  top: `${Math.min(85, Math.max(15, 50 + (telemetry.gazeVector?.y || 0) * 35))}%`
                }}
              ></div>
            </div>
          </div>
          <div className="text-[10px] text-center font-medium text-slate-600 mt-1 truncate">
            {telemetry.gazeDirection}
          </div>
        </div>

        {/* Body Posture */}
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Activity size={12} className="text-purple-500" /> Posture
            </span>
            <span className="text-xs font-bold text-slate-900">{telemetry.composureScore}/100</span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  telemetry.composureScore >= 80 ? 'bg-emerald-500' :
                  telemetry.composureScore >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                }`}
                style={{ width: `${telemetry.composureScore}%` }}
              />
            </div>
            <div className="text-[10px] text-center text-slate-500 truncate">{telemetry.postureStatus}</div>
          </div>
        </div>

        {/* Speech Cadence */}
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Speech</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{wpm} <span className="text-xs font-normal text-slate-400">WPM</span></div>
          <div className="text-[10px] text-slate-500 mt-1">
            {wpm >= 120 && wpm <= 165 ? 'Optimal pace' : wpm < 120 ? 'Deliberate' : 'Rapid'}
          </div>
        </div>

        {/* Answer Quality */}
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quality</span>
          </div>
          <div className="text-[11px] text-slate-700 leading-snug line-clamp-2">
            {isAiThinking ? 'Evaluating...' : (liveEvaluation.latestHighlights?.[0] || 'Awaiting response')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            {liveEvaluation.accuracyStatus || 'Ready'}
          </div>
        </div>
      </div>

      {/* Behavior Alerts Panel */}
      {hasBehaviorFlags && (
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-amber-500" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Behavior & Integrity Alerts</span>
          </div>
          <div className="space-y-1.5">
            {telemetry.behaviorFlags.map((flag, idx) => (
              <div key={idx} className={`flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-lg ${
                flag.severity === 'critical' ? 'bg-red-50 text-red-700 border border-red-200 font-medium' :
                flag.severity === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-slate-50 text-slate-600 border border-slate-100'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  flag.severity === 'critical' ? 'bg-red-500 animate-ping' :
                  flag.severity === 'high' ? 'bg-amber-500' : 'bg-slate-400'
                }`}></span>
                <span className="font-medium">{flag.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
