import React from 'react';
import { Eye, Activity, Crosshair, MessageSquare, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useInterview } from '../../context/InterviewContext';

export default function TelemetryHUD() {
  const { telemetry, videoRef, canvasRef, cameraAvailable } = useTelemetry(true);
  const { liveEvaluation, isAiThinking } = useInterview();

  const wpm = liveEvaluation.wpm || 138;
  const isOffTopic = liveEvaluation.isOffTopic;
  const accuracyStatus = isOffTopic ? '⚠️ Off-Topic Response' : (liveEvaluation.accuracyStatus || 'Awaiting response');
  const highlight = isOffTopic ? 'Please provide architectural reasoning' : (liveEvaluation.latestHighlights?.[0] || 'Technical breakdown in progress');

  // Gaze Radar coordinates (-1 to +1 mapped to % in radar circle)
  const radarX = Math.min(85, Math.max(15, 50 + (telemetry.gazeVector?.x || 0) * 35));
  const radarY = Math.min(85, Math.max(15, 50 + (telemetry.gazeVector?.y || 0) * 35));

  return (
    <div className="space-y-4">
      
      {/* Top Live Camera Box with MediaPipe Computer Vision Canvas Overlay */}
      <div className="relative aspect-[16/10] bg-[#0c1427] border border-indigo-200/80 rounded-3xl overflow-hidden shadow-xl shadow-indigo-900/10 p-3 flex flex-col justify-between">
        
        {/* Top Video Header */}
        <div className="flex items-center justify-between z-10 text-[10px] text-slate-300 select-none">
          <div className="flex items-center gap-1.5 bg-[#090f1d]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold text-white uppercase tracking-wider">LIVE TELEMETRY</span>
          </div>
          <span className="px-2.5 py-1 bg-[#090f1d]/80 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-bold text-cyan-300">
            {telemetry.trackingEngine}
          </span>
        </div>

        {/* Video Canvas Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          
          {/* Webcam Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100 opacity-75"
          />

          {/* MediaPipe Real-Time Facial Landmarks & Eye Tracking Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          />

          {!cameraAvailable && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#090f1d]/90 text-slate-400 z-20">
              <div className="w-10 h-10 rounded-2xl bg-[#121c33] border border-[#1b2848] flex items-center justify-center mb-1 text-indigo-400">
                <Activity size={18} />
              </div>
              <p className="text-xs font-bold text-white">Camera Feed Initializing</p>
              <p className="text-[10px] text-slate-400 max-w-[200px]">Allow webcam permissions for live eye tracking</p>
            </div>
          )}

          {/* Cybernetic Corner Reticles */}
          <div className="absolute inset-4 border border-indigo-400/30 pointer-events-none z-10">
            <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-indigo-400 absolute -top-0.5 -left-0.5"></div>
            <div className="w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-400 absolute -top-0.5 -right-0.5"></div>
            <div className="w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-400 absolute -bottom-0.5 -left-0.5"></div>
            <div className="w-3.5 h-3.5 border-b-2 border-r-2 border-indigo-400 absolute -bottom-0.5 -right-0.5"></div>
          </div>
        </div>

        {/* Bottom Video Telemetry Subtext */}
        <div className="flex items-center justify-between z-10 text-[10px] text-slate-300 bg-[#090f1d]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 select-none">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${telemetry.faceDetected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className="font-bold text-white">{telemetry.faceDetected ? 'EYE TRACK: LOCKED' : 'SEARCHING FACE'}</span>
          </span>
          <span className="text-cyan-300 font-bold">{telemetry.gazeDirection}</span>
          <span className="text-purple-300 font-bold">FOCUS: {telemetry.gazeFocus}%</span>
        </div>

      </div>

      {/* 2x2 Real-Time Computer Vision & Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3.5 select-none">
        
        {/* Card 1: EYE TRACKING & GAZE RADAR */}
        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-4 flex flex-col justify-between space-y-2 shadow-md shadow-indigo-900/5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-indigo-700 flex items-center gap-1.5">
              <Eye size={13} className="text-indigo-600" />
              EYE TRACKING
            </span>
            <span className="text-xs font-black text-indigo-600">{telemetry.gazeFocus}%</span>
          </div>

          {/* Interactive Radar Target Reticle */}
          <div className="flex items-center justify-center py-1">
            <div className="relative w-16 h-16 rounded-full border border-indigo-200 bg-[#f4f8fe] flex items-center justify-center overflow-hidden shadow-inner">
              
              {/* Radar Circles */}
              <div className="absolute inset-2 rounded-full border border-indigo-200"></div>
              <div className="absolute w-full h-[1px] bg-indigo-200"></div>
              <div className="absolute h-full w-[1px] bg-indigo-200"></div>

              {/* Pupil Target Dot */}
              <div
                className="absolute w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/50 transition-all duration-75 flex items-center justify-center"
                style={{
                  left: `${radarX}%`,
                  top: `${radarY}%`
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>

            </div>
          </div>

          <div className="bg-[#f0f4ff] border border-indigo-100 text-indigo-800 text-center py-0.5 rounded-xl text-[10px] font-bold truncate">
            {telemetry.gazeDirection}
          </div>
        </div>

        {/* Card 2: BODY MOVEMENT & COMPOSURE */}
        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-4 flex flex-col justify-between space-y-2 shadow-md shadow-indigo-900/5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-purple-700 flex items-center gap-1.5">
              <Crosshair size={13} className="text-purple-600" />
              BODY POSTURE
            </span>
            <span className="text-xs font-black text-purple-600">{telemetry.composureScore}/100</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
              <span>Composure</span>
              <span className="text-purple-600 text-[11px]">{telemetry.movementRate} mm/s</span>
            </div>

            {/* Composure Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 transition-all duration-300"
                style={{ width: `${telemetry.composureScore}%` }}
              />
            </div>

            <div className="flex justify-between text-[9px] text-slate-400 font-medium">
              <span>Restless</span>
              <span className="text-purple-700 font-bold">Upright & Calm</span>
            </div>
          </div>

          <div className="bg-[#f7f0ff] border border-purple-100 text-purple-800 text-center py-0.5 rounded-xl text-[10px] font-bold truncate">
            {telemetry.postureStatus}
          </div>
        </div>

        {/* Card 3: SPEECH CADENCE */}
        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-4 flex flex-col justify-between space-y-2 shadow-md shadow-indigo-900/5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-700 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-blue-600" />
              SPEECH CADENCE
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-extrabold text-sm text-slate-900 block">
              {wpm} WPM
            </span>

            {/* Cadence Bars */}
            <div className="flex items-end gap-1 h-5 pt-1">
              <span className="w-2 bg-blue-300 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 40)}%` }}></span>
              <span className="w-2 bg-blue-400 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 70)}%` }}></span>
              <span className="w-2 bg-blue-600 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 100)}%` }}></span>
              <span className="w-2 bg-blue-500 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 60)}%` }}></span>
              <span className="w-2 bg-blue-400 rounded-sm" style={{ height: `${Math.min(100, (wpm / 160) * 85)}%` }}></span>
            </div>
          </div>

          <span className="text-[10px] text-blue-700 font-semibold truncate block">
            {wpm >= 120 && wpm <= 165 ? 'Optimal Cadence (120-165)' : wpm < 120 ? 'Deliberate Pace' : 'Rapid Delivery'}
          </span>
        </div>

        {/* Card 4: ANSWER ACCURACY */}
        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-4 flex flex-col justify-between space-y-2 shadow-md shadow-indigo-900/5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between text-slate-600">
            <span className={`text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 ${isOffTopic ? 'text-rose-700' : 'text-emerald-700'}`}>
              {isOffTopic ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
              ANSWER ACCURACY
            </span>
          </div>

          <div className="space-y-1 py-0.5">
            <div className={`p-2 rounded-xl text-[10px] leading-snug line-clamp-2 ${
              isOffTopic
                ? 'bg-rose-50 border border-rose-100 text-rose-800'
                : 'bg-[#f4f7fe] border border-indigo-50 text-slate-800'
            }`}>
              {isAiThinking ? 'Evaluating response...' : highlight}
            </div>
          </div>

          <span className={`text-[10px] font-bold truncate block ${isOffTopic ? 'text-rose-700' : 'text-emerald-700'}`}>
            {accuracyStatus}
          </span>
        </div>

      </div>

    </div>
  );
}
