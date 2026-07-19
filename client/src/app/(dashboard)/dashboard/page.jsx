'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { dashboardService } from '../../../lib/dashboardService';
import ChallengeWidget from '../../../components/widgets/ChallengeWidget';
import ProgressWidget from '../../../components/widgets/ProgressWidget';
import LeaderboardWidget from '../../../components/widgets/LeaderboardWidget';
import RecentQuestionsWidget from '../../../components/widgets/RecentQuestionsWidget';
import ResourcesWidget from '../../../components/widgets/ResourcesWidget';
import ContributionsWidget from '../../../components/widgets/ContributionsWidget';
import UpcomingEventsWidget from '../../../components/widgets/UpcomingEventsWidget';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await dashboardService.getSummary();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
        setError('Could not fetch dashboard summary data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.05)',
          borderLeftColor: 'var(--accent-primary)',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          animation: 'spin 1s linear infinite',
          marginRight: '12px'
        }} />
        <span>Loading Arena Panel...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'rgba(248, 113, 113, 0.05)',
        border: '1px solid rgba(248, 113, 113, 0.1)',
        color: 'var(--accent-danger)',
        textAlign: 'center',
        margin: '40px auto',
        maxWidth: '480px'
      }}>
        <p style={{ fontWeight: '600', marginBottom: '8px' }}>⚠️ Error loading dashboard</p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{error}</p>
      </div>
    );
  }

  const {
    profile = {},
    weeklyChallenge = null,
    practiceProgress = {},
    leaderboardPreview = [],
    upcomingEvents = [],
    latestResources = [],
    contributionsCount = 0
  } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome Banner */}
      <div style={{
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.08) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(10px)',
          pointerEvents: 'none'
        }} />
        <h1 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: 'var(--text-primary)',
          marginBottom: '8px',
          letterSpacing: '-0.01em'
        }}>
          Welcome Back, {user?.full_name?.split(' ')[0] || 'Candidate'}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px', lineHeight: '1.6' }}>
          Keep up your learning streak! Solve practice questions, check the latest resource uploads, or get ready for this week&apos;s coding challenge.
        </p>
      </div>

      {/* Grid Canvas Section 1 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
        gap: '24px'
      }}
      className="dashboard-grid-1"
      >
        <ChallengeWidget challenge={weeklyChallenge} />
        <ProgressWidget progress={profile} level={profile.level} />
      </div>

      {/* Grid Canvas Section 2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '24px'
      }}
      className="dashboard-grid-2"
      >
        <LeaderboardWidget leaderboard={leaderboardPreview} />
        <RecentQuestionsWidget />
      </div>

      {/* Grid Canvas Section 3 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
        gap: '24px'
      }}
      className="dashboard-grid-3"
      >
        <ResourcesWidget resources={latestResources} />
        <ContributionsWidget count={contributionsCount} />
        <UpcomingEventsWidget events={upcomingEvents} />
      </div>

      {/* Global CSS responsive layout overrides */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .dashboard-grid-1,
          .dashboard-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 1200px) {
          .dashboard-grid-3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
