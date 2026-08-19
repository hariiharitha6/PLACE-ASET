'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Cpu, RefreshCw, Sparkles, Layers } from 'lucide-react';

export default function AIProcessingQueuePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      setLoading(true);
      try {
        const res = await api.get('/admin/datasets');
        setJobs(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load dataset queue', err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          ⚙️ ASYNCHRONOUS AI PIPELINE QUEUE
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>AI Dataset Processing Queue</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Real-time background worker status for OCR extraction, categorizations, and duplicate detection.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
          <p>Checking AI asynchronous job queues...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
          <Cpu size={36} style={{ color: '#64748b', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>No active AI jobs in queue</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>When dataset files or community OCR scans are submitted, their 19-step AI progress will display here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jobs.map((j) => (
            <div key={j.id} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>{j.name || j.dataset || 'Dataset Processing'}</h3>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Status: <strong>{j.status || 'Active'}</strong> &bull; {j.source || 'Admin Upload'}</span>
                </div>

                <span style={{ backgroundColor: j.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', color: j.status === 'completed' ? '#34d399' : '#818cf8', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '12px' }}>
                  ● {(j.status || 'PROCESSING').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
