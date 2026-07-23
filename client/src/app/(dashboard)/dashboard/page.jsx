'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { dashboardService } from '../../../lib/dashboardService';
import PlacementReadinessWidget from '../../../components/widgets/PlacementReadinessWidget';
import PlacementDrivesWidget from '../../../components/widgets/PlacementDrivesWidget';
import ChallengeWidget from '../../../components/widgets/ChallengeWidget';
import ProgressWidget from '../../../components/widgets/ProgressWidget';
import LeaderboardWidget from '../../../components/widgets/LeaderboardWidget';
import RecentQuestionsWidget from '../../../components/widgets/RecentQuestionsWidget';
import ResourcesWidget from '../../../components/widgets/ResourcesWidget';
import UpcomingEventsWidget from '../../../components/widgets/UpcomingEventsWidget';
import styles from './studentDashboard.module.css';
import { useRouter } from 'next/navigation';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Motivational Quote Generator
  const quotes = [
    '"Success is not final, failure is not fatal: it is the courage to continue that counts." – Winston Churchill',
    '"The secret of getting ahead is getting started." – Mark Twain',
    '"Opportunities don\'t happen, you create them." – Chris Grosser',
    '"Code is like humor. When you have to explain it, it’s bad." – Cory House',
    '"Continuous learning is the minimum requirement for success in any field." – Brian Tracy',
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * quotes.length));
    const loadDashboard = async () => {
      try {
        const res = await dashboardService.getSummary();
        setData(res);
      } catch (err) {
        console.error('Failed to load student dashboard metrics:', err);
        setError('Could not fetch dashboard summary data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <span>Initializing World-Class Student Arena...</span>
      </div>
    );
  }

  const {
    profile = {},
    weeklyChallenge = null,
    leaderboardPreview = [],
    upcomingEvents = [],
    latestResources = [],
  } = data || {};

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.dashboardContainer}>

      {/* 1. WELCOME & MOTIVATIONAL HEADER */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeGlow} />
        <div className={styles.welcomeContent}>
          <div className={styles.greetingHeader}>
            <div>
              <span className={styles.dateBadge}>📅 {todayFormatted}</span>
              <h1 className={styles.welcomeTitle}>
                Welcome back, {user?.full_name || 'Candidate'}! 👋
              </h1>
              <p className={styles.welcomeSub}>
                <strong>Dept:</strong> {profile.department_code || 'CSE'} &bull; <strong>Year:</strong> {profile.year || '4th Year'} &bull; <strong>Section:</strong> {profile.section || 'A'} &bull; <strong>Roll No:</strong> {profile.roll_number || 'ATP22CS006'}
              </p>
            </div>
            <div className={styles.readinessPillCard}>
              <span className={styles.readinessTitle}>Readiness Score</span>
              <span className={styles.readinessScoreVal}>87 / 100</span>
              <div className={styles.miniProgressTrack}>
                <div className={styles.miniProgressFill} style={{ width: '87%' }} />
              </div>
            </div>
          </div>

          <div className={styles.quoteBox}>
            <span>💡 <em>{quotes[quoteIndex]}</em></span>
          </div>
        </div>
      </div>

      {/* 2. 10 EXECUTIVE KPI DASHBOARD CARDS */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} onClick={() => router.push('/placement-drives')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>💼</span>
            <span className={styles.kpiTagActive}>3 Open</span>
          </div>
          <span className={styles.kpiVal}>3 Drives</span>
          <span className={styles.kpiLabel}>Upcoming Placement Drives</span>
        </div>

        <div className={styles.kpiCard} onClick={() => router.push('/challenges')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>📝</span>
            <span className={styles.kpiTagUrgent}>2 Scheduled</span>
          </div>
          <span className={styles.kpiVal}>2 Tests</span>
          <span className={styles.kpiLabel}>Upcoming Mock Tests</span>
        </div>

        <div className={styles.kpiCard} onClick={() => router.push('/practice')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>⚡</span>
            <span className={styles.kpiTag}>Pending</span>
          </div>
          <span className={styles.kpiVal}>14 Sets</span>
          <span className={styles.kpiLabel}>Pending Practice Modules</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>✅</span>
            <span className={styles.kpiTagSuccess}>+12 this week</span>
          </div>
          <span className={styles.kpiVal}>{profile.solved_count || 142}</span>
          <span className={styles.kpiLabel}>Total Solved Questions</span>
        </div>

        <div className={styles.kpiCard} onClick={() => router.push('/leaderboard')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>🏆</span>
            <span className={styles.kpiTagGold}>Campus Rank</span>
          </div>
          <span className={styles.kpiVal}>#{profile.rank || 4}</span>
          <span className={styles.kpiLabel}>Overall Leaderboard Rank</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>🔥</span>
            <span className={styles.kpiTagOrange}>Active</span>
          </div>
          <span className={styles.kpiVal}>{profile.streak_days || 14} Days</span>
          <span className={styles.kpiLabel}>Daily Coding Streak</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>📈</span>
            <span className={styles.kpiTag}>Level {profile.level || 4}</span>
          </div>
          <span className={styles.kpiVal}>78%</span>
          <span className={styles.kpiLabel}>Overall Placement Progress</span>
        </div>

        <div className={styles.kpiCard} onClick={() => router.push('/achievements')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>📜</span>
            <span className={styles.kpiTagSuccess}>Verified</span>
          </div>
          <span className={styles.kpiVal}>5 Badges</span>
          <span className={styles.kpiLabel}>Certificates & Achievements</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>🎯</span>
            <span className={styles.kpiTagPurple}>AI Index</span>
          </div>
          <span className={styles.kpiVal}>87 / 100</span>
          <span className={styles.kpiLabel}>Placement Readiness Score</span>
        </div>

        <div className={styles.kpiCard} onClick={() => router.push('/practice/bookmarks')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>🔖</span>
            <span className={styles.kpiTag}>Saved</span>
          </div>
          <span className={styles.kpiVal}>18 Items</span>
          <span className={styles.kpiLabel}>Saved Bookmarks & Notes</span>
        </div>
      </div>

      {/* 3. PLACEMENT READINESS & PLACEMENT DRIVES ROW */}
      <div className={styles.sectionRowTwo}>
        <PlacementReadinessWidget readinessScore={87} />
        <PlacementDrivesWidget drives={[]} />
      </div>

      {/* 4. MY PROFILE SUMMARY & QUICK PRACTICE NAVIGATOR */}
      <div className={styles.sectionRowTwo}>
        
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarBox}>
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <h3 className={styles.profileName}>{user?.full_name || 'D Haritha'}</h3>
              <p className={styles.profileEmail}>{user?.email || 'hariiharitha05@gmail.com'}</p>
              <div className={styles.badgeRow}>
                <span className={styles.pillDept}>CSE Dept</span>
                <span className={styles.pillCgpa}>CGPA: 8.9 / 10</span>
              </div>
            </div>
          </div>

          <div className={styles.profileMetaGrid}>
            <div><span>College:</span> <strong>ASET Campus</strong></div>
            <div><span>Roll No:</span> <code>ATP22CS006</code></div>
            <div><span>Phone:</span> <strong>+91 98470 12345</strong></div>
            <div><span>Resume:</span> <span className={styles.resumeStatus}>✓ Uploaded (PDF)</span></div>
          </div>

          <div className={styles.socialRow}>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialLink}>💼 LinkedIn</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className={styles.socialLink}>🐙 GitHub</a>
            <button className={styles.editProfileBtn} onClick={() => router.push('/profile-setup')}>✏️ Edit Profile</button>
          </div>
        </div>

        {/* Question Bank Shortcuts */}
        <div className={styles.qBankCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Question Bank & Arena Shortcuts</h3>
              <p className={styles.cardSub}>Practice company-curated questions by difficulty and topic</p>
            </div>
            <button className={styles.viewAllBtn} onClick={() => router.push('/questions')}>Explore All</button>
          </div>

          <div className={styles.companyShortcuts}>
            <span className={styles.companyBadge} onClick={() => router.push('/questions')}>Amazon (42)</span>
            <span className={styles.companyBadge} onClick={() => router.push('/questions')}>TCS Digital (85)</span>
            <span className={styles.companyBadge} onClick={() => router.push('/questions')}>Infosys (60)</span>
            <span className={styles.companyBadge} onClick={() => router.push('/questions')}>Wipro (50)</span>
            <span className={styles.companyBadge} onClick={() => router.push('/questions')}>Google (24)</span>
          </div>

          <div className={styles.categoryGrid}>
            <div className={styles.catBox} onClick={() => router.push('/practice')}>
              <span>💻</span>
              <div>
                <strong>Coding Arena</strong>
                <p>Data Structures, Algo</p>
              </div>
            </div>
            <div className={styles.catBox} onClick={() => router.push('/practice')}>
              <span>🧠</span>
              <div>
                <strong>Aptitude Test</strong>
                <p>Quants, Reasoning</p>
              </div>
            </div>
            <div className={styles.catBox} onClick={() => router.push('/practice')}>
              <span>⚙️</span>
              <div>
                <strong>Technical Core</strong>
                <p>OS, DBMS, Networks</p>
              </div>
            </div>
            <div className={styles.catBox} onClick={() => router.push('/practice')}>
              <span>🗣️</span>
              <div>
                <strong>HR & Behavioral</strong>
                <p>Interview Prep & Tips</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. WEEKLY CHALLENGE & PROGRESS LEVEL */}
      <div className={styles.sectionRowTwo}>
        <ChallengeWidget challenge={weeklyChallenge} />
        <ProgressWidget progress={profile} level={profile.level} />
      </div>

      {/* 6. LEADERBOARD PREVIEW & RECENT QUESTIONS */}
      <div className={styles.sectionRowTwo}>
        <LeaderboardWidget leaderboard={leaderboardPreview} />
        <RecentQuestionsWidget />
      </div>

      {/* 7. STUDY MATERIALS, CONTRIBUTIONS & EVENTS */}
      <div className={styles.sectionRowThree}>
        <ResourcesWidget resources={latestResources} />
        <UpcomingEventsWidget events={upcomingEvents} />
      </div>

    </div>
  );
}
