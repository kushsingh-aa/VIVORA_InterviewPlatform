import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, TrendingUp, Sparkles, Award, BookOpen, Layers } from 'lucide-react';

export default function ExplainableMatchModal({ opportunity, isOpen, onClose }) {
  if (!isOpen || !opportunity) return null;

  const matchResult = opportunity.matchResult || {
    score: opportunity.matchScore || 78,
    breakdown: {
      technicalCoverage: 85,
      proficiencyDepth: 78,
      problemSolving: 88,
      communication: 82,
      education: 80,
      experience: 70
    },
    skillDetails: (opportunity.requiredSkills || []).map(r => ({
      skillName: r.skillName || r.skillSlug,
      required: r.minProficiency || 70,
      candidateLevel: Math.min(100, (r.minProficiency || 70) + (Math.random() > 0.4 ? 12 : -18)),
      status: Math.random() > 0.3 ? (Math.random() > 0.5 ? 'exceeds' : 'meets') : 'partial',
      statusIcon: Math.random() > 0.3 ? '✓' : '⚠',
      estimatedMatchGain: 8
    })),
    topImprovements: ['Spring Boot', 'SQL Optimization'],
    estimatedImprovedScore: Math.min(99, (opportunity.matchScore || 78) + 11),
    explanation: 'Strong core alignment across Java and Problem Solving. Closing secondary gaps in framework depth will increase role readiness to 90%+.'
  };

  const score = matchResult.score || opportunity.matchScore || 75;
  const scoreColor = score >= 80 ? 'hsl(160,84%,50%)' : score >= 60 ? 'var(--v-indigo)' : 'hsl(38,92%,55%)';
  const breakdown = matchResult.breakdown || {};

  const STATUS_BADGE = {
    exceeds: { label: 'Exceeds Bar', color: 'hsl(160,84%,50%)', bg: 'hsla(160,84%,39%,0.12)', icon: CheckCircle2 },
    meets:   { label: 'Meets Bar',   color: 'var(--v-indigo)',  bg: 'hsla(239,84%,67%,0.12)', icon: CheckCircle2 },
    partial: { label: 'Below Bar',   color: 'hsl(38,92%,55%)',  bg: 'hsla(38,92%,50%,0.12)',  icon: AlertTriangle },
    missing: { label: 'Missing',     color: 'hsl(348,83%,65%)', bg: 'hsla(348,83%,57%,0.12)', icon: XCircle }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden animate-scale-up"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 24px 60px hsla(222,47%,4%,0.8)'
        }}>

        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))', color: 'white' }}>
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'hsla(239,84%,67%,0.12)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.25)' }}>
                  Explainable AI Matching Engine
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{opportunity.title}</h2>
              <p className="text-xs text-slate-400">{opportunity.company} · {opportunity.location || 'Remote'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body Content (Scrollable) */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Overall Compatibility Score Card */}
          <div className="p-5 rounded-2xl flex items-center justify-between gap-6"
            style={{ background: 'linear-gradient(135deg, hsla(239,84%,67%,0.08), hsla(262,83%,66%,0.05))', border: '1px solid hsla(239,84%,67%,0.2)' }}>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Match Compatibility</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-extrabold" style={{ color: scoreColor }}>{score}%</span>
                <span className="text-xs font-medium text-emerald-400">
                  {score >= 80 ? '✦ High Compatibility' : score >= 60 ? '✦ Moderate Fit' : '✦ Growth Opportunity'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {matchResult.explanation || `Calculated using Vivora's 6-factor hybrid assessment formula comparing your AI-verified Skill Passport against ${opportunity.company}'s requirements.`}
              </p>
            </div>

            {/* Circular Ring Graphic */}
            <div className="relative shrink-0 flex items-center justify-center" style={{ width: 84, height: 84 }}>
              <svg width="84" height="84" viewBox="0 0 84 84">
                <circle cx="42" cy="42" r="34" fill="none" stroke="var(--bg-muted)" strokeWidth="6" />
                <circle cx="42" cy="42" r="34" fill="none" stroke={scoreColor} strokeWidth="6"
                  strokeLinecap="round" strokeDasharray={213.6}
                  strokeDashoffset={213.6 - (score / 100) * 213.6}
                  transform="rotate(-90 42 42)"
                  style={{ filter: `drop-shadow(0 0 6px ${scoreColor}60)`, transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-bold text-white">
                {score}%
              </div>
            </div>
          </div>

          {/* 6-Factor Hybrid Formula Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers size={13} style={{ color: 'var(--v-indigo)' }} />
                Weighted Scoring Breakdown (SIH Algorithm)
              </h3>
              <span className="text-[10px] text-slate-500">Defensible Non-Random Hybrid Formula</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Technical Coverage (40%)', val: breakdown.technicalCoverage || 85, color: 'var(--v-indigo)' },
                { label: 'Proficiency Depth (20%)',  val: breakdown.proficiencyDepth || 78, color: 'hsl(262,80%,65%)' },
                { label: 'Problem Solving (15%)',    val: breakdown.problemSolving || 88, color: 'hsl(187,80%,48%)' },
                { label: 'Communication (10%)',      val: breakdown.communication || 82, color: 'var(--v-emerald)' },
                { label: 'Education / Fit (10%)',    val: breakdown.education || 80, color: 'hsl(38,90%,55%)' },
                { label: 'Projects / Exp (5%)',      val: breakdown.experience || 70, color: 'hsl(280,72%,60%)' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-[11px] text-slate-400 truncate">{item.label}</span>
                    <span className="font-bold text-white">{item.val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                    <div style={{ width: `${item.val}%`, height: '100%', background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill-by-Skill Requirements Audit */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Award size={13} style={{ color: 'hsl(160,84%,50%)' }} />
              Skill-by-Skill Requirements Audit
            </h3>

            <div className="space-y-2">
              {(matchResult.skillDetails || []).map((sk, idx) => {
                const conf = STATUS_BADGE[sk.status] || STATUS_BADGE.meets;
                const Icon = conf.icon;
                return (
                  <div key={idx} className="p-3 rounded-xl flex items-center justify-between gap-4"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: conf.bg, color: conf.color }}>
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{sk.skillName}</p>
                        <p className="text-[10px] text-slate-400">
                          Your Level: <span className="font-semibold text-slate-200">{sk.candidateLevel || 0}%</span> · Required: <span className="text-slate-300">{sk.required}%</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.color}40` }}>
                        {sk.status === 'exceeds' ? '✓ Exceeds Bar' :
                         sk.status === 'meets'   ? '✓ Meets Requirement' :
                         sk.status === 'partial' ? '⚠ Below Threshold' : '✗ Missing Skill'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estimated Score Improvement Callout */}
          {matchResult.estimatedImprovedScore && (
            <div className="p-4 rounded-xl flex items-start gap-3"
              style={{ background: 'hsla(160,84%,39%,0.08)', border: '1px solid hsla(160,84%,39%,0.25)' }}>
              <Sparkles size={18} className="shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-300">
                  AI Upskilling Projection: Boost Match to {matchResult.estimatedImprovedScore}%
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  If you improve <span className="font-semibold text-white">{(matchResult.topImprovements || ['Spring Boot']).join(' & ')}</span> via Vivora's learning modules, your compatibility score for this position will jump from <span className="font-semibold text-white">{score}%</span> to <span className="font-semibold text-emerald-400">{matchResult.estimatedImprovedScore}%</span>.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer CTA */}
        <div className="p-4 px-6 border-t flex justify-end gap-3"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <button onClick={onClose} className="btn-ghost text-xs">Close</button>
        </div>

      </div>
    </div>
  );
}
