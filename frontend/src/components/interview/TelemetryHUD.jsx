import React from 'react';
import { MessageSquare, Languages, Target, Eye } from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';

export default function TelemetryHUD() {
  const { metrics, videoRef, cameraAvailable } = useTelemetry(true);

  return (
    <div className="space-y-4">
      
      {/* Top Live Assessment Chamber Video Box */}
      <div className="relative aspect-[16/10] bg-[#090f1d] border border-[#17233f] rounded-2xl overflow-hidden shadow-lg p-3 flex flex-col justify-between">
        
        {/* Top Video Header */}
        <div className="flex items-center justify-between z-10 font-mono text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
            <span className="font-bold text-slate-200 uppercase tracking-wider">LIVE</span>
          </div>
          <span className="tracking-widest uppercase text-slate-400">LIVE ASSESSMENT CHAMBER</span>
        </div>

        {/* Video Canvas or Reticle Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100 opacity-40 mix-blend-screen"
          />

          {/* Corner Reticles [ ] */}
          <div className="absolute inset-4 border border-[#22355e]/50 pointer-events-none">
            <div className="w-3 h-3 border-t-2 border-l-2 border-indigo-400 absolute -top-0.5 -left-0.5"></div>
            <div className="w-3 h-3 border-t-2 border-r-2 border-indigo-400 absolute -top-0.5 -right-0.5"></div>
            <div className="w-3 h-3 border-b-2 border-l-2 border-indigo-400 absolute -bottom-0.5 -left-0.5"></div>
            <div className="w-3 h-3 border-b-2 border-r-2 border-indigo-400 absolute -bottom-0.5 -right-0.5"></div>
          </div>

          {/* Center Circular Focus Reticle */}
          <div className="w-28 h-28 border border-indigo-400/30 rounded-full flex items-center justify-center">
            <div className="w-20 h-20 border border-dashed border-cyan-400/40 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></div>
            </div>
          </div>
        </div>

        {/* Bottom Video Telemetry Subtext */}
        <div className="flex items-center justify-between z-10 font-mono text-[9px] text-slate-400 border-t border-[#131d33] pt-2">
          <span>ASSESSMENT: ARCHITECTURE SIMULATION</span>
          <span>STATUS: ACTIVE</span>
          <span className="text-cyan-400 font-bold">INTEGRITY: 99.7%</span>
        </div>

      </div>

      {/* 2x2 Telemetry Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5 font-mono">
        
        {/* Card 1: SPEECH RATE */}
        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-300">
              SPEECH RATE
            </span>
            <MessageSquare size={13} className="text-slate-400" />
          </div>

          <div className="space-y-1">
            <span className="font-bold text-xs sm:text-sm text-slate-200 block">
              {metrics.wpm || 142} WPM
            </span>

            {/* Mini Bar Chart */}
            <div className="flex items-end gap-1 h-6 pt-1">
              <span className="w-2 bg-cyan-400/40 rounded-sm" style={{ height: '35%' }}></span>
              <span className="w-2 bg-cyan-400/60 rounded-sm" style={{ height: '60%' }}></span>
              <span className="w-2 bg-cyan-400/80 rounded-sm" style={{ height: '90%' }}></span>
              <span className="w-2 bg-cyan-400/50 rounded-sm" style={{ height: '50%' }}></span>
              <span className="w-2 bg-cyan-400/70 rounded-sm" style={{ height: '75%' }}></span>
            </div>
          </div>

          <span className="text-[9px] text-cyan-400/90 font-medium">
            Optimal Range (130-160)
          </span>
        </div>

        {/* Card 2: VOCAB CLARITY */}
        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-purple-300">
              VOCAB CLARITY
            </span>
            <Languages size={13} className="text-slate-400" />
          </div>

          {/* Circular Percentage Gauge */}
          <div className="flex items-center justify-center py-1">
            <div className="relative w-14 h-14 rounded-full border-4 border-[#16223e] border-t-purple-400 border-r-purple-500 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-200">
                {metrics.clarity || 92}%
              </span>
            </div>
          </div>

          <div className="bg-[#121a2f] border border-[#192748] text-purple-300 text-center py-1 rounded-lg text-[9px] font-bold">
            Highly Articulate
          </div>
        </div>

        {/* Card 3: COMPOSURE */}
        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">
              COMPOSURE
            </span>
            <Target size={13} className="text-slate-400" />
          </div>

          <div className="space-y-2">
            <span className="font-bold text-xs sm:text-sm text-slate-200 block">
              {100 - (metrics.stressIndex || 12)} / 100
            </span>

            {/* Slider bar */}
            <div className="w-full bg-[#16223e] rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-300"
                style={{ width: `${100 - (metrics.stressIndex || 12)}%` }}
              />
            </div>

            <div className="flex justify-between text-[8px] text-slate-400">
              <span>Stressed</span>
              <span>Calm</span>
            </div>
          </div>
        </div>

        {/* Card 4: GAZE FOCUS */}
        <div className="bg-[#0b1324] border border-[#17233f] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-300">
              GAZE FOCUS
            </span>
            <Eye size={13} className="text-slate-400" />
          </div>

          {/* Reticle Graphic */}
          <div className="flex items-center justify-center py-1">
            <div className="relative w-14 h-14 border border-[#1c2c50] rounded-full flex items-center justify-center">
              <div className="absolute inset-0 border border-dashed border-[#243968] rounded-full"></div>
              <div className="w-full h-px bg-[#1c2c50] absolute"></div>
              <div className="h-full w-px bg-[#1c2c50] absolute"></div>
              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400 animate-pulse"></div>
            </div>
          </div>

          <span className="text-[9px] text-slate-400 text-center block">
            Locked on Center
          </span>
        </div>

      </div>

    </div>
  );
}
