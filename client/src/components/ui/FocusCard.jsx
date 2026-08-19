import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Flame, CheckCircle } from 'lucide-react';
import styles from './FocusCard.module.css';

export default function FocusCard({
  greeting = 'Good day',
  userName = 'Candidate',
  streak = 1,
  focusTitle = 'Continue Active Learning',
  focusDescription = 'Pick up right where you left off. Today’s recommended focus is Technical Core mastery.',
  ctaText = 'Resume Practice',
  ctaHref = '/practice',
  goalProgress = 0,
  goalTarget = 5,
  completedCount = 0
}) {
  const percentage = Math.min(100, Math.round((completedCount / (goalTarget || 1)) * 100));

  return (
    <section className={styles.focusCard} aria-label="Daily Focus Command Center">
      <div className={styles.ambientGlow} />

      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.welcomeBox}>
            <span className={styles.greetingBadge}>
              <Sparkles size={13} /> {greeting.toUpperCase()}, {userName.split(' ')[0].toUpperCase()}
            </span>
            <h2 className={styles.focusTitle}>{focusTitle}</h2>
            <p className={styles.focusDescription}>{focusDescription}</p>
          </div>

          <div className={styles.streakBadge}>
            <Flame size={18} className={styles.flameIcon} />
            <div>
              <div className={styles.streakCount}>{streak} Days</div>
              <div className={styles.streakLabel}>Active Streak</div>
            </div>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.goalSection}>
            <div className={styles.goalHeader}>
              <span className={styles.goalTitle}>Today&apos;s Target</span>
              <span className={styles.goalMetric}>{completedCount} / {goalTarget} Questions ({percentage}%)</span>
            </div>
            <div className={styles.progressTrack} role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
              <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
            </div>
          </div>

          <Link href={ctaHref} className={styles.ctaButton} id="focus-card-cta">
            <span>{ctaText}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
