'use client';

import { useState } from 'react';
import styles from './achievements.module.css';

export default function AchievementsPage() {
  const [filterCategory, setFilterCategory] = useState('ALL');

  const achievementsList = [
    { id: '1', title: '100 Questions Solved', category: 'PRACTICE', icon: '🎯', desc: 'Successfully solved 100 coding & aptitude questions in Arena', xp: 500, tier: 'GOLD', earned: true, date: 'June 15, 2026' },
    { id: '2', title: 'Top 10 Leaderboard', category: 'RANK', icon: '🏆', desc: 'Achieved Top 10 overall campus leaderboard position', xp: 1000, tier: 'GOLD', earned: true, date: 'July 01, 2026' },
    { id: '3', title: '7-Day Coding Streak', category: 'STREAK', icon: '🔥', desc: 'Maintained consecutive daily practice activity for 7 days', xp: 250, tier: 'BRONZE', earned: true, date: 'June 20, 2026' },
    { id: '4', title: '30-Day Streak Master', category: 'STREAK', icon: '⚡', desc: 'Maintained consecutive daily practice activity for 30 days', xp: 1200, tier: 'GOLD', earned: false, date: null },
    { id: '5', title: 'Placement Ready Candidate', category: 'PLACEMENT', icon: '💼', desc: 'Achieved a Placement Readiness Score exceeding 85%', xp: 750, tier: 'SILVER', earned: true, date: 'July 18, 2026' },
    { id: '6', title: 'Community Resource Contributor', category: 'COMMUNITY', icon: '📚', desc: 'Shared 5 verified placement study materials & notes', xp: 400, tier: 'SILVER', earned: true, date: 'July 20, 2026' },
    { id: '7', title: 'Mock Test Champion', category: 'PRACTICE', icon: '📝', desc: 'Scored 90%+ in a TCS / Infosys Corporate Mock Exam', xp: 600, tier: 'SILVER', earned: false, date: null },
    { id: '8', title: 'Hackathon Finalist', category: 'COMMUNITY', icon: '🚀', desc: 'Ranked in the top 3 teams in ASET Innovation Hackathon', xp: 850, tier: 'GOLD', earned: false, date: null },
  ];

  const filtered = achievementsList.filter(a => filterCategory === 'ALL' || a.category === filterCategory);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Achievements & Gamification Showcase</h1>
          <p className={styles.subtitle}>Unlock badges, earn XP rewards, and celebrate your placement milestones</p>
        </div>
        <div className={styles.earnedSummary}>
          <span>🏆 {achievementsList.filter(a => a.earned).length} / {achievementsList.length} Badges Earned</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabRow}>
        <button className={`${styles.tab} ${filterCategory === 'ALL' ? styles.activeTab : ''}`} onClick={() => setFilterCategory('ALL')}>All Badges</button>
        <button className={`${styles.tab} ${filterCategory === 'PRACTICE' ? styles.activeTab : ''}`} onClick={() => setFilterCategory('PRACTICE')}>Practice & Solved</button>
        <button className={`${styles.tab} ${filterCategory === 'RANK' ? styles.activeTab : ''}`} onClick={() => setFilterCategory('RANK')}>Rank & Leaderboard</button>
        <button className={`${styles.tab} ${filterCategory === 'STREAK' ? styles.activeTab : ''}`} onClick={() => setFilterCategory('STREAK')}>Coding Streaks</button>
        <button className={`${styles.tab} ${filterCategory === 'PLACEMENT' ? styles.activeTab : ''}`} onClick={() => setFilterCategory('PLACEMENT')}>Placement Readiness</button>
        <button className={`${styles.tab} ${filterCategory === 'COMMUNITY' ? styles.activeTab : ''}`} onClick={() => setFilterCategory('COMMUNITY')}>Community</button>
      </div>

      {/* Grid of Badges */}
      <div className={styles.grid}>
        {filtered.map((item) => (
          <div key={item.id} className={`${styles.badgeCard} ${item.earned ? styles.earned : styles.locked}`}>
            <div className={styles.iconCircle}>{item.icon}</div>

            <div className={styles.cardContent}>
              <div className={styles.tierHeader}>
                <span className={`${styles.tierBadge} ${styles[item.tier.toLowerCase()]}`}>{item.tier} TIER</span>
                <span className={styles.xpReward}>+{item.xp} XP</span>
              </div>

              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>

              <div className={styles.cardFooter}>
                {item.earned ? (
                  <span className={styles.earnedLabel}>✅ Earned on {item.date}</span>
                ) : (
                  <span className={styles.lockedLabel}>🔒 In Progress</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
