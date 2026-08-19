import React, { useState, useEffect } from 'react';
import { useInterview } from '../context/InterviewContext';
import { Settings, Key, Volume2, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsView() {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { speechRate, setSpeechRate } = useInterview();

  useEffect(() => {
    const saved = localStorage.getItem('vivora_api_key') || '';
    setApiKeyInput(saved);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      localStorage.setItem('vivora_api_key', apiKeyInput.trim());
    } else {
      localStorage.removeItem('vivora_api_key');
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-900/5">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Settings size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Platform Settings</h2>
            <p className="text-xs text-slate-500 font-normal">
              Configure your custom AI model keys, speech synthesis rate, and platform preferences.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-700 flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 size={16} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* API Key Form */}
      <form onSubmit={handleSave} className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl shadow-indigo-900/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Key size={16} className="text-indigo-600" />
            <span>Custom LLM API Key (OpenRouter / OpenAI / Gemini)</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            By default, the server uses your configured environment keys. You can override it here with your own key for testing.
          </p>
        </div>

        <input
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="sk-or-v1-... or sk-..."
          className="w-full p-3.5 border border-indigo-100 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs text-slate-900 bg-[#f8faff] transition-all"
        />

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Voice Preferences */}
      <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-indigo-900/5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Volume2 size={16} className="text-indigo-600" />
              <span>AI Voice Speech Rate</span>
            </div>
            <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              {speechRate}x
            </span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.1"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

    </div>
  );
}
