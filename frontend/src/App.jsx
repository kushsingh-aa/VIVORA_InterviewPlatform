import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useInterview } from './context/InterviewContext';
import Navbar from './components/layout/Navbar';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import InterviewView from './views/InterviewView';
import ScorecardView from './views/ScorecardView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';
import SupportView from './views/SupportView';
import AboutView from './views/AboutView';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { setFinalReport } = useInterview();
  const [currentView, setCurrentView] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f8faff] via-[#eef4ff] to-[#f3efff]">
        <div className="flex items-center gap-3 text-indigo-600 font-bold text-sm bg-white/80 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-xl border border-indigo-100">
          <span className="w-3 h-3 rounded-full bg-indigo-600 animate-ping"></span>
          <span>Initializing Vivora AI Platform...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleStartInterview = () => {
    setCurrentView('interview');
  };

  const handleInterviewConcluded = (report) => {
    if (report) {
      setFinalReport(report);
    }
    setCurrentView('complete');
  };

  const handleInspectHistoricalReport = (report) => {
    if (report) {
      setFinalReport(report);
      setCurrentView('complete');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8faff] via-[#eef4ff] to-[#f4f0ff] text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 overflow-y-auto">
        {currentView === 'dashboard' && (
          <DashboardView onStartInterview={handleStartInterview} />
        )}

        {currentView === 'interview' && (
          <InterviewView onConclude={handleInterviewConcluded} />
        )}

        {currentView === 'complete' && (
          <ScorecardView onBackToDashboard={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'analytics' && (
          <HistoryView onInspectReport={handleInspectHistoricalReport} />
        )}

        {currentView === 'support' && (
          <SupportView />
        )}

        {currentView === 'about' && (
          <AboutView onStartAssessment={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'settings' && (
          <SettingsView />
        )}
      </main>

    </div>
  );
}
