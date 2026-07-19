'use client';

import { Library, Download } from 'lucide-react';
import Link from 'next/link';

export default function ResourcesWidget({ resources }) {
  return (
    <div style={{
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-glass)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Library size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>Latest Resources</span>
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {resources.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: '13px' }}>
            No resources uploaded yet.
          </p>
        ) : (
          resources.map((res) => (
            <div 
              key={res.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {res.title}
                </p>
                <span style={{ 
                  fontSize: '10px', 
                  color: 'var(--text-muted)', 
                  textTransform: 'uppercase',
                  border: '1px solid var(--border-color)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  {res.type?.replace(/_/g, ' ')}
                </span>
              </div>

              <Link href={res.file_url || '/resources'} style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}>
                <Download size={14} />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
