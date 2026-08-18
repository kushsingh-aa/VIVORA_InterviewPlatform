import React, { useState } from 'react';
import { LifeBuoy, Send, CheckCircle2, ShieldCheck, Cpu, Mic, Camera, HelpCircle, MessageSquare } from 'lucide-react';

export default function SupportView() {
  const [category, setCategory] = useState('Web Speech API Audio Interruption');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setDescription('');
      setSubmitted(false);
    }, 4000);
  };

  const faqs = [
    {
      q: 'How does Vivora calibrate question difficulty across seniorities?',
      a: 'Vivora prompts its OpenRouter LLM core with specialized persona calibration archetypes ranging from Junior (CRUD & language fundamentals) to Staff (planetary multi-region sharding & zero-downtime consensus).'
    },
    {
      q: 'How does speech synthesis and microphone voice recording work?',
      a: 'Vivora utilizes the native browser Web Speech API for high-fidelity speech synthesis and real-time SpeechRecognition STT. Speech stops immediately whenever you conclude the chamber.'
    },
    {
      q: 'Is my assessment session saved permanently?',
      a: 'Yes, all session dialogues, rubrics, and final scorecards are persisted in MongoDB Atlas Cloud and can be inspected in the History Archive anytime.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <LifeBuoy size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Platform Assistance Matrix</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Encountering anomalies or need telemetry calibration? Dispatch a diagnostic ticket or browse system FAQs.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Support Ticket Form (7 Cols) */}
        <div className="md:col-span-7 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm space-y-5">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>Dispatch Analytical Support Ticket</span>
          </h2>

          {submitted && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>✓ Ticket successfully dispatched to telemetry support node!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Issue Classification
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option>Web Speech API Voice Synthesis Interruption</option>
                <option>Microphone Speech-to-Text Input Issue</option>
                <option>Webcam Biometric Feed Not Initializing</option>
                <option>OpenRouter LLM Response Latency</option>
                <option>MongoDB History Persistence Issue</option>
                <option>Custom Seniority Calibration Request</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Detailed Diagnostic Description
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, your browser, and any steps to reproduce..."
                className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 font-medium text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold p-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all text-xs flex items-center justify-center gap-2"
            >
              <Send size={15} />
              <span>Dispatch Support Ticket</span>
            </button>
          </form>
        </div>

        {/* Quick Diagnostics & Status (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              Live System Status
            </span>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Cpu size={14} className="text-indigo-500" /> OpenRouter LLM
                </span>
                <span className="text-emerald-500 font-bold">100% Operational</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Mic size={14} className="text-purple-500" /> Web Speech Engine
                </span>
                <span className="text-emerald-500 font-bold">Active</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck size={14} className="text-emerald-500" /> MongoDB Atlas Cloud
                </span>
                <span className="text-emerald-500 font-bold">Connected</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-white/10 space-y-2">
            <h3 className="font-bold text-sm">💡 Pro Tip for Voice Testing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use Google Chrome or Microsoft Edge for the highest fidelity natural neural voices in speech synthesis.
            </p>
          </div>

        </div>

      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-5">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-indigo-600" />
          <span>System Architecture & FAQs</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1.5">
              <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
                {faq.q}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
