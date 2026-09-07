import React from 'react';
import { useInterview } from '../context/InterviewContext';
import { Award, CheckCircle2, TrendingUp, Download, ArrowLeft, Eye, AlertTriangle, Shield, Users, Smartphone, Sparkles, Map, Target, Compass } from 'lucide-react';

function ScoreRing({ score, size = 120 }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? 'hsl(160,84%,39%)' : score >= 60 ? 'hsl(239,84%,67%)' : 'hsl(38,92%,50%)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-muted)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 8px ${color}60)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{score}%</span>
      </div>
    </div>
  );
}

function MetricBar({ label, score, color }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{score}%</span>
      </div>
      <div className="progress-bar" style={{ height: '6px' }}>
        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ScorecardView({ onBackToDashboard, onNavigateTo, onSwitchDomain }) {
  const { finalReport, activeSession } = useInterview();

  const report = finalReport || {
    roleTitle: activeSession?.roleTitle || 'Software Engineer',
    overallScore: 0,
    recommendation: 'Incomplete',
    executiveSummary: 'Session ended before any answers were submitted.',
    metrics: { technicalDepth: 0, problemSolving: 0, communication: 0, composure: 0 },
    visionBiometrics: { eyeContactPercentage: 0, averageComposureScore: 0, fidgetIndex: 'N/A', gazeQuality: 'N/A', observations: [] },
    behaviorIntegrity: { integrityScore: 100, totalFlags: 0, summary: 'No behavioral data recorded.', recommendation: 'N/A', flags: [] },
    keyStrengths: [],
    areasForGrowth: []
  };

  const biometrics = report.visionBiometrics || {};
  const behavior = report.behaviorIntegrity || { integrityScore: 100, totalFlags: 0, summary: 'No data', recommendation: 'Clean', flags: [] };
  const isZero = report.overallScore === 0;

  const handleExportTxt = () => {
    const b = behavior;
    const content = [
      '═'.repeat(60),
      '        VIVORA AI — INTERVIEW EVALUATION SCORECARD',
      '═'.repeat(60),
      '',
      `Role:          ${report.roleTitle || 'Engineer'}`,
      `Overall Score: ${report.overallScore || 0}%`,
      `Verdict:       ${report.recommendation || 'Incomplete'}`,
      `Date:          ${new Date().toLocaleString()}`,
      '',
      '─'.repeat(60),
      'EXECUTIVE SUMMARY',
      '─'.repeat(60),
      report.executiveSummary || 'No summary.',
      '',
      '─'.repeat(60),
      'SKILL METRICS',
      '─'.repeat(60),
      `Technical Depth:   ${report.metrics?.technicalDepth || 0}%`,
      `Problem Solving:   ${report.metrics?.problemSolving || 0}%`,
      `Communication:     ${report.metrics?.communication || 0}%`,
      `Composure:         ${report.metrics?.composure || 0}%`,
      '',
      '─'.repeat(60),
      'BEHAVIOR INTEGRITY',
      '─'.repeat(60),
      `Integrity Score:   ${b.integrityScore}/100`,
      `Total Flags:       ${b.totalFlags}`,
      `Face Violations:   ${b.faceCountViolations || 0}`,
      `Phone Suspected:   ${b.phoneUsageEvents || 0}`,
      `Looking Away:      ${b.lookingAwayEvents || 0}`,
      `Summary:           ${b.summary}`,
      `Assessment:        ${b.recommendation}`,
      '',
      '─'.repeat(60),
      'STRENGTHS',
      '─'.repeat(60),
      ...(report.keyStrengths || []).map(s => `  + ${s}`),
      '',
      '─'.repeat(60),
      'AREAS FOR GROWTH',
      '─'.repeat(60),
      ...(report.areasForGrowth || []).map(g => `  > ${g}`),
      '═'.repeat(60)
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vivora_Scorecard_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const recColor = isZero ? 'hsl(348,70%,60%)' :
    report.overallScore >= 80 ? 'hsl(160,84%,50%)' : 'hsl(38,92%,55%)';

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-up pb-12">

      {/* Header */}
      <div className="p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="badge badge-indigo">
              <Award size={10} /> EVALUATION COMPLETE
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {report.roleTitle || 'Candidate'} Assessment
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {report.executiveSummary}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <ScoreRing score={report.overallScore || 0} />
          <span className="font-semibold text-sm px-3 py-1 rounded-full"
            style={{ background: `${recColor}18`, color: recColor, border: `1px solid ${recColor}40` }}>
            {report.recommendation}
          </span>
        </div>
      </div>

      {/* Metric Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Technical',      score: report.metrics?.technicalDepth  || 0, color: 'linear-gradient(90deg, hsl(239,84%,60%), hsl(262,80%,65%))' },
          { label: 'Problem Solving', score: report.metrics?.problemSolving  || 0, color: 'linear-gradient(90deg, hsl(187,70%,45%), hsl(210,70%,55%))' },
          { label: 'Communication',  score: report.metrics?.communication   || 0, color: 'linear-gradient(90deg, hsl(280,70%,55%), hsl(300,60%,60%))' },
          { label: 'Composure',      score: report.metrics?.composure       || 0, color: 'linear-gradient(90deg, hsl(160,70%,38%), hsl(180,65%,45%))' },
        ].map(item => <MetricBar key={item.label} {...item} />)}
      </div>

      {/* AI Skill Assessment — only shown if real skills were extracted */}
      <div className="p-6 rounded-2xl space-y-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: 'var(--v-indigo)' }} />
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                AI Skill Assessment &amp; Extracted Competencies
              </h2>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Individual skill breakdown verified via dialogue &amp; committed to your Digital Skill Passport
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigateTo && onNavigateTo('skill')}
              className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3">
              <Map size={13} /> View Skill Passport
            </button>
            <button onClick={() => onNavigateTo && onNavigateTo('gap')}
              className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3">
              <Target size={13} /> View Skill Gap
            </button>
          </div>
        </div>

        {/* Real extracted skills — or empty state */}
        {(() => {
          const extracted = report.extractedSkills || [];
          if (isZero || extracted.length === 0) {
            return (
              <div className="py-8 text-center rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No skill data extracted</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>Skills are extracted automatically after you answer interview questions.</p>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {extracted.map(sk => (
                <div key={sk.name || sk.skillName} className="p-3.5 rounded-xl flex flex-col justify-between"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">{sk.name || sk.skillName}</span>
                    <span className="text-xs font-bold" style={{ color: (sk.score || sk.proficiency || 0) >= 80 ? 'hsl(160,84%,50%)' : 'var(--v-indigo)' }}>
                      {sk.score || sk.proficiency || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="text-[10px] text-slate-400">Proficiency</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)' }}>
                      {sk.level || ((sk.score || sk.proficiency || 0) >= 80 ? 'Advanced' : (sk.score || sk.proficiency || 0) >= 60 ? 'Intermediate' : 'Beginner')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Behavior Integrity */}
      <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: 'var(--v-indigo)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Behavior Integrity Report</h2>
          </div>
          <span className="font-semibold text-xs px-3 py-1 rounded-full"
            style={behavior.integrityScore >= 90
              ? { background: 'hsla(160,84%,39%,0.12)', color: 'hsl(160,84%,50%)', border: '1px solid hsla(160,84%,39%,0.25)' }
              : behavior.integrityScore >= 70
                ? { background: 'hsla(38,92%,50%,0.12)', color: 'hsl(38,92%,55%)', border: '1px solid hsla(38,92%,50%,0.25)' }
                : { background: 'hsla(348,83%,57%,0.12)', color: 'hsl(348,83%,65%)', border: '1px solid hsla(348,83%,57%,0.25)' }
            }>
            Score: {behavior.integrityScore}/100
          </span>
        </div>

        {isZero ? (
          <div className="py-6 text-center rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No session data recorded</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>Behavioral telemetry is captured during an active interview session.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { icon: Users,        label: 'Face Violations',   value: behavior.faceCountViolations || 0, isCritical: (behavior.faceCountViolations || 0) > 0 },
                { icon: Smartphone,   label: 'Head-Down Events',  value: behavior.phoneUsageEvents || 0,    isCritical: false },
                { icon: Eye,          label: 'Looking Away',       value: behavior.lookingAwayEvents || 0,   isCritical: false },
                { icon: AlertTriangle,label: 'Total Flags',        value: behavior.totalFlags || 0,          isCritical: (behavior.totalFlags || 0) > 5 },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 text-center relative"
                  style={{
                    background: item.isCritical ? 'hsla(348,83%,57%,0.08)' : 'var(--bg-elevated)',
                    border: item.isCritical ? '1px solid hsla(348,83%,57%,0.3)' : '1px solid var(--border-subtle)'
                  }}>
                  {item.isCritical && (
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded absolute top-1.5 right-1.5"
                      style={{ background: 'hsla(348,83%,57%,0.2)', color: 'hsl(348,83%,70%)' }}>Breach</span>
                  )}
                  <item.icon size={14} className="mx-auto mb-1.5"
                    style={{ color: item.isCritical ? 'hsl(348,83%,65%)' : 'var(--text-dim)' }} />
                  <span className="text-xl font-bold block"
                    style={{ color: item.isCritical ? 'hsl(348,83%,65%)' : 'var(--text-primary)' }}>
                    {item.value}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{behavior.summary}</p>
            <p className="text-sm font-semibold"
              style={{ color: behavior.integrityScore >= 90 ? 'hsl(160,84%,50%)' : behavior.integrityScore >= 70 ? 'hsl(38,92%,55%)' : 'hsl(348,83%,65%)' }}>
              {behavior.recommendation}
            </p>
            {behavior.flags && behavior.flags.length > 0 && (
              <div className="mt-4 space-y-1.5">
                {behavior.flags.slice(0, 10).map((flag, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                    style={flag.severity === 'critical'
                      ? { background: 'hsla(348,83%,57%,0.1)', color: 'hsl(348,83%,70%)', border: '1px solid hsla(348,83%,57%,0.2)' }
                      : flag.severity === 'high'
                        ? { background: 'hsla(38,92%,50%,0.1)', color: 'hsl(38,92%,60%)', border: '1px solid hsla(38,92%,50%,0.2)' }
                        : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }
                    }>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: flag.severity === 'critical' ? 'hsl(348,83%,57%)' : flag.severity === 'high' ? 'hsl(38,92%,50%)' : 'var(--text-dim)' }} />
                    <span className="font-medium">{flag.message}</span>
                    {flag.timestamp && <span className="ml-auto opacity-60">{new Date(flag.timestamp).toLocaleTimeString()}</span>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Eye Tracking & Posture with True Measured Values */}
      <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Eye size={15} style={{ color: 'var(--v-indigo)' }} />
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Eye Tracking &amp; Posture</h2>
          <span className="text-[10px] ml-auto font-medium" style={{ color: 'var(--text-dim)' }}>MediaPipe Face Mesh (Precision Calibrated)</span>
        </div>

        {isZero ? (
          <div className="py-6 text-center rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No biometric data recorded</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>Eye tracking and posture data is captured during an active interview session.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Eye Contact',
                  value: `${biometrics.eyeContactPercentage ?? 0}%`,
                  color: (biometrics.eyeContactPercentage || 0) >= 80 ? 'hsl(160,84%,50%)' :
                         (biometrics.eyeContactPercentage || 0) >= 50 ? 'hsl(38,92%,55%)' : 'hsl(348,83%,65%)',
                  sub: (biometrics.eyeContactPercentage || 0) >= 80 ? 'Excellent Focus' :
                       (biometrics.eyeContactPercentage || 0) >= 50 ? 'Gaze Shifts' : 'Diverted Gaze'
                },
                {
                  label: 'Posture',
                  value: `${biometrics.averageComposureScore ?? 0}/100`,
                  color: (biometrics.averageComposureScore || 0) >= 80 ? 'hsl(160,84%,50%)' :
                         (biometrics.averageComposureScore || 0) >= 60 ? 'hsl(239,84%,67%)' : 'hsl(348,83%,65%)',
                  sub: (biometrics.averageComposureScore || 0) >= 80 ? 'Upright & Steady' :
                       (biometrics.averageComposureScore || 0) >= 60 ? 'Moderate' : 'Restless / Slouch'
                },
                {
                  label: 'Movement',
                  value: biometrics.fidgetIndex || 'N/A',
                  color: 'var(--text-primary)',
                  sub: biometrics.gazeQuality || 'N/A'
                },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[10px] uppercase font-semibold block mb-1" style={{ color: 'var(--text-dim)' }}>{item.label}</span>
                  <span className="text-lg font-bold" style={{ color: item.color }}>{item.value}</span>
                  <span className="text-[10px] block mt-0.5" style={{ color: 'var(--text-dim)' }}>{item.sub}</span>
                </div>
              ))}
            </div>
            {(biometrics.observations || []).length > 0 && (
              <div className="mt-3 space-y-1.5">
                {biometrics.observations.map((obs, i) => (
                  <div key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--text-dim)', marginTop: 2 }}>•</span>
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Strengths & Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: 'Strengths',
            icon: CheckCircle2,
            iconColor: 'hsl(160,84%,50%)',
            items: report.keyStrengths || [],
            empty: 'No strengths recorded.',
            itemStyle: { color: 'hsl(160,84%,65%)', marginTop: 2 },
            itemChar: '✓',
            cardBorder: 'hsla(160,84%,39%,0.15)'
          },
          {
            title: 'Areas for Growth',
            icon: TrendingUp,
            iconColor: 'var(--v-indigo)',
            items: report.areasForGrowth || [],
            empty: 'No growth areas recorded.',
            itemStyle: { color: 'var(--v-indigo)', marginTop: 2 },
            itemChar: '→',
            cardBorder: 'hsla(239,84%,67%,0.15)'
          }
        ].map(section => (
          <div key={section.title} className="p-6 rounded-2xl"
            style={{ background: 'var(--bg-surface)', border: `1px solid ${section.cardBorder}` }}>
            <h3 className="flex items-center gap-2 font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              <section.icon size={15} style={{ color: section.iconColor }} />
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-3 rounded-xl"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <span style={section.itemStyle}>{section.itemChar}</span>
                  <span>{item}</span>
                </div>
              ))}
              {section.items.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{section.empty}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
        <button onClick={onBackToDashboard}
          className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2.5">
          {onSwitchDomain && (
            <button
              onClick={onSwitchDomain}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover-lift"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid hsla(239,84%,67%,0.35)',
                color: 'var(--v-indigo)'
              }}>
              <Compass size={14} className="text-indigo-400" />
              <span>Change Domain / Track</span>
            </button>
          )}
          <button onClick={handleExportTxt}
            className="btn-primary flex items-center gap-2">
            <Download size={14} /> Export Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}
