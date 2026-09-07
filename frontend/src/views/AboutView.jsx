import React from 'react';
import { Info, Brain, Activity, Cpu, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AboutView({ onStartAssessment }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up pb-10">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          About <span className="gradient-text">Vivora AI</span>
        </h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Vivora is an intelligent, multi-agent AI interview preparation and competency assessment platform.
          Instead of rigid question banks, it conducts adaptive conversational interviews calibrated to seniority levels —
          evaluating technical mastery, behavioral integrity, and core communication metrics in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Brain, title: 'Dynamic Conversation', desc: 'AI adapts follow-up questions and hints based on your responses. No fixed question scripts.' },
          { icon: Activity, title: 'Behavior Monitoring', desc: 'Real-time multi-person detection, phone usage indicators, and attention telemetry.' },
          { icon: Cpu, title: 'Seniority Calibration', desc: 'Questions dynamically adapt from Junior fundamentals to Staff/Principal distributed systems.' },
          { icon: ShieldCheck, title: 'Integrity Scoring', desc: 'Transparent behavioral integrity metrics and proctoring telemetry included in your verified scorecard.' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <Icon size={20} style={{ color: 'var(--v-indigo)', marginBottom: '12px' }} />
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button onClick={onStartAssessment} className="btn-primary flex items-center gap-2">
          Start Interview <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
