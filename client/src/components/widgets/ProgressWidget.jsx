'use client';

import { Flame, Target, Award } from 'lucide-react';

export default function ProgressWidget({ progress, level }) {
  const { xp = 0, streak = 0, longestStreak = 0, collegeRank = 0 } = progress || {};

  // Level calculations: Assuming 1000 XP per level
  const xpInCurrentLevel = xp % 1000;
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 1000) * 100));
  const nextLevelXpNeeded = 1000 - xpInCurrentLevel;

  return (
    <div style={{
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Your Progress</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-warning)', fontSize: '13px', fontWeight: '600' }}>
          <Flame size={16} />
          <span>{streak} Day Streak</span>
        </div>
      </div>

      {/* Level stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-primary)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: '700',
          fontSize: '16px'
        }}>
          {level}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>Level {level}</span>
            <span>{xpInCurrentLevel} / 1000 XP</span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${levelProgressPercent}%`,
              background: 'var(--accent-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Grid stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--accent-info)' }}><Target size={18} /></div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>College Rank</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>#{collegeRank || '-'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--accent-secondary)' }}><Award size={18} /></div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Longest Streak</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{longestStreak} Days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
