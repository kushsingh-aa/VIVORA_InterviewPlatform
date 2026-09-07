import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ClipboardList, CheckCircle, Clock, XCircle, ChevronRight, Building2, Calendar } from 'lucide-react';

const STATUS_CONFIG = {
  applied: { label: 'Applied', color: 'hsl(220,70%,60%)', bg: 'hsla(220,70%,60%,0.1)', border: 'hsla(220,70%,60%,0.2)', icon: '📤' },
  under_review: { label: 'Under Review', color: 'hsl(38,90%,55%)', bg: 'hsla(38,90%,55%,0.1)', border: 'hsla(38,90%,55%,0.2)', icon: '👀' },
  shortlisted: { label: 'Shortlisted', color: 'hsl(262,80%,65%)', bg: 'hsla(262,80%,65%,0.1)', border: 'hsla(262,80%,65%,0.2)', icon: '⭐' },
  interview: { label: 'Interview', color: 'hsl(187,80%,48%)', bg: 'hsla(187,80%,48%,0.1)', border: 'hsla(187,80%,48%,0.2)', icon: '🎤' },
  selected: { label: 'Selected 🎉', color: 'hsl(160,70%,45%)', bg: 'hsla(160,70%,45%,0.1)', border: 'hsla(160,70%,45%,0.2)', icon: '✅' },
  rejected: { label: 'Rejected', color: 'hsl(348,70%,55%)', bg: 'hsla(348,70%,55%,0.1)', border: 'hsla(348,70%,55%,0.2)', icon: '❌' }
};

const STATUS_PIPELINE = ['applied', 'under_review', 'shortlisted', 'interview', 'selected'];

function StatusPipeline({ currentStatus }) {
  const isRejected = currentStatus === 'rejected';
  const currentIdx = STATUS_PIPELINE.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1 mt-3 flex-wrap">
      {STATUS_PIPELINE.map((status, idx) => {
        const conf = STATUS_CONFIG[status];
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;

        return (
          <React.Fragment key={status}>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all"
                style={{
                  background: isCurrent ? conf.bg : isPast ? 'hsla(160,70%,45%,0.08)' : 'var(--bg-elevated)',
                  color: isCurrent ? conf.color : isPast ? 'hsl(160,60%,50%)' : 'var(--text-dim)',
                  border: `1px solid ${isCurrent ? conf.border : isPast ? 'hsla(160,70%,45%,0.2)' : 'var(--border-subtle)'}`
                }}>
                {isPast ? '✓' : conf.icon} {conf.label.replace(' 🎉', '')}
              </div>
            </div>
            {idx < STATUS_PIPELINE.length - 1 && (
              <ChevronRight size={10} style={{ color: isPast ? 'hsl(160,60%,50%)' : 'var(--text-dim)' }} />
            )}
          </React.Fragment>
        );
      })}
      {isRejected && (
        <div className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ background: STATUS_CONFIG.rejected.bg, color: STATUS_CONFIG.rejected.color, border: `1px solid ${STATUS_CONFIG.rejected.border}` }}>
          ❌ Rejected
        </div>
      )}
    </div>
  );
}

export default function ApplicationsView() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/opportunity/my-applications');
      if (res.data.success) setApplications(res.data.applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? applications :
    applications.filter(a => a.status === filter);

  const counts = {};
  for (const a of applications) {
    counts[a.status] = (counts[a.status] || 0) + 1;
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <span className="gradient-text">My Applications</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Track the status of all your job and internship applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Object.entries(STATUS_CONFIG).map(([status, conf]) => (
          <button key={status} onClick={() => setFilter(filter === status ? 'all' : status)}
            className="p-3 rounded-xl text-center transition-all"
            style={{
              background: filter === status ? conf.bg : 'var(--bg-surface)',
              border: filter === status ? `1px solid ${conf.border}` : '1px solid var(--border-subtle)'
            }}>
            <p className="text-xl font-bold" style={{ color: filter === status ? conf.color : 'var(--text-primary)' }}>
              {counts[status] || 0}
            </p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {conf.label.replace(' 🎉', '')}
            </p>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`nav-tab ${filter === 'all' ? 'active' : ''}`}>
          All ({applications.length})
        </button>
        {Object.entries(STATUS_CONFIG).filter(([s]) => counts[s]).map(([status, conf]) => (
          <button key={status} onClick={() => setFilter(status)}
            className="nav-tab"
            style={filter === status ? { background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` } : {}}>
            {conf.icon} {conf.label.replace(' 🎉', '')} ({counts[status] || 0})
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto animate-spin"
            style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--v-indigo)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <ClipboardList size={40} className="mx-auto mb-4" style={{ color: 'var(--text-dim)' }} />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {filter === 'all' ? 'No applications yet' : `No ${STATUS_CONFIG[filter]?.label} applications`}
          </h3>
          <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            Browse opportunities and apply to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app, i) => {
            const opp = app.opportunityId || {};
            const conf = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
            return (
              <div key={app._id || i} className="p-5 rounded-2xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))', color: 'white' }}>
                      {(opp.company || 'C')[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {opp.title || 'Opportunity'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Building2 size={11} />
                        <span>{opp.company || 'Company'}</span>
                        {opp.location && <><span>·</span><span>{opp.location}</span></>}
                        <span>·</span>
                        <span className="capitalize">{(opp.type || 'internship').replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Match Score */}
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: app.matchScore >= 80 ? 'hsl(160,70%,45%)' : app.matchScore >= 60 ? 'var(--v-indigo)' : 'hsl(38,90%,55%)' }}>
                        {app.matchScore || 0}%
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>Match</div>
                    </div>
                    {/* Status Badge */}
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}>
                      {conf.icon} {conf.label}
                    </span>
                  </div>
                </div>

                {/* Status Pipeline */}
                {app.status !== 'rejected' && <StatusPipeline currentStatus={app.status} />}

                {/* Applied Date */}
                <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: 'var(--text-dim)' }}>
                  <Calendar size={11} />
                  <span>Applied {formatDate(app.appliedAt)}</span>
                  {app.statusHistory?.length > 1 && (
                    <span>· Last updated {formatDate(app.statusHistory[app.statusHistory.length - 1]?.changedAt)}</span>
                  )}
                </div>

                {/* Recruiter Note */}
                {app.recruiterNote && (
                  <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Recruiter note: </span>
                    {app.recruiterNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
