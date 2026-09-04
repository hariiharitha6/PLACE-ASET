'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { dashboardService } from '../../../lib/dashboardService';
import FocusCard from '../../../components/ui/FocusCard';
import NextStepCard from '../../../components/widgets/NextStepCard';
import PlacementReadinessWidget from '../../../components/widgets/PlacementReadinessWidget';
import PlacementDrivesWidget from '../../../components/widgets/PlacementDrivesWidget';
import ChallengeWidget from '../../../components/widgets/ChallengeWidget';
import ProgressWidget from '../../../components/widgets/ProgressWidget';
import LeaderboardWidget from '../../../components/widgets/LeaderboardWidget';
import RecentQuestionsWidget from '../../../components/widgets/RecentQuestionsWidget';
import ResourcesWidget from '../../../components/widgets/ResourcesWidget';
import UpcomingEventsWidget from '../../../components/widgets/UpcomingEventsWidget';
import { 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Database, 
  Layers, 
  Cpu, 
  Award, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  BookOpen,
  Bot
} from 'lucide-react';
import styles from './studentDashboard.module.css';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await dashboardService.getSummary();
        setData(res);
      } catch (err) {
        console.error('Failed to load student dashboard summary:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const welcomed = localStorage.getItem('place_aset_welcomed');
      if (!welcomed) {
        toast.info("Welcome to PLACE@ASET! Start with the highlighted 'Your Next Step' above.", 6000);
        localStorage.setItem('place_aset_welcomed', 'true');
      }
    }
  }, [toast]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <span>Loading Learning Command Center...</span>
      </div>
    );
  }

  const {
    profile = {},
    practiceProgress = {},
    weeklyChallenge = null,
    leaderboardPreview = [],
    upcomingEvents = [],
    latestResources = [],
  } = data || {};

  const streakDays = profile?.streak || 0;
  const totalSessions = practiceProgress?.totalSessions || 0;
  const completedSessions = practiceProgress?.completedSessions || 0;
  const rank = profile?.collegeRank || 0;
  const readinessScore = profile?.readiness_score || 0;

  return (
    <div className={styles.dashboardContainer}>

      {/* 1. GREETING + FOCUS CARD */}
      <FocusCard
        greeting="Good day"
        userName={user?.full_name || 'Candidate'}
        streak={streakDays}
        focusTitle={totalSessions > 0 ? 'Continue Active Learning' : 'Welcome to PLACE@ASET'}
        focusDescription={totalSessions > 0
          ? `You have completed ${completedSessions} practice sessions. Keep going to strengthen your preparation.`
          : 'Start by practising a few questions. Your dashboard will fill up as you learn.'
        }
        ctaText={totalSessions > 0 ? 'Resume Practice →' : 'Start Your First Practice →'}
        ctaHref="/practice"
        goalTarget={5}
        completedCount={Math.min(5, completedSessions)}
      />

      {/* 2. YOUR NEXT STEP — data-driven recommendations */}
      <NextStepCard />

      {/* 3. EXECUTIVE STUDY TELEMETRY KPIS */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} onClick={() => router.push('/practice')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>⚡</span>
            <span className={styles.kpiTagSuccess}>Active</span>
          </div>
          <span className={styles.kpiVal}>{totalSessions > 0 ? `${completedSessions} Sessions` : 'Not started'}</span>
          <span className={styles.kpiLabel}>Practice Sessions Completed</span>
        </div>

        <div className={styles.kpiCard} onClick={() => router.push('/challenges')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>🏆</span>
            <span className={styles.kpiTagActive}>Weekly</span>
          </div>
          <span className={styles.kpiVal}>{rank > 0 ? `Rank #${rank}` : 'Unranked'}</span>
          <span className={styles.kpiLabel}>Campus Leaderboard</span>
        </div>

        <div className={styles.kpiCard} onClick={() => router.push('/dashboard/readiness')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>🎯</span>
            <span className={styles.kpiTagActive}>{readinessScore > 0 ? `${readinessScore}%` : '—'}</span>
          </div>
          <span className={styles.kpiVal}>{readinessScore > 0 ? `${readinessScore} / 100` : 'Start practicing'}</span>
          <span className={styles.kpiLabel}>Placement Readiness Score</span>
        </div>

        <div className={styles.kpiCard} onClick={() => router.push('/personal')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>✨</span>
            <span className={styles.kpiTagAmber}>Studio</span>
          </div>
          <span className={styles.kpiVal}>Personal Hub</span>
          <span className={styles.kpiLabel}>Notes & Private Flashcards</span>
        </div>
      </div>

      {/* 4. TOPIC LAUNCHPAD */}
      <div className={styles.topicCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>Core Learning Tracks</h3>
          <Link href="/practice" style={{ fontSize: '12px', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>
            View All →
          </Link>
        </div>
        <div className={styles.topicGrid}>
          <Link href="/practice" className={styles.topicItem}>
            <span className={styles.topicIcon}>💻</span>
            <div>
              <h4 className={styles.topicName}>Data Structures</h4>
              <span className={styles.topicCount}>Trees, Graphs, DP</span>
            </div>
          </Link>

          <Link href="/practice" className={styles.topicItem}>
            <span className={styles.topicIcon}>🗄️</span>
            <div>
              <h4 className={styles.topicName}>DBMS & SQL</h4>
              <span className={styles.topicCount}>Queries, Indexing</span>
            </div>
          </Link>

          <Link href="/practice" className={styles.topicItem}>
            <span className={styles.topicIcon}>⚙️</span>
            <div>
              <h4 className={styles.topicName}>Operating Systems</h4>
              <span className={styles.topicCount}>Threads, Memory</span>
            </div>
          </Link>

          <Link href="/practice" className={styles.topicItem}>
            <span className={styles.topicIcon}>🧠</span>
            <div>
              <h4 className={styles.topicName}>General Aptitude</h4>
              <span className={styles.topicCount}>Quants & Reasoning</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. PLACEMENT READINESS & PLACEMENT DRIVES */}
      <div className={styles.sectionRowTwo}>
        <PlacementReadinessWidget readinessScore={readinessScore} />
        <PlacementDrivesWidget drives={[]} />
      </div>

      {/* 5. WEEKLY CHALLENGE & PROGRESS LEVEL */}
      <div className={styles.sectionRowTwo}>
        <ChallengeWidget challenge={weeklyChallenge} />
        <ProgressWidget progress={profile} level={profile.level || 1} />
      </div>

      {/* 6. LEADERBOARD PREVIEW & RECENT QUESTIONS */}
      <div className={styles.sectionRowTwo}>
        <LeaderboardWidget leaderboard={leaderboardPreview} />
        <RecentQuestionsWidget />
      </div>

      {/* 7. STUDY MATERIALS & UPCOMING EVENTS */}
      <div className={styles.sectionRowThree}>
        <ResourcesWidget resources={latestResources} />
        <UpcomingEventsWidget events={upcomingEvents} />
      </div>

    </div>
  );
}
