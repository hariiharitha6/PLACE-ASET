'use client';

import { Users, Award, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default function ContributionsWidget({ count }) {
  // Mock contribution points
  const pointsEarned = count * 25;

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
      <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={18} style={{ color: 'var(--accent-secondary)' }} />
        <span>Your Contributions</span>
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <FileSpreadsheet size={20} style={{ color: 'var(--accent-primary)', marginBottom: '8px' }} />
          <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{count}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Questions Added</p>
        </div>

        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <Award size={20} style={{ color: 'var(--accent-success)', marginBottom: '8px' }} />
          <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{pointsEarned}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Contr. XP Earned</p>
        </div>
      </div>

      <Link 
        href="/community" 
        style={{
          display: 'block',
          width: '100%',
          padding: '10px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-glass-hover)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontWeight: '600',
          textAlign: 'center',
          transition: 'all var(--transition-fast)'
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
      >
        Contribute a Question
      </Link>
    </div>
  );
}
