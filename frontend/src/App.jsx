import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useInterview } from './context/InterviewContext';
import Navbar from './components/layout/Navbar';
import LoginView from './views/LoginView';
import CandidateOnboardingView from './views/CandidateOnboardingView';
import TrackSelectorView from './views/TrackSelectorView';
import DashboardView from './views/DashboardView';
import InterviewView from './views/InterviewView';
import ScorecardView from './views/ScorecardView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';
import AboutView from './views/AboutView';
import SkillPassportView from './views/SkillPassportView';
import SkillGapView from './views/SkillGapView';
import MarketplaceView from './views/MarketplaceView';
import RecruiterView from './views/RecruiterView';
import AcademiaView from './views/AcademiaView';
import ProfileView from './views/ProfileView';
import ApplicationsView from './views/ApplicationsView';
import LearningView from './views/LearningView';
import ResumeView from './views/ResumeView';
import AdminView from './views/AdminView';
import CareerCopilotModal from './components/career/CareerCopilotModal';

const VALID_VIEWS = [
  'dashboard', 'about', 'settings', 'marketplace',
  'interview', 'complete', 'analytics', 'skill', 'gap',
  'profile', 'applications', 'learning', 'resume',
  'recruiter', 'academia', 'admin'
];

function getViewFromUrlOrStorage() {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    if (VALID_VIEWS.includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem('vivora_current_view');
    if (saved && VALID_VIEWS.includes(saved)) {
      return saved;
    }
  }
  return 'dashboard';
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 animate-fade-up">
          <div className="card p-8 max-w-md w-full text-center space-y-4" style={{ background: 'var(--bg-surface)' }}>
            <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center bg-rose-500/10 text-rose-400 text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              An unexpected render issue occurred. Click below to reload the dashboard.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.hash = '#dashboard'; window.location.reload(); }}
              className="btn-primary text-xs px-5 py-2.5">
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { setFinalReport } = useInterview();
  const [currentView, setCurrentViewState] = useState(getViewFromUrlOrStorage);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [preSelectedTrack, setPreSelectedTrack] = useState(
    () => sessionStorage.getItem('vivora_selected_subtrack') || null
  );

  // Sync hash routing and browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (VALID_VIEWS.includes(hash)) {
        setCurrentViewState(hash);
        localStorage.setItem('vivora_current_view', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // If no hash present, set initial hash cleanly
    if (!window.location.hash || !VALID_VIEWS.includes(window.location.hash.replace(/^#\/?/, '').trim())) {
      window.history.replaceState(null, '', `#${currentView}`);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  const setCurrentView = (view) => {
    if (!VALID_VIEWS.includes(view)) return;
    setCurrentViewState(view);
    localStorage.setItem('vivora_current_view', view);
    if (window.location.hash !== `#${view}`) {
      window.location.hash = `#${view}`;
    }
  };

  // Show profile onboarding once after login
  const [profileOnboarded, setProfileOnboarded] = useState(
    () => sessionStorage.getItem('vivora_profile_onboarded') === 'true'
  );

  // Show track selector once per browser session after login
  const [trackSelected, setTrackSelected] = useState(
    () => sessionStorage.getItem('vivora_track_selected') === 'true'
  );

  const handleTrackSelect = (trackId) => {
    setPreSelectedTrack(trackId);
    sessionStorage.setItem('vivora_selected_subtrack', trackId);
    sessionStorage.setItem('vivora_track_selected', 'true');
    setTrackSelected(true);
    setCurrentView('interview');
  };

  const handleSwitchDomain = () => {
    setTrackSelected(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-lg"
            style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))' }}>
            V
          </div>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--v-indigo)' }} />
            Loading Vivora...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const role = user?.role || 'candidate';

  // Step 1: Candidate Profile Onboarding (Name, Graduation, Location, Resume, Skills)
  if (!profileOnboarded && role === 'candidate') {
    return (
      <CandidateOnboardingView
        onComplete={() => setProfileOnboarded(true)}
        onSkip={() => setProfileOnboarded(true)}
      />
    );
  }

  // Step 2: Track selector once per session (only for candidates)
  if (!trackSelected && role === 'candidate') {
    return (
      <TrackSelectorView
        onSelectTrack={handleTrackSelect}
        onCancel={preSelectedTrack ? () => setTrackSelected(true) : undefined}
      />
    );
  }

  const handleStartInterview = () => setCurrentView('interview');

  const handleInterviewConcluded = (report) => {
    if (report) setFinalReport(report);
    setCurrentView('complete');
  };

  const handleInspectHistoricalReport = (report) => {
    if (report) {
      setFinalReport(report);
      setCurrentView('complete');
    }
  };


  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onSwitchDomain={role === 'candidate' ? handleSwitchDomain : undefined}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <ErrorBoundary>
        {/* ── Universal Views (all roles) ────────────────────────────── */}
        {currentView === 'dashboard'    && (
          <DashboardView
            onStartInterview={handleStartInterview}
            onOpenCopilot={() => setIsCopilotOpen(true)}
            setCurrentView={setCurrentView}
            onSwitchDomain={role === 'candidate' ? handleSwitchDomain : undefined}
          />
        )}
        {currentView === 'about'        && <AboutView onStartAssessment={() => setCurrentView('dashboard')} />}
        {currentView === 'settings'     && <SettingsView />}
        {currentView === 'marketplace'  && <MarketplaceView />}

        {/* ── Candidate / Student Views ───────────────────────────────── */}
        {currentView === 'interview'    && (
          <InterviewView
            onConclude={handleInterviewConcluded}
            preSelectedTrack={preSelectedTrack}
            onSwitchDomain={handleSwitchDomain}
          />
        )}
        {currentView === 'complete'     && (
          <ScorecardView
            onBackToDashboard={() => setCurrentView('dashboard')}
            onNavigateTo={(view) => setCurrentView(view)}
            onSwitchDomain={role === 'candidate' ? handleSwitchDomain : undefined}
          />
        )}
        {currentView === 'analytics'    && <HistoryView onInspectReport={handleInspectHistoricalReport} />}
        {currentView === 'skill'        && <SkillPassportView />}
        {currentView === 'gap'          && <SkillGapView />}
        {currentView === 'profile'      && <ProfileView />}
        {currentView === 'applications' && <ApplicationsView />}
        {currentView === 'learning'     && <LearningView />}
        {currentView === 'resume'       && <ResumeView />}

        {/* ── Recruiter Views ─────────────────────────────────────────── */}
        {currentView === 'recruiter' && (role === 'recruiter' || role === 'admin') && <RecruiterView />}
        {currentView === 'recruiter' && role !== 'recruiter' && role !== 'admin' && (
          <AccessDenied message="This view requires a Recruiter account." />
        )}

        {/* ── Faculty / Academia Views ─────────────────────────────────── */}
        {currentView === 'academia' && (role === 'faculty' || role === 'admin') && <AcademiaView />}
        {currentView === 'academia' && role !== 'faculty' && role !== 'admin' && (
          <AccessDenied message="This view requires a Faculty account." />
        )}

        {/* ── Admin Views ─────────────────────────────────────────────── */}
        {currentView === 'admin' && role === 'admin' && <AdminView />}
        {currentView === 'admin' && role !== 'admin' && (
          <AccessDenied message="This view requires an Admin account." />
        )}
        </ErrorBoundary>
      </main>

      {/* Global Omnipresent AI Career Copilot */}
      <CareerCopilotModal isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}

function AccessDenied({ message }) {
  return (
    <div className="py-24 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Access Restricted</p>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}
