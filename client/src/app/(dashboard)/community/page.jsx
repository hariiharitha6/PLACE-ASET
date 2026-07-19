'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { communityService } from '../../../lib/communityService';
import { supabase } from '../../../lib/supabase';
import { BookOpen, Plus, ThumbsUp, Send, Check, X, ShieldAlert } from 'lucide-react';
import styles from './community.module.css';

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('approved'); // approved, pending, rejected
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New question form state
  const [statement, setStatement] = useState('');
  const [opts, setOpts] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('0');
  const [explanation, setExplanation] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadQuestions = async () => {
    try {
      const res = await communityService.listQuestions({
        page, limit: 10, status: activeTab
      });
      setQuestions(res.questions || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [page, activeTab]);

  useEffect(() => {
    const loadCats = async () => {
      const { data } = await supabase.from('categories').select('id, name').order('name');
      setCategories(data || []);
    };
    loadCats();
  }, []);

  const handleReview = async (id, action) => {
    const notes = await confirm({
      title: 'Review Question',
      message: 'Enter review notes (optional):',
      showInput: true,
      inputPlaceholder: 'E.g. Approved/Rejected reason...',
      confirmText: action === 'approve' ? 'Approve' : 'Reject',
      type: action === 'approve' ? 'info' : 'danger'
    });
    if (notes === null) return;
    try {
      await communityService.reviewQuestion(id, { action, review_notes: notes });
      toast.success(`Question ${action}d successfully.`);
      loadQuestions();
    } catch (e) {
      toast.error('Review failed: ' + e.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!statement || opts.some(o => !o)) return;
    setIsSubmitting(true);
    try {
      await communityService.submitQuestion({
        statement,
        options: opts.map((content, idx) => ({ label: String.fromCharCode(65 + idx), content })),
        correct_answer: correctAnswer,
        explanation,
        category_id: categoryId || undefined,
        difficulty
      });
      setShowAddModal(false);
      setStatement('');
      setOpts(['', '', '', '']);
      setCorrectAnswer('0');
      setExplanation('');
      setCategoryId('');
      toast.success('Question submitted successfully!');
      loadQuestions();
    } catch (err) {
      toast.error('Failed to submit: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditor = user && ['super_admin', 'college_admin', 'host'].includes(user.role);
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Community Repository</h1>
          <p>Crowdsourced practice questions, solutions, and community notes.</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
          <Plus size={16} /> Contribute Question
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`${styles.tab} ${activeTab === 'approved' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('approved')}>
            Approved Repository
          </button>
          <button className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('pending')}>
            Pending Reviews {isEditor && <span style={{ color: 'var(--accent-warning)', fontSize: '11px', marginLeft: '4px' }}>●</span>}
          </button>
          <button className={`${styles.tab} ${activeTab === 'my_submissions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('my_submissions')}>
            My Submissions
          </button>
          {isEditor && (
            <button className={`${styles.tab} ${activeTab === 'rejected' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('rejected')}>
              Rejected
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/community/upload')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            Upload File (OCR)
          </button>
          {isEditor && (
            <button onClick={() => router.push('/community/review')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--accent-warning)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
              Moderation Queue
            </button>
          )}
        </div>
      </div>

      {/* Question Grid */}
      {activeTab === 'my_submissions' ? (
        <MySubmissionsList />
      ) : questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No questions in this section yet.
        </div>
      ) : (
        <div className={styles.grid}>
          {questions.map(q => (
            <div key={q.id} className={styles.card}>
              <div className={styles.userLine}>
                <div className={styles.userAvatar}>{getInitials(q.users?.full_name)}</div>
                <div>
                  <div>Contributed by {q.users?.full_name || 'Anonymous'}</div>
                  <div style={{ fontSize: '10px' }}>{new Date(q.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`${styles.badge} ${q.status === 'approved' ? styles.badgeApproved : q.status === 'rejected' ? styles.badgeRejected : styles.badgePending}`}>
                  {q.status}
                </span>
              </div>

              <div className={styles.statement}>{q.statement}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(q.options || []).map((o, idx) => {
                  const isCorrect = String(idx) === String(q.correct_answer) || o.label === q.correct_answer;
                  return (
                    <div key={idx} className={`${styles.option} ${isCorrect && q.status === 'approved' ? styles.correctOption : ''}`}>
                      <strong>{o.label || String.fromCharCode(65 + idx)}.</strong> {o.content || o}
                    </div>
                  );
                })}
              </div>

              {q.explanation && q.status === 'approved' && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}

              {/* Admin review controls */}
              {isEditor && q.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <button onClick={() => handleReview(q.id, 'rejected')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-danger)', background: 'transparent', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                    <X size={14} /> Reject
                  </button>
                  <button onClick={() => handleReview(q.id, 'approved')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--gradient-success)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                    <Check size={14} /> Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Previous
          </button>
          <span style={{ padding: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
            style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Next
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modal} onSubmit={handleAddQuestion}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Contribute a Question</h2>
            
            <div className={styles.formGroup}>
              <label>Question Statement</label>
              <textarea className={styles.formInput} required placeholder="Type the question statement here..." rows={3}
                value={statement} onChange={e => setStatement(e.target.value)} />
            </div>

            {opts.map((opt, idx) => (
              <div key={idx} className={styles.formGroup}>
                <label>Option {String.fromCharCode(65 + idx)}</label>
                <input type="text" className={styles.formInput} required placeholder={`Option ${String.fromCharCode(65 + idx)} content`}
                  value={opt} onChange={e => {
                    const newOpts = [...opts];
                    newOpts[idx] = e.target.value;
                    setOpts(newOpts);
                  }} />
              </div>
            ))}

            <div className={styles.formGroup}>
              <label>Correct Option</label>
              <select className={styles.formInput} value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}>
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Difficulty</label>
              <select className={styles.formInput} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Category (optional)</label>
              <select className={styles.formInput} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Explanation (optional)</label>
              <textarea className={styles.formInput} placeholder="Why is this option correct?" rows={2}
                value={explanation} onChange={e => setExplanation(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MySubmissionsList() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await communityService.getHistory();
      setHistory(res.history || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleWithdraw = async (id) => {
    try {
      await communityService.withdrawSubmission(id);
      loadHistory();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Loading submissions...</div>;

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        You haven&apos;t contributed any submissions yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {history.map(item => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: item.type === 'question' ? 'var(--accent-primary)' : 'var(--accent-success)' }}>
                {item.type}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Submitted on {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '6px' }}>{item.title}</h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'capitalize',
              color: item.status === 'approved' ? 'var(--accent-success)' : item.status === 'rejected' ? 'var(--accent-danger)' : 'var(--accent-warning)'
            }}>
              {item.status}
            </span>

            {['submitted', 'under_review'].includes(item.status) && (
              <button
                onClick={() => handleWithdraw(item.id)}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-danger)', background: 'transparent', color: 'var(--accent-danger)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
              >
                Withdraw
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
