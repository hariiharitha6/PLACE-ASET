'use client';

import { useState, useEffect } from 'react';
import { leaderboardService } from '../../../lib/leaderboardService';
import { Trophy, Award, Lock, Unlock, Zap, Sparkles } from 'lucide-react';
import styles from '../leaderboard/leaderboard.module.css';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [activeTier, setActiveTier] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await leaderboardService.getAchievements();
        setAchievements(res || []);
      } catch (err) {
        console.error('Failed to load achievements', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const tiers = ['all', 'bronze', 'silver', 'gold', 'diamond'];

  const filtered = activeTier === 'all'
    ? achievements
    : achievements.filter(a => a.tier === activeTier);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'diamond': return '#b9f2ff';
      default: return 'var(--text-primary)';
    }
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const overallProgress = achievements.length > 0 
    ? Math.round((unlockedCount / achievements.length) * 100) 
    : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Placement Milestones & Achievements</h1>
          <p>Complete goals, unlock tiers (Bronze to Diamond), and earn XP bonuses.</p>
        </div>
      </div>

      {/* Progress Card Summary */}
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
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Overall Progress</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>
            {unlockedCount} / {achievements.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Achievements Unlocked</div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Completion Ratio</span>
            <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{overallProgress}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${overallProgress}%`, background: 'var(--gradient-primary)', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>
      </div>

      {/* Tier Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        {tiers.map(t => (
          <button
            key={t}
            onClick={() => setActiveTier(t)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: activeTier === t ? 'var(--bg-primary)' : 'transparent',
              color: activeTier === t ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              textTransform: 'capitalize',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading achievements list...</div>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>No achievements found for this tier.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filtered.map(ach => (
            <div
              key={ach.id}
              style={{
                background: ach.isUnlocked ? 'var(--bg-glass)' : 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                opacity: ach.isUnlocked ? 1 : 0.8
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span 
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    color: getTierColor(ach.tier),
                    border: `1px solid ${getTierColor(ach.tier)}`,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px'
                  }}
                >
                  {ach.tier}
                </span>
                
                {ach.isUnlocked ? (
                  <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700' }}>
                    <Unlock size={12} /> Unlocked
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                    <Lock size={12} /> Locked
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{ach.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  {ach.description}
                </p>
              </div>

              {/* XP reward badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', alignSelf: 'start', padding: '3px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.08)', color: 'var(--accent-warning)', fontSize: '11px', fontWeight: '700' }}>
                <Zap size={10} fill="currentColor" /> +{ach.xpReward} XP Reward
              </div>

              {/* Progress fill */}
              <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Progress: {ach.currentValue} / {ach.targetValue}</span>
                  <span>{ach.progressPct}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${ach.progressPct}%`, background: getTierColor(ach.tier), borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
