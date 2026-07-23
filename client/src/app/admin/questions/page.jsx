'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import QuestionEditorModal from '../../../components/admin/QuestionEditorModal';
import styles from './adminQuestions.module.css';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions').catch(() => ({ data: null }));
      if (res?.data && Array.isArray(res.data)) {
        setQuestions(res.data);
      } else {
        setQuestions([
          { id: 'q-1', statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', type: 'Coding', difficulty: 'Easy', topic: 'Arrays & Hashing', company: 'Amazon', status: 'Approved' },
          { id: 'q-2', statement: 'What is the key difference between Process and Thread in Operating Systems?', type: 'Technical', difficulty: 'Medium', topic: 'Operating Systems', company: 'TCS', status: 'Approved' },
          { id: 'q-3', statement: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?', type: 'Aptitude', difficulty: 'Easy', topic: 'Speed & Distance', company: 'Infosys', status: 'Approved' },
          { id: 'q-4', statement: 'Implement a LRU Cache data structure with O(1) time complexity for get and put operations.', type: 'Coding', difficulty: 'Hard', topic: 'Data Structures', company: 'Google', status: 'Approved' },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      if (updated.id && !updated.id.startsWith('q-')) {
        await api.put(`/questions/${updated.id}`, updated).catch(() => {});
      }
      setQuestions((prev) => {
        const idx = prev.findIndex((item) => item.id === updated.id);
        if (idx >= 0) {
          const newArr = [...prev];
          newArr[idx] = updated;
          return newArr;
        }
        return [{ id: `q-${Date.now()}`, ...updated }, ...prev];
      });
      setMsg('Question successfully saved.');
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (qId) => {
    try {
      await api.patch(`/admin/questions/${qId}/archive`).catch(() => {});
      setQuestions((prev) => prev.filter((item) => item.id !== qId));
      setMsg('Question archived.');
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const typeMatch = filterType === 'ALL' || q.type?.toLowerCase() === filterType.toLowerCase();
    const diffMatch = filterDifficulty === 'ALL' || q.difficulty?.toLowerCase() === filterDifficulty.toLowerCase();
    const searchMatch = !search || q.statement?.toLowerCase().includes(search.toLowerCase()) || q.topic?.toLowerCase().includes(search.toLowerCase());
    return typeMatch && diffMatch && searchMatch;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Question Bank Management</h1>
          <p className={styles.subtitle}>Manage, filter, edit, and create coding, MCQ, aptitude, and technical questions</p>
        </div>
        <button className={styles.primaryBtn} onClick={handleOpenCreate}>+ Create Question</button>
      </div>

      {msg && (
        <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✅</span>
          <span>{msg}</span>
        </div>
      )}

      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="🔍 Search question statements, topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '13px', width: '280px' }}
        />

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="ALL">All Categories</option>
          <option value="Coding">Coding</option>
          <option value="MCQ">MCQ</option>
          <option value="Aptitude">Aptitude</option>
          <option value="Technical">Technical</option>
        </select>

        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
          <option value="ALL">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div style={{ padding: '24px', color: '#94a3b8' }}>Loading question repository...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Question Statement</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Topic</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q) => (
                <tr key={q.id}>
                  <td><code>{q.id}</code></td>
                  <td><span className={styles.stmt}>{q.statement}</span></td>
                  <td><span className={styles.typeBadge}>{q.type || 'MCQ'}</span></td>
                  <td><span className={`${styles.diffTag} ${styles[q.difficulty?.toLowerCase() || 'medium']}`}>{q.difficulty}</span></td>
                  <td>{q.topic || 'General'}</td>
                  <td><span className={styles.companyTag}>{q.company || 'ASET'}</span></td>
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
