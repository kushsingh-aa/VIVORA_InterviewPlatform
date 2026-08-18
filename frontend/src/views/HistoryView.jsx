import React from 'react';
import { useInterview } from '../context/InterviewContext';
import { History, Award, Calendar, ArrowRight } from 'lucide-react';

export default function HistoryView({ onInspectReport }) {
  const { historyArchive } = useInterview();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <History size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Historical Evaluation Archive</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Review and audit your past assessment sessions, telemetry scores, and interviewer feedback.
            </p>
          </div>
        </div>
      </div>

      {/* History Items */}
      {historyArchive.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Award size={40} className="mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Assessment Records Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Complete an interview track from the dashboard to compile your first performance evaluation scorecard.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyArchive.map((session, idx) => {
            const overallScore = session.report?.overallScore || 80;
            const recommendation = session.report?.recommendation || 'Hire';
            const dateStr = session.createdAt ? new Date(session.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'Recent Session';

            return (
              <div
                key={session.sessionId || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {session.role || session.track || 'Software Engineering'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-bold">
                      {session.difficulty || 'Senior'} Level
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Calendar size={13} />
                    <span>{dateStr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-400 uppercase">Score</span>
                    <span className="font-mono font-black text-lg text-indigo-600 dark:text-indigo-400">
                      {overallScore}%
                    </span>
                  </div>

                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase">
                    {recommendation}
                  </span>

                  {session.report && (
                    <button
                      onClick={() => onInspectReport(session.report)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all"
                    >
                      <span>View Scorecard</span>
                      <ArrowRight size={14} />
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
