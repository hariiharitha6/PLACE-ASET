'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { challengeService } from '../../../../../lib/challengeService';
import { useToast } from '../../../../../context/ToastContext';
import { useConfirm } from '../../../../../context/ConfirmContext';
import { 
  AlertTriangle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import styles from '../../challenges.module.css';

export default function ChallengeArenaPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const toast = useToast();
  const confirm = useConfirm();

  // Question & Attempt state
  const [challenge, setChallenge] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> selectedOptionId
  const [markedForReview, setMarkedForReview] = useState({}); // questionId -> boolean
  
  // Timer & Loading state
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab switch counter (Anti-Cheat deterrent)
  const tabSwitches = useRef(0);
  const autoSaveTimer = useRef(null);

  // Load challenge metadata and questions list on mount
  useEffect(() => {
    const initArena = async () => {
      try {
        const res = await challengeService.startChallenge(id);
        setChallenge(res.challenge);
        setQuestions(res.questions || []);

        // Load pre-existing partial answers if any from submissions array
        const initialAnswers = {};
        if (res.submissions && res.submissions.length > 0) {
          res.submissions.forEach((s) => {
            if (s.selected_option_id) {
              initialAnswers[s.question_id] = s.selected_option_id;
            }
          });
        }
        setAnswers(initialAnswers);

        // Compute countdown seconds remaining
        const started = new Date(res.challenge.started_at);
        const limitSeconds = res.challenge.duration_minutes * 60;
        const elapsedSeconds = Math.round((new Date().getTime() - started.getTime()) / 1000);
        const remaining = Math.max(0, limitSeconds - elapsedSeconds);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          // Auto submit if time already spent
          handleFinalize(true);
        }
      } catch (err) {
        console.error('Arena init error', err);
        toast.error(err.message || 'Failed to start challenge arena.');
        router.push(`/challenges/${id}`);
      } finally {
        setIsLoading(false);
      }
    };
    initArena();
  }, [id]);

  // Periodic progress saving method
  const handleAutoSave = useCallback(async () => {
    try {
      const mappedAnswers = Object.entries(answers).map(([qId, oId]) => ({
        question_id: qId,
        selected_option_id: oId,
        time_spent_seconds: 30
      }));
      if (mappedAnswers.length > 0) {
        await challengeService.saveProgress(id, mappedAnswers);
        console.log('Progress auto-saved successfully.');
      }
    } catch (err) {
      console.warn('Auto save progress error:', err);
    }
  }, [id, answers]);

  // Setup auto-save timer interval (every 30 seconds)
  useEffect(() => {
    if (isLoading || isSubmitting || !timeLeft) return;

    autoSaveTimer.current = setInterval(handleAutoSave, 30000);
    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [isLoading, isSubmitting, timeLeft, handleAutoSave]);

  // Finalize Submission
  const handleFinalize = async (isAutoSubmit = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);

    if (!isAutoSubmit) {
      const confirmText = 'Are you sure you want to finalize and submit your challenge? You cannot change answers after this.';
      const isConfirmed = await confirm({
        title: 'Submit Challenge',
        message: confirmText,
        confirmText: 'Submit Now',
        type: 'warning',
      });
      if (!isConfirmed) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // 1. Submit latest answers array
      const mappedAnswers = Object.entries(answers).map(([qId, oId]) => ({
        question_id: qId,
        selected_option_id: oId,
        time_spent_seconds: 10
      }));
      if (mappedAnswers.length > 0) {
        await challengeService.saveProgress(id, mappedAnswers);
      }

      // 2. Call finalize grading endpoint
      await challengeService.finalizeAttempt(id);

      if (isAutoSubmit) {
        toast.warning('Time is up! Your answers have been automatically submitted.');
      } else {
        toast.success('Challenge attempt finalized and scored successfully!');
      }

      router.push(`/challenges/${id}/results`);
    } catch (err) {
      console.error('Finalize error', err);
      toast.error('Failed to finalize attempt: ' + err.message);
      setIsSubmitting(false);
    }
  };

  // Anti-Cheat Audit listener setup
  const auditActivity = useCallback(async (eventType) => {
    tabSwitches.current += 1;
    try {
      await challengeService.logActivity(id, eventType, { 
        count: tabSwitches.current,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Audit logger warning:', err);
    }
    toast.warning('⚠️ Tab switch detected! Suspicious activity has been logged. Attempting to cheat may lead to disqualification.', 6000);
  }, [id]);

  useEffect(() => {
    if (isLoading || isSubmitting) return;

    const handleBlur = () => auditActivity('window_blur');
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        auditActivity('tab_hidden');
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isLoading, isSubmitting, auditActivity]);

  // Countdown timer clock tick
  useEffect(() => {
    if (timeLeft === null || isSubmitting) return;

    if (timeLeft <= 0) {
      handleFinalize(true);
      return;
    }

    const clock = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(clock);
  }, [timeLeft, isSubmitting]);

  const handleSelectOption = (questionId, optionId) => {
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

  const handleManualSave = async () => {
    try {
      const mappedAnswers = Object.entries(answers).map(([qId, oId]) => ({
        question_id: qId,
        selected_option_id: oId,
        time_spent_seconds: 10
      }));
      await challengeService.saveProgress(id, mappedAnswers);
      toast.success('Progress saved successfully!');
    } catch (err) {
      toast.error('Failed to save progress: ' + err.message);
    }
  };

  const formatTimer = (sec) => {
    if (sec <= 0 || sec === null) return '00:00';
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        <span>Instantiating Arena Canvas...</span>
      </div>
    );
  }

  const activeQuestion = questions[activeIdx]?.questions;
  const points = questions[activeIdx]?.points || 1;

  return (
    <div className={styles.arenaLayout}>
      
      {/* Left panel: Testing Area */}
      <div className={styles.arenaMain}>
        
        {/* Progress header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Question {activeIdx + 1} of {questions.length} ({points} Points)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeQuestion?.type && (
              <span className={`${styles.statusBadge} ${styles.statusPublished}`}>
                {activeQuestion.type?.replace(/_/g, ' ')}
              </span>
            )}
            <span className={`${styles.statusBadge} ${styles.statusActive}`}>
              {activeQuestion?.difficulty}
            </span>
          </div>
        </div>

        {/* Question content */}
        {activeQuestion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            
            {/* Statement */}
            <div className={styles.statement} style={{ fontSize: '18px', fontWeight: '600' }}>
              {activeQuestion.statement}
            </div>
            {activeQuestion.image_url && (
              <img 
                src={activeQuestion.image_url} 
                alt="Question Diagram" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  objectFit: 'contain'
                }}
              />
            )}

            {/* Options selection List */}
            {activeQuestion.question_options && activeQuestion.question_options.length > 0 && (
              <div className={styles.optionsList} style={{ marginTop: '16px' }}>
                {activeQuestion.question_options.map((opt) => {
                  const isSelected = answers[activeQuestion.id] === opt.id;
                  return (
                    <div 
                      key={opt.id}
                      onClick={() => handleSelectOption(activeQuestion.id, opt.id)}
                      className={`${styles.optionItem} ${isSelected ? styles.optionItemCorrect : ''}`}
                      style={{ cursor: 'pointer', transition: 'border-color var(--transition-fast)' }}
                    >
                      <span className={`${styles.optionLabel} ${isSelected ? styles.optionLabelCorrect : styles.optionLabelNormal}`}>
                        {opt.label}
                      </span>
                      <span className={styles.optionText}>{opt.content}</span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* Navigation bottom bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          marginTop: 'auto',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={styles.btnSecondary}
              disabled={activeIdx === 0}
              onClick={() => setActiveIdx(activeIdx - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            
            <button 
              className={styles.btnSecondary}
              disabled={activeIdx === questions.length - 1}
              onClick={() => setActiveIdx(activeIdx + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {activeQuestion && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={styles.btnSecondary}
                onClick={() => handleClearAnswer(activeQuestion.id)}
                style={{ color: 'var(--accent-danger)' }}
              >
                Clear
              </button>
              <button 
                className={styles.btnSecondary}
                onClick={() => handleToggleMarkForReview(activeQuestion.id)}
                style={{ color: markedForReview[activeQuestion.id] ? 'var(--accent-warning)' : 'inherit' }}
              >
                {markedForReview[activeQuestion.id] ? 'Unmark Review' : 'Mark Review'}
              </button>
              <button 
                className={styles.btnSecondary}
                onClick={handleManualSave}
                style={{ color: 'var(--accent-info)' }}
              >
                Save Draft
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Right panel: Sidebar status & Timers */}
      <div className={styles.arenaSidebar}>
        
        {/* Countdown display */}
        <div>
          <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Remaining Time
          </h4>
          <div className={`${styles.timerBox} ${timeLeft > 120 ? styles.timerNormal : ''}`}>
            <Clock size={20} />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>

        {/* Question index navigation grid */}
        <div>
          <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Challenge Questions
          </h4>
          <div className={styles.questionGrid}>
            {questions.map((q, idx) => {
              const qId = q.questions?.id;
              const isSolved = !!answers[qId];
              const isActive = activeIdx === idx;
              const isMarked = !!markedForReview[qId];
              
              return (
                <button 
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`
                    ${styles.questionNavBtn} 
                    ${isActive ? styles.questionNavBtnActive : ''} 
                    ${!isActive && isSolved ? styles.questionNavBtnSolved : ''}
                    ${!isActive && !isSolved ? styles.questionNavBtnUnsolved : ''}
                  `}
                  style={!isActive && isMarked ? {
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--accent-warning)',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                  } : {}}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Warning messages */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(251, 191, 36, 0.04)',
          border: '1px solid rgba(251, 191, 36, 0.1)',
          color: 'var(--accent-warning)',
          fontSize: '12px',
          lineHeight: '1.4'
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>Warning: Do not exit full screen or tab switch. Suspicious activities are logged for review.</span>
        </div>

        {/* Finalize submit triggers */}
        <button 
          className={styles.btnPrimary}
          disabled={isSubmitting}
          onClick={() => handleFinalize(false)}
          style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 'auto', background: 'var(--gradient-success)' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Finalizing...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} /> Finalize Submission
            </>
          )}
        </button>

      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

    </div>
  );
}
