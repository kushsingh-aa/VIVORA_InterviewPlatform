import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useInterview } from '../context/InterviewContext';
import { Settings, Key, Volume2, Moon, Sun, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsView() {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { isDark, toggleTheme } = useTheme();
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
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <Settings size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Platform Settings & API Keys</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Configure your AI models, speech synthesis rate, and platform preferences.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* API Key Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
            <Key size={16} className="text-indigo-600" />
            <span>Custom LLM API Key (OpenRouter / OpenAI / Gemini)</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            By default, the server uses your configured environment keys. You can override it here with your own key for testing.
          </p>
        </div>

        <input
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="sk-or-v1-... or sk-..."
          className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-mono text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 transition-all"
        />

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-500/20"
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Voice & Theme Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        
        {/* Speech Rate Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <Volume2 size={16} className="text-indigo-600" />
              <span>AI Voice Speech Rate</span>
            </div>
            <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
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

        {/* Theme Toggle */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
            {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-600" />}
            <span>Interface Theme</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition-all"
          >
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </button>
        </div>

      </div>

    </div>
  );
}
