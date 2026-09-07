import React, { useState } from 'react';
import { useInterview, SENIORITY_INFO } from '../context/InterviewContext';
import PersonaHeader from '../components/interview/PersonaHeader';
import ChatStream from '../components/interview/ChatStream';
import ChatInput from '../components/interview/ChatInput';
import TelemetryHUD from '../components/interview/TelemetryHUD';
import CopilotDrawer from '../components/interview/CopilotDrawer';
import { Terminal, Database, TrendingUp, Users, Play, Loader2, Sparkles, Shield, AlertCircle, RefreshCw } from 'lucide-react';

const TRACKS = [
  {
    id: 'software',
    title: 'Software Engineering',
    desc: 'Distributed systems, concurrency, caching, algorithms',
    icon: Terminal,
    gradient: 'linear-gradient(135deg, hsl(239,80%,55%), hsl(262,80%,60%))'
  },
  {
    id: 'system_design',
    title: 'System Design',
    desc: 'Architecture, high-scale infra, multi-region data pipelines',
    icon: Database,
    gradient: 'linear-gradient(135deg, hsl(187,70%,40%), hsl(220,70%,55%))'
  },
  {
    id: 'product',
    title: 'Product Management',
    desc: 'Strategy, prioritization, metrics, GTM frameworks',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, hsl(280,70%,55%), hsl(320,60%,55%))'
  },
  {
    id: 'behavioral',
    title: 'Behavioral & Leadership',
    desc: 'STAR methodology, crisis leadership, cross-functional impact',
    icon: Users,
    gradient: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(180,60%,40%))'
  },
];

// Map sub-track IDs from TrackSelectorView to the core interview track IDs
const SUBTRACK_TO_TRACK = {
  software_dsa: 'software', software_fullstack: 'software',
  software_backend: 'software', software_frontend: 'software',
  system_design: 'system_design',
  product_strategy: 'product', product_metrics: 'product',
  product_gtm: 'product', product_ux: 'product',
  data_ml: 'software', data_analysis: 'software',
  data_sql: 'software', data_dl: 'software',
  devops_cloud: 'software', devops_cicd: 'software',
  devops_k8s: 'software', devops_sre: 'software',
  sec_appsec: 'software', sec_network: 'software', sec_pentest: 'software',
  behavioral_leadership: 'behavioral', behavioral_comm: 'behavioral',
  behavioral_teamwork: 'behavioral',
};

export default function InterviewView({ onConclude, preSelectedTrack, onSwitchDomain }) {
  const resolvedTrack = preSelectedTrack ? (SUBTRACK_TO_TRACK[preSelectedTrack] || 'software') : 'software';
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(resolvedTrack);
  const [launching, setLaunching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    activeSession,
    startSession,
    endSession,
    isAiThinking,
    selectedDifficulty,
    setSelectedDifficulty
  } = useInterview();

  const handleStart = async (trackToStart) => {
    const track = trackToStart || selectedTrack;
    setLaunching(true);
    setErrorMsg('');
    try {
      const res = await startSession(track);
      if (!res.success) {
        setErrorMsg(res.message || 'Failed to initialize session. Please check your connection.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to launch interview.');
    } finally {
      setLaunching(false);
    }
  };

  const handleEndInterview = async () => {
    try {
      const report = await endSession();
      if (onConclude) onConclude(report);
    } catch {
      if (onConclude) onConclude({ overallScore: 0, recommendation: 'Incomplete', executiveSummary: 'Session ended.' });
    }
  };

  const handleResponseCompleted = (report) => {
    if (onConclude) onConclude(report);
  };

  // 1. Initializing Chamber Screen
  if (isAiThinking && !activeSession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fade-up">
        <div className="card p-10 max-w-md w-full text-center space-y-5" style={{ background: 'var(--bg-surface)' }}>
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))' }}>
            <Loader2 size={32} className="text-white animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Calibrating AI Chamber
            </h2>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Synthesizing domain scenario, configuring behavioral telemetry models, and briefing persona...
            </p>
          </div>
          <div className="flex justify-center gap-1">
            <span className="live-bar" />
            <span className="live-bar" />
            <span className="live-bar" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Chamber Launcher if no session is active yet
  if (!activeSession) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-up py-4">
        <div className="card p-8 text-center space-y-3" style={{ background: 'var(--bg-surface)' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-1"
            style={{ background: 'hsla(239,84%,67%,0.12)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.2)' }}>
            <Sparkles size={13} />
            <span>Autonomous Interview Chamber</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Ready to Begin Your AI Assessment?
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
            Select your track and seniority level. Our AI Bar Raiser will conduct a multi-turn evaluation with real-time biometric telemetry and behavioral integrity tracking.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl text-xs flex items-center justify-center gap-2 max-w-md mx-auto"
              style={{ background: 'hsla(348,83%,57%,0.12)', color: 'hsl(348,83%,70%)', border: '1px solid hsla(348,83%,57%,0.25)' }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>


        {/* Seniority Selector */}
        <div className="card p-6" style={{ background: 'var(--bg-surface)' }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>1. Select Seniority Level</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Junior', 'Mid-Level', 'Senior', 'Staff/Lead'].map(level => {
              const isSelected = selectedDifficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedDifficulty(level)}
                  className="p-3 rounded-xl text-center text-xs font-semibold transition-all"
                  style={isSelected
                    ? { background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))', color: 'white', boxShadow: '0 4px 16px hsla(239,84%,55%,0.3)' }
                    : { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }
                  }>
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pre-selection confirmation OR full track picker */}
        {/* Pre-selection confirmation OR full track picker */}
        {preSelectedTrack ? (
          /* ── Came from TrackSelectorView: just show what was chosen ── */
          <div className="card p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>2. Your Selected Track</h3>
              {onSwitchDomain && (
                <button
                  type="button"
                  onClick={onSwitchDomain}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all hover:opacity-90"
                  style={{
                    background: 'hsla(239,84%,67%,0.12)',
                    color: 'var(--v-indigo)',
                    border: '1px solid hsla(239,84%,67%,0.3)'
                  }}>
                  <RefreshCw size={12} />
                  <span>Change Domain / Track</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: 'hsla(239,84%,67%,0.08)', border: '1px solid hsla(239,84%,67%,0.3)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))' }}>
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm capitalize truncate" style={{ color: 'var(--text-primary)' }}>
                  {preSelectedTrack.replace(/_/g, ' ')}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Selected from your career focus onboarding
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{ background: 'hsla(160,84%,39%,0.15)', color: 'hsl(160,84%,55%)', border: '1px solid hsla(160,84%,39%,0.3)' }}>
                  ✓ Ready
                </span>
                {onSwitchDomain && (
                  <button
                    type="button"
                    onClick={onSwitchDomain}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors hover:border-indigo-500"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                    title="Change to another domain">
                    Change
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {onSwitchDomain && (
                <button
                  type="button"
                  onClick={onSwitchDomain}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={14} />
                  <span>Choose Another Domain</span>
                </button>
              )}
              <button
                type="button"
                disabled={launching}
                onClick={() => handleStart()}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-sm font-bold shadow-lg"
                style={{ borderRadius: '12px' }}>
                {launching ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Calibrating Chamber...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} fill="white" />
                    <span>Start Interview Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ── Direct nav to Interview: show full track picker ── */
          <div className="card p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>2. Choose Track &amp; Launch</h3>
              {onSwitchDomain && (
                <button
                  type="button"
                  onClick={onSwitchDomain}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                  style={{
                    background: 'hsla(239,84%,67%,0.12)',
                    color: 'var(--v-indigo)',
                    border: '1px solid hsla(239,84%,67%,0.3)'
                  }}>
                  <RefreshCw size={12} />
                  <span>Explore All Domains</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRACKS.map(t => {
                const Icon = t.icon;
                const isSelected = selectedTrack === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setSelectedTrack(t.id); handleStart(t.id); }}
                    disabled={launching}
                    className="p-4 rounded-xl text-left flex items-start gap-3 transition-all duration-200"
                    style={isSelected
                      ? { background: 'hsla(239,84%,67%,0.12)', border: '1px solid var(--v-indigo)' }
                      : { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }
                    }>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                      style={{ background: t.gradient }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-dim)' }}>{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-center">
              <button
                type="button"
                disabled={launching}
                onClick={() => handleStart()}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-sm font-bold shadow-lg"
                style={{ borderRadius: '12px' }}>
                {launching ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Calibrating Chamber...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} fill="white" />
                    <span>Start Interview Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Active Live Chamber
  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fade-up">
      <PersonaHeader onEndInterview={handleEndInterview} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Chat */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <ChatStream />
          <ChatInput
            onComplete={handleResponseCompleted}
            onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
          />
        </div>

        {/* Telemetry */}
        <div className="lg:col-span-5 sticky top-20">
          <TelemetryHUD />
        </div>
      </div>

      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}
