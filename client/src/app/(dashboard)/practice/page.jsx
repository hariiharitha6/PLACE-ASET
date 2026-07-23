'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { practiceService } from '../../../lib/practiceService';
import { supabase } from '../../../lib/supabase';
import { getDepartmentsForCollege } from '../../../constants/departments';
import { 
  Brain, Cpu, BarChart3, BookOpen, Shuffle, Zap, Trophy, Target, 
  Flame, Clock, ChevronRight, Bookmark, AlertTriangle, Sparkles, 
  Settings, History, Award, CheckCircle, RefreshCw 
} from 'lucide-react';
import styles from './practice.module.css';

const PRACTICE_MODES = [
  { id: 'technical', label: 'Technical Practice', desc: 'Data structures, algorithms, OS, networking, DBMS.', icon: <Cpu size={20} />, color: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
  { id: 'logical', label: 'Logical Reasoning', desc: 'Puzzles, patterns, sequences, and syllogisms.', icon: <Brain size={20} />, color: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)' },
  { id: 'quantitative', label: 'Quantitative Aptitude', desc: 'Arithmetic, algebra, and data interpretation.', icon: <BarChart3 size={20} />, color: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.25)' },
  { id: 'verbal', label: 'Verbal Ability', desc: 'Grammar, vocabulary, reading comprehension.', icon: <BookOpen size={20} />, color: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  { id: 'mixed', label: 'Mixed Practice', desc: 'Random mix from all categories.', icon: <Shuffle size={20} />, color: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  { id: 'company', label: 'Company Specific', desc: 'Custom practice tailored for specific recruiter tests.', icon: <Trophy size={20} />, color: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)' },
  { id: 'department', label: 'Department Specific', desc: 'Questions linked to academic curriculums.', icon: <Award size={20} />, color: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.25)' },
  { id: 'adaptive', label: 'Adaptive Practice', desc: 'Foundation testing targeting weak and medium areas.', icon: <Sparkles size={20} />, color: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.25)' },
];

export default function PracticeArenaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);

  // Configuration state
  const [selectedMode, setSelectedMode] = useState(null);
  const [difficulty, setDifficulty] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [solvedStatus, setSolvedStatus] = useState('all');
  const [timedMode, setTimedMode] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [recentlyAdded, setRecentlyAdded] = useState(false);

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
      const { data: cats } = await supabase.from('categories').select('id, name').order('name');
      setCategories(cats || []);
    } catch (e) { console.error(e); }

    try {
      const { data: depts } = await supabase.from('departments').select('id, name, code').order('name');
      setDepartments(getDepartmentsForCollege('aset', depts || []));
    } catch (e) { console.error(e); }

    try {
      const { data: comps } = await supabase.from('companies').select('id, name').order('name');
      setCompanies(comps || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStart = async (overrideParams = null) => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      const payload = overrideParams || {
        mode: selectedMode,
        category_id: categoryId || undefined,
        difficulty: difficulty || undefined,
        questionCount,
        department_id: selectedMode === 'department' ? departmentId || undefined : undefined,
        company_id: selectedMode === 'company' ? companyId || undefined : undefined,
        solved_status: solvedStatus,
        recently_added_only: recentlyAdded || undefined,
      };

      // Add category_id maps if target modes are picked
      if (selectedMode === 'technical' && !payload.category_id) {
        // default to technical subcategories or technical category id
        const techCat = categories.find(c => c.name.toLowerCase().includes('technical'));
        if (techCat) payload.category_id = techCat.id;
      } else if (selectedMode === 'logical' && !payload.category_id) {
        const logCat = categories.find(c => c.name.toLowerCase().includes('logical'));
        if (logCat) payload.category_id = logCat.id;
      } else if (selectedMode === 'quantitative' && !payload.category_id) {
        const quantCat = categories.find(c => c.name.toLowerCase().includes('quant'));
        if (quantCat) payload.category_id = quantCat.id;
      } else if (selectedMode === 'verbal' && !payload.category_id) {
        const verbCat = categories.find(c => c.name.toLowerCase().includes('verbal'));
        if (verbCat) payload.category_id = verbCat.id;
      }

      const res = await practiceService.startSession(payload);
      
      // Pass timed config parameters to session storage
      res.timedConfig = {
        isTimed: timedMode,
        durationMinutes: durationMinutes
      };

      sessionStorage.setItem('practiceSession', JSON.stringify(res));
      toast.success('Practice session started!');
      router.push(`/practice/arena`);
    } catch (err) {
      toast.error('Failed to start: ' + err.message);
      setIsStarting(false);
    }
  };

  const startShortcutPractice = (type) => {
    if (type === 'bookmarks') {
      handleStart({
        mode: 'mixed',
        questionCount: 10,
        bookmarked_only: true
      });
    } else if (type === 'incorrect') {
      handleStart({
        mode: 'mixed',
        questionCount: 10,
        solved_status: 'incorrect'
      });
    } else if (type === 'weak') {
      handleStart({
        mode: 'adaptive',
        questionCount: 10,
        weak_topics_only: true
      });
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Placement Practice Arena</h1>
          <p>Train across Quantitative, Reasoning, Verbal, Technical, and Recruiters specific formats.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={styles.btnSecondary}
            onClick={() => router.push('/practice/bookmarks')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <Bookmark size={15} /> Bookmarks
          </button>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent-warning)', padding: '12px', borderRadius: '50%' }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats?.streak || 0} Days</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Practice Streak</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '12px', borderRadius: '50%' }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats?.totalXP || 0} XP</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Level {stats?.level || 1} Progress</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', padding: '12px', borderRadius: '50%' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats?.accuracy || 0}%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Average Accuracy Rate</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--accent-info)', padding: '12px', borderRadius: '50%' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats?.totalQuestions || 0}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Questions Solved</div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.5fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Side: Setup Practice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Practice Recommendations */}
          {recommendations.length > 0 && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px dashed rgba(245, 158, 11, 0.3)',
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: 'var(--accent-warning)' }}>
                <Sparkles size={16} /> Recommended Practice Topics
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {recommendations.slice(0, 3).map((rec) => (
                  <button 
                    key={rec.id}
                    onClick={() => {
                      setSelectedMode('adaptive');
                      setCategoryId(rec.category_id);
                      handleStart({
                        mode: 'adaptive',
                        category_id: rec.category_id,
                        questionCount: 10
                      });
                    }}
                    style={{
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    Solve <strong>{rec.categories?.name}</strong>: low accuracy alert.
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode Selector */}
          {!selectedMode ? (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Pick a Target Mode</h2>
              <div className={styles.modeGrid}>
                {PRACTICE_MODES.map((m) => (
                  <div key={m.id} className={styles.modeCard} onClick={() => setSelectedMode(m.id)}>
                    <div className={styles.modeIcon} style={{ background: m.color, border: `1px solid ${m.border}` }}>
                      {m.icon}
                    </div>
                    <div className={styles.modeTitle}>{m.label}</div>
                    <div className={styles.modeDesc}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.configPanel} style={{ maxWidth: '100%', margin: '0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
                Configure Your Session
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Mode: <strong>{PRACTICE_MODES.find(m => m.id === selectedMode)?.label}</strong>
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                {/* Topic Specific Option */}
                {selectedMode !== 'mixed' && selectedMode !== 'adaptive' && selectedMode !== 'company' && selectedMode !== 'department' && (
                  <div className={styles.configRow}>
                    <label>Sub-Topic</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                      style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      <option value="">All Topics</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {/* Company filter */}
                {selectedMode === 'company' && (
                  <div className={styles.configRow}>
                    <label>Target Company</label>
                    <select value={companyId} onChange={e => setCompanyId(e.target.value)}
                      style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      <option value="">Select Company</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {/* Department filter */}
                {selectedMode === 'department' && (
                  <div className={styles.configRow}>
                    <label>Target Department</label>
                    <select value={departmentId} onChange={e => setDepartmentId(e.target.value)}
                      style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}

                <div className={styles.configRow}>
                  <label>Difficulty Rating</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                    style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className={styles.configRow}>
                  <label>Question Quantity</label>
                  <select value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}
                    style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={30}>30 Questions</option>
                  </select>
                </div>

                <div className={styles.configRow}>
                  <label>Solvability Status</label>
                  <select value={solvedStatus} onChange={e => setSolvedStatus(e.target.value)}
                    style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="all">All Questions</option>
                    <option value="unsolved">Unsolved Only</option>
                    <option value="solved">Previously Solved Only</option>
                    <option value="incorrect">Incorrectly Answered Only</option>
                  </select>
                </div>
              </div>

              {/* Timed vs Untimed Toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Enable Timed Mode</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Simulate real placement test conditions.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={timedMode}
                    onChange={(e) => setTimedMode(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
                {timedMode && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Session Duration:</span>
                    <input 
                      type="number"
                      min="5"
                      max="120"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 15)}
                      style={{ width: '60px', padding: '6px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px' }}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>minutes</span>
                  </div>
                )}
              </div>

              {/* Extra Checkbox filters */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={recentlyAdded} 
                    onChange={e => setRecentlyAdded(e.target.checked)} 
                    style={{ cursor: 'pointer' }}
                  />
                  Prioritize recently added questions
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={() => setSelectedMode(null)}
                  style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Back
                </button>
                <button onClick={() => handleStart()} disabled={isStarting}
                  className={styles.btnPrimary}
                  style={{ padding: '10px 28px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isStarting ? 'Starting...' : <>Start Arena Session <ChevronRight size={16} /></>}
                </button>
              </div>
            </div>
          )}

          {/* Practice History Table */}
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} /> Recent Practice Sessions
            </h2>
            {history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                No practice history recorded yet. Choose a mode to start!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category/Mode</th>
                      <th>Solved</th>
                      <th>XP</th>
                      <th>Accuracy</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td>{new Date(h.ended_at).toLocaleDateString()}</td>
                        <td>{h.categories?.name || h.mode || 'Mixed'}</td>
                        <td>{h.total_questions} questions</td>
                        <td>+{h.xp_earned} XP</td>
                        <td>
                          <span style={{ fontWeight: '700', color: h.correct_count / h.total_questions >= 0.6 ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                            {Math.round((h.correct_count / h.total_questions) * 100)}%
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => router.push(`/practice/results/${h.id}`)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Short-cuts & Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick practice triggers */}
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Quick Solve Workspaces</h3>
            
            <button 
              onClick={() => startShortcutPractice('bookmarks')}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}
            >
              <Bookmark size={15} style={{ color: 'var(--accent-info)' }} /> Retry Bookmarked Questions
            </button>

            <button 
              onClick={() => startShortcutPractice('incorrect')}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}
            >
              <AlertTriangle size={15} style={{ color: 'var(--accent-danger)' }} /> Retry Incorrect Answers
            </button>

            <button 
              onClick={() => startShortcutPractice('weak')}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}
            >
              <Sparkles size={15} style={{ color: 'var(--accent-warning)' }} /> Focus on Weak Topics
            </button>
          </div>

          {/* Topic mastery lists */}
          {stats?.topicAnalysis && stats.topicAnalysis.length > 0 && (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>Topic Mastery Rates</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.topicAnalysis.map((t, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{t.name}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{t.mastery}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${t.mastery}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty stats overview */}
          {stats?.difficultyAnalysis && stats.difficultyAnalysis.length > 0 && (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>Difficulty Accuracy</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.difficultyAnalysis.map((d, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontWeight: '600' }}>{d.difficulty}</span>
                    <span style={{ fontWeight: '700', color: d.accuracy >= 65 ? 'var(--accent-success)' : 'var(--text-primary)' }}>{d.accuracy}% accuracy</span>
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
