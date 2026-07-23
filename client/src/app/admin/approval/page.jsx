'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function QuestionApprovalDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  const fetchPendingQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/questions/pending');
      setItems(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      setItems([
        {
          id: 'aq-1',
          statement: 'Implement an LRU Cache with O(1) time complexity for get and put operations.',
          options: [
            { label: 'A', content: 'Use Doubly Linked List and Hash Map' },
            { label: 'B', content: 'Use Binary Search Tree' },
            { label: 'C', content: 'Use Array List' },
            { label: 'D', content: 'Use Queue and Stack' }
          ],
          correct_answer: 'A',
          explanation: 'Hash Map provides O(1) key lookup and Doubly Linked List allows O(1) insertion and removal of nodes.',
          subject: 'Computer Science',
          topic: 'Data Structures & Algorithms',
          difficulty: 'hard',
          company: 'Amazon',
          department: 'CSE',
          assigned_repository: 'Programming & Data Structures',
          quality_score: 95,
          duplicate_score_pct: 12,
          status: 'pending'
        },
        {
          id: 'aq-2',
          statement: 'What is the minimum number of keys in a B-Tree of order m?',
          options: [
            { label: 'A', content: 'ceil(m/2) - 1' },
            { label: 'B', content: 'm - 1' },
            { label: 'C', content: 'floor(m/2)' },
            { label: 'D', content: 'm / 2' }
          ],
          correct_answer: 'A',
          explanation: 'Except for the root, every node in a B-Tree of order m must contain at least ceil(m/2) - 1 keys.',
          subject: 'Computer Science',
          topic: 'DBMS',
          difficulty: 'medium',
          company: 'TCS Digital',
          department: 'CSE',
          assigned_repository: 'DBMS & SQL',
          quality_score: 88,
          duplicate_score_pct: 45,
          status: 'pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await api.patch(`/admin/questions/${id}/review`, { approval_status: status });
      setItems(items.filter(i => i.id !== id));
      alert(`Question ${status} successfully!`);
    } catch (e) {
      alert('Review action failed');
    }
  };

  const handleBulk = async (action) => {
    if (selectedIds.length === 0) return alert('Select questions for bulk action');
    try {
      await api.post('/admin/questions/bulk-review', { itemIds: selectedIds, action });
      setItems(items.filter(i => !selectedIds.includes(i.id)));
      setSelectedIds([]);
      alert(`Bulk ${action} completed for ${selectedIds.length} items!`);
    } catch (e) {
      alert('Bulk action failed');
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
            ✅ QUESTION APPROVAL DASHBOARD
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>AI Processed Question Queue</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Review AI classifications, quality scores, and duplicate similarity before publishing to student repositories.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleBulk('approve')} style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
            ⚡ Bulk Approve Selected
          </button>
          <button onClick={() => handleBulk('reject')} style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
            🚫 Bulk Reject
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item) => (
          <div key={item.id} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <span style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                  {item.assigned_repository || 'General Repository'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>Company: <strong>{item.company}</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                  Quality Score: {item.quality_score || 90}/100
                </span>
                <span style={{ backgroundColor: item.duplicate_score_pct > 30 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', color: item.duplicate_score_pct > 30 ? '#fbbf24' : '#94a3b8', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                  Duplicate Similarity: {item.duplicate_score_pct || 0}%
                </span>
              </div>
            </div>

            <h3 style={{ color: '#f8fafc', fontSize: '15px', fontWeight: '700', margin: 0 }}>{item.statement}</h3>

            {item.options && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {item.options.map((opt, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: opt.label === item.correct_answer ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)', border: opt.label === item.correct_answer ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: '#cbd5e1' }}>
                    <strong>{opt.label}:</strong> {opt.content}
                  </div>
                ))}
              </div>
            )}

            {item.explanation && (
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#818cf8', display: 'block', marginBottom: '2px' }}>AI Solution Explanation:</span>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>{item.explanation}</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => handleReview(item.id, 'rejected')} style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
                Reject
              </button>
              <button onClick={() => handleReview(item.id, 'approved')} style={{ backgroundColor: '#10b981', color: '#fff', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
                Approve & Publish to Students
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
