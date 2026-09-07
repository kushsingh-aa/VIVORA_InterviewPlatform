import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const A4_STYLE = `
@media print {
  @page { margin: 0; size: A4; }
  body { margin: 0; }
  .no-print { display: none !important; }
  .resume-page { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; width: 100% !important; }
}
`;

function Section({ title, children, border = true }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: '#4338ca', borderBottom: border ? '1.5px solid #4338ca' : 'none', paddingBottom: '3px', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function ResumeView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skillProfile, setSkillProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const resumeRef = useRef();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, skillRes] = await Promise.allSettled([
        api.get('/profile/me'),
        api.get('/skill/passport')
      ]);

      if (profRes.status === 'fulfilled' && profRes.value.data.success) {
        setProfile(profRes.value.data.user);
      } else {
        setProfile(user);
      }

      if (skillRes.status === 'fulfilled' && skillRes.value.data.success) {
        setSkillProfile(skillRes.value.data.profile);
      }
    } catch (e) {
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const aiVerifiedSkills = skillProfile?.skills
    ?.filter(s => s.verificationLevel === 'ai_assessed' && s.proficiency >= 60)
    ?.sort((a, b) => b.proficiency - a.proficiency)
    ?.slice(0, 8) || [];

  const allSkills = profile?.technicalSkills || [];
  const softSkills = profile?.softSkills || [];

  if (loading) return (
    <div className="py-20 text-center">
      <div className="w-10 h-10 border-2 border-t-transparent rounded-full mx-auto animate-spin"
        style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--v-indigo)' }} />
    </div>
  );

  const p = profile || {};

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-up">
      <style>{A4_STYLE}</style>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <span className="gradient-text">Digital Resume</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            AI-generated from your profile · AI-verified skills are badged automatically
          </p>
        </div>
        <button onClick={handlePrint} className="btn-primary">
          🖨️ Print / Save as PDF
        </button>
      </div>

      {/* Resume A4 Page */}
      <div ref={resumeRef} className="resume-page"
        style={{ background: 'white', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '794px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)', padding: '28px 32px 24px', borderRadius: '12px 12px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
                {p.name || 'Your Name'}
              </h1>
              {(p.degree || p.branch) && (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontWeight: 500 }}>
                  {[p.degree, p.branch].filter(Boolean).join(' · ')}
                </p>
              )}
              {p.institution && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '2px 0 0' }}>
                  {p.institution}{p.graduationYear ? ` · Class of ${p.graduationYear}` : ''}
                </p>
              )}
            </div>
            {/* VIVORA Badge */}
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '7px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Verified by</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>VIVORA</div>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>AI SKILL PASSPORT</div>
            </div>
          </div>

          {/* Contact Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '14px' }}>
            {[
              p.email && { text: p.email, icon: '✉' },
              p.phone && { text: p.phone, icon: '📞' },
              p.location && { text: p.location, icon: '📍' },
              p.githubUrl && { text: p.githubUrl.replace('https://', ''), icon: '⌨' },
              p.linkedinUrl && { text: p.linkedinUrl.replace('https://linkedin.com/in/', 'linkedin.com/in/'), icon: '🔗' },
            ].filter(Boolean).map((item, i) => (
              <span key={i} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 32px 32px' }}>

          {/* AI Verified Skills */}
          {aiVerifiedSkills.length > 0 && (
            <Section title="AI-Verified Skill Passport">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {aiVerifiedSkills.map(s => (
                  <span key={s.skillSlug} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 600, background: '#ede9fe', color: '#5b21b6', border: '1px solid #c4b5fd' }}>
                    <span style={{ color: '#4338ca' }}>✓</span> {s.skillName} · {s.proficiency}%
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '8px', color: '#9ca3af', marginTop: '5px' }}>
                Skills above were assessed via AI-powered technical interviews on the VIVORA platform.
              </p>
            </Section>
          )}

          {/* Technical Skills */}
          {allSkills.length > 0 && (
            <Section title="Technical Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {allSkills.map(s => (
                  <span key={s} style={{ padding: '2px 9px', borderRadius: '100px', fontSize: '10px', fontWeight: 500, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {p.institution && (
            <Section title="Education">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0 }}>{p.institution}</p>
                  <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 0' }}>
                    {[p.degree, p.branch].filter(Boolean).join(' in ')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {p.graduationYear && <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Expected {p.graduationYear}</p>}
                  {p.cgpa && <p style={{ fontSize: '10px', fontWeight: 600, color: '#4338ca', margin: '2px 0 0' }}>CGPA: {p.cgpa}</p>}
                </div>
              </div>
            </Section>
          )}

          {/* Projects */}
          {p.projects?.length > 0 && (
            <Section title="Projects">
              {p.projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#111827', margin: 0 }}>{proj.title}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {proj.githubLink && <span style={{ fontSize: '9px', color: '#4338ca' }}>⌨ GitHub</span>}
                      {proj.link && <span style={{ fontSize: '9px', color: '#4338ca' }}>🔗 Demo</span>}
                    </div>
                  </div>
                  {proj.techStack?.length > 0 && (
                    <p style={{ fontSize: '9px', color: '#7c3aed', fontWeight: 600, margin: '2px 0' }}>
                      {proj.techStack.join(' · ')}
                    </p>
                  )}
                  {proj.description && (
                    <p style={{ fontSize: '10px', color: '#4b5563', margin: '3px 0 0', lineHeight: '1.5' }}>
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Internship History */}
          {p.internshipHistory?.length > 0 && (
            <Section title="Internship Experience">
              {p.internshipHistory.map((intern, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#111827', margin: 0 }}>
                        {intern.role} — {intern.company}
                      </p>
                    </div>
                    <p style={{ fontSize: '9px', color: '#6b7280', margin: 0, shrink: 0 }}>{intern.duration}</p>
                  </div>
                  {intern.description && (
                    <p style={{ fontSize: '10px', color: '#4b5563', margin: '3px 0 0', lineHeight: '1.5' }}>
                      {intern.description}
                    </p>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Certifications */}
          {p.certifications?.length > 0 && (
            <Section title="Certifications">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {p.certifications.map((cert, i) => (
                  <div key={i} style={{ padding: '5px 10px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#166534', margin: 0 }}>{cert.title}</p>
                    {cert.issuer && <p style={{ fontSize: '9px', color: '#15803d', margin: '1px 0 0' }}>{cert.issuer}{cert.issueDate ? ` · ${cert.issueDate}` : ''}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Soft Skills */}
          {softSkills.length > 0 && (
            <Section title="Soft Skills" border={false}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {softSkills.map(s => (
                  <span key={s} style={{ padding: '2px 9px', borderRadius: '100px', fontSize: '10px', fontWeight: 500, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e5e7eb', padding: '10px 32px', background: '#f9fafb', borderRadius: '0 0 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '8px', color: '#9ca3af' }}>Generated by VIVORA AI Platform</span>
          <span style={{ fontSize: '8px', color: '#9ca3af' }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <p className="text-center text-xs pb-8 no-print" style={{ color: 'var(--text-dim)' }}>
        Use <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>Ctrl+P</kbd> or the Print button to save as PDF
      </p>
    </div>
  );
}
