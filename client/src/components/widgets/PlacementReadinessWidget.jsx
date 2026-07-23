'use client';

import styles from './placementReadinessWidget.module.css';

export default function PlacementReadinessWidget({ readinessScore = 87 }) {
  const breakdown = [
    { label: 'Coding & Data Structures', score: 85, color: '#6366f1' },
    { label: 'Aptitude & Logical Reasoning', score: 78, color: '#10b981' },
    { label: 'Technical Core Subjects', score: 92, color: '#f59e0b' },
    { label: 'Resume & Profile Completeness', score: 95, color: '#8b5cf6' },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Placement Readiness Index</h3>
          <p className={styles.subtitle}>AI-computed readiness score based on your practice arena performance</p>
        </div>
        <span className={styles.pill}>Top 5% Candidate</span>
      </div>

      <div className={styles.mainContent}>
        {/* Readiness Circular Progress Gauge */}
        <div className={styles.gaugeBox}>
          <div className={styles.gaugeCircle} style={{ '--score': `${readinessScore}%` }}>
            <div className={styles.gaugeInner}>
              <span className={styles.scoreNumber}>{readinessScore}%</span>
              <span className={styles.scoreLabel}>READINESS</span>
            </div>
          </div>
        </div>

        {/* Skill Breakdowns */}
        <div className={styles.breakdownList}>
          {breakdown.map((item, idx) => (
            <div key={idx} className={styles.breakdownItem}>
              <div className={styles.itemHeader}>
                <span className={styles.itemLabel}>{item.label}</span>
                <span className={styles.itemScore}>{item.score}%</span>
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
          <strong>Next Recommendation:</strong> Complete 2 Medium Aptitude Practice Sets to boost your score above 90%!
        </span>
      </div>
    </div>
  );
}
