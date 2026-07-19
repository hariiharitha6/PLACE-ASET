'use client';

import { useState, useEffect } from 'react';
import { leaderboardService } from '../../../lib/leaderboardService';
import { Trophy, Award, Lock, ShieldAlert, Sparkles, Zap, Flame, Cpu, BookOpen, Users } from 'lucide-react';
import styles from '../leaderboard/leaderboard.module.css';

const BADGE_ICONS = {
  challenge: <Trophy size={20} />,
  practice: <Award size={20} />,
  streak: <Flame size={20} />,
  contributor: <Users size={20} />,
  resource: <BookOpen size={20} />
};

const CATEGORIES = ['all', 'challenge', 'practice', 'streak', 'contributor', 'resource'];

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await leaderboardService.getBadgesList();
        setBadges(res || []);
      } catch (err) {
        console.error('Failed to load badges', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = activeCategory === 'all'
    ? badges
    : badges.filter(b => b.category === activeCategory);

  const earnedCount = badges.filter(b => b.isEarned).length;
  const badgeRatio = badges.length > 0
    ? Math.round((earnedCount / badges.length) * 100)
    : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Honor Badges & Insignias</h1>
          <p>Display your dedication! Solve practice sessions, streaks, and community tasks to earn badges.</p>
        </div>
      </div>

      {/* Badges Progress Summary */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '24px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Insignias Earned</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>
            {earnedCount} / {badges.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Badges Unlocked</div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Earned Ratio</span>
            <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{badgeRatio}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${badgeRatio}%`, background: 'var(--gradient-primary)', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: activeCategory === cat ? 'var(--bg-primary)' : 'transparent',
              color: activeCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              textTransform: 'capitalize',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading badges list...</div>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>No badges found in this category.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {filtered.map(b => (
            <div
              key={b.id}
              style={{
                background: b.isEarned ? 'var(--bg-glass)' : 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
                position: 'relative',
                opacity: b.isEarned ? 1 : 0.6
              }}
            >
              {/* Badge Icon Wrapper */}
              <div 
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: b.isEarned ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.03)',
                  border: b.isEarned ? 'none' : '1px solid var(--border-color)',
                  color: b.isEarned ? '#fff' : 'var(--text-muted)',
                  fontSize: '22px',
                  boxShadow: b.isEarned ? '0 0 12px rgba(99,102,241,0.2)' : 'none'
                }}
              >
                {b.isEarned ? (BADGE_ICONS[b.category] || <Award size={20} />) : <Lock size={18} />}
              </div>

              {/* Title & Description */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: b.isEarned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {b.name}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                  {b.description}
                </p>
              </div>

              {/* XP reward info */}
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(245,158,11,0.08)',
                  color: 'var(--accent-warning)',
                  fontSize: '10px',
                  fontWeight: '700',
                  marginTop: 'auto'
                }}
              >
                <Zap size={8} fill="currentColor" /> +{b.xpReward} XP Reward
              </div>

              {/* Unlocked date indicator */}
              {b.isEarned && b.earnedAt && (
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Earned {new Date(b.earnedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
