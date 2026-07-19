'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../../context/ToastContext';
import { practiceService } from '../../../../lib/practiceService';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Zap, 
  Play, Pause, RefreshCw, Bookmark, HelpCircle, Save, Check 
} from 'lucide-react';
import styles from '../practice.module.css';

export default function PracticeArenaSessionPage() {
  const router = useRouter();
  const toast = useToast();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);

  // Attempt States
  const [answers, setAnswers] = useState({}); // qId -> selectedOptionId
  const [markedForReview, setMarkedForReview] = useState({}); // qId -> boolean
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState({}); // qId -> boolean

  // Timer & Control States
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState(null);

  const timerRef = useRef(0);
  const totalSecondsRef = useRef(0);
  const clockTimer = useRef(null);
  const autoSaveTimer = useRef(null);

  // Initialize practice session
  useEffect(() => {
    const stored = sessionStorage.getItem('practiceSession');
    if (!stored) {
      router.push('/practice');
      return;
    }
    const parsed = JSON.parse(stored);
    setSession(parsed.session);
    setQuestions(parsed.questions || []);

    // Set up timed mode if configured
    const timedConfig = parsed.timedConfig;
    if (timedConfig && timedConfig.isTimed) {
      setTimeLeft(timedConfig.durationMinutes * 60);
    }

    // Load initial user bookmarks
    const loadBookmarks = async () => {
      try {
        const bms = await practiceService.getBookmarks();
        const bmMap = {};
        bms.forEach(id => {
          bmMap[id] = true;
        });
        setBookmarkedQuestions(bmMap);
      } catch (e) {
        console.error('Failed to load bookmarks', e);
      }
    };
    loadBookmarks();

    // Start clock timer
    clockTimer.current = setInterval(() => {
      if (!isPaused && !isFinished) {
        timerRef.current += 1;
        totalSecondsRef.current += 1;
        setTimeLeft(prev => {
          if (prev !== null) {
            if (prev <= 1) {
              clearInterval(clockTimer.current);
              handleFinish(true); // Auto submit on timeout
              return 0;
            }
            return prev - 1;
          }
          return null;
        });
      }
    }, 1000);

    // Auto-save progress every 30 seconds
    autoSaveTimer.current = setInterval(() => {
      saveProgressDraft(false);
    }, 30000);

    return () => {
      if (clockTimer.current) clearInterval(clockTimer.current);
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [isPaused, isFinished]);

  const saveProgressDraft = async (showToast = true) => {
    if (!session || isFinished) return;
    try {
      // Save all active selections
      const promises = Object.entries(answers).map(([qId, oId]) => 
        practiceService.submitAnswer({
          sessionId: session.id,
          question_id: qId,
          selected_option_id: oId,
          time_spent: Math.min(timerRef.current, 30)
        })
      );
      if (promises.length > 0) {
        await Promise.all(promises);
        if (showToast) {
          toast.success('Practice progress draft auto-saved!');
        }
      }
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    if (isPaused) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleClearAnswer = (questionId) => {
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleToggleMarkForReview = (questionId) => {
    setMarkedForReview(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleToggleBookmark = async (questionId) => {
    try {
      const res = await practiceService.toggleBookmark(questionId);
      setBookmarkedQuestions(prev => ({
        ...prev,
        [questionId]: res.bookmarked
      }));
      toast.success(res.bookmarked ? 'Question bookmarked!' : 'Bookmark removed.');
    } catch (err) {
      toast.error('Failed to toggle bookmark: ' + err.message);
    }
  };

  const handleFinish = async (isAutoSubmit = false) => {
    if (isFinished) return;
    if (clockTimer.current) clearInterval(clockTimer.current);
    if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);

    try {
      // 1. Submit final answers
      const promises = Object.entries(answers).map(([qId, oId]) => 
        practiceService.submitAnswer({
          sessionId: session.id,
          question_id: qId,
          selected_option_id: oId,
          time_spent: Math.round(totalSecondsRef.current / (questions.length || 1))
        })
      );
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // 2. Call endSession
      const res = await practiceService.endSession({
        sessionId: session.id
      });

      // 3. Compute topic recommendations and metrics locally for presentation
      const accuracy = res.accuracy;
      const averageTime = Math.round(totalSecondsRef.current / (res.totalAnswered || 1));

      setResults({
        ...res,
        timeTakenSeconds: totalSecondsRef.current,
        averageTimePerQuestion: averageTime
      });
      setIsFinished(true);
      toast.success(isAutoSubmit ? 'Time expired. Practice auto-submitted!' : 'Practice session finalized!');
    } catch (err) {
      toast.error('Failed to finalize practice: ' + err.message);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setMarkedForReview({});
    setActiveIdx(0);
    timerRef.current = 0;
    totalSecondsRef.current = 0;
    setTimeLeft(session?.duration_minutes ? session.duration_minutes * 60 : null);
    setIsPaused(false);
    setIsFinished(false);
    setResults(null);
  };

  const formatTimer = (sec) => {
    if (sec <= 0 || sec === null) return '00:00';
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading practice workspace...</div>;
  }

  // Evaluation Screen
  if (isFinished && results) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>Session Performance Evaluation</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Placement practice review sheet</p>
        </div>

        <div className={styles.statsGrid} style={{ maxWidth: '800px', margin: '0 auto', gap: '20px' }}>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: 'var(--accent-success)' }}>{results.correctCount}</span>
            <span className={styles.statLabel}>Correct</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: 'var(--accent-danger)' }}>{results.wrongCount}</span>
            <span className={styles.statLabel}>Incorrect</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: 'var(--text-muted)' }}>{results.skippedCount}</span>
            <span className={styles.statLabel}>Skipped</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{results.accuracy}%</span>
            <span className={styles.statLabel}>Accuracy</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{formatTimer(results.timeTakenSeconds)}</span>
            <span className={styles.statLabel}>Time Taken</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{results.averageTimePerQuestion}s</span>
            <span className={styles.statLabel}>Avg Time/Q</span>
          </div>
        </div>

        {/* Dynamic mastery tips */}
        <div style={{ maxWidth: '600px', margin: '24px auto', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} style={{ color: 'var(--accent-warning)' }} /> Recommended Focus Strategy
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {results.accuracy >= 80 
              ? 'Excellent performance! You demonstrate high topic mastery. Consider trying Expert difficulty practice sessions or moving to company specific placement papers next.'
              : 'Good job finishing the session. We suggest reviewing the incorrect answers below to identify concept gaps. Focus on practicing weak areas with Untimed mode to build confidence.'}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          <button onClick={() => router.push('/practice')}
            style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600' }}>
            Back to Arena
          </button>
          <button onClick={handleRestart}
            style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={15} /> Restart Session
          </button>
        </div>
      </div>
    );
  }

  const activeQ = questions[activeIdx];
  const questionData = activeQ?.questions || activeQ;
  const options = questionData?.question_options || [];
  const selectedOptionId = answers[questionData?.id];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className={styles.arenaLayout}>
      
      {/* Main Panel */}
      <div className={styles.arenaMain} style={{ filter: isPaused ? 'blur(6px)' : 'none' }}>
        
        {/* Topic Header info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Question {activeIdx + 1} of {questions.length}
            </span>
            <span style={{ marginLeft: '12px', fontSize: '11px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              {questionData?.difficulty || 'Medium'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {timeLeft !== null && (
              <span style={{ fontSize: '13px', color: 'var(--accent-danger)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {formatTimer(timeLeft)}
              </span>
            )}
            <button 
              onClick={() => setIsPaused(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              title="Pause Session"
            >
              <Pause size={18} />
            </button>
          </div>
        </div>

        {/* Question Statement & Options */}
        {questionData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, marginTop: '12px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              {questionData.statement}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {options.map(opt => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button 
                    key={opt.id} 
                    className={`${styles.optionBtn} ${isSelected ? styles.optionSelected : ''}`}
                    onClick={() => handleSelectOption(questionData.id, opt.id)}
                  >
                    <span className={styles.optionLabel}>{opt.label}</span>
                    <span>{opt.content}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Panel Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: 'auto', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              disabled={activeIdx === 0} 
              onClick={() => setActiveIdx(activeIdx - 1)}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: activeIdx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button 
              disabled={activeIdx === questions.length - 1} 
              onClick={() => setActiveIdx(activeIdx + 1)}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: activeIdx === questions.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {questionData && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleClearAnswer(questionData.id)}
                style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '13px' }}
              >
                Clear Answer
              </button>
              <button 
                onClick={() => handleToggleMarkForReview(questionData.id)}
                style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'transparent', color: markedForReview[questionData.id] ? 'var(--accent-warning)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
              >
                {markedForReview[questionData.id] ? 'Unmark Review' : 'Mark Review'}
              </button>
              <button 
                onClick={() => handleToggleBookmark(questionData.id)}
                style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'transparent', color: bookmarkedQuestions[questionData.id] ? 'var(--accent-info)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Bookmark size={14} fill={bookmarkedQuestions[questionData.id] ? 'currentColor' : 'none'} /> Bookmark
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar question grid palette */}
      <div className={styles.arenaSidebar}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Practice Session Progress</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(answeredCount / (questions.length || 1)) * 100}%` }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{answeredCount} of {questions.length} questions completed</p>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Question Navigator</div>
          <div className={styles.questionNavGrid}>
            {questions.map((q, idx) => {
              const qId = (q.questions || q)?.id;
              const hasAnswer = !!answers[qId];
              const isMarked = !!markedForReview[qId];

              let cls = styles.navBtn;
              let customStyle = {};

              if (activeIdx === idx) {
                cls += ` ${styles.navBtnActive}`;
              } else if (isMarked) {
                customStyle = {
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-warning)',
                  borderColor: 'rgba(245, 158, 11, 0.4)',
                };
              } else if (hasAnswer) {
                customStyle = {
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--accent-success)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                };
              }

              return (
                <button 
                  key={idx} 
                  className={cls} 
                  style={customStyle}
                  onClick={() => setActiveIdx(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
          <button 
            onClick={() => saveProgressDraft(true)}
            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}
          >
            <Save size={15} /> Save Progress Draft
          </button>
          <button 
            onClick={() => handleFinish(false)}
            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-success)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
          >
            Finish Practice Session
          </button>
        </div>
      </div>

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '40px',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>Session Paused</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Your session clock has been frozen. You can resume when you are ready.</p>
            <button 
              onClick={() => setIsPaused(false)}
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-primary)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Play size={15} /> Resume Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
