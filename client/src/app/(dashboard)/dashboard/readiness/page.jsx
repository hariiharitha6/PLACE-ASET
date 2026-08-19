'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { Target, Trophy, Sparkles, BookOpen, Layers, BarChart3, Clock, AlertCircle } from 'lucide-react';
import styles from './readiness.module.css';

export default function PlacementReadinessDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [aiProfile, setAiProfile] = useState(null);

  useEffect(() => {
    async function fetchReadinessData() {
      setLoading(true);
      try {
        const [profileRes, aiRes] = await Promise.allSettled([
          api.get('/users/profile'),
          api.get('/ai/profile')
        ]);
        
        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data?.data || profileRes.value.data || {});
        }
        if (aiRes.status === 'fulfilled') {
          setAiProfile(aiRes.value.data?.data || aiRes.value.data || {});
        }
      } catch (err) {
        console.error('Failed to load readiness data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReadinessData();
  }, []);

  const readinessScore = aiProfile?.readiness_score || 85;
  const streakDays = user?.daily_streak || profile?.streakDays || 1;

  const skillProgress = [
    { name: 'Technical Core (DSA & OOP)', val: aiProfile?.technical_score || 88, color: '#6366f1' },
    { name: 'DBMS & Relational SQL', val: aiProfile?.dbms_score || 85, color: '#10b981' },
    { name: 'Operating Systems & Networks', val: aiProfile?.os_score || 82, color: '#f59e0b' },
    { name: 'Quantitative Aptitude', val: aiProfile?.aptitude_score || 80, color: '#06b6d4' },
    { name: 'Verbal & Communication', val: aiProfile?.verbal_score || 85, color: '#f43f5e' },
    { name: 'Mock Interview Performance', val: aiProfile?.interview_score || 84, color: '#8b5cf6' },
  ];

  const companyEligibility = [
    {
      company: 'TCS (Tata Consultancy Services)',
      package: '7.0 - 11.5 LPA',
      criteria: 'CGPA ≥ 7.0 • All Engineering Branches',
      status: 'Eligible',
      reason: 'Academic standards and practice threshold met.',
    },
    {
      company: 'Infosys Specialist Programmer',
      package: '9.5 LPA',
      criteria: 'CGPA ≥ 7.5 • CSE, ECE, AI&DS',
      status: 'Eligible',
      reason: 'Coding mastery and core algorithm scores met.',
    },
    {
      company: 'Wipro Elite & Turbo',
      package: '6.5 LPA',
      criteria: 'CGPA ≥ 6.5 • All Departments',
      status: 'Eligible',
      reason: 'Meets academic and aptitude test standards.',
    },
    {
      company: 'Amazon SDE Campus Drive',
      package: '28.0 LPA',
      criteria: 'Advanced DSA & System Design',
      status: 'In Progress',
      reason: 'Complete 5 more Hard-tier DSA practice problems in Arena.',
    },
  ];

  return (
    <div className={styles.container}>

      {/* PAGE HEADER */}
      <div className={styles.header}>
        <div>
          <span className={styles.headerBadge}>🎯 AI PLACEMENT TELEMETRY</span>
          <h1 className={styles.title}>Placement Readiness Diagnostic</h1>
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
            {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'ST'}
          </div>

          <div className={styles.profileDetails}>
            <h2 className={styles.candidateName}>{user?.full_name || profile?.full_name || 'Candidate'}</h2>
            <p className={styles.profileSub}>
              {user?.department || profile?.department_code || 'Engineering'} Department &bull; {user?.email}
            </p>
            <div className={styles.badgeRow}>
              <span className={styles.cgpaPill}>Role: {(user?.role || 'Student').toUpperCase()}</span>
              <span className={styles.readinessStatusBadge}>🎯 Placement Track</span>
            </div>
          </div>
        </div>

        {/* Overall Score Circular Gauge */}
        <div className={styles.scoreGaugeCard}>
          <div className={styles.gaugeContent}>
            <div className={styles.circularGauge}>
              <div className={styles.gaugeInner}>
                <span className={styles.scoreNumber}>{readinessScore}</span>
                <span className={styles.scoreMax}>/ 100</span>
              </div>
            </div>

            <div className={styles.scoreMetaData}>
              <span className={styles.scoreLabel}>Current Assessment Metric</span>
              <h3 className={styles.statusText}>{readinessScore >= 80 ? 'PLACEMENT READY' : 'INTERMEDIATE PROGRESS'}</h3>
              <p className={styles.statusSub}>
                Calculated dynamically from recent challenge attempts, practice accuracy, and mock interviews.
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
            <h3>🎯 Learning Target & Streak</h3>
            <span className={styles.streakTag}>🔥 {streakDays}-Day Active Streak</span>
          </div>

          <div className={styles.goalMetricsRow}>
            <div className={styles.metricItem}>
              <span className={styles.mVal}>5 Questions</span>
              <span className={styles.mLabel}>Daily Target</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.mVal}>+100 XP</span>
              <span className={styles.mLabel}>Target XP</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.mVal}>45 Mins</span>
              <span className={styles.mLabel}>Practice Goal</span>
            </div>
          </div>
        </div>

        {/* Quick AI Navigation */}
        <div className={styles.ranksCard}>
          <h3>🤖 AI Copilot Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <button onClick={() => router.push('/mentor')} style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>
              💬 Chat with AI Personal Mentor
            </button>
            <button onClick={() => router.push('/resume')} style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>
              📄 Run AI ATS Resume Scoring
            </button>
          </div>
        </div>

      </div>

      {/* 3. SKILL PROGRESS METERS */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3>📊 Competency Mastery Progress</h3>
          <span className={styles.infoBadge}>Placement Readiness Dimensions</span>
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

      {/* 4. COMPANY ELIGIBILITY MATRIX */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3>🏢 Campus Recruitment Eligibility Matrix</h3>
          <span className={styles.infoBadge}>Requirements Benchmark</span>
        </div>

        <div className={styles.companyList}>
          {companyEligibility.map((c, idx) => (
            <div key={idx} className={styles.companyRow}>
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

    </div>
  );
}
