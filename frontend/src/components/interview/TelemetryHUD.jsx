import React from 'react';
import { Camera, Eye, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useInterview } from '../../context/InterviewContext';

export default function TelemetryHUD() {
  const { activeSession } = useInterview();
  const { metrics, videoRef, cameraAvailable } = useTelemetry(true);

  const totalQuestions = activeSession?.totalQuestions || 4;
  const currentIdx = activeSession?.questionIndex || 1;

  return (
    <div className="space-y-4">
      
      {/* Webcam & Biometric Target Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Live Biometrics HUD
            </span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Streaming
          </span>
        </div>

        {/* Video Canvas Container */}
        <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />

          {!cameraAvailable && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-950/80 text-slate-400">
              <Camera size={28} className="mb-2 text-slate-600" />
              <p className="text-xs font-semibold text-slate-300">Camera Feed Synthetic</p>
              <p className="text-[10px] text-slate-500">Biometric telemetry modeled via audio & response metrics</p>
            </div>
          )}

          {/* HUD Overlay Crosshair Target */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-indigo-500/30 rounded-full border-dashed animate-spin [animation-duration:15s] flex items-center justify-center">
              <div className="w-24 h-24 border border-indigo-400/40 rounded-2xl"></div>
            </div>
          </div>

          {/* Focal Attention Tag */}
          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5">
            <Eye size={12} className="text-emerald-400" />
            <span>Focal Focus: {metrics.focus}%</span>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Pace</span>
            <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{metrics.wpm} <span className="text-[10px] font-normal text-slate-400">WPM</span></span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Clarity</span>
            <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">{metrics.clarity}%</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Composure</span>
            <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">{100 - metrics.stressIndex}%</span>
          </div>
        </div>

      </div>

      {/* Vertical Question Progression Tracker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Assessment Progression
          </span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            Q{currentIdx} of {totalQuestions}
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((currentIdx / totalQuestions) * 100))}%` }}
          />
        </div>

        <div className="space-y-1.5 pt-1">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const num = idx + 1;
            const isDone = num < currentIdx;
            const isCurrent = num === currentIdx;

            return (
              <div 
                key={num}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold ${
                  isCurrent 
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                    : isDone
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {isDone ? '✓' : num}
                  </span>
                  <span>Question {num}</span>
                </div>
                <span className="text-[10px] uppercase font-bold">
                  {isDone ? 'Completed' : isCurrent ? 'In Progress' : 'Queued'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
