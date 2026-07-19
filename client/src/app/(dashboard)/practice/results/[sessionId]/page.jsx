'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '../../../../../context/ToastContext';
import { practiceService } from '../../../../../lib/practiceService';
import { ChevronLeft, CheckCircle, XCircle, Clock, Zap, BookOpen, AlertTriangle } from 'lucide-react';
import styles from '../../practice.module.css';

export default function PracticeSessionResultsPage() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams();
  const { sessionId } = params;

  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await practiceService.getSessionResults(sessionId);
        setSession(res.session);
        setAnswers(res.answers || []);
      } catch (err) {
        toast.error('Failed to load session details: ' + err.message);
        router.push('/practice');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [sessionId, toast, router]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading session results...</div>;
  }

  const correctCount = session?.correct_count || 0;
  const totalCount = session?.total_questions || 0;
  const wrongCount = Math.max(0, answers.length - correctCount);
  const skippedCount = Math.max(0, totalCount - answers.length);
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => router.push('/practice')}
          style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px 12px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>Session Review</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Mode: {session?.categories?.name || session?.mode || 'Mixed'} | Completed on {new Date(session?.ended_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--accent-success)' }}>{correctCount}</span>
          <span className={styles.statLabel}>Correct</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--accent-danger)' }}>{wrongCount}</span>
          <span className={styles.statLabel}>Incorrect</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--text-muted)' }}>{skippedCount}</span>
          <span className={styles.statLabel}>Skipped</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{accuracy}%</span>
          <span className={styles.statLabel}>Accuracy</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Zap size={18} /> +{session?.xp_earned}
          </span>
          <span className={styles.statLabel}>XP Gained</span>
        </div>
      </div>

      {/* Question Review Sheet */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Question Breakdown & Explanations</h2>
        
        {answers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No answers submitted in this session.</p>
        ) : (
          answers.map((ans, idx) => {
            const q = ans.questions;
            if (!q) return null;
            const isCorrect = ans.is_correct === true;
            
            return (
              <div 
                key={ans.id}
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Question Info Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Question {idx + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isCorrect ? (
                      <span style={{ fontSize: '11px', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                        <CheckCircle size={14} /> Correct
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                        <XCircle size={14} /> Incorrect
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      Time: {ans.time_spent_seconds}s
                    </span>
                  </div>
                </div>

                {/* Statement */}
                <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '600', lineHeight: '1.5' }}>
                  {q.statement}
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.question_options?.map(opt => {
                    const isSelected = ans.selected_option_id === opt.id;
                    const isCorrectOption = opt.is_correct;
                    
                    let bg = 'rgba(255,255,255,0.01)';
                    let border = '1px solid var(--border-color)';
                    let color = 'var(--text-secondary)';

                    if (isCorrectOption) {
                      bg = 'rgba(16, 185, 129, 0.08)';
                      border = '1px solid var(--accent-success)';
                      color = 'var(--accent-success)';
                    } else if (isSelected && !isCorrectOption) {
                      bg = 'rgba(239, 68, 68, 0.06)';
                      border = '1px solid var(--accent-danger)';
                      color = 'var(--accent-danger)';
                    }

                    return (
                      <div 
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          background: bg,
                          border: border,
                          fontSize: '13px',
                          color: color,
                          gap: '12px'
                        }}
                      >
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${isSelected || isCorrectOption ? 'currentColor' : 'var(--border-color)'}`,
                          fontWeight: '700',
                          fontSize: '11px',
                          flexShrink: 0
                        }}>
                          {opt.label}
                        </span>
                        <span>{opt.content}</span>
                        {isSelected && <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '700', opacity: 0.8 }}>(Your Choice)</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    lineHeight: '1.6'
                  }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Explanation:</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
