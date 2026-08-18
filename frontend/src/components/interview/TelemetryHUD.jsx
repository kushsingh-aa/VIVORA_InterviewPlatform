import React from 'react';
import { Camera, Eye, Activity, Sparkles, CheckCircle2, Shield, HeartPulse, Zap } from 'lucide-react';
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
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-md">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Camera size={14} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Live Biometrics HUD
            </span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Telemetry Stream
          </span>
        </div>

        {/* Video Canvas Container */}
        <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />

          {!cameraAvailable && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-950/85 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2 text-indigo-400">
                <Camera size={22} />
              </div>
              <p className="text-xs font-bold text-slate-200">Camera Feed Synthetic</p>
              <p className="text-[10px] text-slate-500 max-w-[200px] mt-0.5">Biometric telemetry modeled via audio cadence & response latency</p>
            </div>
          )}

          {/* Futuristic HUD Scanning Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Outer Rotating Radar Line */}
            <div className="w-36 h-36 border border-indigo-500/20 rounded-full radar-sweep flex items-center justify-center">
              <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-indigo-400 origin-right"></div>
            </div>
            
            {/* Inner Bounding Target Box */}
            <div className="absolute w-28 h-28 border border-indigo-400/40 rounded-2xl flex items-center justify-center">
              <div className="w-2 h-2 border-t-2 border-l-2 border-indigo-400 absolute -top-1 -left-1"></div>
              <div className="w-2 h-2 border-t-2 border-r-2 border-indigo-400 absolute -top-1 -right-1"></div>
              <div className="w-2 h-2 border-b-2 border-l-2 border-indigo-400 absolute -bottom-1 -left-1"></div>
              <div className="w-2 h-2 border-b-2 border-r-2 border-indigo-400 absolute -bottom-1 -right-1"></div>
            </div>
          </div>

          {/* Focal Attention Tag */}
          <div className="absolute bottom-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-bold text-slate-200 border border-slate-700/80 flex items-center gap-1.5 shadow-lg">
            <Eye size={12} className="text-emerald-400" />
            <span>Focal Index: <strong className="text-white">{metrics.focus}%</strong></span>
          </div>

          <div className="absolute top-2.5 right-2.5 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
            60 FPS
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2.5">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Cadence</span>
            <span className="font-mono font-black text-sm text-slate-900 dark:text-white mt-0.5 block">
              {metrics.wpm} <span className="text-[10px] font-bold text-slate-400">WPM</span>
            </span>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2.5">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Clarity</span>
            <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {metrics.clarity}%
            </span>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2.5">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Composure</span>
            <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {100 - metrics.stressIndex}%
            </span>
          </div>
        </div>

      </div>

      {/* Progression Tracker */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Chamber Progress
          </span>
          <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-lg">
            Q{currentIdx} / {totalQuestions}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, Math.round((currentIdx / totalQuestions) * 100))}%` }}
          />
        </div>

        <div className="space-y-2 pt-1">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const num = idx + 1;
            const isDone = num < currentIdx;
            const isCurrent = num === currentIdx;

            return (
              <div 
                key={num}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                  isCurrent 
                    ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                    : isDone
                    ? 'text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isDone 
                      ? 'bg-emerald-500 text-white' 
                      : isCurrent 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 animate-pulse' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {isDone ? '✓' : num}
                  </span>
                  <span className="font-semibold">Question {num}</span>
                </div>
                <span className="text-[10px] uppercase font-black tracking-wider">
                  {isDone ? 'Evaluated' : isCurrent ? 'Active Probe' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
