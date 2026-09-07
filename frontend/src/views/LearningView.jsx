import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookMarked, TrendingUp, Clock, ChevronRight, Star, ArrowRight, Play } from 'lucide-react';

const TYPE_CONFIG = {
  course: { label: 'Course', color: 'var(--v-indigo)', bg: 'hsla(239,84%,67%,0.1)', icon: '📚' },
  video: { label: 'Video', color: 'hsl(348,70%,60%)', bg: 'hsla(348,70%,60%,0.1)', icon: '▶️' },
  project: { label: 'Project', color: 'hsl(160,70%,45%)', bg: 'hsla(160,70%,45%,0.1)', icon: '💻' },
  article: { label: 'Article', color: 'hsl(38,90%,55%)', bg: 'hsla(38,90%,55%,0.1)', icon: '📄' }
};

const LEVEL_CONFIG = {
  beginner: { label: 'Beginner', color: 'hsl(160,70%,45%)' },
  intermediate: { label: 'Intermediate', color: 'hsl(38,90%,55%)' },
  advanced: { label: 'Advanced', color: 'hsl(348,70%,60%)' }
};

function ResourceCard({ resource }) {
  const type = TYPE_CONFIG[resource.type] || TYPE_CONFIG.course;
  const level = LEVEL_CONFIG[resource.level] || LEVEL_CONFIG.beginner;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-all group cursor-pointer hover-lift"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div className="text-2xl shrink-0">{type.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{resource.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
            style={{ background: type.bg, color: type.color }}>{type.label}</span>
          <span className="text-[10px] font-medium" style={{ color: level.color }}>{level.label}</span>
          <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-dim)' }}>
            <Clock size={9} />{resource.duration}
          </span>
        </div>
      </div>
      <Play size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--v-indigo)' }} />
    </div>
  );
}

function SkillGapCard({ gap, rank }) {
  const pct = gap.current || 0;
  const req = gap.required || 60;
  const estimatedNew = gap.estimatedNewLevel || Math.min(100, pct + 25);
  const gapSize = Math.max(0, req - pct);

  return (
    <div className="p-5 rounded-2xl space-y-4"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      {/* Skill Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'hsla(239,84%,67%,0.1)', color: 'var(--v-indigo)', border: '1px solid hsla(239,84%,67%,0.2)' }}>
              #{rank}
            </span>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{gap.skillName}</h3>
          </div>
          {gap.prerequisites?.length > 0 && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Prerequisites: {gap.prerequisites.join(', ')}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Gap: <span className="font-bold" style={{ color: 'hsl(348,70%,60%)' }}>{gapSize}%</span></div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Needed: {req}%</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--text-muted)' }}>Current Level</span>
            <span className="font-bold" style={{ color: pct >= req ? 'hsl(160,70%,45%)' : 'hsl(38,90%,55%)' }}>{pct}%</span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 9999, background: pct >= req ? 'hsl(160,70%,45%)' : 'linear-gradient(90deg, hsl(38,80%,45%), hsl(38,90%,55%))', transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--text-muted)' }}>After Learning ↗</span>
            <span className="font-bold" style={{ color: 'hsl(160,70%,45%)' }}>{estimatedNew}%</span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div style={{ width: `${estimatedNew}%`, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg, hsl(160,60%,38%), hsl(160,80%,48%))', opacity: 0.5, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
          </div>
        </div>
      </div>

      {/* Resources */}
      {gap.resources?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>RECOMMENDED RESOURCES</h4>
          {gap.resources.slice(0, 3).map((r, i) => <ResourceCard key={i} resource={r} />)}
        </div>
      )}
    </div>
  );
}

export default function LearningView() {
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('fullstack-developer');

  const ROLES = [
    { slug: 'backend-developer', label: 'Backend Dev' },
    { slug: 'frontend-developer', label: 'Frontend Dev' },
    { slug: 'fullstack-developer', label: 'Full Stack' },
    { slug: 'data-scientist', label: 'Data Scientist' },
    { slug: 'ml-engineer', label: 'ML Engineer' },
    { slug: 'devops-engineer', label: 'DevOps' },
  ];

  useEffect(() => { fetchLearningPlan(); }, [selectedRole]);

  const fetchLearningPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/skill/gap?roleSlug=${selectedRole}`);
      if (res.data.success) setGapData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const gapsWithResources = gapData?.gapAnalysis
    ?.filter(g => g.status !== 'met')
    .slice(0, 5)
    .map(g => ({
      ...g,
      resources: getResourcesForSkill(g.slug),
      estimatedNewLevel: Math.min(100, g.current + 25),
      prerequisites: getPrerequisites(g.slug)
    })) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <span className="gradient-text">Learning Recommendations</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          AI-curated learning path to close your skill gaps and boost your match score
        </p>
      </div>

      {/* Role Selector */}
      <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Target Role</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(r => (
            <button key={r.slug} onClick={() => setSelectedRole(r.slug)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={selectedRole === r.slug
                ? { background: 'linear-gradient(135deg, var(--v-indigo-deep), var(--v-violet))', color: 'white' }
                : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Match Summary */}
      {gapData && (
        <div className="p-5 rounded-2xl flex items-center gap-6 flex-wrap"
          style={{ background: 'linear-gradient(135deg, hsla(239,80%,55%,0.08), hsla(262,80%,60%,0.08))', border: '1px solid hsla(239,84%,67%,0.15)' }}>
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: 'var(--v-indigo)' }}>{gapData.matchScore}%</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Current Match</div>
          </div>
          <ArrowRight size={20} style={{ color: 'var(--text-dim)' }} />
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: 'hsl(160,70%,45%)' }}>
              {Math.min(99, gapData.matchScore + gapsWithResources.reduce((a, g) => a + Math.min(10, g.estimatedMatchImprovement || 8), 0))}%
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>After Upskilling</div>
          </div>
          <div className="flex-1 min-w-48">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {gapData.targetRole} — {gapsWithResources.length} skills to improve
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Focus on these resources to significantly boost your employability for this role.
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full mx-auto animate-spin"
            style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--v-indigo)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>Building your learning plan...</p>
        </div>
      )}

      {/* Gap Cards */}
      {!loading && gapsWithResources.length === 0 && (
        <div className="py-20 text-center rounded-2xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <Star size={40} className="mx-auto mb-4" style={{ color: 'hsl(160,70%,45%)' }} />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>You're Ready! 🎉</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            You already meet all requirements for this role. Try a harder track or explore advanced topics.
          </p>
        </div>
      )}

      {!loading && gapsWithResources.map((gap, i) => (
        <SkillGapCard key={gap.slug} gap={gap} rank={i + 1} />
      ))}
    </div>
  );
}

// Internal resource database (mirrors backend learningRecommendationService)
function getResourcesForSkill(slug) {
  const DB = {
    'spring-boot': [
      { title: 'Spring Boot Fundamentals', type: 'course', duration: '8 hours', level: 'beginner' },
      { title: 'Building REST APIs with Spring Boot', type: 'project', duration: '6 hours', level: 'intermediate' }
    ],
    'java': [
      { title: 'Core Java Programming', type: 'course', duration: '12 hours', level: 'beginner' },
      { title: 'Java Concurrency & Multithreading', type: 'course', duration: '5 hours', level: 'advanced' }
    ],
    'python': [
      { title: 'Python for Beginners', type: 'course', duration: '10 hours', level: 'beginner' },
      { title: 'Python OOP and Design Patterns', type: 'course', duration: '6 hours', level: 'intermediate' }
    ],
    'react': [
      { title: 'React Fundamentals', type: 'course', duration: '8 hours', level: 'beginner' },
      { title: 'React Hooks & State Management', type: 'course', duration: '5 hours', level: 'intermediate' }
    ],
    'javascript': [
      { title: 'JavaScript: The Complete Guide', type: 'course', duration: '15 hours', level: 'beginner' },
      { title: 'Async JavaScript & Promises', type: 'course', duration: '4 hours', level: 'intermediate' }
    ],
    'nodejs': [
      { title: 'Node.js Crash Course', type: 'video', duration: '3 hours', level: 'beginner' },
      { title: 'Building REST APIs with Node.js', type: 'course', duration: '8 hours', level: 'intermediate' }
    ],
    'system-design': [
      { title: 'System Design Fundamentals', type: 'course', duration: '8 hours', level: 'beginner' },
      { title: 'Practice: Design Twitter Clone', type: 'project', duration: '4 hours', level: 'intermediate' }
    ],
    'docker': [
      { title: 'Docker for Beginners', type: 'video', duration: '3 hours', level: 'beginner' },
      { title: 'Docker Compose & Multi-Container Apps', type: 'course', duration: '4 hours', level: 'intermediate' }
    ],
    'aws': [
      { title: 'AWS Cloud Practitioner', type: 'course', duration: '12 hours', level: 'beginner' },
      { title: 'AWS Solutions Architect Associate', type: 'course', duration: '20 hours', level: 'intermediate' }
    ],
    'machine-learning': [
      { title: 'Machine Learning Fundamentals', type: 'course', duration: '15 hours', level: 'beginner' },
      { title: 'Build an ML Project End-to-End', type: 'project', duration: '10 hours', level: 'intermediate' }
    ],
  };
  return DB[slug] || [
    { title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Fundamentals`, type: 'course', duration: '6 hours', level: 'beginner' },
    { title: 'Practice Project', type: 'project', duration: '8 hours', level: 'intermediate' }
  ];
}

function getPrerequisites(slug) {
  const PREREQS = {
    'spring-boot': ['java'],
    'react': ['javascript'],
    'nodejs': ['javascript'],
    'kubernetes': ['docker'],
    'machine-learning': ['python'],
    'deep-learning': ['python', 'machine-learning']
  };
  return PREREQS[slug] || [];
}
