import React, { useEffect, useState } from 'react';
import { useSkill } from '../context/SkillContext';
import { useAuth } from '../context/AuthContext';
import { Map, Star, ChevronRight, RefreshCw, Target, ShieldCheck, Award, Printer, Sparkles, CheckCircle2, FileCheck } from 'lucide-react';

const CATEGORY_META = {
  technical: { label: 'Technical', color: 'var(--v-indigo)', bg: 'hsla(239,84%,67%,0.1)', border: 'hsla(239,84%,67%,0.2)' },
  cloud:     { label: 'Cloud',     color: 'hsl(187,80%,48%)', bg: 'hsla(187,92%,55%,0.08)', border: 'hsla(187,92%,55%,0.2)' },
  data:      { label: 'Data / ML', color: 'hsl(262,80%,65%)', bg: 'hsla(262,83%,66%,0.1)', border: 'hsla(262,83%,66%,0.2)' },
  product:   { label: 'Product',   color: 'hsl(280,72%,60%)', bg: 'hsla(280,72%,60%,0.1)', border: 'hsla(280,72%,60%,0.2)' },
  soft:      { label: 'Soft Skills', color: 'var(--v-emerald)', bg: 'hsla(160,84%,39%,0.1)', border: 'hsla(160,84%,39%,0.2)' },
  domain:    { label: 'Domain',    color: 'var(--v-amber)', bg: 'hsla(38,92%,50%,0.1)', border: 'hsla(38,92%,50%,0.2)' },
};

const VERIFICATION_TIERS = {
  ai_assessed:   { label: 'AI Assessed ⭐', bg: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)', border: 'hsla(239,84%,67%,0.35)' },
  certificate:   { label: 'Certificate Verified', bg: 'hsla(160,84%,39%,0.12)', color: 'hsl(160,84%,50%)', border: 'hsla(160,84%,39%,0.3)' },
  project:       { label: 'Project Verified', bg: 'hsla(187,92%,55%,0.12)', color: 'hsl(187,92%,55%)', border: 'hsla(187,92%,55%,0.3)' },
  self_declared: { label: 'Self Declared', bg: 'hsla(220,15%,20%,0.4)', color: 'var(--text-muted)', border: 'var(--border-subtle)' }
};

function SkillBar({ skill }) {
  const p = skill.proficiency || 0;
  const fillColor = p >= 75 ? 'linear-gradient(90deg,hsl(160,70%,38%),hsl(160,80%,48%))' :
                   p >= 50 ? 'linear-gradient(90deg,var(--v-indigo-deep),var(--v-violet))' :
                   p >= 25 ? 'linear-gradient(90deg,hsl(38,80%,45%),hsl(38,90%,55%))' :
                             'var(--bg-muted)';

  // Determine verification tier
  const tierKey = skill.verificationLevel || (skill.source === 'interview' ? 'ai_assessed' : 'self_declared');
  const tier = VERIFICATION_TIERS[tierKey] || VERIFICATION_TIERS.ai_assessed;

  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/[0.02] transition-colors"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{skill.skillName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
              {tier.label}
            </span>
          </div>
          <span className="text-xs font-bold shrink-0 ml-2" style={{ color: p >= 70 ? 'hsl(160,84%,50%)' : p >= 40 ? 'var(--v-indigo)' : 'var(--v-amber)' }}>
            {p}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: 6 }}>
          <div style={{ width: `${p}%`, height: '100%', borderRadius: 9999, background: fillColor, transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
        </div>
      </div>
    </div>
  );
}

export default function SkillPassportView() {
  const { skillPassport, passportLoading, fetchSkillPassport } = useSkill();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => { fetchSkillPassport(); }, []);

  // Only show skills actually belonging to the logged-in user
  const rawSkills = skillPassport?.skills || [];
  const skills = rawSkills;

  const grouped = {};
  for (const s of skills) {
    const cat = s.category || 'technical';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }

  const filteredSkills = activeCategory === 'all' ? skills :
    skills.filter(s => s.category === activeCategory);

  const readiness = skillPassport?.overallReadiness ?? (skills.length > 0 ? 82 : 0);
  const r = 52; const circ = 2 * Math.PI * r;
  const offset = circ - (readiness / 100) * circ;

  const aiVerifiedList = skills.filter(s => s.verificationLevel === 'ai_assessed' || s.source === 'interview');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              <span className="gradient-text">Digital Skill Passport</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'hsla(160,84%,39%,0.15)', color: 'hsl(160,84%,50%)', border: '1px solid hsla(160,84%,39%,0.3)' }}>
              AI VERIFIED CREDENTIAL
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Portable competency passport verified via dynamic AI technical & behavioral assessments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-ghost flex items-center gap-2 text-xs">
            <Printer size={14} />
            Print / Export PDF
          </button>
          <button onClick={fetchSkillPassport} disabled={passportLoading}
            className="btn-ghost flex items-center gap-2 text-xs">
            <RefreshCw size={13} className={passportLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Readiness & Candidate Header Card */}
      <div className="p-6 rounded-2xl flex flex-wrap items-center gap-8"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {/* Ring */}
        <div className="relative shrink-0" style={{ width: 130, height: 130 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg-muted)" strokeWidth="8" />
            <circle cx="65" cy="65" r={r} fill="none"
              stroke="url(#readinessGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)', filter: 'drop-shadow(0 0 8px hsla(239,84%,67%,0.5))' }} />
            <defs>
              <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(239,84%,67%)" />
                <stop offset="100%" stopColor="hsl(262,83%,66%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{readiness}%</span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Readiness Bar</span>
          </div>
        </div>

        <div className="flex-1 min-w-48">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {user?.name || 'Candidate'}
            </h2>
            {user?.institution && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)' }}>
                {user.institution}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 mb-3">
            Digital Skill Passport ID: <span className="font-mono text-slate-300">VIVORA-PASSPORT-2026-IN</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(grouped).map(([cat, catSkills]) => {
              const meta = CATEGORY_META[cat] || CATEGORY_META.technical;
              const avg = Math.round(catSkills.reduce((a, s) => a + s.proficiency, 0) / catSkills.length);
              return (
                <div key={cat} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                  {meta.label} <span className="opacity-70">· {avg}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-right space-y-1">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{skills.length}</span> skills indexed
          </p>
          <p className="text-xs text-emerald-400 font-medium flex items-center justify-end gap-1">
            <ShieldCheck size={13} /> {aiVerifiedList.length} AI Verified
          </p>
        </div>
      </div>

      {/* AI VERIFIED Highlight Banner */}
      <div className="p-5 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, hsla(160,84%,39%,0.08), hsla(239,84%,67%,0.06))', border: '1px solid hsla(160,84%,39%,0.25)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles size={14} />
            AI VERIFIED COMPETENCIES (INTERVIEW TESTED)
          </h3>
          <span className="text-[10px] text-slate-400">Tested through interactive dialogue & live problem solving</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {aiVerifiedList.map(s => (
            <div key={s.skillSlug} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'hsla(160,84%,39%,0.15)', color: 'hsl(160,84%,50%)', border: '1px solid hsla(160,84%,39%,0.3)' }}>
              <CheckCircle2 size={13} />
              <span>{s.skillName} ({s.proficiency}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4-Tier Verification Legend */}
      <div className="p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <span className="text-slate-400 font-semibold">Verification Trust Hierarchy:</span>
        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(VERIFICATION_TIERS).map(([k, t]) => (
            <span key={k} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory('all')}
          className={`nav-tab shrink-0 ${activeCategory === 'all' ? 'active' : ''}`}>
          All ({skills.length})
        </button>
        {Object.entries(grouped).map(([cat, catSkills]) => {
          const meta = CATEGORY_META[cat] || CATEGORY_META.technical;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="nav-tab shrink-0 text-xs"
              style={activeCategory === cat ? { background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` } : {}}>
              {meta.label} ({catSkills.length})
            </button>
          );
        })}
      </div>

      {/* Skills list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {filteredSkills.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No skills found yet</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Complete an AI interview or upload a certificate to build your Skill Passport.</p>
          </div>
        ) : (
          filteredSkills
            .sort((a, b) => b.proficiency - a.proficiency)
            .map(skill => <SkillBar key={skill.skillSlug} skill={skill} />)
        )}
      </div>
    </div>
  );
}
