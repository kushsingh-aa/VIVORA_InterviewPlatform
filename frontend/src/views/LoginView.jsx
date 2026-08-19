import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';

export default function LoginView() {
  const [email, setEmail] = useState('candidate.test@vivora.ai');
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
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-[#f8faff] via-[#eef4ff] to-[#f4f0ff] relative overflow-hidden">
      
      {/* Background ambient orbs */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md p-8 md:p-10 bg-white/90 backdrop-blur-2xl border border-indigo-100/80 rounded-3xl shadow-2xl shadow-indigo-950/10 space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-600 text-white rounded-2xl text-2xl font-black shadow-lg shadow-indigo-500/25 mb-1">
            V
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            VIVORA <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-slate-500 text-xs font-semibold">
            Next-Gen Autonomous Technical Interview Platform
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700">
              Candidate Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@vivora.ai"
              className="w-full p-3.5 border border-indigo-100 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium text-slate-900 bg-[#f8faff] transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700">
              Access Key / Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-3.5 pr-16 border border-indigo-100 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium text-slate-900 bg-[#f8faff] transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-indigo-600 hover:text-indigo-800 tracking-wider"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white font-extrabold p-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all text-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Enter Assessment Chamber'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-indigo-100 w-full"></div>
          <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-widest absolute">
            or
          </span>
        </div>

        {/* Demo Mode Button */}
        <button
          type="button"
          onClick={loginDemo}
          className="w-full bg-[#f4f7fe] hover:bg-[#ebf1fe] text-indigo-900 font-bold p-3.5 rounded-2xl border border-indigo-100 transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
        >
          <Zap size={15} className="text-amber-500" />
          <span>⚡ Instant Guest Access (No Credentials Required)</span>
        </button>

      </div>
    </div>
  );
}
