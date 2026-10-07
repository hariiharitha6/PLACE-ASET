'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { dashboardService } from '../../../lib/dashboardService';
import FocusCard from '../../../components/ui/FocusCard';
import LoadingState from '../../../components/ui/LoadingState';
import NextStepCard from '../../../components/widgets/NextStepCard';
import PlacementReadinessWidget from '../../../components/widgets/PlacementReadinessWidget';
import ProgressWidget from '../../../components/widgets/ProgressWidget';
import RecentQuestionsWidget from '../../../components/widgets/RecentQuestionsWidget';
import ResourcesWidget from '../../../components/widgets/ResourcesWidget';
import UpcomingEventsWidget from '../../../components/widgets/UpcomingEventsWidget';
import styles from './studentDashboard.module.css';

export default function StudentDashboardPage() {
  const { user } = useAuth();
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
    return <LoadingState message="Preparing your study command center…" minHeight={400} />;
  }

  const {
    profile = {},
    practiceProgress = {},
    upcomingEvents = [],
    latestResources = [],
  } = data || {};

  const streakDays = profile?.streak || 0;
  const totalSessions = practiceProgress?.totalSessions || 0;
  const completedSessions = practiceProgress?.completedSessions || 0;
  const readinessScore = profile?.readiness_score || 0;

  return (
    <div className={`${styles.dashboardContainer} pageStack`}>

      <FocusCard
        greeting="Good day"
        userName={user?.full_name || 'Candidate'}
        streak={streakDays}
        focusTitle={totalSessions > 0 ? 'Continue your placement preparation' : 'Welcome to PLACE@ASET'}
        focusDescription={totalSessions > 0
          ? `You have completed ${completedSessions} practice session${completedSessions === 1 ? '' : 's'}. Pick up where you left off or follow your next recommended step below.`
          : 'Begin with a short practice set. Your dashboard will reflect real progress as you study.'
        }
        ctaText={totalSessions > 0 ? 'Continue Practice →' : 'Start Your First Practice →'}
        ctaHref="/practice"
        goalTarget={5}
        completedCount={Math.min(5, completedSessions)}
      />

      <NextStepCard />

      <section className={styles.sectionBlock} aria-labelledby="continue-learning-heading">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="continue-learning-heading" className="sectionTitle">Continue Learning</h2>
            <p className="sectionHint">Jump into a core track aligned with campus placements.</p>
          </div>
          <Link href="/practice" className={styles.sectionLink}>View practice hub →</Link>
        </div>
        <div className={styles.topicGrid}>
          <Link href="/practice" className={styles.topicItem}>
            <span className={styles.topicIcon} aria-hidden>💻</span>
            <div>
              <h3 className={styles.topicName}>Data Structures</h3>
              <p className={styles.topicCount}>Trees, graphs, dynamic programming</p>
            </div>
          </Link>
          <Link href="/practice" className={styles.topicItem}>
            <span className={styles.topicIcon} aria-hidden>🗄️</span>
            <div>
              <h3 className={styles.topicName}>DBMS &amp; SQL</h3>
              <p className={styles.topicCount}>Queries, normalization, indexing</p>
            </div>
          </Link>
          <Link href="/practice" className={styles.topicItem}>
            <span className={styles.topicIcon} aria-hidden>⚙️</span>
            <div>
              <h3 className={styles.topicName}>Operating Systems</h3>
              <p className={styles.topicCount}>Processes, memory, synchronization</p>
            </div>
          </Link>
          <Link href="/practice" className={styles.topicItem}>
            <span className={styles.topicIcon} aria-hidden>🧠</span>
            <div>
              <h3 className={styles.topicName}>General Aptitude</h3>
              <p className={styles.topicCount}>Quantitative and logical reasoning</p>
            </div>
          </Link>
        </div>
      </section>

      <div className={styles.sectionRowTwo}>
        <PlacementReadinessWidget readinessScore={readinessScore} />
        <RecentQuestionsWidget />
      </div>

      <div className={styles.sectionRowTwo}>
        <ProgressWidget progress={profile} level={profile.level || 1} />
        <UpcomingEventsWidget events={upcomingEvents} />
      </div>

      <ResourcesWidget resources={latestResources} />
    </div>
  );
}
