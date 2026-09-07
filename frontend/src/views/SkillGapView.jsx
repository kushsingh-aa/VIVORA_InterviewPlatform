import React, { useEffect } from 'react';
import { useSkill } from '../context/SkillContext';
import { Target, AlertTriangle, CheckCircle, Minus, ChevronDown } from 'lucide-react';

const ROLES = [
  { slug: 'backend-developer',    title: 'Backend Developer' },
  { slug: 'frontend-developer',   title: 'Frontend Developer' },
  { slug: 'fullstack-developer',  title: 'Full Stack Developer' },
  { slug: 'data-scientist',       title: 'Data Scientist' },
  { slug: 'ml-engineer',          title: 'ML Engineer' },
  { slug: 'devops-engineer',      title: 'DevOps Engineer' },
  { slug: 'product-manager',      title: 'Product Manager' },
];

function RadarChart({ gapAnalysis }) {
  if (!gapAnalysis || gapAnalysis.length === 0) return null;
  const n = Math.min(8, gapAnalysis.length);
  const items = gapAnalysis.slice(0, n);
  const cx = 120, cy = 120, maxR = 95;
  const points = (values) => values.map((v, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const r = (v / 100) * maxR;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });

  const required = items.map(g => g.required);
  const current  = items.map(g => g.current);
  const toPath = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + 'Z';

  const reqPoints = points(required);
  const curPoints = points(current);
  const axisPoints = items.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x1: cx, y1: cy, x2: cx + maxR * Math.cos(angle), y2: cy + maxR * Math.sin(angle), label: items[i].skillName, lx: cx + (maxR + 22) * Math.cos(angle), ly: cy + (maxR + 22) * Math.sin(angle) };
  });

  return (
    <div className="flex justify-center">
      <svg width="240" height="240" viewBox="0 0 240 240">
        {/* Grid circles */}
        {[20, 40, 60, 80, 100].map(v => (
          <circle key={v} cx={cx} cy={cy} r={(v / 100) * maxR} fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
        ))}
        {/* Axes */}
        {axisPoints.map((ax, i) => (
          <g key={i}>
            <line x1={ax.x1} y1={ax.y1} x2={ax.x2} y2={ax.y2} stroke="var(--border-subtle)" strokeWidth="1" />
            <text x={ax.lx} y={ax.ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="var(--text-dim)"
              style={{ fontFamily: 'Inter, sans-serif' }}>
              {ax.label.split(' ')[0].substring(0, 10)}
            </text>
          </g>
        ))}
        {/* Required polygon */}
        <path d={toPath(reqPoints)} fill="hsla(239,84%,67%,0.08)" stroke="hsla(239,84%,67%,0.5)" strokeWidth="1.5" />
        {/* Current polygon */}
        <path d={toPath(curPoints)} fill="hsla(160,84%,39%,0.15)" stroke="hsl(160,84%,50%)" strokeWidth="1.5" />
        {/* Points */}
        {curPoints.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="hsl(160,84%,50%)" />
        ))}
        {/* Legend */}
        <g transform="translate(8, 226)">
          <rect x="0" y="-6" width="8" height="8" rx="2" fill="hsla(239,84%,67%,0.4)" />
          <text x="11" y="0" fontSize="7" fill="var(--text-dim)" fontFamily="Inter, sans-serif">Required</text>
          <rect x="56" y="-6" width="8" height="8" rx="2" fill="hsl(160,84%,50%)" />
          <text x="67" y="0" fontSize="7" fill="var(--text-dim)" fontFamily="Inter, sans-serif">Current</text>
        </g>
      </svg>
    </div>
  );
}

export default function SkillGapView() {
  const { gapData, gapLoading, selectedRole, setSelectedRole, fetchGap } = useSkill();

  useEffect(() => { fetchGap(selectedRole); }, []);

  const handleRoleChange = (slug) => {
    setSelectedRole(slug);
    fetchGap(slug);
  };

  const gap = gapData;

  const matchColor = !gap ? 'var(--text-dim)' :
    gap.matchScore >= 80 ? 'hsl(160,84%,50%)' :
    gap.matchScore >= 60 ? 'var(--v-indigo)' :
    gap.matchScore >= 40 ? 'hsl(38,92%,55%)' :
    'hsl(348,83%,65%)';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <span className="gradient-text">Skill Gap Analysis</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Compare your current skills against industry role requirements
        </p>
      </div>

      {/* Role selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Target Role:</span>
        <div className="relative">
          <select value={selectedRole} onChange={e => handleRoleChange(e.target.value)}
            className="input-dark pr-8 appearance-none cursor-pointer text-sm"
            style={{ paddingTop: '8px', paddingBottom: '8px', minWidth: '220px' }}>
            {ROLES.map(r => (
              <option key={r.slug} value={r.slug}>{r.title}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-dim)' }} />
        </div>
        {gapLoading && (
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--v-indigo)' }} />
        )}
      </div>

      {gap && !gapLoading && (
        <>
          {/* Match Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-1 p-6 rounded-2xl flex flex-col items-center justify-center gap-2"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <span className="text-5xl font-black" style={{ color: matchColor }}>{gap.matchScore}%</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Role Match</span>
              <span className="text-xs px-3 py-1 rounded-full"
                style={{ background: `${matchColor}18`, color: matchColor, border: `1px solid ${matchColor}35` }}>
                {gap.role}
              </span>
            </div>

            <div className="col-span-1 md:col-span-1 p-4 rounded-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <RadarChart gapAnalysis={gap.gapAnalysis} />
            </div>

            <div className="col-span-1 flex flex-col gap-3">
              {[
                { label: 'Met', icon: CheckCircle, color: 'hsl(160,84%,50%)', count: gap.gapAnalysis.filter(g => g.status === 'met').length },
                { label: 'Partial', icon: Minus, color: 'hsl(38,92%,55%)', count: gap.gapAnalysis.filter(g => g.status === 'partial').length },
                { label: 'Missing', icon: AlertTriangle, color: 'hsl(348,83%,65%)', count: gap.gapAnalysis.filter(g => g.status === 'missing').length },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <item.icon size={18} style={{ color: item.color, flexShrink: 0 }} />
                  <div>
                    <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.count}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>skills {item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill-by-skill breakdown */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Skill Breakdown</h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {gap.gapAnalysis.map(g => {
                const statusColor = g.status === 'met' ? 'hsl(160,84%,50%)' : g.status === 'partial' ? 'hsl(38,92%,55%)' : 'hsl(348,83%,65%)';
                return (
                  <div key={g.slug} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{g.skillName}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {g.current}% / {g.required}%
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                            style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                            {g.status}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                        {/* Required threshold marker */}
                        <div className="absolute top-0 bottom-0 w-px z-10"
                          style={{ left: `${g.required}%`, background: `${statusColor}80` }} />
                        {/* Current fill */}
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${g.current}%`, background: g.status === 'met' ? 'linear-gradient(90deg,hsl(160,70%,38%),hsl(160,80%,48%))' : g.status === 'partial' ? 'linear-gradient(90deg,hsl(38,80%,45%),hsl(38,90%,55%))' : 'linear-gradient(90deg,hsl(348,60%,45%),hsl(348,80%,60%))' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          {gap.recommendations?.length > 0 && (
            <div className="p-6 rounded-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Target size={15} style={{ color: 'var(--v-indigo)' }} />
                Top Recommendations
              </h2>
              <div className="space-y-3">
                {gap.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)' }}>{i + 1}</span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{rec.skill}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{rec.suggestion}</p>
                    </div>
                    <span className="ml-auto shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'hsla(348,83%,57%,0.1)', color: 'hsl(348,83%,65%)', border: '1px solid hsla(348,83%,57%,0.2)' }}>
                      -{rec.gap}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {gapLoading && (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full mx-auto animate-spin"
            style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--v-indigo)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>Analyzing skill gaps...</p>
        </div>
      )}
    </div>
  );
}
