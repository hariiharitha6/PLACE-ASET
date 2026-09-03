'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import QuestionEditorModal from '../../../components/admin/QuestionEditorModal';
import EmptyState from '../../../components/ui/EmptyState';
import { HelpCircle, Plus, Search, Filter, Trash2, Edit3, CheckCircle2, AlertCircle, Archive } from 'lucide-react';
import styles from './adminQuestions.module.css';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filterType, setFilterType] = useState('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions', {
        params: {
          search: search || undefined,
          type: filterType !== 'ALL' ? filterType : undefined,
          difficulty: filterDifficulty !== 'ALL' ? filterDifficulty.toLowerCase() : undefined,
          status: filterStatus !== 'ALL' ? filterStatus.toLowerCase() : undefined,
          limit: 50,
        },
      });
      const data = res?.data?.questions || res?.data || [];
      setQuestions(Array.isArray(data) ? data : []);
      setTotalCount(res?.data?.total || (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      console.error('Failed to load questions from database', err);
      setQuestions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterDifficulty, filterStatus]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleOpenCreate = () => {
    setSelectedQuestion(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setSelectedQuestion(q);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (updated) => {
    try {
      if (updated.id && !String(updated.id).startsWith('q-')) {
        await api.put(`/questions/${updated.id}`, updated);
      } else {
        await api.post('/questions', updated);
      }
      setMsg('Question successfully saved to database.');
      fetchQuestions();
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save question', err);
      setMsg('Error saving question: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleArchive = async (qId) => {
    try {
      await api.put(`/questions/${qId}/archive`);
      setQuestions((prev) => prev.filter((item) => item.id !== qId));
      setMsg('Question archived.');
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error('Failed to archive question', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Institutional Question Bank Management</h1>
          <p className={styles.subtitle}>Curate, review, categorize, and publish academic exam and placement preparation questions</p>
        </div>
        <button className={styles.primaryBtn} onClick={handleOpenCreate}>+ Create Question</button>
      </div>

      {msg && (
        <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✅</span>
          <span>{msg}</span>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Questions in Bank</span>
          <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--text-primary)' }}>{totalCount}</h3>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Published to Students</span>
          <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--accent-success)' }}>
            {questions.filter(q => q.approval_status === 'approved' || q.is_published).length}
          </h3>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending Moderation</span>
          <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--accent-warning)' }}>
            {questions.filter(q => q.approval_status === 'pending').length}
          </h3>
        </div>
      </div>

      {/* Filter Controls */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="🔍 Search question statement, topic, keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '13px', flex: 1, minWidth: '220px' }}
        />

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="ALL">All Question Types</option>
          <option value="mcq_single">Single Choice MCQ</option>
          <option value="mcq_multiple">Multiple Choice MCQ</option>
          <option value="coding">Coding Problem</option>
          <option value="technical">Technical Concept</option>
        </select>

        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
          <option value="ALL">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
          <option value="Expert">Expert</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="Approved">Published</option>
          <option value="Pending">Pending Review</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Main Table */}
      <div className={styles.card}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading question repository from database...</div>
        ) : questions.length === 0 ? (
          <EmptyState
            icon={<HelpCircle size={36} style={{ color: 'var(--text-muted)' }} />}
            title="No questions match current filters"
            description="Upload or create new questions to populate your institutional question repository."
            actionText="+ Create Question"
            onAction={handleOpenCreate}
          />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Statement</th>
                <th>Subject / Module</th>
                <th>Difficulty</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td><span className={styles.stmt}>{q.statement}</span></td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{q.subject || 'General'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{q.module ? `Module: ${q.module}` : q.topic || 'Core'}</div>
                  </td>
                  <td><span className={`${styles.diffTag} ${styles[q.difficulty?.toLowerCase() || 'medium']}`}>{q.difficulty}</span></td>
                  <td><span className={styles.typeBadge}>{q.type || 'MCQ'}</span></td>
                  <td>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: q.approval_status === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: q.approval_status === 'approved' ? '#34d399' : '#fbbf24', fontWeight: '700', textTransform: 'capitalize' }}>
                      {q.approval_status || 'Published'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.btnRow}>
                      <button className={styles.editBtn} onClick={() => handleOpenEdit(q)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => handleArchive(q.id)}>Archive</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <QuestionEditorModal
        question={selectedQuestion}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
      />
    </div>
  );
}
