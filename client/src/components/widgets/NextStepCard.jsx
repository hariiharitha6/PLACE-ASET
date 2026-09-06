'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardService } from '../../lib/dashboardService';
import {
  ArrowRight, User, BookOpen, AlertTriangle, Trophy,
  Upload, Bell, Flame, Users, Sparkles, Target
} from 'lucide-react';
import styles from './nextStepCard.module.css';

const TYPE_ICONS = {
  profile:       { icon: <User size={20} />,          emoji: '👤', className: styles.typeProfile },
  practice:      { icon: <BookOpen size={20} />,       emoji: '📖', className: styles.typePractice },
  weak_topic:    { icon: <AlertTriangle size={20} />,  emoji: '🎯', className: styles.typeWeakTopic },
  challenge:     { icon: <Trophy size={20} />,         emoji: '🏆', className: styles.typeChallenge },
  personal:      { icon: <Upload size={20} />,         emoji: '✨', className: styles.typePersonal },
  calendar:      { icon: <Target size={20} />,         emoji: '📅', className: styles.typeCalendar },
  streak:        { icon: <Flame size={20} />,          emoji: '🔥', className: styles.typeStreak },
  community:     { icon: <Users size={20} />,          emoji: '💬', className: styles.typeCommunity },
  notifications: { icon: <Bell size={20} />,           emoji: '🔔', className: styles.typeNotifications },
};

/**
 * NextStepCard — shows data-driven "Your Next Step" recommendations.
 * 
 * - ONE dominant primary recommendation
 * - Up to 2 secondary recommendations (smaller)
 * - Each says WHAT, WHY, and ONE CTA
 * - Zero jargon, zero database terms, zero fake data
 */
export default function NextStepCard() {
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSteps() {
      try {
        const data = await dashboardService.getNextSteps();
        setSteps(data || []);
      } catch (err) {
        console.error('Failed to load next steps', err);
        setSteps([]);
      } finally {
        setLoading(false);
      }
    }
    loadSteps();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <Target size={16} style={{ animation: 'pulse 1.5s ease infinite', color: 'var(--accent-primary)' }} />
        <span>Loading recommended next step...</span>
      </div>
    );
  }

  if (!steps || steps.length === 0) return null;

  const primary = steps[0];
  const secondary = steps.slice(1);
  const primaryType = TYPE_ICONS[primary.type] || TYPE_ICONS.practice;

  return (
    <div className={styles.nextStepSection}>
      {/* Primary recommendation — dominant, clear, one CTA */}
      <div className={styles.primaryCard}>
        <div className={styles.label}>
          <Target size={12} /> Your Next Step
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div className={`${styles.iconPrimary} ${primaryType.className}`}>
            {primaryType.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <h3 className={styles.title}>{primary.title}</h3>
            <p className={styles.reason}>{primary.reason}</p>
          </div>
        </div>

        <Link href={primary.ctaHref} className={styles.ctaButton}>
          {primary.ctaText} <ArrowRight size={14} />
        </Link>
      </div>

      {/* Secondary recommendations — compact, subtle */}
      {secondary.map((step, idx) => {
        const typeInfo = TYPE_ICONS[step.type] || TYPE_ICONS.practice;
        return (
          <div key={idx} className={styles.secondaryCard}>
            <div className={`${styles.iconBox} ${typeInfo.className}`}>
              {typeInfo.emoji}
            </div>
            <div className={styles.secondaryContent}>
              <h4 className={styles.titleSecondary}>{step.title}</h4>
              <p className={styles.reasonSecondary}>{step.reason}</p>
            </div>
            <Link href={step.ctaHref} className={styles.ctaSecondary}>
              {step.ctaText} →
            </Link>
          </div>
        );
      })}
    </div>
  );
}
