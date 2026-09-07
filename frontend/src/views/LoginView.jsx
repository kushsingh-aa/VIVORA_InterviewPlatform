import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Eye, EyeOff, Sparkles, Brain, Shield, TrendingUp } from 'lucide-react';

const FEATURES = [
  { icon: Brain, label: 'AI Interviews', desc: 'Multi-turn LLM-powered assessment' },
  { icon: Shield, label: 'Skill Passport', desc: 'Auto-verified competency profile' },
  { icon: TrendingUp, label: 'Gap Analysis', desc: 'Industry role skill matching' },
];

export default function LoginView() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('candidate');
  const [institution, setInstitution] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginDemo, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    let res;
    if (tab === 'login') {
      res = await login(email, password);
    } else {
      res = await register({ name, email, password, role, institution, company });
    }

    setIsSubmitting(false);
    if (!res.success) setErrorMsg(res.message);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, hsl(239,60%,14%) 0%, hsl(262,55%,10%) 100%)' }}>

        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Glow orbs */}
        <div className="absolute top-32 left-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--v-indigo), transparent 70%)' }} />
        <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, var(--v-violet), transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))' }}>
              V
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Vivora</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            AI-Powered<br />
            <span style={{ background: 'linear-gradient(135deg, var(--v-indigo), var(--v-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Skill Intelligence
            </span><br />
            Platform
          </h1>
          <p style={{ color: 'hsl(215,25%,65%)' }} className="text-sm leading-relaxed max-w-xs">
            Assess, map, and bridge the gap between academia and industry. From AI interviews to skill passports to opportunity matching.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'hsla(239,50%,50%,0.08)', border: '1px solid hsla(239,50%,50%,0.12)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'hsla(239,84%,67%,0.15)' }}>
                <Icon size={16} style={{ color: 'var(--v-indigo)' }} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{label}</p>
                <p className="text-xs" style={{ color: 'hsl(215,20%,55%)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'hsl(215,15%,40%)' }}>
          AI-Powered Employability Platform
        </p>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))' }}>V</div>
            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Vivora</span>
          </div>

          {/* Tabs */}
          <div className="flex p-1 rounded-xl mb-8" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setErrorMsg(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
                style={tab === t
                  ? { background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))', color: 'white', boxShadow: '0 4px 12px hsla(239,84%,55%,0.3)' }
                  : { color: 'var(--text-muted)', background: 'transparent' }
                }>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {tab === 'login'
                ? 'Sign in to continue your skill journey'
                : 'Join the AI-powered employability platform'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: 'hsla(348,83%,57%,0.1)', border: '1px solid hsla(348,83%,57%,0.25)', color: 'hsl(348,83%,70%)' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your full name" className="input-dark" />
                </div>

                {/* Role selector */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>I am a...</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'candidate', label: 'Student', emoji: '🎓' },
                      { id: 'recruiter', label: 'Recruiter', emoji: '💼' },
                      { id: 'faculty', label: 'Faculty', emoji: '🏫' },
                      { id: 'admin', label: 'Admin', emoji: '🛡️' }
                    ].map(r => (
                      <button type="button" key={r.id} onClick={() => setRole(r.id)}
                        className="py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all"
                        style={role === r.id
                          ? { background: 'hsla(239,84%,67%,0.15)', border: '1px solid hsla(239,84%,67%,0.4)', color: 'var(--v-indigo)' }
                          : { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <span className="text-base">{r.emoji}</span>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {role === 'candidate' && (
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Institution</label>
                    <input type="text" value={institution} onChange={e => setInstitution(e.target.value)}
                      placeholder="Your college / university" className="input-dark" />
                  </div>
                )}
                {role === 'recruiter' && (
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Company</label>
                    <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                      placeholder="Your company name" className="input-dark" />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="input-dark" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" className="input-dark pr-12" />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-dim)' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 mt-2" style={{ padding: '12px 20px' }}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
          </div>

          <button type="button" onClick={loginDemo}
            className="btn-ghost w-full flex items-center justify-center gap-2">
            <Sparkles size={15} style={{ color: 'var(--v-violet)' }} />
            Continue as Guest
          </button>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--text-dim)' }}>
            Demo mode · No account needed · AI interviews available
          </p>
        </div>
      </div>
    </div>
  );
}
