'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { challengeService } from '../../../../../lib/challengeService';
import { useAuth } from '../../../../../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  ChevronLeft,
  Users,
  Trophy,
  Target,
  Clock,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  HelpCircle,
  BarChart2,
  Shield
} from 'lucide-react';
import styles from '../../challenges.module.css';

const BUCKET_COLORS = ['#f87171', '#fbbf24', '#38bdf8', '#34d399', '#818cf8'];

export default function ChallengeAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();

  const isAdminOrHost = ['super_admin', 'college_admin', 'host'].includes(user?.role);

  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'questions' | 'anticheat'

  useEffect(() => {
    if (!isAdminOrHost) {
      router.push(`/challenges/${id}`);
      return;
    }
    const fetchAnalytics = async () => {
      try {
        const res = await challengeService.getChallengeAnalytics(id);
        setAnalytics(res);
      } catch (err) {
        console.error('Failed to load analytics', err);
        setError('Could not load analytics. You may not have permission.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [id, isAdminOrHost]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
        <BarChart2 size={40} style={{ margin: '0 auto 16px', color: 'var(--accent-primary)' }} />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-danger)' }}>
        <p>{error}</p>
        <button className={styles.btnSecondary} onClick={() => router.push(`/challenges/${id}`)} style={{ margin: '16px auto' }}>Back</button>
      </div>
    );
  }

  const { challenge, participation, scores, question_analytics, anti_cheat_summary, leaderboard } = analytics;

  const scoreDistributionData = Object.entries(scores.score_distribution).map(([range, count], idx) => ({
    range,
    count,
    color: BUCKET_COLORS[idx]
  }));

  const questionChartData = question_analytics.map((q, idx) => ({
    name: `Q${idx + 1}`,
    correct: q.correct_count,
    wrong: q.wrong_count,
    unanswered: q.unanswered_count,
    correctRate: q.correct_rate,
  }));

  const statCard = (icon, label, value, color) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '20px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--bg-glass)',
      border: '1px solid var(--border-color)',
      flex: '1',
      minWidth: '140px'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: 'var(--radius-sm)',
        background: `${color}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className={styles.btnSecondary} onClick={() => router.push(`/challenges/${id}`)} style={{ padding: '8px 12px' }}>
            <ChevronLeft size={16} /> Back
          </button>
          <div className={styles.titleSection}>
            <h1>Challenge Analytics</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{challenge.title}</p>
          </div>
        </div>
        <span className={`${styles.statusBadge} ${challenge.status === 'active' ? styles.statusActive : challenge.status === 'ended' ? styles.statusEnded : styles.statusPublished}`}>
          {challenge.status}
        </span>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
        {[
          { key: 'overview', label: 'Overview', icon: <TrendingUp size={14} /> },
          { key: 'questions', label: 'Question Analysis', icon: <BarChart2 size={14} /> },
          { key: 'anticheat', label: `Anti-Cheat Log (${anti_cheat_summary.length})`, icon: <Shield size={14} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              border: 'none',
              background: activeTab === tab.key ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ──────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* KPI Cards Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {statCard(<Users size={20} style={{ color: 'var(--accent-info)' }} />, 'Total Registered', participation.total_registrations, '#38bdf8')}
            {statCard(<CheckCircle size={20} style={{ color: 'var(--accent-success)' }} />, 'Completed', participation.total_completed, '#34d399')}
            {statCard(<TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />, 'Completion Rate', `${participation.completion_rate}%`, '#818cf8')}
            {statCard(<Trophy size={20} style={{ color: 'var(--accent-warning)' }} />, 'Avg Score', `${scores.avg_score} pts`, '#fbbf24')}
            {statCard(<Target size={20} style={{ color: 'var(--accent-success)' }} />, 'Avg %', `${scores.avg_percentage}%`, '#34d399')}
            {statCard(<AlertTriangle size={20} style={{ color: 'var(--accent-danger)' }} />, 'Flagged Users', anti_cheat_summary.length, '#f87171')}
          </div>

          {/* Score Distribution Chart */}
          <div className={styles.challengeCard} style={{ cursor: 'default' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} style={{ color: 'var(--accent-primary)' }} />
              Score Distribution (% Buckets)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDistributionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: '600' }}
                  itemStyle={{ color: 'var(--text-secondary)' }}
                />
                <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                  {scoreDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Leaderboard */}
          <div className={styles.challengeCard} style={{ cursor: 'default' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={16} style={{ color: 'var(--accent-warning)' }} />
              Top Performers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.slice(0, 10).map((item, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                return (
                  <div key={item.id || idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: idx < 3 ? 'var(--gradient-card)' : 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', width: '28px', textAlign: 'center' }}>
                        {medal || `#${idx + 1}`}
                      </span>
                      <div>
                        <p style={{ fontWeight: '600' }}>{item.users?.full_name || 'Anonymous'}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.users?.departments?.code || '—'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {item.correct_count}/{item.total_questions} ✓
                      </span>
                      <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>
                        {item.total_score} pts ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
              {leaderboard.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>No submissions yet.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ─── Question Analysis Tab ─────────────────────────────────── */}
      {activeTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Per-question chart */}
          <div className={styles.challengeCard} style={{ cursor: 'default' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} style={{ color: 'var(--accent-primary)' }} />
              Correct / Wrong / Unanswered per Question
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={questionChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: '600' }}
                  itemStyle={{ color: 'var(--text-secondary)' }}
                />
                <Bar dataKey="correct" name="Correct" fill="#34d399" radius={[3, 3, 0, 0]} />
                <Bar dataKey="wrong" name="Wrong" fill="#f87171" radius={[3, 3, 0, 0]} />
                <Bar dataKey="unanswered" name="Unanswered" fill="#6b6b80" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Question detail cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question_analytics.map((q, idx) => (
              <div key={q.question_id} className={styles.challengeCard} style={{ cursor: 'default', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Q{idx + 1} · {q.points} pts</span>
                      <span className={`${styles.statusBadge} ${styles.statusPublished}`}>{q.difficulty}</span>
                      <span className={`${styles.statusBadge} ${styles.statusDraft}`}>{q.type?.replace(/_/g, ' ')}</span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                      {q.statement?.length > 120 ? `${q.statement.substring(0, 120)}...` : q.statement}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: q.correct_rate >= 60 ? 'var(--accent-success)' : q.correct_rate >= 30 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>
                      {q.correct_rate}%
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>correct rate</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-success)' }}>
                    <CheckCircle size={12} /> {q.correct_count} correct
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-danger)' }}>
                    <XCircle size={12} /> {q.wrong_count} wrong
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <HelpCircle size={12} /> {q.unanswered_count} skipped
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <Users size={12} /> {q.total_attempts} total
                  </span>
                </div>
              </div>
            ))}
            {question_analytics.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No question data available yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ─── Anti-Cheat Log Tab ─────────────────────────────────────── */}
      {activeTab === 'anticheat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(251, 191, 36, 0.06)',
            border: '1px solid rgba(251, 191, 36, 0.15)',
            color: 'var(--accent-warning)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>
              Anti-cheat monitoring logs tab switches and window blur events for review purposes. 
              These events are indicative of potential distraction and are not conclusive proof of academic dishonesty.
            </span>
          </div>

          {anti_cheat_summary.length === 0 ? (
            <div className={styles.challengeCard} style={{ cursor: 'default', textAlign: 'center', padding: '40px' }}>
              <Shield size={32} style={{ color: 'var(--accent-success)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No suspicious activity detected during this challenge.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {anti_cheat_summary
                .sort((a, b) => b.total_events - a.total_events)
                .map((entry, idx) => (
                  <div key={entry.user_id || idx} className={styles.challengeCard} style={{
                    cursor: 'default',
                    padding: '16px 20px',
                    borderColor: entry.total_events >= 5 ? 'rgba(248, 113, 113, 0.3)' : 'var(--border-color)',
                    background: entry.total_events >= 5 ? 'rgba(248, 113, 113, 0.03)' : undefined
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '14px' }}>{entry.full_name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          User ID: {entry.user_id?.substring(0, 8)}...
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '20px', fontWeight: '800', color: entry.total_events >= 5 ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                            {entry.total_events}
                          </p>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total Events</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-secondary)' }}>{entry.tab_hidden_count}</p>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tab Hides</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-secondary)' }}>{entry.window_blur_count}</p>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Window Blurs</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
