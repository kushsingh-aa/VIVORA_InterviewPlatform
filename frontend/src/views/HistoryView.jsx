import React, { useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import { History, Award, Calendar, ArrowRight, BarChart3, Filter } from 'lucide-react';

export default function HistoryView({ onInspectReport }) {
  const { historyArchive } = useInterview();
  const [filter, setFilter] = useState('all');

  const filtered = historyArchive.filter(session => {
    if (filter === 'all') return true;
    return session.track === filter || session.difficulty?.toLowerCase() === filter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <span className="gradient-text">Interview History</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {historyArchive.length} session{historyArchive.length !== 1 ? 's' : ''} · Review past assessments and scorecards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={13} style={{ color: 'var(--text-dim)' }} />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input-dark text-xs" style={{ padding: '6px 12px', width: 'auto' }}>
            <option value="all">All Sessions</option>
            <option value="software">Software Eng</option>
            <option value="system_design">System Design</option>
            <option value="product">Product</option>
            <option value="behavioral">Behavioral</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 rounded-2xl text-center"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <Award size={40} className="mx-auto mb-4" style={{ color: 'var(--text-dim)' }} />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {historyArchive.length === 0 ? 'No Sessions Yet' : 'No sessions match filter'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {historyArchive.length === 0
              ? 'Complete an AI interview to see your history and scorecard here.'
              : 'Try adjusting the filter above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session, idx) => {
            const score = session.report?.overallScore || 0;
            const rec = session.report?.recommendation || 'Incomplete';
            const isZero = score === 0;
            const dateStr = session.createdAt
              ? new Date(session.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })
              : 'Recent';

            const scoreColor = isZero ? 'hsl(348,70%,55%)'
              : score >= 80 ? 'hsl(160,84%,50%)'
              : score >= 60 ? 'var(--v-indigo)'
              : 'hsl(38,92%,55%)';

            return (
              <div key={session.sessionId || idx}
                className="p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all duration-200 hover-lift"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>

                <div className="flex items-center gap-4">
                  {/* Score ring mini */}
                  <div className="relative w-12 h-12 shrink-0">
                    <svg width="48" height="48" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="19" fill="none" stroke="var(--bg-muted)" strokeWidth="4" />
                      <circle cx="24" cy="24" r="19" fill="none" stroke={scoreColor} strokeWidth="4"
                        strokeLinecap="round" strokeDasharray={119.4}
                        strokeDashoffset={119.4 - (score / 100) * 119.4}
                        transform="rotate(-90 24 24)"
                        style={{ filter: `drop-shadow(0 0 4px ${scoreColor}50)` }} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: scoreColor }}>
                      {score}%
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {session.role || session.track || 'Engineering'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-dim)', border: '1px solid var(--border-subtle)' }}>
                        {session.difficulty || 'Senior'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-dim)' }}>
                      <Calendar size={11} />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={isZero
                      ? { background: 'hsla(348,83%,57%,0.1)', color: 'hsl(348,83%,65%)', border: '1px solid hsla(348,83%,57%,0.2)' }
                      : score >= 80
                        ? { background: 'hsla(160,84%,39%,0.1)', color: 'hsl(160,84%,50%)', border: '1px solid hsla(160,84%,39%,0.2)' }
                        : { background: 'hsla(239,84%,67%,0.1)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.2)' }
                    }>
                    {rec}
                  </span>
                  {session.report && (
                    <button onClick={() => onInspectReport(session.report)}
                      className="flex items-center gap-1.5 btn-primary text-xs" style={{ padding: '7px 14px' }}>
                      View <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
