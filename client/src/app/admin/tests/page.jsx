'use client';

import styles from './adminTests.module.css';

export default function TestsPage() {
  const tests = [
    { id: 'test-1', title: 'TCS NQT National Mock Challenge', category: 'Corporate Mock', duration: '90 Mins', totalQuestions: 40, activeCandidates: 184, status: 'Active' },
    { id: 'test-2', title: 'Data Structures & Algorithms Weekly Assessment', category: 'Practice Assessment', duration: '60 Mins', totalQuestions: 15, activeCandidates: 92, status: 'Active' },
    { id: 'test-3', title: 'General Aptitude & Logical Diagnostic Test', category: 'Diagnostic Test', duration: '45 Mins', totalQuestions: 30, activeCandidates: 45, status: 'Completed' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Assessment & Test Administration</h1>
          <p className={styles.subtitle}>Create online mock exams, timer rules, proctoring settings, and candidate sessions</p>
        </div>
        <button className={styles.primaryBtn}>+ Create New Assessment</button>
      </div>

      <div className={styles.grid}>
        {tests.map((t) => (
          <div key={t.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.catBadge}>{t.category}</span>
              <span className={styles.statusPill}>{t.status}</span>
            </div>
            <h3 className={styles.testTitle}>{t.title}</h3>
            <div className={styles.metaRow}>
              <span>⏱️ {t.duration}</span>
              <span>❓ {t.totalQuestions} Questions</span>
              <span>👥 {t.activeCandidates} Active</span>
            </div>
            <div className={styles.btnRow}>
              <button className={styles.btnPrimary}>View Realtime Submissions</button>
              <button className={styles.btnSec}>Configure Timer & Cutoff</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
