'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../../../lib/api';
import styles from './studentCompare.module.css';

export default function StudentComparePage() {
  const searchParams = useSearchParams();
  const user1 = searchParams.get('user1') || 'user-1';
  const user2 = searchParams.get('user2') || 'user-2';

  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparison();
  }, [user1, user2]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/compare', { params: { user1, user2 } });
      setCompareData(res.data?.data || res.data || {});
    } catch (err) {
      console.error(err);
      setCompareData({
        student1: {
          id: user1,
          full_name: 'D Haritha',
          departments: { code: 'CSE' },
          year: '4th Year',
          stats: { totalXP: 4850, rank: 4, level: 5, solvedCount: 142, streakDays: 14, readinessScore: 87, mockTestsCount: 12, resourcesUploadedCount: 5 }
        },
        student2: {
          id: user2,
          full_name: 'Rahul Varma',
          departments: { code: 'ECE' },
          year: '4th Year',
          stats: { totalXP: 4210, rank: 7, level: 4, solvedCount: 128, streakDays: 12, readinessScore: 82, mockTestsCount: 10, resourcesUploadedCount: 3 }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <span>Generating Student Comparison Matrix...</span>
      </div>
    );
  }

  const { student1 = {}, student2 = {} } = compareData || {};
  const s1 = student1.stats || {};
  const s2 = student2.stats || {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Student Head-to-Head Comparison</h1>
        <p className={styles.subtitle}>Side-by-side performance matrix comparing candidate achievements, XP, rank, and readiness</p>
      </div>

      {/* Candidates Header Banner */}
      <div className={styles.candidatesBanner}>
        <div className={styles.candidateCard}>
          <div className={styles.avatarCircle}>
            {student1.full_name?.substring(0, 2).toUpperCase() || 'S1'}
          </div>
          <h2>{student1.full_name || 'Candidate 1'}</h2>
          <span className={styles.badgeDept}>{student1.departments?.code || 'CSE'} &bull; {student1.year || '4th Year'}</span>
        </div>

        <div className={styles.vsCircle}>VS</div>

        <div className={styles.candidateCard}>
          <div className={styles.avatarCircle}>
            {student2.full_name?.substring(0, 2).toUpperCase() || 'S2'}
          </div>
          <h2>{student2.full_name || 'Candidate 2'}</h2>
          <span className={styles.badgeDept}>{student2.departments?.code || 'ECE'} &bull; {student2.year || '4th Year'}</span>
        </div>
      </div>

      {/* Side by Side Comparison Matrix */}
      <div className={styles.matrixCard}>
        <h3>📊 Performance Metrics Comparison</h3>

        <div className={styles.metricRow}>
          <div className={`${styles.valBox} ${s1.totalXP >= s2.totalXP ? styles.winner : ''}`}>{s1.totalXP || 0} XP</div>
          <div className={styles.metricName}>Total XP</div>
          <div className={`${styles.valBox} ${s2.totalXP >= s1.totalXP ? styles.winner : ''}`}>{s2.totalXP || 0} XP</div>
        </div>

        <div className={styles.metricRow}>
          <div className={`${styles.valBox} ${s1.rank <= s2.rank ? styles.winner : ''}`}>Rank #{s1.rank || 0}</div>
          <div className={styles.metricName}>Campus Rank</div>
          <div className={`${styles.valBox} ${s2.rank <= s1.rank ? styles.winner : ''}`}>Rank #{s2.rank || 0}</div>
        </div>

        <div className={styles.metricRow}>
          <div className={`${styles.valBox} ${s1.solvedCount >= s2.solvedCount ? styles.winner : ''}`}>{s1.solvedCount || 0} Qs</div>
          <div className={styles.metricName}>Questions Solved</div>
          <div className={`${styles.valBox} ${s2.solvedCount >= s1.solvedCount ? styles.winner : ''}`}>{s2.solvedCount || 0} Qs</div>
        </div>

        <div className={styles.metricRow}>
          <div className={`${styles.valBox} ${s1.readinessScore >= s2.readinessScore ? styles.winner : ''}`}>{s1.readinessScore || 0}%</div>
          <div className={styles.metricName}>Placement Readiness</div>
          <div className={`${styles.valBox} ${s2.readinessScore >= s1.readinessScore ? styles.winner : ''}`}>{s2.readinessScore || 0}%</div>
        </div>

        <div className={styles.metricRow}>
          <div className={`${styles.valBox} ${s1.streakDays >= s2.streakDays ? styles.winner : ''}`}>🔥 {s1.streakDays || 0} Days</div>
          <div className={styles.metricName}>Coding Streak</div>
          <div className={`${styles.valBox} ${s2.streakDays >= s1.streakDays ? styles.winner : ''}`}>🔥 {s2.streakDays || 0} Days</div>
        </div>

        <div className={styles.metricRow}>
          <div className={`${styles.valBox} ${s1.mockTestsCount >= s2.mockTestsCount ? styles.winner : ''}`}>{s1.mockTestsCount || 0} Tests</div>
          <div className={styles.metricName}>Mock Tests Done</div>
          <div className={`${styles.valBox} ${s2.mockTestsCount >= s1.mockTestsCount ? styles.winner : ''}`}>{s2.mockTestsCount || 0} Tests</div>
        </div>
      </div>
    </div>
  );
}
