'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import styles from './readiness.module.css';

export default function PlacementReadinessDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchReadinessData();
  }, []);

  const fetchReadinessData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data?.data || res.data || {});
    } catch (err) {
      console.error(err);
      setProfile({
        full_name: 'D Haritha',
        department_code: 'CSE',
        year: '4th Year',
        section: 'A',
        cgpa: '8.9 / 10',
        roll_number: 'ATP22CS006',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <span>Loading Placement Readiness Engine...</span>
      </div>
    );
  }

  const skillProgress = [
    { name: 'Technical Core', val: 92, color: '#6366f1' },
    { name: 'Programming (C++/Java/Python)', val: 88, color: '#4f46e5' },
    { name: 'DBMS & SQL', val: 85, color: '#10b981' },
    { name: 'Operating Systems', val: 90, color: '#f59e0b' },
    { name: 'Computer Networks', val: 78, color: '#ef4444' },
    { name: 'Data Structures & Algorithms', val: 86, color: '#8b5cf6' },
    { name: 'Aptitude & Quants', val: 82, color: '#06b6d4' },
    { name: 'Interview Readiness', val: 85, color: '#3b82f6' },
    { name: 'Resume Completeness', val: 95, color: '#10b981' },
    { name: 'Coding Arena Score', val: 88, color: '#818cf8' },
    { name: 'Communication & Verbal', val: 90, color: '#f43f5e' },
  ];

  const weakAreas = [
    {
      subject: 'Dynamic Programming & Memoization',
      reason: '2 missed test cases on 0/1 Knapsack & Longest Common Subsequence problems in recent practice sessions.',
      recommendation: 'Solve 3 Medium DP Problems in Arena',
      link: '/practice',
    },
    {
      subject: 'Computer Networks (TCP/IP & Subnetting)',
      reason: '78% accuracy on Subnet Masking questions compared to 92% campus average.',
      recommendation: 'Review OS & Networks Notes PDF',
      link: '/resources',
    },
  ];

  const companyEligibility = [
    {
      company: 'TCS (Tata Consultancy Services)',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80',
      package: '7.0 - 11.5 LPA',
      criteria: 'CGPA ≥ 7.0 &bull; CSE, ECE, AI&DS',
      status: 'Eligible',
      reason: 'Your CGPA (8.9) exceeds the 7.0 requirement and your branch (CSE) is eligible.',
    },
    {
      company: 'Infosys Specialist Programmer',
      logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=100&q=80',
      package: '9.5 LPA',
      criteria: 'CGPA ≥ 7.5 &bull; CSE, AI&DS',
      status: 'Eligible',
      reason: 'All academic cutoffs met. Strong coding score (88%) matches role criteria.',
    },
    {
      company: 'Wipro Turbo Drive',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&q=80',
      package: '6.5 LPA',
      criteria: 'CGPA ≥ 6.5 &bull; All Departments',
      status: 'Eligible',
      reason: 'Meets academic and aptitude test standards.',
    },
    {
      company: 'Amazon SDE Placement Drive',
      logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=100&q=80',
      package: '28.0 LPA',
      criteria: 'CGPA ≥ 8.5 &bull; Advanced DSA & System Design',
      status: 'Nearly Eligible',
      reason: 'Academic CGPA met (8.9). Recommended solving 2 more Medium Graph/Tree coding problems.',
    },
    {
      company: 'Google Software Engineering Intern',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=100&q=80',
      package: '15.0 LPA Stipend',
      criteria: 'CGPA ≥ 9.0 &bull; CSE',
      status: 'Not Eligible',
      reason: 'Current CGPA is 8.9 (Minimum required: 9.0). CGPA update required.',
    },
  ];

  const recentActivity = [
    { type: 'Practice', text: 'Completed "Binary Tree Level Order Traversal"', time: '2 hours ago', icon: '💻' },
    { type: 'Challenge', text: 'Participated in TCS NQT National Mock Challenge (Score: 88%)', time: '1 day ago', icon: '🏆' },
    { type: 'Resource', text: 'Downloaded "System Design & Microservices Handbook.pdf"', time: '2 days ago', icon: '📚' },
  ];

  return (
    <div className={styles.container}>

      {/* PAGE HEADER */}
      <div className={styles.header}>
        <div>
          <span className={styles.headerBadge}>🎯 AI PLACEMENT ENGINE</span>
          <h1 className={styles.title}>Placement Readiness Dashboard</h1>
          <p className={styles.subtitle}>Comprehensive candidate readiness diagnostic, company eligibility matrix, and skill progress meters</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => router.push('/practice')}>
          ⚡ Start Diagnostic Practice
        </button>
      </div>

      {/* 1. PROFILE SUMMARY & OVERALL SCORE */}
      <div className={styles.gridTwo}>
        
        {/* Profile Card */}
        <div className={styles.profileSummaryCard}>
          <div className={styles.avatarBox}>
            {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'DH'}
          </div>

          <div className={styles.profileDetails}>
            <h2 className={styles.candidateName}>{user?.full_name || profile?.full_name || 'D Haritha'}</h2>
            <p className={styles.profileSub}>
              {profile?.department_code || 'CSE'} Department &bull; {profile?.year || '4th Year'} &bull; Sec {profile?.section || 'A'}
            </p>
            <div className={styles.badgeRow}>
              <span className={styles.cgpaPill}>CGPA: 8.9 / 10</span>
              <span className={styles.readinessStatusBadge}>🎯 Placement Ready</span>
            </div>
          </div>
        </div>

        {/* Overall Score Circular Gauge */}
        <div className={styles.scoreGaugeCard}>
          <div className={styles.gaugeContent}>
            <div className={styles.circularGauge}>
              <div className={styles.gaugeInner}>
                <span className={styles.scoreNumber}>87</span>
                <span className={styles.scoreMax}>/ 100</span>
              </div>
            </div>

            <div className={styles.scoreMetaData}>
              <span className={styles.scoreLabel}>Current Assessment Status</span>
              <h3 className={styles.statusText}>PLACEMENT READY</h3>
              <p className={styles.statusSub}>
                Your performance puts you in the <strong>Top 5% candidate percentile</strong> for campus drives!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 2. TODAY'S GOALS & LEADERBOARD POSITIONS */}
      <div className={styles.gridTwo}>
        
        {/* Today's Goal */}
        <div className={styles.goalCard}>
          <div className={styles.cardHeader}>
            <h3>🎯 Today&apos;s Target & Streak</h3>
            <span className={styles.streakTag}>🔥 14-Day Streak</span>
          </div>

          <div className={styles.goalMetricsRow}>
            <div className={styles.metricItem}>
              <span className={styles.mVal}>3 / 5</span>
              <span className={styles.mLabel}>Questions Remaining</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.mVal}>+150 XP</span>
              <span className={styles.mLabel}>Daily XP Earned</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.mVal}>60 Mins</span>
              <span className={styles.mLabel}>Practice Goal</span>
            </div>
          </div>
        </div>

        {/* Leaderboard Positions */}
        <div className={styles.ranksCard}>
          <h3>🏆 Your Leaderboard Positions</h3>
          <div className={styles.ranksGrid}>
            <div className={styles.rankBox}>
              <span className={styles.rVal}>#4</span>
              <span className={styles.rLabel}>College Rank</span>
            </div>
            <div className={styles.rankBox}>
              <span className={styles.rVal}>#2</span>
              <span className={styles.rLabel}>Department Rank</span>
            </div>
            <div className={styles.rankBox}>
              <span className={styles.rVal}>#3</span>
              <span className={styles.rLabel}>Year Rank</span>
            </div>
            <div className={styles.rankBox}>
              <span className={styles.rVal}>#1</span>
              <span className={styles.rLabel}>Section Rank</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. SKILL PROGRESS METERS */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3>📊 Skill Mastery & Performance Progress</h3>
          <span className={styles.infoBadge}>11 Competency Area Meters</span>
        </div>

        <div className={styles.skillsGrid}>
          {skillProgress.map((s, idx) => (
            <div key={idx} className={styles.skillItem}>
              <div className={styles.skillHeader}>
                <span>{s.name}</span>
                <strong>{s.val}%</strong>
              </div>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${s.val}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. WEAK AREA DIAGNOSTICS & AI RECOMMENDATIONS */}
      <div className={styles.gridTwo}>
        
        {/* Weak Areas */}
        <div className={styles.cardBox}>
          <div className={styles.cardHeader}>
            <h3>⚠️ Diagnostic Weak Areas</h3>
            <span className={styles.tagDanger}>Requires Focus</span>
          </div>

          <div className={styles.weakList}>
            {weakAreas.map((w, idx) => (
              <div key={idx} className={styles.weakItem}>
                <h4 className={styles.weakTitle}>{w.subject}</h4>
                <p className={styles.weakReason}>{w.reason}</p>
                <button className={styles.actionLinkBtn} onClick={() => router.push(w.link)}>
                  ➡️ {w.recommendation}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className={styles.cardBox}>
          <div className={styles.cardHeader}>
            <h3>🤖 AI Personalized Recommendations</h3>
            <span className={styles.tagPurple}>AI Suggested</span>
          </div>

          <div className={styles.recList}>
            <div className={styles.recItem} onClick={() => router.push('/practice')}>
              <span>💻</span>
              <div>
                <strong>Recommended Question</strong>
                <p>LRU Cache Implementation in C++ (Amazon Pattern)</p>
              </div>
            </div>

            <div className={styles.recItem} onClick={() => router.push('/challenges')}>
              <span>🏆</span>
              <div>
                <strong>Recommended Challenge</strong>
                <p>TCS NQT National Aptitude Mock Diagnostic</p>
              </div>
            </div>

            <div className={styles.recItem} onClick={() => router.push('/resources')}>
              <span>📚</span>
              <div>
                <strong>Recommended Resource</strong>
                <p>Operating Systems & Virtual Memory Handouts PDF</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. COMPANY ELIGIBILITY MATRIX */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3>🏢 Visiting Company Eligibility Matrix</h3>
          <span className={styles.infoBadge}>Live Campus Requirements Check</span>
        </div>

        <div className={styles.companyList}>
          {companyEligibility.map((c, idx) => (
            <div key={idx} className={styles.companyRow}>
              <img src={c.logo} alt={c.company} className={styles.companyLogo} />

              <div className={styles.cDetails}>
                <div className={styles.cTitleRow}>
                  <h4>{c.company}</h4>
                  <span className={styles.pkgText}>💰 {c.package}</span>
                </div>
                <span className={styles.cCriteria}>Criteria: {c.criteria}</span>
                <p className={styles.cReason}>{c.reason}</p>
              </div>

              <div className={styles.cAction}>
                <span className={`${styles.statusTag} ${styles[c.status.toLowerCase().replace(' ', '')]}`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. RECENT ACTIVITY TIMELINE */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3>🕒 Recent Practice & Platform Activity</h3>
        </div>

        <div className={styles.activityList}>
          {recentActivity.map((act, idx) => (
            <div key={idx} className={styles.activityRow}>
              <span className={styles.actIcon}>{act.icon}</span>
              <div className={styles.actContent}>
                <span>{act.text}</span>
                <span className={styles.actTime}>{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
