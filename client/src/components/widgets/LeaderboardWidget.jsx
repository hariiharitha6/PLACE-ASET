'use client';

import { Trophy } from 'lucide-react';

export default function LeaderboardWidget({ leaderboard }) {
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
          <Trophy size={18} style={{ color: 'var(--accent-warning)' }} />
          <span>Leaderboard</span>
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {leaderboard.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: '13px' }}>
            No ranking data available yet.
          </p>
        ) : (
          leaderboard.map((item, index) => {
            const isTop3 = index < 3;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

            return (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: isTop3 ? 'var(--text-primary)' : 'var(--text-muted)',
                    width: '24px',
                    textAlign: 'center'
                  }}>
                    {medal || index + 1}
                  </span>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: '700',
                    fontSize: '12px'
                  }}>
                    {item.full_name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ 
                      fontSize: '13px', 
                      fontWeight: '600', 
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.full_name}
                    </p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Level {item.level || 1}</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)' }}>
                    {item.xp}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>XP</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
