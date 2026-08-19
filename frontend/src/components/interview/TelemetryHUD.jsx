import React from 'react';
import { Eye, Activity, Crosshair, MessageSquare, Target, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useInterview } from '../../context/InterviewContext';

export default function TelemetryHUD() {
  const { telemetry, videoRef, canvasRef, cameraAvailable } = useTelemetry(true);
  const { liveEvaluation, isAiThinking } = useInterview();

  const wpm = liveEvaluation.wpm || 138;
  const isOffTopic = liveEvaluation.isOffTopic;
  const clarity = isOffTopic ? null : (liveEvaluation.clarityScore || 90);
  const techDepth = isOffTopic ? 0 : (liveEvaluation.technicalDepth || 88);
  const accuracyStatus = isOffTopic ? '⚠️ Off-Topic Response' : (liveEvaluation.accuracyStatus || 'Awaiting response');
  const highlight = isOffTopic ? 'Please provide architectural reasoning' : (liveEvaluation.latestHighlights?.[0] || 'Technical breakdown in progress');

  // Gaze Radar coordinates (-1 to +1 mapped to % in radar circle)
  const radarX = Math.min(85, Math.max(15, 50 + (telemetry.gazeVector?.x || 0) * 35));
  const radarY = Math.min(85, Math.max(15, 50 + (telemetry.gazeVector?.y || 0) * 35));

  return (
    <div className="space-y-4">
      
      {/* Top Live Assessment Chamber Video Box with MediaPipe Computer Vision Canvas Overlay */}
      <div className="relative aspect-[16/10] bg-[#090f1d] border border-[#17233f] rounded-2xl overflow-hidden shadow-xl p-3 flex flex-col justify-between">
        
        {/* Top Video Header */}
        <div className="flex items-center justify-between z-10 font-mono text-[10px] text-slate-300 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold text-slate-200 uppercase tracking-wider">LIVE TELEMETRY FEED</span>
          </div>
          <span className="px-2 py-0.5 bg-[#0e182c]/80 border border-[#1d2d52] rounded-full text-[9px] font-semibold text-cyan-300">
            {telemetry.trackingEngine}
          </span>
        </div>

        {/* Video Canvas Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          
          {/* Real Webcam Video Stream (Mirrored) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100 opacity-60 mix-blend-screen"
          />

          {/* MediaPipe Real-Time Facial Landmarks & Eye Tracking Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          />

          {!cameraAvailable && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#090f1d]/90 text-slate-400 z-20">
              <div className="w-10 h-10 rounded-xl bg-[#0f182c] border border-[#1b2848] flex items-center justify-center mb-1 text-indigo-400">
                <Activity size={18} />
              </div>
              <p className="text-[11px] font-mono font-bold text-slate-300">Camera Feed Initializing</p>
              <p className="text-[9px] font-mono text-slate-500 max-w-[200px]">Allow webcam permissions for live eye tracking</p>
            </div>
          )}

          {/* Cybernetic Corner Reticles [ ] */}
          <div className="absolute inset-4 border border-[#22355e]/40 pointer-events-none z-10">
            <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-indigo-400 absolute -top-0.5 -left-0.5"></div>
            <div className="w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-400 absolute -top-0.5 -right-0.5"></div>
            <div className="w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-400 absolute -bottom-0.5 -left-0.5"></div>
            <div className="w-3.5 h-3.5 border-b-2 border-r-2 border-indigo-400 absolute -bottom-0.5 -right-0.5"></div>
          </div>
        </div>

        {/* Bottom Video Telemetry Subtext */}
        <div className="flex items-center justify-between z-10 font-mono text-[9px] text-slate-400 border-t border-[#131d33] pt-2 select-none">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${telemetry.faceDetected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            {telemetry.faceDetected ? 'IRIS & POSE: LOCKED' : 'SEARCHING FACE'}
          </span>
          <span className="text-purple-300 font-bold">{telemetry.gazeDirection}</span>
          <span className="text-cyan-400 font-bold">FOCUS: {telemetry.gazeFocus}%</span>
        </div>

      </div>

      {/* 2x2 Real-Time Computer Vision & Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3.5 font-mono select-none">
        
        {/* Card 1: REAL EYE TRACKING & GAZE RADAR */}
        <div className="bg-[#0b1324] border border-[#17233f] hover:border-[#22355e] rounded-2xl p-3.5 flex flex-col justify-between space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-300 flex items-center gap-1.5">
              <Eye size={12} className="text-cyan-400" />
              EYE TRACKING
            </span>
            <span className="text-[10px] font-bold text-slate-200">{telemetry.gazeFocus}%</span>
          </div>

          {/* Interactive Radar Target Reticle moving with actual Pupil Gaze */}
          <div className="flex items-center justify-center py-1">
            <div className="relative w-16 h-16 rounded-full border border-cyan-500/30 bg-[#08101e] flex items-center justify-center overflow-hidden shadow-inner">
              
              {/* Radar Grid Circles */}
              <div className="absolute inset-2 rounded-full border border-cyan-500/20"></div>
              <div className="absolute w-full h-[1px] bg-cyan-500/20"></div>
              <div className="absolute h-full w-[1px] bg-cyan-500/20"></div>

              {/* Real Pupil Target Dot tracked by MediaPipe */}
              <div
                className="absolute w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full bg-cyan-400 shadow-md shadow-cyan-400/80 transition-all duration-75 flex items-center justify-center"
                style={{
                  left: `${radarX}%`,
                  top: `${radarY}%`
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>

            </div>
          </div>

          <div className="bg-[#0f172a] border border-[#182647] text-cyan-300 text-center py-0.5 rounded-lg text-[9px] font-bold truncate">
            {telemetry.gazeDirection}
          </div>
        </div>

        {/* Card 2: BODY MOVEMENT & COMPOSURE */}
        <div className="bg-[#0b1324] border border-[#17233f] hover:border-[#22355e] rounded-2xl p-3.5 flex flex-col justify-between space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-purple-300 flex items-center gap-1.5">
              <Crosshair size={12} className="text-purple-400" />
              POSTURE & MOVEMENT
            </span>
            <span className="text-[10px] font-bold text-slate-200">{telemetry.composureScore}/100</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
              <span>Composure</span>
              <span className="text-purple-300 text-[10px]">{telemetry.movementRate} mm/s</span>
            </div>

            {/* Composure Progress Bar */}
            <div className="w-full bg-[#16223e] rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${telemetry.composureScore}%` }}
              />
            </div>

            <div className="flex justify-between text-[8px] text-slate-500">
              <span>Restless</span>
              <span className="text-purple-300 font-bold">Calm & Upright</span>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-[#182647] text-purple-300 text-center py-0.5 rounded-lg text-[9px] font-bold truncate">
            {telemetry.postureStatus}
          </div>
        </div>

        {/* Card 3: REAL SPEECH CADENCE (WPM) */}
        <div className="bg-[#0b1324] border border-[#17233f] hover:border-[#22355e] rounded-2xl p-3.5 flex flex-col justify-between space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-300 flex items-center gap-1.5">
              <MessageSquare size={12} className="text-cyan-400" />
              SPEECH CADENCE
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-xs sm:text-sm text-slate-200 block">
              {wpm} WPM
            </span>

            {/* Cadence Indicator Bars */}
            <div className="flex items-end gap-1 h-5 pt-1">
              <span className="w-2 bg-cyan-400/50 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 40)}%` }}></span>
              <span className="w-2 bg-cyan-400/70 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 70)}%` }}></span>
              <span className="w-2 bg-cyan-400 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 100)}%` }}></span>
              <span className="w-2 bg-cyan-400/60 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 60)}%` }}></span>
              <span className="w-2 bg-cyan-400/80 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 85)}%` }}></span>
            </div>
          </div>

          <span className="text-[9px] text-cyan-400/90 font-medium truncate block">
            {wpm >= 120 && wpm <= 165 ? 'Optimal Cadence' : wpm < 120 ? 'Deliberate Pace' : 'Rapid Delivery'}
          </span>
        </div>

        {/* Card 4: ANSWER ACCURACY & TECHNICAL DEPTH */}
        <div className="bg-[#0b1324] border border-[#17233f] hover:border-[#22355e] rounded-2xl p-3.5 flex flex-col justify-between space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className={`text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 ${isOffTopic ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isOffTopic ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
              ANSWER ACCURACY
            </span>
          </div>

          <div className="space-y-1 py-0.5">
            <div className={`p-1.5 rounded-xl text-[10px] leading-snug line-clamp-2 ${
              isOffTopic
                ? 'bg-rose-950/30 border border-rose-900/50 text-rose-200'
                : 'bg-[#0e192f] border border-[#1a2d52] text-slate-200'
            }`}>
              {isAiThinking ? 'Evaluating response...' : highlight}
            </div>
          </div>

          <span className={`text-[9px] font-medium truncate block ${isOffTopic ? 'text-rose-400' : 'text-emerald-400'}`}>
            {accuracyStatus}
          </span>
        </div>

      </div>

    </div>
  );
}
