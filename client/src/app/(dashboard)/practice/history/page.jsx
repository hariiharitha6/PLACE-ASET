'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { practiceService } from '../../../../lib/practiceService';
import { Clock, Target, Zap, ChevronRight } from 'lucide-react';
import styles from '../practice.module.css';

export default function PracticeHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await practiceService.getHistory({ page, limit: 15 });
      setSessions(res.sessions || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, [page]);

  const formatDuration = (start, end) => {
    if (!start || !end) return '-';
    const secs = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
    const mins = Math.floor(secs / 60);
    return mins > 0 ? `${mins}m ${secs % 60}s` : `${secs}s`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Practice History</h1>
          <p>{total} completed sessions</p>
        </div>
        <button onClick={() => router.push('/practice')}
          style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          ← Back to Arena
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading history...</div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          No practice sessions completed yet.
        </div>
      ) : (
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'auto' }}>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Mode</th>
                <th>Category</th>
                <th>Score</th>
                <th>Duration</th>
                <th>XP</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td>{new Date(s.ended_at).toLocaleDateString()}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.mode}</td>
                  <td>{s.categories?.name || '-'}</td>
                  <td>
                    <span style={{ color: 'var(--accent-success)', fontWeight: '600' }}>{s.correct_count}</span>
                    <span style={{ color: 'var(--text-muted)' }}> / {s.total_questions}</span>
                  </td>
                  <td>{formatDuration(s.started_at, s.ended_at)}</td>
                  <td><span className={styles.xpBadge}><Zap size={10} /> {s.xp_earned}</span></td>
                  <td>
                    <button onClick={() => router.push(`/practice/results/${s.id}`)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
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
    </div>
  );
}
