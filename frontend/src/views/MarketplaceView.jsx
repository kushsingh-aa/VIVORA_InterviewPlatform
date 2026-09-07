import React, { useEffect, useState } from 'react';
import { useSkill } from '../context/SkillContext';
import { Briefcase, MapPin, Clock, DollarSign, CheckCircle2, Bookmark, Search, Filter, ExternalLink, Sparkles } from 'lucide-react';
import ExplainableMatchModal from '../components/matching/ExplainableMatchModal';

const TYPE_LABELS = { internship: 'Internship', full_time: 'Full-Time', part_time: 'Part-Time', contract: 'Contract' };
const TYPE_COLORS = {
  internship: { bg: 'hsla(239,84%,67%,0.1)', color: 'var(--v-indigo)', border: 'hsla(239,84%,67%,0.25)' },
  full_time:  { bg: 'hsla(160,84%,39%,0.1)', color: 'hsl(160,84%,50%)', border: 'hsla(160,84%,39%,0.25)' },
  part_time:  { bg: 'hsla(38,92%,50%,0.1)',  color: 'hsl(38,92%,55%)',  border: 'hsla(38,92%,50%,0.25)' },
  contract:   { bg: 'hsla(262,83%,66%,0.1)', color: 'hsl(262,83%,70%)', border: 'hsla(262,83%,66%,0.25)' },
};

function MatchBadge({ score }) {
  const color = score >= 80 ? 'hsl(160,84%,50%)' : score >= 60 ? 'var(--v-indigo)' : score >= 40 ? 'hsl(38,92%,55%)' : 'hsl(348,83%,65%)';
  return (
    <div className="flex flex-col items-center">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="var(--bg-muted)" strokeWidth="4" />
        <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={125.6}
          strokeDashoffset={125.6 - (score / 100) * 125.6}
          transform="rotate(-90 24 24)"
          style={{ filter: `drop-shadow(0 0 4px ${color}50)`, transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <span className="text-[10px] font-bold -mt-7 mb-3 block" style={{ color }}>{score}%</span>
    </div>
  );
}

function OpportunityCard({ opp, isApplied, onApply, onExplainMatch }) {
  const [expanded, setExpanded] = useState(false);
  const [applying, setApplying] = useState(false);
  const typeStyle = TYPE_COLORS[opp.type] || TYPE_COLORS.internship;

  const handleApply = async () => {
    setApplying(true);
    await onApply(opp._id);
    setApplying(false);
  };

  return (
    <div className="p-5 rounded-2xl transition-all duration-200 hover-lift"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-start gap-4">
        {/* Company avatar */}
        <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-overlay))', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
          {opp.company[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{opp.title}</h3>
              <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{opp.company}</p>
            </div>
            <div onClick={() => onExplainMatch(opp)} className="cursor-pointer" title="Click to view AI Explainable Match Breakdown">
              <MatchBadge score={opp.matchScore || 50} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2 mb-3">
            <span className="badge text-[10px] py-0.5 px-2" style={typeStyle}>{TYPE_LABELS[opp.type] || opp.type}</span>
            {opp.location && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-dim)' }}>
                <MapPin size={9} /> {opp.location}
              </span>
            )}
            {opp.stipend && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-dim)' }}>
                <DollarSign size={9} /> {opp.stipend}
              </span>
            )}
            {opp.duration && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-dim)' }}>
                <Clock size={9} /> {opp.duration}
              </span>
            )}
          </div>

          {expanded && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {opp.description && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{opp.description}</p>
              )}
              {opp.requiredSkills?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--text-dim)' }}>REQUIRED SKILLS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.requiredSkills.map(s => (
                      <span key={s.skillSlug} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        {s.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {opp.eligibility && (
                <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                  <span className="font-semibold">Eligible:</span> {opp.eligibility}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button onClick={() => setExpanded(p => !p)}
              className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
              {expanded ? 'Show less ▲' : 'See details ▼'}
            </button>
            <button onClick={() => onExplainMatch(opp)}
              className="text-xs font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all hover-lift"
              style={{ background: 'hsla(239,84%,67%,0.1)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.25)' }}>
              <Sparkles size={11} />
              <span>Why You Match</span>
            </button>
            <div className="flex-1" />
            {isApplied ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'hsla(160,84%,39%,0.1)', color: 'hsl(160,84%,50%)', border: '1px solid hsla(160,84%,39%,0.25)' }}>
                <CheckCircle2 size={12} /> Applied
              </span>
            ) : (
              <button onClick={handleApply} disabled={applying} className="btn-primary text-xs" style={{ padding: '6px 14px' }}>
                {applying ? 'Applying...' : 'Apply Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplaceView() {
  const { opportunities, oppLoading, appliedIds, fetchOpportunities, applyToOpportunity } = useSkill();
  const [search, setSearch] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedOppForModal, setSelectedOppForModal] = useState(null);

  useEffect(() => { fetchOpportunities(); }, []);

  const handleExplainMatch = async (opp) => {
    try {
      const res = await fetch(`/opportunity/${opp._id}`);
      const data = await res.json();
      if (data.success && data.matchResult) {
        setSelectedOppForModal({ ...opp, matchResult: data.matchResult });
      } else {
        setSelectedOppForModal(opp);
      }
    } catch (e) {
      setSelectedOppForModal(opp);
    }
  };

  const filtered = opportunities.filter(o => {
    const q = search.toLowerCase();
    return (
      (!search || o.title.toLowerCase().includes(q) || o.company.toLowerCase().includes(q)) &&
      (!filterDomain || o.domain === filterDomain) &&
      (!filterType   || o.type   === filterType)
    );
  });

  const domains = [...new Set(opportunities.map(o => o.domain))];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <span className="gradient-text">Opportunity Marketplace</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Internships and jobs matched to your verified skill profile
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search roles, companies..." className="input-dark pl-9" />
        </div>
        <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)} className="input-dark" style={{ width: 'auto', minWidth: '140px' }}>
          <option value="">All Domains</option>
          {domains.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-dark" style={{ width: 'auto', minWidth: '140px' }}>
          <option value="">All Types</option>
          <option value="internship">Internships</option>
          <option value="full_time">Full-Time</option>
        </select>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-dim)' }}>
        <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{filtered.length} opportunities</span>
        <span>·</span>
        <span>{appliedIds.size} applied</span>
        {opportunities.length > 0 && <span>· Tap "Why You Match" for explainable AI reasoning</span>}
      </div>

      {/* Opportunity List */}
      {oppLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto animate-spin"
            style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--v-indigo)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>Loading opportunities...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <Briefcase size={36} className="mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No opportunities found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {opportunities.length === 0 ? 'Run the seed script to load demo opportunities.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(opp => (
            <OpportunityCard key={opp._id || opp.title}
              opp={opp}
              isApplied={appliedIds.has(opp._id)}
              onApply={applyToOpportunity}
              onExplainMatch={handleExplainMatch} />
          ))}
        </div>
      )}

      {/* Explainable AI Match Modal */}
      <ExplainableMatchModal
        opportunity={selectedOppForModal}
        isOpen={!!selectedOppForModal}
        onClose={() => setSelectedOppForModal(null)}
      />
    </div>
  );
}
