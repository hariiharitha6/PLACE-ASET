'use client';

import styles from './adminLeaderboard.module.css';

export default function AdminLeaderboardPage() {
  const leaders = [
    { rank: 1, name: 'Ananya Ramesh', department: 'CSE', year: '4th Year', xp: 4850, solved: 142, streak: '24 Days' },
    { rank: 2, name: 'Siddharth Menon', department: 'ME', year: '4th Year', xp: 4210, solved: 128, streak: '18 Days' },
    { rank: 3, name: 'Sneha Joseph', department: 'AI&DS', year: '2nd Year', xp: 3950, solved: 115, streak: '15 Days' },
    { rank: 4, name: 'Rahul Varma', department: 'ECE', year: '4th Year', xp: 3620, solved: 104, streak: '12 Days' },
    { rank: 5, name: 'Kavya Nair', department: 'EEE', year: '3rd Year', xp: 3100, solved: 88, streak: '9 Days' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Campus Leaderboard Oversight</h1>
          <p className={styles.subtitle}>Audit candidate gamification XP scores, problem solving streaks, and department rankings</p>
        </div>
        <button className={styles.secondaryBtn}>📥 Export Leaderboard CSV</button>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Candidate Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Total XP</th>
              <th>Problems Solved</th>
              <th>Streak</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((l) => (
              <tr key={l.rank}>
                <td>
                  <span className={`${styles.rankBadge} ${l.rank <= 3 ? styles.topThree : ''}`}>
                    #{l.rank}
                  </span>
                </td>
                <td><strong>{l.name}</strong></td>
                <td><span className={styles.deptBadge}>{l.department}</span></td>
                <td>{l.year}</td>
                <td><span className={styles.xpText}>⭐ {l.xp} XP</span></td>
                <td>{l.solved} Problems</td>
                <td>🔥 {l.streak}</td>
                <td>
                  <button className={styles.btnSec}>View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
