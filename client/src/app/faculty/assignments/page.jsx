'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await api.get('/faculty/assignments').catch(() => ({ data: { data: [] } }));
        setAssignments(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/faculty/assignments', { title, description, due_date: dueDate });
      if (res.data?.data) {
        setAssignments([res.data.data, ...assignments]);
        setShowModal(false);
        setTitle('');
        setDescription('');
        setDueDate('');
      }
    } catch (err) {
      console.error('Failed to create assignment', err);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#818cf8', backgroundColor: 'rgba(99,102,241,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
            📚 ACADEMIC ASSIGNMENTS & PRACTICE SETS
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px 0' }}>Department Assignments & Practice Sets</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            Create, publish, and track student submissions for department coursework.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
        >
          + Create New Assignment
        </button>
      </div>

      <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Active Departmental Assignments</h3>
        {loading ? (
          <div style={{ color: '#94a3b8' }}>Loading assignments...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {assignments.map((asg) => (
              <div key={asg.id} style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>{asg.status || 'Active'}</span>
                <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{asg.title}</h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{asg.description}</p>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Due: {asg.due_date || '2026-08-30'}</span>
                  <span>{asg.submission_count || 42} Submissions</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreate} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Create New Assignment</h3>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff' }}
                placeholder="e.g. Dynamic Programming Masterclass"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', minHeight: '80px' }}
                placeholder="Assignment instructions and problem statements..."
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Publish Assignment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
