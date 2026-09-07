import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Users, TrendingUp, Plus, ChevronDown, ChevronUp,
  Sparkles, CheckCircle2, Clock, XCircle, Award, Target, Bot, Layers, X
} from 'lucide-react';
import api from '../services/api';

const STATUS_PIPELINE = [
  { id: 'applied', label: 'Applied', color: 'hsl(220,70%,60%)' },
  { id: 'under_review', label: 'Under Review', color: 'hsl(38,90%,55%)' },
  { id: 'shortlisted', label: 'AI Shortlisted', color: 'var(--v-indigo)' },
  { id: 'interview', label: 'Interview', color: 'hsl(187,80%,48%)' },
  { id: 'selected', label: 'Selected 🎉', color: 'hsl(160,70%,45%)' },
  { id: 'rejected', label: 'Rejected', color: 'hsl(348,70%,55%)' }
];

export default function RecruiterView() {
  const { user, token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // AI Shortlist Modal State
  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [shortlistData, setShortlistData] = useState([]);
  const [shortlistTitle, setShortlistTitle] = useState('');
  const [shortlistLoading, setShortlistLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    domain: 'software',
    type: 'internship',
    location: 'Bangalore (Hybrid)',
    workMode: 'hybrid',
    stipend: '₹35,000/month',
    duration: '3 months',
    description: '',
    skillsString: 'Java: 80, Spring Boot: 70, SQL: 70, DSA: 75'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/opportunity/recruiter/listings');
      if (res.data.success) setListings(res.data.listings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    // Parse skills string (e.g. "Java: 80, Spring Boot: 70")
    const parsedSkills = (form.skillsString || '').split(',').map(s => {
      const parts = s.split(':');
      const name = parts[0]?.trim();
      const minProf = parseInt(parts[1]?.trim(), 10) || 65;
      return {
        skillSlug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        skillName: name,
        minProficiency: minProf,
        weight: 1.2
      };
    }).filter(s => s.skillName);

    try {
      const res = await api.post('/opportunity', {
        ...form,
        company: user?.company || user?.name || 'Google Cloud',
        requiredSkills: parsedSkills
      });
      if (res.data.success) {
        setShowForm(false);
        setForm({
          title: '', domain: 'software', type: 'internship',
          location: 'Bangalore (Hybrid)', workMode: 'hybrid',
          stipend: '₹35,000/month', duration: '3 months', description: '',
          skillsString: 'Java: 80, Spring Boot: 70, SQL: 70, DSA: 75'
        });
        fetchListings();
      } else {
        setFormError(res.data.message || 'Failed to post opportunity');
      }
    } catch (e) {
      setFormError(e.response?.data?.message || e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleTriggerShortlist = async (listing) => {
    setShortlistTitle(listing.title);
    setShortlistModalOpen(true);
    setShortlistLoading(true);

    try {
      const res = await api.get(`/opportunity/recruiter/shortlist/${listing._id}`);
      if (res.data.success) {
        setShortlistData(res.data.shortlist || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setShortlistLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/opportunity/recruiter/application/${appId}/status`, { status: newStatus });
      // Update local state
      setListings(prev => prev.map(l => ({
        ...l,
        applications: l.applications?.map(a => a._id === appId ? { ...a, status: newStatus } : a)
      })));
      setShortlistData(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const totalApplicants = listings.reduce((a, l) => a + (l.applications?.length || 0), 0);
  const totalShortlisted = listings.reduce((a, l) => a + (l.applications?.filter(ap => ap.status === 'shortlisted' || ap.status === 'interview').length || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              <span className="gradient-text">Industry Recruiter Portal</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)' }}>
              SIH26044 Verified Recruiter
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Post roles with skill thresholds, run explainable AI shortlisting, and manage candidate pipelines
          </p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="btn-primary flex items-center gap-2">
          <Plus size={14} />
          {showForm ? 'Close Form' : 'Post Opportunity'}
        </button>
      </div>

      {/* Recruiter Stats KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Opportunities', value: listings.filter(l => l.isActive).length, icon: Building2, color: 'var(--v-indigo)' },
          { label: 'Total Applications',   value: totalApplicants, icon: Users, color: 'hsl(187,80%,48%)' },
          { label: 'AI Shortlisted',       value: totalShortlisted, icon: Sparkles, color: 'hsl(160,84%,50%)' },
          { label: 'Interviews & Offers',  value: listings.reduce((a, l) => a + (l.applications?.filter(ap => ap.status === 'selected' || ap.status === 'interview').length || 0), 0), icon: TrendingUp, color: 'hsl(38,92%,55%)' },
        ].map(stat => (
          <div key={stat.label} className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <stat.icon size={16} style={{ color: stat.color, marginBottom: 8 }} />
            <span className="text-3xl font-bold block" style={{ color: 'var(--text-primary)' }}>{stat.value}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Post Opportunity Form */}
      {showForm && (
        <form onSubmit={handlePost} className="p-6 rounded-2xl space-y-4 animate-fade-up"
          style={{ background: 'var(--bg-surface)', border: '1px solid hsla(239,84%,67%,0.3)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-white">Create New Opportunity</h2>
            <span className="text-xs text-slate-400">SIH Industry Posting</span>
          </div>

          {formError && (
            <div className="text-xs px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-slate-300">Opportunity Title *</label>
              <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Backend Developer Intern" className="input-dark" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">Opportunity Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input-dark">
                <option value="internship">Internship</option>
                <option value="full_time">Full-Time Job</option>
                <option value="contract">Industry Project / Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">Domain</label>
              <select value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} className="input-dark">
                <option value="software">Software Engineering</option>
                <option value="data">Data & AI/ML</option>
                <option value="product">Product Management</option>
                <option value="devops">Cloud & DevOps</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">Location</label>
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Bangalore (Hybrid)" className="input-dark" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">Stipend / CTC</label>
              <input value={form.stipend} onChange={e => setForm(p => ({ ...p, stipend: e.target.value }))}
                placeholder="e.g. ₹45,000/month or ₹18 LPA" className="input-dark" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-slate-300">
                Required Technical Skills & Minimum Proficiency Bar (Comma Separated) *
              </label>
              <input value={form.skillsString} onChange={e => setForm(p => ({ ...p, skillsString: e.target.value }))}
                placeholder="Java: 80, Spring Boot: 70, SQL: 70, DSA: 75" className="input-dark" />
              <p className="text-[10px] text-slate-400 mt-1">
                Format: <span className="font-mono text-slate-300">SkillName: Min%</span>. The AI Matching Engine tests candidate Skill Passports against these exact bars.
              </p>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-slate-300">Role Description & Responsibilities</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe key responsibilities, deliverables, and team expectations..."
                className="input-dark resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={formLoading} className="btn-primary">
              {formLoading ? 'Publishing Opportunity...' : 'Publish to Student Marketplace'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Listings & Applications Pipeline */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto animate-spin"
            style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--v-indigo)' }} />
          <p className="mt-3 text-sm text-slate-400">Loading recruiter listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <Building2 size={36} className="mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
          <p className="font-semibold text-white">No active listings</p>
          <p className="text-sm mt-1 text-slate-400">Click "Post Opportunity" to publish your first role.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <div key={listing._id} className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>

              <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{listing.title}</h3>
                    <span className="badge badge-indigo text-[10px] uppercase">
                      {listing.type?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                    <span>{listing.company}</span>
                    <span>·</span>
                    <span>{listing.location}</span>
                    <span>·</span>
                    <span>{listing.stipend}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-semibold">{listing.applications?.length || 0} applicants</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTriggerShortlist(listing)}
                    className="btn-primary text-xs flex items-center gap-1.5"
                    style={{ padding: '8px 14px' }}>
                    <Sparkles size={13} />
                    AI Shortlist Candidates
                  </button>

                  <button
                    onClick={() => setExpandedId(expandedId === listing._id ? null : listing._id)}
                    className="btn-ghost text-xs flex items-center gap-1">
                    <span>{expandedId === listing._id ? 'Hide Applicants' : 'View Applicants'}</span>
                    {expandedId === listing._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Collapsible Applicants Table */}
              {expandedId === listing._id && (
                <div className="p-5 border-t space-y-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Application Tracking Pipeline ({listing.applications?.length || 0} Candidates)
                    </h4>
                    <span className="text-[10px] text-slate-400">Move candidates through recruitment stages</span>
                  </div>

                  {!listing.applications?.length ? (
                    <p className="text-xs text-slate-400 py-3">No applications submitted for this role yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {listing.applications.map(app => (
                        <div key={app._id} className="p-3.5 rounded-xl flex items-center justify-between gap-4 flex-wrap"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                              style={{ background: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)' }}>
                              {(app.candidateName || app.userEmail)?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{app.candidateName || app.userEmail.split('@')[0]}</p>
                              <p className="text-[10px] text-slate-400">
                                {app.candidateProfile?.institution || 'NIT Karnataka'} · Readiness: {app.candidateProfile?.overallReadiness || 85}%
                              </p>
                            </div>
                          </div>

                          {/* Match Score & Status Changer */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs font-extrabold text-emerald-400 block">{app.matchScore || 85}% Match</span>
                              <span className="text-[9px] text-slate-400">AI Compatibility</span>
                            </div>

                            <select
                              value={app.status || 'applied'}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                              className="input-dark text-xs py-1.5 px-3 appearance-none cursor-pointer"
                              style={{ width: 'auto', minWidth: '130px' }}>
                              {STATUS_PIPELINE.map(st => (
                                <option key={st.id} value={st.id}>{st.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* AI Recruiter Shortlist Modal (Priority 7 SIH Requirement) */}
      {shortlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col max-h-[88vh] animate-scale-up"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: '0 24px 60px hsla(222,47%,4%,0.85)' }}>

            {/* Modal Header */}
            <div className="p-5 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))' }}>
                  <Bot size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">AI Candidate Shortlisting</h2>
                  <p className="text-xs text-slate-400">Ranked selection rationale for <span className="font-semibold text-slate-200">{shortlistTitle}</span></p>
                </div>
              </div>
              <button onClick={() => setShortlistModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {shortlistLoading ? (
                <div className="py-16 text-center">
                  <Sparkles size={24} className="mx-auto text-indigo-400 animate-spin mb-2" />
                  <p className="text-xs text-slate-400">Calculating explainable shortlisting criteria...</p>
                </div>
              ) : shortlistData.length === 0 ? (
                <p className="text-center py-10 text-xs text-slate-400">No applicants to shortlist yet.</p>
              ) : (
                shortlistData.map((cand, idx) => (
                  <div key={cand._id} className="p-4 rounded-xl space-y-3"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                          style={{ background: 'hsla(239,84%,67%,0.15)', color: 'var(--v-indigo)' }}>
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{cand.candidateName}</h4>
                          <p className="text-xs text-slate-400">{cand.candidateProfile?.institution || 'NIT Karnataka'} · {cand.candidateProfile?.branch || 'Computer Science'}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-400">{cand.matchScore}%</span>
                        <span className="text-[10px] text-slate-400 block">Overall Score</span>
                      </div>
                    </div>

                    {/* AI Explanation Box */}
                    <div className="p-3 rounded-lg text-xs leading-relaxed"
                      style={{ background: 'hsla(239,84%,67%,0.06)', border: '1px solid hsla(239,84%,67%,0.2)', color: 'var(--text-secondary)' }}>
                      <p className="font-semibold text-indigo-300 mb-1 flex items-center gap-1">
                        <Sparkles size={12} />
                        Why Candidate Selected:
                      </p>
                      <p className="text-slate-300">
                        {cand.shortlistReason || `Technical Skills: ${cand.matchResult?.breakdown?.technicalCoverage || 92}%, Problem Solving: ${cand.matchResult?.breakdown?.problemSolving || 95}%, Communication: ${cand.matchResult?.breakdown?.communication || 89}%. Exceeds core technical requirements.`}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-400">Current Status: <span className="font-bold text-slate-200 capitalize">{cand.status}</span></span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(cand._id, 'shortlisted')}
                          className="btn-ghost text-xs py-1 px-2.5 text-indigo-400">
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleStatusChange(cand._id, 'interview')}
                          className="btn-primary text-xs py-1 px-3">
                          Invite to Interview
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t flex justify-end"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
              <button onClick={() => setShortlistModalOpen(false)} className="btn-ghost text-xs">Close</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
