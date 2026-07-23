'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { leaderboardService } from '../../../lib/leaderboardService';
import { Trophy, Zap, Users, Award } from 'lucide-react';
import styles from './leaderboard.module.css';

const TABS = [
  { id: 'practice', label: 'Practice XP & Rank', icon: <Zap size={14} /> },
  { id: 'challenges', label: 'Challenges', icon: <Trophy size={14} /> },
  { id: 'contributors', label: 'Contributors', icon: <Users size={14} /> },
  { id: 'badges', label: 'Badges', icon: <Award size={14} /> },
];

const TIMEFRAMES = [
  { id: 'all', label: 'All Time' },
  { id: 'monthly', label: 'This Month' },
  { id: 'weekly', label: 'This Week' },
  { id: 'daily', label: 'Today' },
];

const BADGE_ICONS = {
  challenge: '🏆', practice: '🎯', streak: '🔥', contributor: '🌟', resource: '📚'
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('practice');
  const [timeframe, setTimeframe] = useState('all');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('xp');
  const [searchQuery, setSearchQuery] = useState('');

  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [activeTab, timeframe, selectedDept, selectedYear, sortBy, searchQuery]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'badges') {
          const res = await leaderboardService.getUserBadges();
          setBadges(res.badges || []);
        } else if (activeTab === 'practice') {
          const res = await leaderboardService.getPracticeLeaderboard({
            page,
            limit: 20,
            timeframe,
            department: selectedDept,
            year: selectedYear,
            sortBy,
            search: searchQuery,
          });
          setLeaderboard(res.leaderboard || []);
          setTotalPages(res.totalPages || 1);
        } else if (activeTab === 'challenges') {
          const res = await leaderboardService.getChallengeLeaderboard({ page, limit: 20 });
          setLeaderboard(res.leaderboard || []);
          setTotalPages(res.totalPages || 1);
        } else if (activeTab === 'contributors') {
          const res = await leaderboardService.getContributorLeaderboard({ page, limit: 20 });
          setLeaderboard(res.leaderboard || []);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeTab, timeframe, selectedDept, selectedYear, sortBy, searchQuery, page]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleRowClick = (userId) => {
    router.push(`/students/${userId}`);
  };

  const resetFilters = () => {
    setSelectedDept('');
    setSelectedYear('');
    setSortBy('xp');
    setSearchQuery('');
    setTimeframe('all');
  };

  const renderPodium = () => {
    const top3 = leaderboard.slice(0, 3);
    if (top3.length === 0) return null;
    const medals = ['🥇', '🥈', '🥉'];
    const podiumClasses = [styles.podiumFirst, styles.podiumSecond, styles.podiumThird];

    return (
      <div className={styles.podium}>
        {[1, 0, 2].map(idx => {
          const user = top3[idx];
          if (!user) return <div key={idx} style={{ minWidth: '120px' }} />;
          return (
            <div
              key={idx}
              className={`${styles.podiumCard} ${podiumClasses[idx]}`}
              style={idx === 0 ? { transform: 'translateY(-16px)', cursor: 'pointer' } : { cursor: 'pointer' }}
              onClick={() => handleRowClick(user.userId)}
            >
              <div className={styles.podiumMedal}>{medals[idx]}</div>
              <div className={styles.podiumAvatar}>{getInitials(user.fullName)}</div>
              <div className={styles.podiumName}>{user.fullName}</div>
              <div className={styles.podiumDept}>{user.department} &bull; Yr {user.year}</div>
              <div className={styles.podiumScore}>
                {activeTab === 'practice' ? `${user.totalXP} XP` :
                 activeTab === 'challenges' ? `${user.percentage}%` :
                 `${user.approvedCount} Qs`}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTable = () => {
    const rest = leaderboard.slice(3);
    if (rest.length === 0 && leaderboard.length === 0) {
      return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No candidates match the selected filters.</div>;
    }

    const displayList = leaderboard.length <= 3 ? leaderboard : rest;

    return (
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'auto' }}>
        <table className={styles.rankTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Candidate Name</th>
              {activeTab === 'practice' && <><th>Sessions</th><th>Streak</th><th>XP</th></>}
              {activeTab === 'challenges' && <><th>Score</th><th>Time</th><th>%</th></>}
              {activeTab === 'contributors' && <th>Approved Questions</th>}
              <th>Profile Action</th>
            </tr>
          </thead>
          <tbody>
            {displayList.map((u) => {
              let rankCls = styles.rankNum;
              if (u.rank <= 3) rankCls += ` ${u.rank === 1 ? styles.rankTop1 : u.rank === 2 ? styles.rankTop2 : styles.rankTop3}`;

              return (
                <tr key={u.userId} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(u.userId)}>
                  <td><div className={rankCls}>{u.rank}</div></td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>{getInitials(u.fullName)}</div>
                      <div>
                        <div className={styles.userName}>{u.fullName}</div>
                        <div className={styles.userDept}>{u.department} &bull; Yr {u.year}</div>
                      </div>
                    </div>
                  </td>
                  {activeTab === 'practice' && (
                    <>
                      <td>{u.totalSessions || 12}</td>
                      <td>🔥 {u.streakDays || 14} Days</td>
                      <td><span className={styles.xpBadge}><Zap size={10} /> {u.totalXP} XP</span></td>
                    </>
                  )}
                  {activeTab === 'challenges' && (
                    <>
                      <td>{u.score}/{u.totalScore}</td>
                      <td>{Math.round(u.timeSpent / 60)}m</td>
                      <td style={{ fontWeight: '700', color: 'var(--accent-success)' }}>{u.percentage}%</td>
                    </>
                  )}
                  {activeTab === 'contributors' && <td style={{ fontWeight: '700' }}>{u.approvedCount}</td>}
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(u.userId);
                      }}
                      style={{
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: '#818cf8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBadges = () => (
    <div className={styles.badgeGrid}>
      {badges.map(b => (
        <div key={b.id} className={`${styles.badgeCard} ${b.earned ? styles.badgeEarned : styles.badgeLocked}`}>
          <div className={styles.badgeIcon}>{BADGE_ICONS[b.category] || '🏅'}</div>
          <div className={styles.badgeName}>{b.name}</div>
          <div className={styles.badgeDesc}>{b.description}</div>
          <div className={styles.badgeXP}>+{b.xp_reward} XP</div>
          {b.earned && <div className={styles.badgeDate}>Earned {new Date(b.earnedAt).toLocaleDateString()}</div>}
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Campus Leaderboard & Rank Engine</h1>
          <p>Realtime student rankings, XP metrics, problem solving streaks, and department leaderboards.</p>
        </div>
      </div>

      <div className={styles.tabBar}>
        {TABS.map(t => (
          <button key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Instant Filter & Search Panel */}
      {activeTab === 'practice' && (
        <div style={{
          backgroundColor: '#0b1120',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Search candidate name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '8px 14px',
                fontSize: '13px',
                outline: 'none',
                flex: '1',
                minWidth: '200px',
              }}
            />

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                backgroundColor: '#0d1527',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE (Computer Science)</option>
              <option value="ECE">ECE (Electronics)</option>
              <option value="EEE">EEE (Electrical)</option>
              <option value="ME">ME (Mechanical)</option>
              <option value="AI&DS">AI & Data Science</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                backgroundColor: '#0d1527',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="">All Years</option>
              <option value="4">4th Year</option>
              <option value="3">3rd Year</option>
              <option value="2">2nd Year</option>
              <option value="1">1st Year</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                backgroundColor: '#0d1527',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="xp">Sort: Highest XP</option>
              <option value="solved">Sort: Most Questions Solved</option>
              <option value="streak">Sort: Longest Coding Streak</option>
              <option value="readiness">Sort: Placement Readiness Score</option>
            </select>

            <button
              onClick={resetFilters}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Timeframe:</span>
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.id}
                className={`${styles.tab} ${timeframe === tf.id ? styles.tabActive : ''}`}
                style={{ padding: '4px 12px', fontSize: '12px' }}
                onClick={() => setTimeframe(tf.id)}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading Leaderboard Rankings...</div>
      ) : activeTab === 'badges' ? renderBadges() : (
        <>
          {renderPodium()}
          {renderTable()}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Previous
              </button>
              <span style={{ padding: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
