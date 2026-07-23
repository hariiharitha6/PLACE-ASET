'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import styles from './questionApproval.module.css';

export default function QuestionApprovalPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchPendingQuestions();
  }, []);

  const fetchPendingQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/questions/pending');
      setQuestions(res.data || []);
    } catch (err) {
      console.error(err);
      // Fallback pending question queue
      setQuestions([
        { id: 'q-101', statement: 'Implement a function to find the lowest common ancestor in a Binary Search Tree.', type: 'Coding', difficulty: 'Medium', topic: 'Trees & Data Structures', author: 'Faculty Member 1', created_at: '2026-07-21 09:30 AM' },
        { id: 'q-102', statement: 'What is the time complexity of building a heap from an array of N elements?', type: 'MCQ', difficulty: 'Easy', topic: 'Algorithm Complexity', author: 'Faculty Member 2', created_at: '2026-07-20 04:15 PM' },
        { id: 'q-103', statement: 'Explain how Virtual Memory and Paging work in modern Operating Systems.', type: 'Technical', difficulty: 'Hard', topic: 'Operating Systems', author: 'Faculty Member 3', created_at: '2026-07-20 11:00 AM' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (questionId, status) => {
    try {
      await api.patch(`/admin/questions/${questionId}/review`, { approval_status: status, feedback });
      setQuestions(questions.filter(q => q.id !== questionId));
      setMsg(`Question successfully ${status}.`);
      setSelectedQuestion(null);
      setFeedback('');
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Question Approval Moderation Queue</h1>
          <p className={styles.subtitle}>Review, verify, and approve question submissions before publishing to student portal</p>
        </div>
        <div className={styles.badgeCount}>{questions.length} Pending Review</div>
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
            <div className={styles.emptyQueue}>
              <span>🎉</span>
              <span>All question submissions have been reviewed!</span>
            </div>
          ) : (
            <div className={styles.queueList}>
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`${styles.queueItem} ${selectedQuestion?.id === q.id ? styles.active : ''}`}
                  onClick={() => setSelectedQuestion(q)}
                >
                  <div className={styles.queueItemHeader}>
                    <span className={styles.typeBadge}>{q.type}</span>
                    <span className={`${styles.diffBadge} ${styles[q.difficulty?.toLowerCase()]}`}>{q.difficulty}</span>
                  </div>
                  <p className={styles.statementSnippet}>{q.statement}</p>
                  <div className={styles.queueItemMeta}>
                    <span>By {q.author}</span>
                    <span>{q.created_at}</span>
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
                <h2>Question Review Inspection</h2>
                <span className={styles.idCode}>ID: {selectedQuestion.id}</span>
              </div>

              <div className={styles.metaRow}>
                <div className={styles.metaBox}>
                  <span className={styles.metaLabel}>Category</span>
                  <span className={styles.metaVal}>{selectedQuestion.type}</span>
                </div>
                <div className={styles.metaBox}>
                  <span className={styles.metaLabel}>Difficulty</span>
                  <span className={styles.metaVal}>{selectedQuestion.difficulty}</span>
                </div>
                <div className={styles.metaBox}>
                  <span className={styles.metaLabel}>Topic</span>
                  <span className={styles.metaVal}>{selectedQuestion.topic}</span>
                </div>
              </div>

              <div className={styles.sectionBox}>
                <h4>Question Statement</h4>
                <div className={styles.statementBox}>{selectedQuestion.statement}</div>
              </div>

              <div className={styles.sectionBox}>
                <h4>Review Comments / Feedback</h4>
                <textarea
                  className={styles.feedbackArea}
                  placeholder="Optional review note or explanation for the author..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className={styles.buttonRow}>
                <button
                  className={styles.rejectBtn}
                  onClick={() => handleReview(selectedQuestion.id, 'rejected')}
                >
                  ❌ Reject Submission
                </button>
                <button
                  className={styles.approveBtn}
                  onClick={() => handleReview(selectedQuestion.id, 'approved')}
                >
                  ✅ Approve & Publish
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.placeholderDetail}>
              <span>👈</span>
              <span>Select a question from the left queue to inspect and approve.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
