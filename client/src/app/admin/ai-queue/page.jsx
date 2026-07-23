'use client';

import { useState } from 'react';

export default function AIProcessingQueuePage() {
  const [jobs] = useState([
    { id: 'job-101', dataset: 'TCS NQT Shift 1 2026.csv', task: '19-Step Pipeline Processing', progress: 100, status: 'Completed', processed: 150, total: 150, time: '2 mins ago' },
    { id: 'job-102', dataset: 'Infosys Specialist Mock.pdf', task: 'OCR & Question Extraction', progress: 75, status: 'Processing', processed: 45, total: 60, time: 'Running...' },
    { id: 'job-103', dataset: 'Amazon SDE Question Bank.docx', task: 'Duplicate & Quality Scoring', progress: 20, status: 'Queued', processed: 10, total: 50, time: 'In Queue' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          ⚙️ ASYNCHRONOUS AI PIPELINE QUEUE
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>AI Dataset Processing Queue</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Real-time background worker status for OCR extraction, categorizations, and duplicate detection.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {jobs.map((j) => (
          <div key={j.id} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>{j.dataset}</h3>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>Task: <strong>{j.task}</strong> &bull; {j.processed} / {j.total} Questions</span>
              </div>

              <span style={{ backgroundColor: j.status === 'Completed' ? 'rgba(16,185,129,0.15)' : j.status === 'Processing' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', color: j.status === 'Completed' ? '#34d399' : j.status === 'Processing' ? '#818cf8' : '#94a3b8', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '12px' }}>
                ● {j.status.toUpperCase()}
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${j.progress}%`, height: '100%', backgroundColor: j.status === 'Completed' ? '#10b981' : '#6366f1', borderRadius: '4px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
