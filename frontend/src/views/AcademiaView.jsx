import React, { useEffect, useState } from 'react';
import { useSkill } from '../context/SkillContext';
import { BookOpen, Users, BarChart3, AlertTriangle, Star, RefreshCw, GraduationCap, TrendingUp, Zap, Calendar, Plus } from 'lucide-react';
import api from '../services/api';

const CAT_COLORS = {
  technical: 'var(--v-indigo)', cloud: 'hsl(187,80%,48%)', data: 'hsl(262,80%,65%)',
  product: 'hsl(280,72%,60%)', soft: 'var(--v-emerald)', domain: 'var(--v-amber)'
};

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: 'hsl(348,70%,60%)', bg: 'hsla(348,70%,60%,0.1)', border: 'hsla(348,70%,60%,0.25)', icon: '🚨' },
  high: { label: 'High', color: 'hsl(38,90%,55%)', bg: 'hsla(38,90%,55%,0.1)', border: 'hsla(38,90%,55%,0.25)', icon: '⚠️' },
  medium: { label: 'Medium', color: 'hsl(220,70%,60%)', bg: 'hsla(220,70%,60%,0.1)', border: 'hsla(220,70%,60%,0.25)', icon: '📌' }
};

function HorizontalBar({ label, value, color, max = 100 }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs w-36 shrink-0 truncate" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--bg-muted)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color, boxShadow: `0 0 6px ${color}40` }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right shrink-0" style={{ color: 'var(--text-primary)' }}>{value}%</span>
    </div>
  );
}

const TABS = ['Dashboard', 'Skill Analytics', 'Industry Demand', 'Curriculum Gaps', 'Workshops'];

export default function AcademiaView() {
  const { cohortData, cohortLoading, fetchCohortData, demandData, fetchDemand } = useSkill();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [curriculumGaps, setCurriculumGaps] = useState([]);
  const [industryComparison, setIndustryComparison] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [gapLoading, setGapLoading] = useState(false);
  const [showCreateWorkshop, setShowCreateWorkshop] = useState(false);
  const [workshopForm, setWorkshopForm] = useState({ title: '', topic: '', conductedBy: '', date: '', duration: '2 hours', seats: 50, mode: 'online', description: '' });

  useEffect(() => { fetchCohortData(); fetchDemand(); fetchWorkshops(); }, []);

  useEffect(() => {
    if (activeTab === 'Curriculum Gaps' || activeTab === 'Industry Demand') {
      fetchCurriculumGaps();
    }
  }, [activeTab]);

  const fetchCurriculumGaps = async () => {
    setGapLoading(true);
    try {
      const [gapRes, compRes] = await Promise.allSettled([
        api.get('/analytics/curriculum-gaps'),
        api.get('/analytics/industry-vs-student')
      ]);
      if (gapRes.status === 'fulfilled' && gapRes.value.data.success) {
        setCurriculumGaps(gapRes.value.data.gaps || []);
      }
      if (compRes.status === 'fulfilled' && compRes.value.data.success) {
        setIndustryComparison(compRes.value.data.comparison || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGapLoading(false);
    }
  };

  const fetchWorkshops = async () => {
    try {
      const res = await api.get('/community/workshops');
      if (res.data.success) setWorkshops(res.data.workshops || []);
    } catch (e) {}
  };

  const createWorkshop = async () => {
    try {
      await api.post('/community/workshops', workshopForm);
      setShowCreateWorkshop(false);
      setWorkshopForm({ title: '', topic: '', conductedBy: '', date: '', duration: '2 hours', seats: 50, mode: 'online', description: '' });
      fetchWorkshops();
    } catch (e) {
      console.error(e);
    }
  };

  const registerWorkshop = async (id) => {
    try {
      await api.post(`/community/workshops/${id}/register`);
      fetchWorkshops();
    } catch (e) {
      alert(e.response?.data?.message || 'Registration failed');
    }
  };

  const data = cohortData;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <span className="gradient-text">Academia Analytics</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Cohort skill intelligence · Curriculum gap detection · Industry alignment
          </p>
        </div>
        <button onClick={() => { fetchCohortData(); fetchDemand(); fetchCurriculumGaps(); }} disabled={cohortLoading}
          className="btn-ghost flex items-center gap-2">
          <RefreshCw size={13} className={cohortLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`nav-tab shrink-0 ${activeTab === tab ? 'active' : ''}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Loading */}
      {cohortLoading && (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full mx-auto animate-spin"
            style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--v-indigo)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>Analyzing cohort data...</p>
        </div>
      )}

      {!cohortLoading && data && (
        <>
          {/* Demo banner */}
          {data.isDemoData && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
              style={{ background: 'hsla(38,92%,50%,0.08)', border: '1px solid hsla(38,92%,50%,0.2)', color: 'hsl(38,92%,60%)' }}>
              <AlertTriangle size={13} />
              <span>Showing demo cohort data. Real data will appear when students at your institution complete AI interviews.</span>
            </div>
          )}

          {/* ── DASHBOARD TAB ──────────────────────────────────────────── */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-6">
              {/* KPI Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Students Tracked', value: data.totalStudents?.toLocaleString(), icon: Users, color: 'var(--v-indigo)' },
                  { label: 'AI Interviews', value: data.interviewCount?.toLocaleString(), icon: BarChart3, color: 'hsl(187,80%,48%)' },
                  { label: 'Industry Ready', value: `${data.industryReady?.toLocaleString()}`, icon: Star, color: 'hsl(160,84%,50%)' },
                  { label: 'Need Upskilling', value: `${data.needsUpskilling?.toLocaleString()}`, icon: AlertTriangle, color: 'hsl(38,92%,55%)' },
                ].map(stat => (
                  <div key={stat.label} className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <stat.icon size={16} style={{ color: stat.color, marginBottom: 8 }} />
                    <span className="text-2xl font-bold block" style={{ color: 'var(--text-primary)' }}>{stat.value}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Readiness Progress */}
              <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cohort Industry Readiness</h2>
                  <span className="text-2xl font-bold" style={{ color: 'hsl(160,70%,45%)' }}>{data.avgReadiness}%</span>
                </div>
                <div className="progress-bar" style={{ height: 10, marginBottom: 12 }}>
                  <div style={{ width: `${data.avgReadiness}%`, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg, var(--v-indigo), hsl(160,70%,45%))', transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-lg font-bold" style={{ color: 'hsl(160,70%,45%)' }}>{data.industryReady}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Industry Ready</p></div>
                  <div><p className="text-lg font-bold" style={{ color: 'hsl(38,90%,55%)' }}>{data.needsUpskilling}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Need Upskilling</p></div>
                  <div><p className="text-lg font-bold" style={{ color: 'var(--v-indigo)' }}>{data.interviewCount}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Interviews</p></div>
                </div>
              </div>

              {/* Top Strengths */}
              {data.topStrengths?.length > 0 && (
                <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>🏆 Cohort Strengths</h2>
                  {data.topStrengths.map(s => (
                    <HorizontalBar key={s.slug} label={s.name} value={s.avgProficiency} color="hsl(160,70%,45%)" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SKILL ANALYTICS TAB ────────────────────────────────────── */}
          {activeTab === 'Skill Analytics' && (
            <div className="space-y-6">
              {/* Category Breakdown */}
              {data.categoryBreakdown?.length > 0 && (
                <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Skills by Category</h2>
                  {data.categoryBreakdown.map(cat => (
                    <HorizontalBar key={cat.category} label={cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
                      value={cat.avgProficiency} color={CAT_COLORS[cat.category] || 'var(--v-indigo)'} />
                  ))}
                </div>
              )}

              {/* Critical Gaps */}
              {data.criticalGaps?.length > 0 && (
                <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    ⚠️ Skill Gaps (Below 60% avg)
                  </h2>
                  {data.criticalGaps.map(s => (
                    <HorizontalBar key={s.slug} label={s.name} value={s.avgProficiency || s.studentAvgProficiency || 0} color="hsl(38,90%,55%)" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── INDUSTRY DEMAND TAB ────────────────────────────────────── */}
          {activeTab === 'Industry Demand' && (
            <div className="space-y-6">
              {gapLoading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto animate-spin"
                    style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--v-indigo)' }} />
                </div>
              ) : (
                <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <h2 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Industry Demand vs Student Proficiency</h2>
                  <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Side-by-side comparison of what industry requires and what your students know</p>
                  {(industryComparison.length > 0 ? industryComparison : getDemoComparison()).map(item => (
                    <div key={item.slug} className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.skillName}</span>
                        <div className="flex gap-4">
                          <span style={{ color: 'hsl(348,70%,60%)' }}>Industry: {item.industryDemandPercent}%</span>
                          <span style={{ color: 'hsl(160,70%,45%)' }}>Students: {item.studentProficiency}%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="progress-bar" style={{ height: 5 }}>
                          <div style={{ width: `${item.industryDemandPercent}%`, height: '100%', borderRadius: 9999, background: 'hsl(348,70%,60%)', opacity: 0.7 }} />
                        </div>
                        <div className="progress-bar" style={{ height: 5 }}>
                          <div style={{ width: `${item.studentProficiency}%`, height: '100%', borderRadius: 9999, background: 'hsl(160,70%,45%)' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 mt-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full inline-block" style={{ background: 'hsl(348,70%,60%)' }} /> Industry Demand %</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full inline-block" style={{ background: 'hsl(160,70%,45%)' }} /> Student Proficiency %</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CURRICULUM GAPS TAB ────────────────────────────────────── */}
          {activeTab === 'Curriculum Gaps' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl flex items-start gap-3"
                style={{ background: 'hsla(348,70%,60%,0.06)', border: '1px solid hsla(348,70%,60%,0.2)' }}>
                <AlertTriangle size={16} style={{ color: 'hsl(348,70%,60%)', flexShrink: 0, marginTop: 2 }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Curriculum gaps are detected when a skill has <strong>high industry demand (≥30%)</strong> but <strong>low student proficiency</strong> (below industry requirement). Prioritize addressing Critical and High severity gaps.
                </p>
              </div>

              {gapLoading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto animate-spin"
                    style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--v-indigo)' }} />
                </div>
              ) : (curriculumGaps.length > 0 ? curriculumGaps : getDemoCurriculumGaps()).map(gap => {
                const sev = SEVERITY_CONFIG[gap.severity] || SEVERITY_CONFIG.medium;
                return (
                  <div key={gap.slug} className="p-5 rounded-2xl"
                    style={{ background: 'var(--bg-surface)', border: `1px solid ${sev.border}` }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                            {sev.icon} {sev.label}
                          </span>
                          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{gap.skillName}</h3>
                        </div>
                      </div>
                      <div className="flex gap-4 text-right shrink-0 text-xs">
                        <div><div className="font-bold" style={{ color: 'hsl(348,70%,60%)' }}>{gap.industryDemandPercent}%</div><div style={{ color: 'var(--text-dim)' }}>Industry demand</div></div>
                        <div><div className="font-bold" style={{ color: 'hsl(38,90%,55%)' }}>{gap.studentAvgProficiency}%</div><div style={{ color: 'var(--text-dim)' }}>Student avg</div></div>
                        <div><div className="font-bold" style={{ color: sev.color }}>{gap.gapSize}%</div><div style={{ color: 'var(--text-dim)' }}>Gap size</div></div>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="mt-3 space-y-1.5">
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div style={{ width: `${gap.industryDemandPercent}%`, height: '100%', borderRadius: 9999, background: sev.color, opacity: 0.6 }} />
                      </div>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div style={{ width: `${gap.studentAvgProficiency}%`, height: '100%', borderRadius: 9999, background: 'hsl(160,70%,45%)' }} />
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="mt-4 p-3 rounded-xl text-xs"
                      style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                      <strong>💡 Recommendation:</strong> {gap.recommendation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── WORKSHOPS TAB ─────────────────────────────────────────── */}
          {activeTab === 'Workshops' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Industry Workshops & FDPs
                </h2>
                <button onClick={() => setShowCreateWorkshop(true)} className="btn-primary flex items-center gap-2">
                  <Plus size={14} />Create Workshop
                </button>
              </div>

              {showCreateWorkshop && (
                <div className="p-5 rounded-2xl space-y-4"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Create New Workshop</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { field: 'title', label: 'Workshop Title', placeholder: 'AWS Cloud Fundamentals' },
                      { field: 'topic', label: 'Topic / Domain', placeholder: 'Cloud Computing' },
                      { field: 'conductedBy', label: 'Speaker / Trainer', placeholder: 'AWS Solutions Architect' },
                      { field: 'date', label: 'Date', placeholder: '', type: 'date' },
                      { field: 'duration', label: 'Duration', placeholder: '3 hours' },
                      { field: 'seats', label: 'Max Seats', placeholder: '50', type: 'number' },
                    ].map(({ field, label, placeholder, type }) => (
                      <div key={field}>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                        <input type={type || 'text'} value={workshopForm[field]}
                          onChange={e => setWorkshopForm(f => ({ ...f, [field]: e.target.value }))}
                          placeholder={placeholder} className="input-dark w-full" />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                      <textarea rows={2} value={workshopForm.description}
                        onChange={e => setWorkshopForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="What will students learn?" className="input-dark w-full resize-none" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={createWorkshop} className="btn-primary">Create Workshop</button>
                    <button onClick={() => setShowCreateWorkshop(false)} className="btn-ghost">Cancel</button>
                  </div>
                </div>
              )}

              {workshops.length === 0 ? (
                <div className="py-16 text-center rounded-2xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <GraduationCap size={36} className="mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
                  <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No workshops scheduled yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Create your first industry workshop</p>
                </div>
              ) : workshops.map(w => (
                <div key={w._id} className="p-5 rounded-2xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{w.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {w.conductedBy && `By ${w.conductedBy} · `}{w.mode} · {w.duration}
                      </p>
                      {w.description && <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{w.description}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold" style={{ color: 'var(--v-indigo)' }}>
                        {w.seatsLeft ?? w.seats} seats left
                      </div>
                      {w.date && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>}
                      <button onClick={() => registerWorkshop(w._id)}
                        disabled={w.isRegistered}
                        className="mt-2 text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={w.isRegistered
                          ? { background: 'hsla(160,70%,45%,0.1)', color: 'hsl(160,70%,45%)' }
                          : { background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))', color: 'white' }}>
                        {w.isRegistered ? '✓ Registered' : 'Register'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getDemoComparison() {
  return [
    { slug: 'java', skillName: 'Java', industryDemandPercent: 92, studentProficiency: 84 },
    { slug: 'python', skillName: 'Python', industryDemandPercent: 87, studentProficiency: 71 },
    { slug: 'aws', skillName: 'AWS / Cloud', industryDemandPercent: 78, studentProficiency: 38 },
    { slug: 'system-design', skillName: 'System Design', industryDemandPercent: 67, studentProficiency: 42 },
    { slug: 'machine-learning', skillName: 'AI / ML', industryDemandPercent: 68, studentProficiency: 41 },
    { slug: 'docker', skillName: 'Docker', industryDemandPercent: 58, studentProficiency: 38 },
    { slug: 'communication', skillName: 'Communication', industryDemandPercent: 95, studentProficiency: 74 },
    { slug: 'data-structures', skillName: 'DSA', industryDemandPercent: 88, studentProficiency: 71 }
  ];
}

function getDemoCurriculumGaps() {
  return [
    { slug: 'aws', skillName: 'AWS Cloud Computing', industryDemandPercent: 78, studentAvgProficiency: 38, industryRequiredProficiency: 65, gapSize: 27, severity: 'critical', recommendation: 'CRITICAL: Add a dedicated AWS Cloud course to the curriculum. 78% of industry jobs require it but students average only 38%.' },
    { slug: 'system-design', skillName: 'System Design', industryDemandPercent: 67, studentAvgProficiency: 42, industryRequiredProficiency: 70, gapSize: 28, severity: 'critical', recommendation: 'CRITICAL: Add a dedicated System Design course to the curriculum. 67% of industry jobs require it but students average only 42%.' },
    { slug: 'spring-boot', skillName: 'Spring Boot', industryDemandPercent: 52, studentAvgProficiency: 45, industryRequiredProficiency: 70, gapSize: 25, severity: 'high', recommendation: 'Recommended: Introduce Spring Boot as an elective or add an industry-led workshop.' },
    { slug: 'docker', skillName: 'Docker & Containers', industryDemandPercent: 48, studentAvgProficiency: 38, industryRequiredProficiency: 65, gapSize: 27, severity: 'high', recommendation: 'Recommended: Introduce Docker containerization as an elective or workshop.' },
    { slug: 'machine-learning', skillName: 'Machine Learning', industryDemandPercent: 42, studentAvgProficiency: 35, industryRequiredProficiency: 68, gapSize: 33, severity: 'high', recommendation: 'Recommended: Add AI/ML as a core elective. Industry demand is at 42% and growing rapidly.' }
  ];
}
