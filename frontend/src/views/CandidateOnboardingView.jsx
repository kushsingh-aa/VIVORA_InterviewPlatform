import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User, Mail, Phone, MapPin, GraduationCap, Building2,
  Calendar, Award, Code2, Linkedin, Github, FileText,
  UploadCloud, CheckCircle2, ChevronRight, Sparkles, X,
  ArrowRight, ShieldCheck, AlertCircle, Loader2
} from 'lucide-react';

const COMMON_SKILLS = [
  'Python', 'Java', 'C++', 'JavaScript', 'React',
  'Node.js', 'SQL', 'Data Structures', 'System Design',
  'AWS', 'Docker', 'Machine Learning', 'Git'
];

const DEGREES = ['B.Tech', 'B.E.', 'BCA', 'MCA', 'B.Sc Computer Science', 'M.Tech', 'M.Sc', 'Other'];

export default function CandidateOnboardingView({ onComplete, onSkip }) {
  const { user, updateUser } = useAuth();

  // Split name into first and last name for initial prefill
  const nameParts = (user?.name || '').trim().split(' ');
  const initialFirst = nameParts[0] || '';
  const initialLast = nameParts.slice(1).join(' ') || '';

  const [form, setForm] = useState({
    firstName: initialFirst,
    lastName: initialLast,
    phone: user?.phone || '',
    location: user?.location || '',
    institution: user?.institution || '',
    degree: user?.degree || 'B.Tech',
    branch: user?.branch || '',
    graduationYear: user?.graduationYear ? String(user.graduationYear) : '2026',
    cgpa: user?.cgpa ? String(user.cgpa) : '',
    technicalSkills: user?.technicalSkills && user.technicalSkills.length > 0 ? user.technicalSkills : ['React', 'JavaScript'],
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    resumeUrl: user?.resumeUrl || ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTextChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !form.technicalSkills.includes(trimmed)) {
      setForm(prev => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, trimmed]
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm(prev => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter(s => s !== skillToRemove)
    }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (file) {
      setResumeFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setForm(prev => ({ ...prev, resumeUrl: reader.result || file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim() || user?.name || 'Candidate';

    const payload = {
      name: fullName,
      phone: form.phone.trim(),
      location: form.location.trim(),
      institution: form.institution.trim(),
      degree: form.degree,
      branch: form.branch.trim(),
      graduationYear: form.graduationYear ? parseInt(form.graduationYear, 10) : null,
      cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
      technicalSkills: form.technicalSkills,
      linkedinUrl: form.linkedinUrl.trim(),
      githubUrl: form.githubUrl.trim(),
      resumeUrl: form.resumeUrl || (resumeFile ? resumeFile.name : '')
    };

    try {
      const res = await api.put('/profile/me', payload);
      if (res.data.success && res.data.user) {
        updateUser(res.data.user);
      } else {
        updateUser(payload);
      }
    } catch (err) {
      console.warn('Profile sync fallback:', err);
      updateUser(payload);
    } finally {
      sessionStorage.setItem('vivora_profile_onboarded', 'true');
      setSaving(false);
      if (onComplete) onComplete();
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('vivora_profile_onboarded', 'true');
    if (onSkip) onSkip();
  };

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center justify-start" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar branding */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-6 mb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))' }}>
            V
          </div>
          <div>
            <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Vivora</span>
            <span className="text-xs ml-2 px-2 py-0.5 rounded-full"
              style={{ background: 'hsla(239,84%,67%,0.12)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.2)' }}>
              Profile Setup
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-medium px-3.5 py-1.5 rounded-lg border transition-all hover:border-indigo-400"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
          Skip for Now →
        </button>
      </div>

      {/* Main card */}
      <div className="w-full max-w-3xl animate-fade-up">
        {/* Header banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ background: 'hsla(239,84%,67%,0.12)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.25)' }}>
            <Sparkles size={13} />
            <span>Step 1 of 2: Candidate Profile Calibration</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            Tell us about <span className="gradient-text">yourself</span>
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Our AI interviewer calibrates questions to your background, graduation institution, and core tech focus.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl text-xs flex items-center gap-2"
            style={{ background: 'hsla(348,83%,57%,0.12)', color: 'hsl(348,83%,70%)', border: '1px solid hsla(348,83%,57%,0.25)' }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── SECTION 1: Personal Details ── */}
          <div className="card p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))' }}>
                <User size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Personal Information</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your identity and home location</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  First Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative w-full">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={e => handleTextChange('firstName', e.target.value)}
                    placeholder="e.g. Rahul"
                    className="input-dark w-full pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => handleTextChange('lastName', e.target.value)}
                  placeholder="e.g. Sharma"
                  className="input-dark w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Where do you belong? (Location / City) <span className="text-rose-400">*</span>
                </label>
                <div className="relative w-full">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={e => handleTextChange('location', e.target.value)}
                    placeholder="e.g. Bengaluru, Karnataka or Delhi"
                    className="input-dark w-full pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Contact Phone Number
                </label>
                <div className="relative w-full">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => handleTextChange('phone', e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="input-dark w-full pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Academic & Graduation ── */}
          <div className="card p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, hsl(187,70%,40%), hsl(220,70%,55%))' }}>
                <GraduationCap size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Graduation &amp; Academics</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>From where you graduated or are studying</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  College / University (From where you did graduation) <span className="text-rose-400">*</span>
                </label>
                <div className="relative w-full">
                  <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    required
                    value={form.institution}
                    onChange={e => handleTextChange('institution', e.target.value)}
                    placeholder="e.g. National Institute of Technology Karnataka or IIT Delhi"
                    className="input-dark w-full pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Degree
                  </label>
                  <select
                    value={form.degree}
                    onChange={e => handleTextChange('degree', e.target.value)}
                    className="input-dark w-full cursor-pointer"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                    {DEGREES.map(deg => (
                      <option key={deg} value={deg} style={{ background: '#0d1322', color: '#f1f5f9' }}>
                        {deg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Branch / Major
                  </label>
                  <input
                    type="text"
                    value={form.branch}
                    onChange={e => handleTextChange('branch', e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="input-dark w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Graduation Year
                  </label>
                  <div className="relative w-full">
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
                    <input
                      type="number"
                      min="1990"
                      max="2035"
                      value={form.graduationYear}
                      onChange={e => handleTextChange('graduationYear', e.target.value)}
                      placeholder="e.g. 2026"
                      className="input-dark w-full pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  CGPA / Percentage (Optional)
                </label>
                <div className="relative w-full">
                  <Award size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={form.cgpa}
                    onChange={e => handleTextChange('cgpa', e.target.value)}
                    placeholder="e.g. 8.75"
                    className="input-dark w-full pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Technical Skills & Profiles ── */}
          <div className="card p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, hsl(280,70%,55%), hsl(320,60%,55%))' }}>
                <Code2 size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Skills &amp; Profiles</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Languages, tools, and professional profiles</p>
              </div>
            </div>

            {/* Selected Skills */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Your Primary Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[36px] p-2.5 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                {form.technicalSkills.length === 0 ? (
                  <span className="text-xs self-center" style={{ color: 'var(--text-dim)' }}>No skills added yet. Pick from below or type one!</span>
                ) : form.technicalSkills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.35)' }}>
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:opacity-75 focus:outline-none ml-0.5">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add custom skill input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(skillInput); } }}
                  placeholder="Type a skill & press Enter (e.g. TypeScript, Docker, Go)..."
                  className="input-dark flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  Add Skill
                </button>
              </div>

              {/* Quick suggestion pills */}
              <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-dim)' }}>Popular:</span>
                {COMMON_SKILLS.filter(s => !form.technicalSkills.includes(s)).slice(0, 7).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all hover:border-indigo-400"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  LinkedIn Profile URL (Optional)
                </label>
                <div className="relative w-full">
                  <Linkedin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-sky-400" />
                  <input
                    type="url"
                    value={form.linkedinUrl}
                    onChange={e => handleTextChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="input-dark w-full pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  GitHub Profile URL (Optional)
                </label>
                <div className="relative w-full">
                  <Github size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="url"
                    value={form.githubUrl}
                    onChange={e => handleTextChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="input-dark w-full pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 4: Optional Resume Upload ── */}
          <div className="card p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(180,60%,40%))' }}>
                  <FileText size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Resume (Optional)</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload your CV document or attach a public URL</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-dim)', border: '1px solid var(--border-subtle)' }}>
                Optional
              </span>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer hover:border-indigo-400"
              style={{
                borderColor: resumeFile ? 'hsl(160,84%,45%)' : 'var(--border-subtle)',
                background: resumeFile ? 'hsla(160,84%,39%,0.05)' : 'var(--bg-elevated)'
              }}>
              <input
                type="file"
                id="resume-file-input"
                accept=".pdf,.doc,.docx"
                onChange={handleFileDrop}
                className="hidden"
              />
              <label htmlFor="resume-file-input" className="cursor-pointer block">
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 size={26} className="text-emerald-400 shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{resumeFile.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                        {(resumeFile.size / 1024).toFixed(1)} KB · Document attached successfully
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud size={30} className="mx-auto" style={{ color: 'var(--v-indigo)' }} />
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Drag &amp; drop your resume, or <span className="underline" style={{ color: 'var(--v-indigo)' }}>browse file</span>
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                      Supports PDF or DOCX up to 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Optional Drive / Cloud Link */}
            <div className="mt-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Or provide a Google Drive / Notion / Portfolio Resume link:
              </label>
              <input
                type="url"
                value={form.resumeUrl.startsWith('data:') ? '' : form.resumeUrl}
                onChange={e => handleTextChange('resumeUrl', e.target.value)}
                placeholder="https://drive.google.com/file/d/... or personal website"
                className="input-dark w-full"
              />
            </div>
          </div>

          {/* ── Submit / Navigation Controls ── */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-medium px-4 py-2 rounded-lg transition-colors hover:text-white"
              style={{ color: 'var(--text-muted)' }}>
              I'll complete this later (Skip)
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto px-8 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg hover-lift">
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <span>Save &amp; Continue to Track Selection</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
