'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { practiceService } from '../../../lib/practiceService';
import { supabase } from '../../../lib/supabase';
import { 
  Brain, Cpu, BarChart3, BookOpen, Shuffle, Zap, Trophy, Target, 
  Flame, Clock, ChevronRight, Bookmark, AlertTriangle, Sparkles, 
  History, Award, CheckCircle, RefreshCw, PlayCircle, Layers, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import styles from './practice.module.css';

// India-BIX-Style Hierarchical Taxonomy Definition
const TOPIC_DIRECTORY = [
  {
    group: 'Quantitative Aptitude',
    icon: '🔢',
    color: '#0284c7',
    topics: [
      { name: 'Time and Work', slug: 'time-and-work', estimatedQuestions: 35 },
      { name: 'Percentages', slug: 'percentages', estimatedQuestions: 40 },
      { name: 'Profit and Loss', slug: 'profit-and-loss', estimatedQuestions: 35 },
      { name: 'Ratio and Proportion', slug: 'ratio-and-proportion', estimatedQuestions: 30 },
      { name: 'Averages', slug: 'averages', estimatedQuestions: 25 },
      { name: 'Time Speed Distance', slug: 'time-speed-distance', estimatedQuestions: 30 },
      { name: 'Simple Interest', slug: 'simple-interest', estimatedQuestions: 20 },
      { name: 'Compound Interest', slug: 'compound-interest', estimatedQuestions: 20 },
      { name: 'Number Systems', slug: 'number-systems', estimatedQuestions: 35 },
      { name: 'Probability', slug: 'probability', estimatedQuestions: 20 },
      { name: 'Permutation and Combination', slug: 'permutation-and-combination', estimatedQuestions: 20 },
    ]
  },
  {
    group: 'Logical Reasoning',
    icon: '🧩',
    color: '#9333ea',
    topics: [
      { name: 'Series', slug: 'series', estimatedQuestions: 30 },
      { name: 'Coding Decoding', slug: 'coding-decoding', estimatedQuestions: 35 },
      { name: 'Blood Relations', slug: 'blood-relations', estimatedQuestions: 25 },
      { name: 'Direction Sense', slug: 'direction-sense', estimatedQuestions: 20 },
      { name: 'Syllogism', slug: 'syllogism', estimatedQuestions: 25 },
      { name: 'Seating Arrangement', slug: 'seating-arrangement', estimatedQuestions: 25 },
      { name: 'Puzzles', slug: 'puzzles', estimatedQuestions: 30 },
      { name: 'Data Sufficiency', slug: 'data-sufficiency', estimatedQuestions: 20 },
    ]
  },
  {
    group: 'Verbal Ability',
    icon: '📝',
    color: '#16a34a',
    topics: [
      { name: 'Grammar', slug: 'grammar', estimatedQuestions: 30 },
      { name: 'Vocabulary', slug: 'vocabulary', estimatedQuestions: 35 },
      { name: 'Synonyms', slug: 'synonyms', estimatedQuestions: 25 },
      { name: 'Antonyms', slug: 'antonyms', estimatedQuestions: 25 },
      { name: 'Reading Comprehension', slug: 'reading-comprehension', estimatedQuestions: 20 },
      { name: 'Sentence Correction', slug: 'sentence-correction', estimatedQuestions: 25 },
    ]
  },
  {
    group: 'Technical Aptitude',
    icon: '💻',
    color: '#4f46e5',
    topics: [
      { name: 'Data Structures & Algorithms', slug: 'dsa', estimatedQuestions: 60 },
      { name: 'C Programming', slug: 'c-programming', estimatedQuestions: 40 },
      { name: 'C++ Programming', slug: 'cpp-programming', estimatedQuestions: 40 },
      { name: 'Java', slug: 'java', estimatedQuestions: 45 },
      { name: 'Python', slug: 'python', estimatedQuestions: 40 },
      { name: 'DBMS', slug: 'dbms', estimatedQuestions: 45 },
      { name: 'Operating Systems', slug: 'operating-systems', estimatedQuestions: 40 },
      { name: 'Computer Networks', slug: 'computer-networks', estimatedQuestions: 35 },
      { name: 'OOP Concepts', slug: 'oop-concepts', estimatedQuestions: 35 },
    ]
  }
];

export default function PracticeArenaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);

  // Top-Level Mode Tab: 'practice' (Normal Practice) vs 'timed' (Timed Test)
  const [activeTab, setActiveTab] = useState('practice');

  // Custom Practice Builder state
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [isStarting, setIsStarting] = useState(false);

  const loadData = async () => {
    try {
      const st = await practiceService.getStats();
      setStats(st);
    } catch (e) { console.error('Failed to load stats', e); }

    try {
      const rec = await practiceService.getRecommendations();
      setRecommendations(rec || []);
    } catch (e) { console.error('Failed to load recommendations', e); }

    try {
      const hist = await practiceService.getHistory({ page: 1, limit: 5 });
      setHistory(hist?.sessions || []);
    } catch (e) { console.error('Failed to load history', e); }

    try {
      const { data: cats } = await supabase.from('categories').select('id, name, slug').order('name');
      setCategories(cats || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartSession = async (options = {}) => {
    if (isStarting) return;
    setIsStarting(true);

    const isTimedMode = options.isTimed !== undefined ? options.isTimed : activeTab === 'timed';
    const timerMinutes = options.durationMinutes || durationMinutes;

    try {
      // Find matching category ID from name or slug if passed
      let catId = options.categoryId;
      if (!catId && options.topicSlug) {
        const matched = categories.find(c => c.slug === options.topicSlug || c.name.toLowerCase() === options.topicSlug.toLowerCase());
        if (matched) catId = matched.id;
      }
      if (!catId && selectedCategory) {
        catId = selectedCategory;
      }

      const payload = {
        mode: options.mode || 'mixed',
        category_id: catId || undefined,
        difficulty: options.difficulty || difficulty || undefined,
        questionCount: options.questionCount || questionCount || 10,
        solved_status: options.solvedStatus || 'all',
        weak_topics_only: options.weakTopicsOnly || false,
        bookmarked_only: options.bookmarkedOnly || false
      };

      const res = await practiceService.startSession(payload);
      
      // Store timed test configuration
      res.timedConfig = {
        isTimed: isTimedMode,
        durationMinutes: timerMinutes
      };

      sessionStorage.setItem('practiceSession', JSON.stringify(res));
      toast.success(`${isTimedMode ? 'Timed Test' : 'Practice Session'} started with ${res.questions?.length || payload.questionCount} questions!`);
      router.push('/practice/arena');
    } catch (err) {
      toast.error('Could not start practice session: ' + err.message);
      setIsStarting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={28} style={{ color: 'var(--accent-primary, #6366f1)' }} />
            Placement Practice Arena
          </h1>
          <p>
            Master placement aptitude, reasoning, and technical concepts. Select from the hierarchical topic directory or configure a custom practice session.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link 
            href="/question-bank"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}
          >
            <Layers size={15} /> Browse Question Bank
          </Link>
          <button 
            onClick={() => router.push('/practice/bookmarks')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            <Bookmark size={15} /> Bookmarks
          </button>
        </div>
      </div>

      {/* Real Performance Telemetry Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '10px', borderRadius: '50%' }}>
            <Flame size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats?.streak || 0} Days</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily Streak</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '10px', borderRadius: '50%' }}>
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats?.totalXP || 0} XP</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Level {stats?.level || 1} Progress</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '10px', borderRadius: '50%' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats?.accuracy || 0}%</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified Accuracy</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(14,165,233,0.1)', color: '#0284c7', padding: '10px', borderRadius: '50%' }}>
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats?.totalQuestions || 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Questions Solved</div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs (Phase 14: Clear Separation of Normal Practice vs Timed Test) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('practice')}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'practice' ? 'var(--accent-primary, #6366f1)' : 'transparent',
            color: activeTab === 'practice' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'practice' ? 'none' : '1px solid var(--border-color)',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={16} /> Normal Practice
        </button>

        <button
          onClick={() => setActiveTab('timed')}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'timed' ? '#f59e0b' : 'transparent',
            color: activeTab === 'timed' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'timed' ? 'none' : '1px solid var(--border-color)',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={16} /> Timed Test Mode
        </button>
      </div>

      {/* Target Focus Shortcuts Strip (Phase 17: Practice My Mistakes & Weak Topics) */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>Target Practice:</span>

        <button
          onClick={() => handleStartSession({ solvedStatus: 'incorrect', questionCount: 10 })}
          disabled={isStarting}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
        >
          <AlertTriangle size={14} /> Practice My Mistakes
        </button>

        <button
          onClick={() => handleStartSession({ weakTopicsOnly: true, questionCount: 10 })}
          disabled={isStarting}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
        >
          <Target size={14} /> Practice Weak Topics
        </button>

        <button
          onClick={() => handleStartSession({ bookmarkedOnly: true, questionCount: 10 })}
          disabled={isStarting}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'var(--accent-primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
        >
          <Bookmark size={14} /> Practice Bookmarked
        </button>
      </div>

      {/* Main Grid: Topic Directory on Left, Practice Builder on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: India-BIX-Style Topic Directory (Phase 15) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
              Placement Topics Directory
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click topic to start practice immediately</span>
          </div>

          {TOPIC_DIRECTORY.map((group, gIdx) => (
            <div 
              key={gIdx} 
              style={{ 
                background: 'var(--bg-surface)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                overflow: 'hidden' 
              }}
            >
              {/* Group Title Header */}
              <div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{group.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{group.group}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {group.topics.length} Sub-topics
                </span>
              </div>

              {/* Sub-topics list */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: 'var(--border-color)' }}>
                {group.topics.map((t, tIdx) => (
                  <div 
                    key={tIdx}
                    style={{ 
                      background: 'var(--bg-surface)', 
                      padding: '12px 14px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{t.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Approx. {t.estimatedQuestions} questions
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleStartSession({ topicSlug: t.slug, isTimed: false, questionCount: 10 })}
                        disabled={isStarting}
                        style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                        title="Start Untimed Practice"
                      >
                        Practice
                      </button>

                      <button 
                        onClick={() => handleStartSession({ topicSlug: t.slug, isTimed: true, durationMinutes: 15, questionCount: 10 })}
                        disabled={isStarting}
                        style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                        title="Start 15-Minute Timed Test"
                      >
                        Timed Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Custom Practice / Timed Test Builder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeTab === 'timed' ? <Clock size={18} style={{ color: '#f59e0b' }} /> : <Zap size={18} style={{ color: 'var(--accent-primary)' }} />}
              {activeTab === 'timed' ? 'Timed Test Builder' : 'Custom Practice Builder'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Category Filter */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Number of Questions */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Number of Questions</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[5, 10, 15, 20].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        background: questionCount === cnt ? 'var(--accent-primary)' : 'var(--bg-primary)',
                        color: questionCount === cnt ? '#fff' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Limit (if Timed Test mode) */}
              {activeTab === 'timed' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b', display: 'block', marginBottom: '6px' }}>Time Limit (Minutes)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[10, 15, 30, 45].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMinutes(mins)}
                        style={{
                          padding: '8px',
                          borderRadius: 'var(--radius-sm)',
                          background: durationMinutes === mins ? '#f59e0b' : 'var(--bg-primary)',
                          color: durationMinutes === mins ? '#fff' : 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Start CTA */}
              <button
                onClick={() => handleStartSession()}
                disabled={isStarting}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: activeTab === 'timed' ? '#f59e0b' : 'var(--accent-primary, #6366f1)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: isStarting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isStarting ? 0.7 : 1
                }}
              >
                <PlayCircle size={18} />
                {isStarting ? 'Preparing Arena...' : activeTab === 'timed' ? 'Start Timed Test' : 'Start Practice'}
              </button>
            </div>
          </div>

          {/* Recent History Widget */}
          {history.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={15} style={{ color: 'var(--text-muted)' }} /> Recent Practice Sessions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.slice(0, 4).map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      {h.total_questions} Questions ({h.mode || 'Practice'})
                    </span>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>
                      {h.score_pct !== null ? `${h.score_pct}%` : 'Done'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
