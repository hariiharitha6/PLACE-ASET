'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function HostDiscussionsPage() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiscussions() {
      try {
        const res = await api.get('/host/discussions').catch(() => ({ data: { data: [] } }));
        setDiscussions(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDiscussions();
  }, []);

  const handleModerate = async (id, status) => {
    try {
      await api.patch(`/host/discussions/${id}`, { status });
      setDiscussions(discussions.map((d) => (d.id === id ? { ...d, status } : d)));
    } catch (err) {
      console.error('Failed to moderate discussion', err);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          💬 CONTEST Q&A & DISCUSSION MODERATION
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px 0' }}>Contest Q&A & Discussion Moderation</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          Review and approve student questions, clarify problem statements, and moderate live contest discussion threads.
        </p>
      </div>

      <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Student Inquiry Threads</h3>
        {loading ? (
          <div style={{ color: '#94a3b8' }}>Loading discussion threads...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {discussions.map((disc) => (
              <div key={disc.id} style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: '700' }}>{disc.contest_title}</span>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>&quot;{disc.message}&quot;</h4>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Asked by {disc.author} • {disc.created_at}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {disc.status === 'pending' ? (
                    <>
                      <button onClick={() => handleModerate(disc.id, 'approved')} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => handleModerate(disc.id, 'hidden')} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Hide</button>
                    </>
                  ) : (
                    <span style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px' }}>{disc.status.toUpperCase()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
