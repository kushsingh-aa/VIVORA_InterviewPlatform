import React, { useState, useEffect } from 'react';
import { useInterview } from '../context/InterviewContext';
import { Settings, Key, Volume2, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsView() {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { speechRate, setSpeechRate } = useInterview();

  useEffect(() => {
    setApiKeyInput(localStorage.getItem('vivora_api_key') || '');
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
    <div className="max-w-xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.3)' }}>
          <Settings size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Configure your custom API keys and interview preferences.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl text-xs flex items-center gap-2"
          style={{ background: 'hsla(160,84%,39%,0.12)', color: 'hsl(160,84%,50%)', border: '1px solid hsla(160,84%,39%,0.3)' }}>
          <CheckCircle2 size={16} /> Preferences successfully updated.
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-2xl space-y-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          <Key size={15} style={{ color: 'var(--v-indigo)' }} /> Custom LLM API Key
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Optionally override the server's AI backend with your personal OpenRouter or Gemini API key.
        </p>
        <input
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="sk-or-v1-... or AIzaSy..."
          className="input-dark font-mono text-xs"
        />
        <div className="flex justify-end pt-1">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={14} /> Save Preferences
          </button>
        </div>
      </form>

      <div className="p-6 rounded-2xl space-y-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            <Volume2 size={15} style={{ color: 'var(--v-indigo)' }} /> AI Speech Synthesis Rate
          </div>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-md font-bold"
            style={{ background: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.3)' }}>
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
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
