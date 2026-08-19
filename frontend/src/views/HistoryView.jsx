import React from 'react';
import { useInterview } from '../context/InterviewContext';
import { History, Award, Calendar, ArrowRight } from 'lucide-react';

export default function HistoryView({ onInspectReport }) {
  const { historyArchive } = useInterview();

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-900/5">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">
            <History size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Historical Evaluation Archive</h2>
            <p className="text-xs text-slate-500 font-normal">
              Review and audit your past assessment sessions, telemetry scores, and interviewer feedback.
            </p>
          </div>
        </div>
      </div>

      {/* History Items */}
      {historyArchive.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-12 text-center space-y-3 shadow-md shadow-indigo-900/5">
          <Award size={40} className="mx-auto text-indigo-300" />
          <h3 className="font-extrabold text-base text-slate-800">No Assessment Records Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete an interview track from the dashboard to compile your first performance evaluation scorecard.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {historyArchive.map((session, idx) => {
            const overallScore = session.report?.overallScore || 0;
            const recommendation = session.report?.recommendation || 'Incomplete';
            const isZero = overallScore === 0;
            const dateStr = session.createdAt ? new Date(session.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'Recent Session';

            return (
              <div
                key={session.sessionId || idx}
                className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 shadow-md shadow-indigo-900/5 hover:shadow-xl hover:border-indigo-300 transition-all flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">
                      {session.role || session.track || 'Software Engineering'}
                    </span>
                    <span className="px-3 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                      {session.difficulty || 'Senior'} Level
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Calendar size={13} className="text-indigo-500" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Score</span>
                    <span className={`font-black text-xl ${isZero ? 'text-slate-400' : 'text-indigo-600'}`}>
                      {overallScore}%
                    </span>
                  </div>

                  <span className={`px-3 py-1 border rounded-full text-xs font-extrabold uppercase ${
                    isZero ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    {recommendation}
                  </span>

                  {session.report && (
                    <button
                      onClick={() => onInspectReport(session.report)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
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
