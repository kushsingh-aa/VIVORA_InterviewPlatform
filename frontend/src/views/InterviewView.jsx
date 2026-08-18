import React, { useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import PersonaHeader from '../components/interview/PersonaHeader';
import ChatStream from '../components/interview/ChatStream';
import ChatInput from '../components/interview/ChatInput';
import TelemetryHUD from '../components/interview/TelemetryHUD';
import CopilotDrawer from '../components/interview/CopilotDrawer';
import { Bot, Sparkles } from 'lucide-react';

export default function InterviewView({ onConclude }) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const { endSession } = useInterview();

  const handleEndInterview = async () => {
    if (window.confirm('Are you sure you want to conclude this interview session? Your telemetry and responses will be aggregated into a final evaluation scorecard.')) {
      const report = await endSession();
      if (onConclude) {
        onConclude(report);
      }
    }
  };

  const handleResponseCompleted = (report) => {
    if (onConclude) {
      onConclude(report);
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Top Persona Header */}
      <PersonaHeader onEndInterview={handleEndInterview} />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chat Dialogue Stream & Answer Input (8 Cols) */}
        <div className="lg:col-span-8 space-y-4 flex flex-col">
          <ChatStream />
          <ChatInput onComplete={handleResponseCompleted} />
        </div>

        {/* Right Column: Telemetry HUD & AI Copilot Launcher (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Launch Copilot Drawer Button */}
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl p-4 font-bold text-xs md:text-sm flex items-center justify-between shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                🤖
              </div>
              <div className="text-left">
                <span className="block font-bold text-xs">Open Vivora AI Copilot</span>
                <span className="block text-[10px] text-indigo-200 font-normal">Real-time interview coach</span>
              </div>
            </div>
            <Sparkles size={16} className="text-amber-300" />
          </button>

          {/* Biometrics & Progress HUD */}
          <TelemetryHUD />

        </div>

      </div>

      {/* In-Session Copilot Side Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

    </div>
  );
}
