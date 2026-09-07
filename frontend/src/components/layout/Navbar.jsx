import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useInterview } from '../../context/InterviewContext';
import {
  Moon, Sun, LogOut, LayoutDashboard, Radio, Award, History,
  Settings, Info, ChevronDown, Briefcase, BookOpen, Map, User, Target,
  Bell, UserCircle, GraduationCap, Shield, ClipboardList, BookMarked,
  FileText, Sparkles, Compass, RefreshCw
} from 'lucide-react';
import api from '../../services/api';

export default function Navbar({ currentView, setCurrentView, onOpenCopilot, onSwitchDomain }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { aiStatus, isSpeaking, activeSession } = useInterview();
  const [showDropdown, setShowDropdown] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const role = user?.role || 'candidate';

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/community/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // Silently fail — notifications are non-critical
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/community/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  // Role-aware navigation tabs
  const candidateTabs = [
    { id: 'dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'interview',    label: 'Interview',     icon: Radio, badge: activeSession ? 'Live' : null },
    { id: 'complete',     label: 'Scorecard',     icon: Award },
    { id: 'analytics',   label: 'History',       icon: History },
    { id: 'skill',        label: 'Skill Passport', icon: Map },
    { id: 'gap',          label: 'Skill Gap',     icon: Target },
    { id: 'marketplace',  label: 'Opportunities', icon: Briefcase },
    { id: 'applications', label: 'Applications',  icon: ClipboardList },
    { id: 'learning',     label: 'Learning',      icon: BookMarked },
    { id: 'resume',       label: 'Resume',        icon: FileText },
    { id: 'profile',      label: 'Profile',       icon: UserCircle },
  ];

  const recruiterTabs = [
    { id: 'dashboard',   label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'recruiter',   label: 'Recruiter',  icon: Briefcase },
    { id: 'marketplace', label: 'Browse Jobs', icon: BookOpen },
  ];

  const facultyTabs = [
    { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'academia',   label: 'Academia',   icon: GraduationCap },
    { id: 'marketplace', label: 'Browse',    icon: Briefcase },
  ];

  const adminTabs = [
    { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'admin',      label: 'Admin',      icon: Shield },
    { id: 'recruiter',  label: 'Recruiter',  icon: Briefcase },
    { id: 'academia',   label: 'Academia',   icon: GraduationCap },
    { id: 'marketplace', label: 'Jobs',      icon: BookOpen },
  ];

  const navTabs = role === 'recruiter' ? recruiterTabs :
                  role === 'faculty'   ? facultyTabs :
                  role === 'admin'     ? adminTabs :
                  candidateTabs;

  const NOTIF_ICONS = {
    new_match: '💼',
    application_update: '📋',
    shortlisted: '⭐',
    interview: '🎤',
    course_recommended: '📚',
    assessment_done: '✅',
    workshop_open: '🎓',
    system: '🔔'
  };

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className="sticky top-0 z-50 transition-colors" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <div onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))' }}>
            V
          </div>
          <span className="font-bold text-base hidden sm:block" style={{ color: 'var(--text-primary)' }}>Vivora</span>

        </div>

        {/* Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 flex-1 mx-2 overflow-x-auto no-scrollbar">
          {navTabs.slice(0, 6).map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button key={tab.id} disabled={tab.disabled}
                onClick={() => setCurrentView(tab.id)}
                className="nav-tab shrink-0 whitespace-nowrap"
                style={isActive
                  ? { background: 'hsla(239,84%,67%,0.14)', color: 'var(--v-indigo)', fontWeight: 600, border: '1px solid hsla(239,84%,67%,0.25)' }
                  : tab.disabled
                    ? { opacity: 0.3, cursor: 'not-allowed' }
                    : {}
                }>
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Interview in progress" />
                )}
              </button>
            );
          })}
          {/* More dropdown for extra tabs */}
          {navTabs.length > 6 && (
            <div className="relative group shrink-0">
              <button className="nav-tab shrink-0 flex items-center gap-1">
                <span>More</span>
                <ChevronDown size={11} />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 rounded-xl py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all shadow-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', zIndex: 100 }}>
                {navTabs.slice(6).map(tab => {
                  const Icon = tab.icon;
                  const isActive = currentView === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setCurrentView(tab.id)}
                      className="w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2.5 transition-colors"
                      style={{ color: isActive ? 'var(--v-indigo)' : 'var(--text-secondary)', background: isActive ? 'hsla(239,84%,67%,0.08)' : 'transparent' }}>
                      <Icon size={13} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Role Badge + Domain Switcher */}
          {role === 'candidate' && onSwitchDomain ? (
            <button
              onClick={onSwitchDomain}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
              style={{ background: 'var(--bg-elevated)', border: '1px solid hsla(239,84%,67%,0.3)', color: 'var(--text-secondary)' }}
              title="Click to change your career domain / track">
              <span className="text-sm">🎓</span>
              <span className="capitalize font-semibold text-xs" style={{ color: 'var(--v-indigo)' }}>Student</span>
              <RefreshCw size={10} className="text-indigo-400 opacity-80" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <span className="text-sm">
                {role === 'candidate' ? '🎓' : role === 'recruiter' ? '💼' : role === 'faculty' ? '🏫' : '🛡️'}
              </span>
              <span className="capitalize font-semibold text-xs" style={{ color: 'var(--v-indigo)' }}>
                {role === 'candidate' ? 'Student' : role}
              </span>
            </div>
          )}

          {/* AI Career Copilot Launcher Button */}
          {onOpenCopilot && (
            <button onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover-lift"
              style={{
                background: 'linear-gradient(135deg, hsla(239,84%,67%,0.15), hsla(262,83%,66%,0.15))',
                color: 'var(--v-indigo)',
                border: '1px solid hsla(239,84%,67%,0.3)'
              }}
              title="Open AI Career Copilot">
              <Sparkles size={13} className="text-indigo-400" />
              <span className="hidden sm:inline">Copilot</span>
              {aiStatus && aiStatus !== 'idle' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          )}

          {/* AI Speaking Indicator (only visible when AI is actually talking) */}
          {isSpeaking && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <span className="live-bar" />
              <span className="live-bar" />
              <span className="live-bar" />
            </div>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button onClick={() => { setShowNotifications(p => !p); if (unreadCount > 0) markAllRead(); }}
              className="p-2 rounded-lg transition-colors relative"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
              title="Notifications">
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: 'hsl(348,83%,57%)', color: 'white' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-80 rounded-xl z-50 animate-slide-down overflow-hidden"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: '0 16px 40px hsla(222,47%,4%,0.6)' }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{notifications.filter(n => !n.isRead).length} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
                    ) : notifications.map((notif, i) => (
                      <button key={notif._id || i}
                        onClick={() => { setCurrentView(notif.link || 'dashboard'); setShowNotifications(false); }}
                        className="w-full px-4 py-3 text-left flex items-start gap-3 transition-colors"
                        style={{ background: notif.isRead ? 'transparent' : 'hsla(239,84%,67%,0.04)', borderBottom: '1px solid var(--border-subtle)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-overlay)'}
                        onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'hsla(239,84%,67%,0.04)'}>
                        <span className="text-lg shrink-0">{NOTIF_ICONS[notif.type] || '🔔'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{notif.title}</p>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{notif.message}</p>
                          <p className="text-[10px] mt-1" style={{ color: 'var(--text-dim)' }}>{timeAgo(notif.createdAt)}</p>
                        </div>
                        {!notif.isRead && <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: 'var(--v-indigo)' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
            title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button onClick={() => setShowDropdown(p => !p)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg text-xs transition-colors"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, hsla(239,84%,67%,0.2), hsla(262,83%,66%,0.2))', color: 'var(--v-indigo)' }}>
                {user?.name ? user.name[0].toUpperCase() : 'G'}
              </div>
              <span className="hidden md:block font-medium max-w-[72px] truncate">{user?.name || 'Guest'}</span>
              <ChevronDown size={11} style={{ color: 'var(--text-dim)' }} />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl py-1 z-50 animate-slide-down"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: '0 16px 40px hsla(222,47%,4%,0.6)' }}>

                  <div className="px-3 py-2.5 mb-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Guest'}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-dim)' }}>{user?.email || 'guest@vivora.ai'}</p>
                    <span className="mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{ background: 'hsla(239,84%,67%,0.1)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.2)' }}>
                      {user?.role === 'candidate' ? 'Student' : user?.role || 'guest'}
                    </span>
                  </div>

                  {[
                    ...(role === 'candidate' ? [{ label: 'My Profile', icon: UserCircle, id: 'profile' }] : []),
                    ...(role === 'candidate' && onSwitchDomain ? [{ label: 'Change Domain / Track', icon: Compass, action: () => { onSwitchDomain(); setShowDropdown(false); } }] : []),
                    { label: 'Settings', icon: Settings, id: 'settings' },
                    { label: 'About Vivora', icon: Info, id: 'about' },
                    ...(role === 'admin' ? [{ label: 'Admin Panel', icon: Shield, id: 'admin' }] : []),
                  ].map(item => (
                    <button key={item.label}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else {
                          setCurrentView(item.id);
                          setShowDropdown(false);
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 transition-colors"
                      style={{ color: item.action ? 'var(--v-indigo)' : 'var(--text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-overlay)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <item.icon size={13} style={{ color: item.action ? 'var(--v-indigo)' : 'var(--text-muted)' }} />
                      {item.label}
                    </button>
                  ))}

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px' }}>
                    <button
                      onClick={() => {
                        logout();
                        sessionStorage.removeItem('vivora_profile_onboarded');
                        sessionStorage.removeItem('vivora_track_selected');
                        sessionStorage.removeItem('vivora_selected_subtrack');
                        setShowDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 transition-colors mt-1"
                      style={{ color: 'hsl(348,70%,60%)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'hsla(348,83%,57%,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <LogOut size={13} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
