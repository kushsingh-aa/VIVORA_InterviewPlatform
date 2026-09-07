import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useInterview, SENIORITY_INFO } from '../context/InterviewContext';
import { useSkill } from '../context/SkillContext';
import {
  Terminal, Database, TrendingUp, Users, ChevronRight, Clock,
  BarChart3, Zap, ArrowUpRight, Sparkles, Map, Target, Briefcase, Bot, ShieldCheck, CheckCircle2,
  Sliders, Play, ChevronDown, ChevronUp, Compass
} from 'lucide-react';

const TRACK_CONFIG = [
  {
    id: 'software',
    title: 'Software Engineering',
    desc: 'Distributed systems, concurrency, caching, scalability',
    icon: Terminal,
    gradient: 'linear-gradient(135deg, hsl(239,80%,55%), hsl(262,80%,60%))',
    glow: 'hsla(239,84%,67%,0.15)',
    tag: 'Most Popular',
  },
  {
    id: 'system_design',
    title: 'System Design',
    desc: 'Architecture, scalability, multi-region infrastructure',
    icon: Database,
    gradient: 'linear-gradient(135deg, hsl(187,70%,40%), hsl(220,70%,55%))',
    glow: 'hsla(187,92%,55%,0.12)',
    tag: 'FAANG Focus',
  },
  {
    id: 'product',
    title: 'Product Management',
    desc: 'Strategy, prioritization, metrics & GTM planning',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, hsl(280,70%,55%), hsl(320,60%,55%))',
    glow: 'hsla(280,70%,55%,0.12)',
    tag: 'PM Track',
  },
  {
    id: 'behavioral',
    title: 'Behavioral & Leadership',
    desc: 'STAR framework, crisis management, team leadership',
    icon: Users,
    gradient: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(180,60%,40%))',
    glow: 'hsla(160,84%,39%,0.12)',
    tag: 'Soft Skills',
  },
];

const SENIORITY_TIERS = [
  { id: 'Junior',    label: 'Junior',     sub: '0–2 YOE' },
  { id: 'Mid-Level', label: 'Mid-Level',  sub: '3–5 YOE' },
  { id: 'Senior',    label: 'Senior',     sub: '5–8 YOE' },
  { id: 'Staff/Lead', label: 'Staff / Lead', sub: '8+ YOE' },
];

const ECOSYSTEM_STEPS = [
  { label: 'Assess', view: 'interview', icon: '🎤' },
  { label: 'Verify', view: 'skill', icon: '⭐' },
  { label: 'Map', view: 'skill', icon: '🗺️' },
  { label: 'Identify Gap', view: 'gap', icon: '🎯' },
  { label: 'Upskill', view: 'learning', icon: '📚' },
  { label: 'Match', view: 'marketplace', icon: '⚡' },
  { label: 'Apply', view: 'applications', icon: '📋' },
  { label: 'Interview', view: 'interview', icon: '🤖' },
  { label: 'Select', view: 'recruiter', icon: '🏆' },
  { label: 'Analyze', view: 'academia', icon: '📊' }
];

export default function DashboardView({ onStartInterview, onOpenCopilot, setCurrentView, onSwitchDomain }) {
  const { user } = useAuth();
  const { selectedDifficulty, setSelectedDifficulty, startSession, historyArchive } = useInterview();
  const { skillPassport } = useSkill();
  const seniorityData = SENIORITY_INFO[selectedDifficulty] || SENIORITY_INFO['Senior'];
  const [loadingTrack, setLoadingTrack] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [showEcosystemLoop, setShowEcosystemLoop] = React.useState(() => {
    return localStorage.getItem('vivora_show_loop') !== 'false';
  });

  const activeSubtrack = typeof window !== 'undefined' ? sessionStorage.getItem('vivora_selected_subtrack') : null;

  const toggleLoop = (val) => {
    setShowEcosystemLoop(val);
    localStorage.setItem('vivora_show_loop', String(val));
  };

  const handleStartActiveInterview = () => {
    let track = 'software';
    if (activeSubtrack) {
      if (activeSubtrack.includes('design')) track = 'system_design';
      else if (activeSubtrack.startsWith('product')) track = 'product';
      else if (activeSubtrack.startsWith('behavioral')) track = 'behavioral';
    }
    handleTrackSelect(track);
  };

  const handleTrackSelect = async (trackId) => {
    setLoadingTrack(trackId);
    setErrorMsg('');
    try {
      const res = await startSession(trackId);
      if (res.success) {
        if (onStartInterview) onStartInterview();
      } else {
        setErrorMsg(res.message || 'Could not start interview session. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start interview.');
    } finally {
      setLoadingTrack(null);
    }
  };

  const nav = (v) => {
    if (setCurrentView) setCurrentView(v);
  };

  return (
    <div className="space-y-8 animate-fade-up max-w-5xl mx-auto">

      {/* Hero Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Candidate'}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            AI-verified Skill Passport · Continuous Industry Mapping · Explainable Opportunity Matching
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm flex-wrap">
          {onOpenCopilot && (
            <button onClick={onOpenCopilot}
              className="btn-primary text-xs flex items-center gap-1.5"
              style={{ padding: '8px 14px' }}>
              <Bot size={14} />
              Career Copilot
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            <BarChart3 size={14} style={{ color: 'var(--v-indigo)' }} />
            <span className="text-xs">{historyArchive.length} sessions</span>
          </div>
        </div>
      </div>

      {/* ── SIH 2026 Ecosystem Loop Banner (Collapsible) ──────────────────────────── */}
      {showEcosystemLoop ? (
        <div className="p-4 rounded-2xl space-y-3 relative transition-all"
          style={{ background: 'linear-gradient(135deg, hsla(239,84%,67%,0.08), hsla(262,83%,66%,0.05))', border: '1px solid hsla(239,84%,67%,0.2)' }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: 'var(--v-indigo)' }} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Complete VIVORA Ecosystem Loop (Student ↔ Industry ↔ Academia)
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 hidden sm:inline">Click any stage to inspect</span>
              <button
                type="button"
                onClick={() => toggleLoop(false)}
                className="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500 transition-colors"
                title="Minimize this roadmap banner">
                Minimize ▲
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {ECOSYSTEM_STEPS.map((step, idx) => (
              <React.Fragment key={step.label}>
                <button onClick={() => nav(step.view)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all hover-lift flex items-center gap-1"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--v-indigo)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                  <span>{step.icon}</span>
                  <span>{step.label}</span>
                </button>
                {idx < ECOSYSTEM_STEPS.length - 1 && (
                  <span className="text-slate-600 shrink-0 font-mono text-xs">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-2.5 rounded-xl flex items-center justify-between transition-all"
          style={{ background: 'hsla(239,84%,67%,0.05)', border: '1px solid hsla(239,84%,67%,0.15)' }}>
          <div className="flex items-center gap-2 text-xs">
            <Sparkles size={13} style={{ color: 'var(--v-indigo)' }} />
            <span className="text-indigo-300 font-medium">Vivora Ecosystem Roadmap (10 Stages)</span>
          </div>
          <button
            type="button"
            onClick={() => toggleLoop(true)}
            className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Show Roadmap Stages ▼
          </button>
        </div>
      )}

      {/* ── 3 Intelligence Widgets (Passport + Gap + Recommendations) ── */}
      {(() => {
        const passportSkills = skillPassport?.skills || [];
        const readiness = skillPassport?.overallReadiness || 0;
        const topSkills = passportSkills
          .filter(s => s.verificationLevel === 'ai_assessed' || s.source === 'interview')
          .sort((a, b) => b.proficiency - a.proficiency)
          .slice(0, 4);
        const hasPassport = passportSkills.length > 0;

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Widget 1: Skill Passport Status */}
            <div className="p-5 rounded-2xl flex flex-col justify-between"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={14} style={{ color: 'hsl(160,84%,50%)' }} />
                    Skill Passport
                  </span>
                  {hasPassport && <span className="text-xs font-bold text-emerald-400">{readiness}% Ready</span>}
                </div>
                <h3 className="font-bold text-base text-white">AI-Verified Competencies</h3>
                {hasPassport ? (
                  <>
                    <p className="text-xs text-slate-400 mt-1">
                      {passportSkills.length} skill{passportSkills.length !== 1 ? 's' : ''} verified via AI interviews.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {topSkills.map(s => (
                        <span key={s.skillSlug} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'hsla(160,84%,39%,0.12)', color: 'hsl(160,84%,50%)', border: '1px solid hsla(160,84%,39%,0.25)' }}>
                          ✓ {s.skillName} ({s.proficiency}%)
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 mt-2 italic">Complete an AI interview to build your passport.</p>
                )}
              </div>
              <button onClick={() => nav('skill')}
                className="btn-ghost text-xs w-full mt-4 flex items-center justify-center gap-1">
                <span>Open Skill Passport</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Widget 2: Skill Gap */}
            <div className="p-5 rounded-2xl flex flex-col justify-between"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target size={14} style={{ color: 'hsl(38,92%,55%)' }} />
                    Skill Gap Analysis
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">Role Readiness</h3>
                {hasPassport ? (
                  <p className="text-xs text-slate-400 mt-1">
                    Analyze gaps between your verified skills and your target roles.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-2 italic">Complete an AI interview first to see your skill gaps.</p>
                )}
              </div>
              <button onClick={() => nav('gap')}
                className="btn-ghost text-xs w-full mt-4 flex items-center justify-center gap-1">
                <span>Analyze Skill Gaps</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Widget 3: Opportunities */}
            <div className="p-5 rounded-2xl flex flex-col justify-between"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase size={14} style={{ color: 'var(--v-indigo)' }} />
                    Opportunities
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">Matched Opportunities</h3>
                <p className="text-xs text-slate-500 mt-2 italic">
                  {hasPassport
                    ? 'Browse jobs matched to your verified skill profile.'
                    : 'Complete an AI interview to unlock personalized job matches.'}
                </p>
              </div>
              <button onClick={() => nav('marketplace')}
                className="btn-ghost text-xs w-full mt-4 flex items-center justify-center gap-1">
                <span>View All Opportunities</span>
                <ChevronRight size={13} />
              </button>
            </div>

          </div>
        );
      })()}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-xl text-xs bg-rose-500/10 text-rose-400 border border-rose-500/25">
          {errorMsg}
        </div>
      )}

      {/* ── AI Assessment Hub (Streamlined Quick-Launch + Expandable Customizer) ── */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsla(239,84%,67%,0.08), hsla(262,83%,66%,0.04))',
          border: '1px solid hsla(239,84%,67%,0.2)'
        }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                AI Assessment Hub
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.25)' }}>
                {selectedDifficulty} Level ({seniorityData.title.split(':')[0]})
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {activeSubtrack
                ? `Active Track: ${activeSubtrack.replace(/^software_|^product_|^data_|^devops_|^sec_|^behavioral_/, '').replace(/_/g, ' ').toUpperCase()}`
                : 'Ready for your next AI Technical Interview?'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Real-time multi-agent conversational interview with live telemetry, integrity monitoring, and instant skill scorecard.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {onSwitchDomain && (
              <button
                type="button"
                onClick={onSwitchDomain}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all hover-lift"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid hsla(239,84%,67%,0.35)',
                  color: 'var(--v-indigo)'
                }}
                title="Open domain & sub-track selector panel">
                <Compass size={15} className="text-indigo-400" />
                <span>Change Domain Panel</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleStartActiveInterview}
              disabled={loadingTrack !== null}
              className="btn-primary text-xs flex items-center gap-2 shadow-lg"
              style={{ padding: '9px 18px' }}>
              {loadingTrack ? <Zap size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
              <span>{loadingTrack ? 'Launching Session...' : 'Start Assessment'}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
