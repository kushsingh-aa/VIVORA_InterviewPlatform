import React, { useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import PersonaHeader from '../components/interview/PersonaHeader';
import ChatStream from '../components/interview/ChatStream';
import ChatInput from '../components/interview/ChatInput';
import TelemetryHUD from '../components/interview/TelemetryHUD';
import CopilotDrawer from '../components/interview/CopilotDrawer';

export default function InterviewView({ onConclude }) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const { endSession } = useInterview();

  const handleEndInterview = async () => {
    if (window.confirm('Conclude the current assessment simulation and compile telemetry scorecard?')) {
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
    <div className="max-w-6xl mx-auto space-y-3 relative">
      
      {/* Top Persona & Timer Header */}
      <PersonaHeader onEndInterview={handleEndInterview} />

      {/* Main 2-Column Assessment Chamber Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Chat Dialogue Stream & Clean Input Dock (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-2">
          <ChatStream />
          <ChatInput 
            onComplete={handleResponseCompleted} 
            onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
          />
        </div>

        {/* Right Column: Telemetry & Video HUD (5 Cols) */}
        <div className="lg:col-span-5">
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
