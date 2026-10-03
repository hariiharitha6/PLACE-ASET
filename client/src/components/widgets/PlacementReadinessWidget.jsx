'use client';

import styles from './placementReadinessWidget.module.css';

export default function PlacementReadinessWidget({ readinessScore = 0, breakdown = null }) {
  const hasScore = typeof readinessScore === 'number' && readinessScore > 0;
  
  const skillBreakdown = breakdown || [
    { label: 'Coding & Data Structures', score: hasScore ? Math.min(100, Math.round(readinessScore * 0.9)) : 0, color: '#6366f1' },
    { label: 'Aptitude & Logical Reasoning', score: hasScore ? Math.min(100, Math.round(readinessScore * 0.85)) : 0, color: '#10b981' },
    { label: 'Technical Core Subjects', score: hasScore ? Math.min(100, Math.round(readinessScore * 0.95)) : 0, color: '#f59e0b' },
    { label: 'Resume & Profile Completeness', score: hasScore ? Math.min(100, Math.round(readinessScore * 0.8)) : 0, color: '#8b5cf6' },
  ];

  const pillText = !hasScore 
    ? 'Assessment Pending'
    : readinessScore >= 80 
      ? 'Placement Ready' 
      : readinessScore >= 50 
        ? 'Skill Building' 
        : 'Getting Started';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Placement Readiness Index</h3>
          <p className={styles.subtitle}>AI-computed readiness score based on your practice arena performance</p>
        </div>
        <span className={styles.pill} style={{ 
          backgroundColor: hasScore ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
          borderColor: hasScore ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.3)',
          color: hasScore ? '#34d399' : '#94a3b8'
        }}>
          {pillText}
        </span>
      </div>

      <div className={styles.mainContent}>
        {/* Readiness Circular Progress Gauge */}
        <div className={styles.gaugeBox}>
          <div className={styles.gaugeCircle} style={{ '--score': `${hasScore ? readinessScore : 0}%` }}>
            <div className={styles.gaugeInner}>
              <span className={styles.scoreNumber}>{hasScore ? `${readinessScore}%` : '—'}</span>
              <span className={styles.scoreLabel}>READINESS</span>
            </div>
          </div>
        </div>

        {/* Skill Breakdowns */}
        <div className={styles.breakdownList}>
          {skillBreakdown.map((item, idx) => (
            <div key={idx} className={styles.breakdownItem}>
              <div className={styles.itemHeader}>
                <span className={styles.itemLabel}>{item.label}</span>
                <span className={styles.itemScore}>{hasScore ? `${item.score}%` : '—'}</span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${item.score}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footerNote}>
        <span className={styles.tipIcon}>💡</span>
        <span className={styles.tipText}>
          <strong>Next Recommendation:</strong>{' '}
          {hasScore 
            ? 'Complete additional practice sets in your weak areas to boost your index above 85%!'
            : 'Start practicing questions and completing diagnostic challenges to build your readiness index.'}
        </span>
      </div>
    </div>
  );
}
