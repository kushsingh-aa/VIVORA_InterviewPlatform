import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRight, ArrowLeft, Sparkles,
  Code2, Layers, Server, Globe, Database, Brain, LineChart,
  Container, Lock, Network, Shield, Users, TrendingUp, BarChart2,
  Cloud, Zap, Star
} from 'lucide-react';

const DOMAINS = [
  {
    id: 'software', title: 'Software Engineer', emoji: '🖥️',
    desc: 'Algorithms, system design, full-stack & backend engineering',
    gradient: 'linear-gradient(135deg, hsl(239,80%,55%), hsl(262,80%,60%))',
    glow: 'hsla(239,84%,67%,0.2)', border: 'hsla(239,84%,67%,0.4)',
    subtracks: [
      { id: 'software_dsa',       label: 'DSA & Algorithms',     icon: Code2,   desc: 'Arrays, trees, graphs, dynamic programming, sorting' },
      { id: 'software_fullstack', label: 'Full Stack Dev',       icon: Layers,  desc: 'React, Node.js, APIs, databases, deployment' },
      { id: 'software_backend',   label: 'Backend Engineering',  icon: Server,  desc: 'Microservices, REST, gRPC, performance tuning' },
      { id: 'software_frontend',  label: 'Frontend Engineering', icon: Globe,   desc: 'React, state management, performance, accessibility' },
      { id: 'system_design',      label: 'System Design',        icon: Database,desc: 'Architecture, scalability, caching, distributed systems' },
    ]
  },
  {
    id: 'product', title: 'Product Manager', emoji: '📦',
    desc: 'Strategy, metrics, user research & go-to-market planning',
    gradient: 'linear-gradient(135deg, hsl(280,70%,55%), hsl(320,60%,55%))',
    glow: 'hsla(280,70%,55%,0.18)', border: 'hsla(280,70%,55%,0.4)',
    subtracks: [
      { id: 'product_strategy', label: 'Product Strategy',    icon: TrendingUp, desc: 'Roadmap, prioritization, OKRs, stakeholder alignment' },
      { id: 'product_metrics',  label: 'Metrics & Analytics', icon: BarChart2,  desc: 'KPIs, funnels, A/B testing, data-driven decisions' },
      { id: 'product_gtm',      label: 'Go-to-Market',        icon: Zap,        desc: 'Launch strategy, positioning, pricing, channels' },
      { id: 'product_ux',       label: 'UX & User Research',  icon: Users,      desc: 'Discovery, interviews, wireframes, usability' },
    ]
  },
  {
    id: 'data', title: 'Data Scientist', emoji: '📊',
    desc: 'Machine learning, data analysis & statistical modelling',
    gradient: 'linear-gradient(135deg, hsl(187,70%,40%), hsl(220,70%,55%))',
    glow: 'hsla(187,92%,55%,0.16)', border: 'hsla(187,92%,55%,0.4)',
    subtracks: [
      { id: 'data_ml',       label: 'Machine Learning',   icon: Brain,     desc: 'Supervised learning, model evaluation, feature engineering' },
      { id: 'data_analysis', label: 'Data Analysis',      icon: LineChart, desc: 'EDA, pandas, statistics, visualisation' },
      { id: 'data_sql',      label: 'SQL & Analytics Eng',icon: Database,  desc: 'Complex queries, window functions, dbt, warehouse design' },
      { id: 'data_dl',       label: 'Deep Learning',      icon: Brain,     desc: 'Neural networks, transformers, PyTorch, computer vision' },
    ]
  },
  {
    id: 'devops', title: 'Cloud / DevOps', emoji: '☁️',
    desc: 'AWS / GCP / Azure, CI/CD pipelines & container orchestration',
    gradient: 'linear-gradient(135deg, hsl(38,80%,45%), hsl(38,90%,58%))',
    glow: 'hsla(38,92%,55%,0.16)', border: 'hsla(38,92%,55%,0.4)',
    subtracks: [
      { id: 'devops_cloud', label: 'Cloud (AWS/GCP/Azure)', icon: Cloud,     desc: 'IAM, compute, storage, networking, cost optimisation' },
      { id: 'devops_cicd',  label: 'CI/CD & Pipelines',    icon: Zap,       desc: 'GitHub Actions, Jenkins, GitOps, deployment strategies' },
      { id: 'devops_k8s',   label: 'Kubernetes & Docker',  icon: Container, desc: 'Pods, Helm, service mesh, scaling, observability' },
      { id: 'devops_sre',   label: 'SRE',                  icon: Server,    desc: 'SLOs, incident response, chaos engineering, capacity planning' },
    ]
  },
  {
    id: 'security', title: 'Cybersecurity', emoji: '🔐',
    desc: 'Application security, ethical hacking & network defence',
    gradient: 'linear-gradient(135deg, hsl(348,70%,45%), hsl(0,60%,50%))',
    glow: 'hsla(348,83%,57%,0.16)', border: 'hsla(348,83%,57%,0.4)',
    subtracks: [
      { id: 'sec_appsec',  label: 'Application Security', icon: Lock,    desc: 'OWASP Top 10, SAST/DAST, secure code review, threat modelling' },
      { id: 'sec_network', label: 'Network Security',     icon: Network, desc: 'Firewalls, IDS/IPS, VPNs, zero trust, packet analysis' },
      { id: 'sec_pentest', label: 'Ethical Hacking',      icon: Shield,  desc: 'Penetration testing, bug bounty, CTF techniques' },
    ]
  },
  {
    id: 'behavioral', title: 'Behavioral', emoji: '🤝',
    desc: 'Leadership, communication, teamwork & soft-skill mastery',
    gradient: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(180,60%,40%))',
    glow: 'hsla(160,84%,39%,0.16)', border: 'hsla(160,84%,39%,0.4)',
    subtracks: [
      { id: 'behavioral_leadership', label: 'Leadership & Mgmt', icon: Star,  desc: 'STAR stories, conflict resolution, cross-functional alignment' },
      { id: 'behavioral_comm',       label: 'Communication',     icon: Users, desc: 'Clarity, persuasion, active listening, feedback loops' },
      { id: 'behavioral_teamwork',   label: 'Teamwork & Culture', icon: Users, desc: 'Collaboration, diversity, cultural fit, remote work' },
    ]
  },
];

export default function TrackSelectorView({ onSelectTrack, onCancel }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [selectedSubtrack, setSelectedSubtrack] = useState(null);

  const domain = DOMAINS.find(d => d.id === selectedDomainId);

  const handleDomainClick = (domainId) => {
    setSelectedDomainId(domainId);
    setSelectedSubtrack(null);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!selectedSubtrack) return;
    onSelectTrack(selectedSubtrack);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div className="w-full px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border-subtle)', background: 'hsla(222,47%,7%,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))' }}>V</div>
          <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Vivora</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
            Hey <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name?.split(' ')[0] || 'there'}</span> 👋 — choose your interview track
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>
              ✕ Keep Current Track
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start py-10 px-4">
        <div className="w-full max-w-5xl animate-fade-up">

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {['Choose Domain', 'Choose Sub-Track'].map((label, i) => {
              const isActive = step === i + 1;
              const isDone = step > i + 1;
              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        background: isDone ? 'hsl(160,84%,39%)' : isActive ? 'var(--v-indigo)' : 'var(--bg-elevated)',
                        color: (isDone || isActive) ? 'white' : 'var(--text-dim)',
                        border: (isDone || isActive) ? 'none' : '1px solid var(--border-subtle)'
                      }}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span className="text-xs font-medium" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-dim)' }}>
                      {label}
                    </span>
                  </div>
                  {i < 1 && (
                    <div className="w-12 h-px" style={{ background: step > 1 ? 'hsl(160,84%,39%)' : 'var(--border-subtle)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── STEP 1: Domain Selection ── */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{ background: 'hsla(239,84%,67%,0.12)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.2)' }}>
                  <Sparkles size={12} /> AI Interview Track Selector
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  What's your <span className="gradient-text">career focus?</span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Select your domain — we'll show you the exact sub-tracks for your AI interview.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DOMAINS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleDomainClick(d.id)}
                    className="group p-5 rounded-2xl text-left transition-all duration-200 relative"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = d.border; e.currentTarget.style.boxShadow = `0 8px 32px ${d.glow}`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110"
                        style={{ background: d.gradient, boxShadow: `0 4px 16px ${d.glow}` }}>
                        {d.emoji}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-bold text-sm transition-colors" style={{ color: 'var(--text-primary)' }}>
                          {d.title}
                        </p>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-dim)' }}>{d.desc}</p>
                        <p className="text-[10px] mt-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
                          {d.subtracks.length} sub-tracks available
                        </p>
                      </div>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} style={{ color: 'var(--v-indigo)' }} />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── STEP 2: Sub-Track Selection ── */}
          {step === 2 && domain && (
            <>
              <div className="text-center mb-8">
                <button
                  onClick={() => { setStep(1); setSelectedSubtrack(null); }}
                  className="inline-flex items-center gap-1.5 text-xs mb-4 px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <ArrowLeft size={13} /> Back to domains
                </button>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: domain.gradient, boxShadow: `0 4px 16px ${domain.glow}` }}>
                    {domain.emoji}
                  </div>
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {domain.title} <span className="gradient-text">Sub-Tracks</span>
                  </h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Pick the specific area you want to be interviewed on today.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {domain.subtracks.map(sub => {
                  const Icon = sub.icon;
                  const isSel = selectedSubtrack === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubtrack(sub.id)}
                      className="p-4 rounded-2xl text-left flex items-start gap-3 transition-all duration-150"
                      style={isSel
                        ? { background: 'var(--bg-surface)', border: `2px solid ${domain.border}`, boxShadow: `0 4px 24px ${domain.glow}` }
                        : { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                      onMouseEnter={e => { if (!isSel) { e.currentTarget.style.borderColor = domain.border; } }}
                      onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; } }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all"
                        style={{ background: isSel ? domain.gradient : 'var(--bg-elevated)' }}>
                        <Icon size={16} style={{ color: isSel ? 'white' : 'var(--text-muted)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: isSel ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {sub.label}
                        </p>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-dim)' }}>{sub.desc}</p>
                      </div>
                      {isSel && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: 'var(--v-indigo)' }}>
                          <span className="text-[10px] text-white font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center mt-8 gap-2">
                <button
                  disabled={!selectedSubtrack}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-10 py-3 text-sm font-bold text-white shadow-xl transition-all rounded-2xl"
                  style={{
                    background: selectedSubtrack ? domain.gradient : 'var(--bg-elevated)',
                    color: selectedSubtrack ? 'white' : 'var(--text-dim)',
                    opacity: selectedSubtrack ? 1 : 0.5,
                    cursor: selectedSubtrack ? 'pointer' : 'not-allowed',
                    boxShadow: selectedSubtrack ? `0 8px 32px ${domain.glow}` : 'none',
                    border: selectedSubtrack ? 'none' : '1px solid var(--border-subtle)'
                  }}>
                  <Sparkles size={15} />
                  Go to Interview
                  <ChevronRight size={15} />
                </button>
                {!selectedSubtrack && (
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Select a sub-track above to continue</p>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
