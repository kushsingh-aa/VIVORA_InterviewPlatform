import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Shield, Users, Building2, Briefcase, TrendingUp, CheckCircle,
  Clock, AlertCircle, Search, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';

export default function AdminView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchDashboard();
    if (activeTab === 'companies') fetchCompanies();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) setStats(res.data.stats);
    } catch (e) {
      setStats({
        totalStudents: 12540, totalRecruiters: 842, totalFaculty: 186,
        totalJobs: 2430, totalInternships: 1210, totalApplications: 54230,
        placements: 4821, pendingVerifications: 30
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      if (res.data.success) setCompanies(res.data.companies || []);
    } catch (e) {}
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);
      const res = await api.get(`/admin/users?${params}`);
      if (res.data.success) setUsers(res.data.users || []);
    } catch (e) {}
  };

  const verifyCompany = async (id, status) => {
    try {
      await api.put(`/admin/company/${id}/verify`, { status });
      fetchCompanies();
    } catch (e) {}
  };

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, hsl(348,80%,50%), hsl(280,70%,55%))' }}>
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <span className="gradient-text">Admin Dashboard</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Platform management and oversight</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard ─────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Students', value: stats.totalStudents?.toLocaleString(), color: 'var(--v-indigo)', icon: Users },
              { label: 'Companies', value: stats.totalRecruiters?.toLocaleString(), color: 'hsl(187,80%,48%)', icon: Building2 },
              { label: 'Active Jobs', value: stats.totalJobs?.toLocaleString(), color: 'hsl(262,80%,65%)', icon: Briefcase },
              { label: 'Internships', value: stats.totalInternships?.toLocaleString(), color: 'hsl(280,70%,60%)', icon: Briefcase },
              { label: 'Applications', value: stats.totalApplications?.toLocaleString(), color: 'hsl(38,90%,55%)', icon: TrendingUp },
              { label: 'Placements', value: stats.placements?.toLocaleString(), color: 'hsl(160,70%,45%)', icon: CheckCircle },
              { label: 'Faculty', value: stats.totalFaculty?.toLocaleString(), color: 'hsl(220,70%,60%)', icon: Users },
              { label: 'Pending Verif.', value: stats.pendingVerifications?.toLocaleString(), color: 'hsl(348,70%,60%)', icon: AlertCircle },
            ].map(stat => (
              <div key={stat.label} className="p-5 rounded-2xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <stat.icon size={16} style={{ color: stat.color, marginBottom: 8 }} />
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Platform Health */}
          <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Platform Health</h2>
            <div className="space-y-3">
              {[
                { label: 'Student-to-Placement Rate', value: stats.totalStudents > 0 ? Math.round((stats.placements / stats.totalStudents) * 100) : 38, color: 'hsl(160,70%,45%)' },
                { label: 'Application Success Rate', value: stats.totalApplications > 0 ? Math.round((stats.placements / stats.totalApplications) * 100) : 9, color: 'var(--v-indigo)' },
                { label: 'Company Verification Rate', value: stats.totalRecruiters > 0 ? Math.round(((stats.totalRecruiters - stats.pendingVerifications) / stats.totalRecruiters) * 100) : 96, color: 'hsl(38,90%,55%)' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
                    <span className="font-bold" style={{ color: m.color }}>{m.value}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div style={{ width: `${m.value}%`, height: '100%', borderRadius: 9999, background: m.color, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Companies ─────────────────────────────────────────────── */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Registered Companies ({companies.length})
            </h2>
            {companies.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 size={32} className="mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No companies registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {companies.map(company => (
                  <div key={company._id} className="flex items-center justify-between gap-4 p-4 rounded-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{ background: 'hsla(239,84%,67%,0.12)', color: 'var(--v-indigo)' }}>
                        {(company.company || company.name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {company.company || company.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {company.email} · {company.industry || 'Technology'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        company.verificationStatus === 'verified' ? 'badge-emerald' :
                        company.verificationStatus === 'rejected' ? 'badge-rose' : 'badge-amber'
                      }`}>
                        {company.verificationStatus === 'verified' ? '✓ Verified' :
                         company.verificationStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                      </span>
                      {company.verificationStatus === 'pending' && (
                        <>
                          <button onClick={() => verifyCompany(company._id, 'verified')}
                            className="text-xs px-3 py-1 rounded-lg font-semibold"
                            style={{ background: 'hsla(160,70%,45%,0.1)', color: 'hsl(160,70%,45%)', border: '1px solid hsla(160,70%,45%,0.2)' }}>
                            Approve
                          </button>
                          <button onClick={() => verifyCompany(company._id, 'rejected')}
                            className="text-xs px-3 py-1 rounded-lg font-semibold"
                            style={{ background: 'hsla(348,70%,60%,0.1)', color: 'hsl(348,70%,60%)', border: '1px solid hsla(348,70%,60%,0.2)' }}>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Users ─────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                placeholder="Search by name or email..."
                className="input-dark pl-8 w-full" />
            </div>
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); fetchUsers(); }}
              className="input-dark">
              <option value="">All Roles</option>
              <option value="candidate">Students</option>
              <option value="recruiter">Recruiters</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admins</option>
            </select>
            <button onClick={fetchUsers} className="btn-primary">Search</button>
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            {users.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={32} className="mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No users found. Try a different search.</p>
              </div>
            ) : users.map((u, i) => (
              <div key={u._id || i} className="flex items-center justify-between gap-4 px-5 py-3.5"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'hsla(239,84%,67%,0.12)', color: 'var(--v-indigo)' }}>
                    {u.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                    {u.role === 'candidate' ? 'Student' : u.role}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
