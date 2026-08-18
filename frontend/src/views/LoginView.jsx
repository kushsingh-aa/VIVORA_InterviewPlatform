import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';

export default function LoginView() {
  const [email, setEmail] = useState('candidate@vivora.ai');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginDemo } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 md:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl text-3xl mb-3 shadow-inner">
            🤖
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            VIVORA <span className="text-indigo-600">AI</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mt-1">
            Autonomous Conversational Assessment Engine
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-3.5 rounded-xl text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
              Candidate Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@company.com"
              className="w-full p-3.5 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
              Access Key / Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-3.5 pr-16 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500 hover:text-indigo-600 tracking-wider"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white font-bold p-3.5 rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/20 transition-all text-sm flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Verifying...' : 'Enter Assessment Portal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
          <span className="bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 uppercase tracking-widest absolute">
            or
          </span>
        </div>

        {/* Instant Demo Mode Button */}
        <button
          type="button"
          onClick={loginDemo}
          className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-sm flex items-center justify-center gap-2"
        >
          <Zap size={16} className="text-amber-500" />
          <span>⚡ Launch Instant Demo Mode (No Login Required)</span>
        </button>

      </div>
    </div>
  );
}
