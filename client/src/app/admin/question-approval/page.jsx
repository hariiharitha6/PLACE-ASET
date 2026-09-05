'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import EmptyState from '../../../components/ui/EmptyState';
import { CheckCircle2, AlertCircle, HelpCircle, Layers, Sparkles, Filter, Trash2, Check } from 'lucide-react';
import styles from './questionApproval.module.css';

export default function QuestionApprovalPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [msg, setMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendingQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/questions/pending');
      const data = res?.data || [];
      setQuestions(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedQuestion(data[0]);
      } else {
        setSelectedQuestion(null);
      }
    } catch (err) {
      console.error('Failed to load pending queue from database', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingQuestions();
  }, [fetchPendingQuestions]);

  const handleReview = async (questionId, status) => {
    setIsSubmitting(true);
    try {
      await api.patch(`/admin/questions/${questionId}/review`, { approval_status: status, feedback });
      const updated = questions.filter(q => q.id !== questionId);
      setQuestions(updated);
      setSelectedQuestion(updated[0] || null);
      setMsg(`Question successfully marked as ${status}.`);
      setFeedback('');
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error('Failed to review question', err);
      setMsg('Review action failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (questions.length === 0) return;
    setIsSubmitting(true);
    try {
      const itemIds = questions.map(q => q.id);
      await api.post('/admin/questions/bulk-review', { itemIds, action: 'approve' });
      setQuestions([]);
      setSelectedQuestion(null);
      setMsg(`All ${itemIds.length} pending questions approved and published to students!`);
      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      console.error('Bulk review failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Question Approval Moderation Queue</h1>
          <p className={styles.subtitle}>Review AI-classified questions, verify quality & duplicate scores, and publish to the student portal</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className={styles.badgeCount}>{questions.length} Pending Review</div>
          {questions.length > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={isSubmitting}
              style={{ padding: '8px 16px', background: 'var(--gradient-primary)', color: '#fff', borderRadius: 'var(--radius-sm)', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={14} /> Bulk Approve All
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={styles.alertSuccess}>
          <span>✅</span>
          <span>{msg}</span>
        </div>
      )}

      <div className={styles.contentGrid}>
        {/* Questions Queue List */}
        <div className={styles.queueCard}>
          <h3>Pending Submissions</h3>
          {loading ? (
            <div className={styles.textMuted}>Loading moderation queue...</div>
          ) : questions.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={36} style={{ color: 'var(--accent-success)' }} />}
              title="All Question Submissions Reviewed"
              description="There are currently no questions pending moderation in the approval queue."
            />
          ) : (
            <div className={styles.queueList}>
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`${styles.queueItem} ${selectedQuestion?.id === q.id ? styles.active : ''}`}
                  onClick={() => setSelectedQuestion(q)}
                >
                  <div className={styles.queueItemHeader}>
                    <span className={styles.typeBadge}>{q.question_type || q.type || 'MCQ'}</span>
                    <span className={`${styles.diffBadge} ${styles[q.difficulty?.toLowerCase() || 'medium']}`}>{q.difficulty || 'Medium'}</span>
                    {q.duplicate_score_pct > 0 && (
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: q.duplicate_score_pct > 70 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: q.duplicate_score_pct > 70 ? '#f87171' : '#fbbf24', fontWeight: '700' }}>
                        Sim: {q.duplicate_score_pct}%
                      </span>
                    )}
                  </div>
                  <p className={styles.statementSnippet}>{q.statement}</p>
                  <div className={styles.queueItemMeta}>
                    <span>{q.subject || q.topic || 'General'}</span>
                    <span>{q.created_at ? new Date(q.created_at).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Question Detail & Moderation Panel */}
        <div className={styles.detailCard}>
          {selectedQuestion ? (
            <div className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <h2>Question Review & Verification</h2>
                <span className={styles.idCode}>ID: {selectedQuestion.id}</span>
              </div>

              <div className={styles.metaRow}>
                <div className={styles.metaBox}>
                  <span className={styles.metaLabel}>Subject / Topic</span>
                  <span className={styles.metaVal}>{selectedQuestion.subject || selectedQuestion.topic || 'Computer Science'}</span>
                </div>
                <div className={styles.metaBox}>
                  <span className={styles.metaLabel}>Difficulty</span>
                  <span className={styles.metaVal}>{selectedQuestion.difficulty || 'Medium'}</span>
                </div>
                <div className={styles.metaBox}>
                  <span className={styles.metaLabel}>AI Quality Score</span>
                  <span className={styles.metaVal}>{selectedQuestion.quality_score != null ? `${selectedQuestion.quality_score} / 100` : 'Pending'}</span>
                </div>
              </div>

              <div className={styles.sectionBox}>
                <h4>Question Statement</h4>
                <div className={styles.statementBox}>{selectedQuestion.statement}</div>
              </div>

              {selectedQuestion.options && Array.isArray(selectedQuestion.options) && selectedQuestion.options.length > 0 && (
                <div className={styles.sectionBox}>
                  <h4>Answer Options</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedQuestion.options.map((opt, i) => (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: '6px', background: (opt.is_correct || opt.label === selectedQuestion.correct_answer) ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', border: (opt.is_correct || opt.label === selectedQuestion.correct_answer) ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border-color)', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--accent-primary)' }}>{opt.label}:</strong>
                        <span>{opt.content}</span>
                        {(opt.is_correct || opt.label === selectedQuestion.correct_answer) && <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#34d399', fontWeight: '700' }}>✓ Correct Answer</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedQuestion.explanation && (
                <div className={styles.sectionBox}>
                  <h4>Explanation</h4>
                  <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {selectedQuestion.explanation}
                  </div>
                </div>
              )}

              <div className={styles.sectionBox}>
                <h4>Review Comments / Feedback</h4>
                <textarea
                  className={styles.feedbackArea}
                  placeholder="Optional review note or revision guidance..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className={styles.buttonRow}>
                <button
                  className={styles.rejectBtn}
                  disabled={isSubmitting}
                  onClick={() => handleReview(selectedQuestion.id, 'rejected')}
                >
                  ❌ Reject Submission
                </button>
                <button
                  className={styles.approveBtn}
                  disabled={isSubmitting}
                  onClick={() => handleReview(selectedQuestion.id, 'approved')}
                >
                  ✅ Approve & Publish
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.placeholderDetail}>
              <span>👈</span>
              <span>Select a question from the queue to inspect and publish.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
