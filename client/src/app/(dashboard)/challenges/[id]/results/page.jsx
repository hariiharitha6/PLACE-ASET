'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { challengeService } from '../../../../../lib/challengeService';
import { 
  ChevronLeft, 
  Trophy, 
  Target, 
  Clock, 
  Award,
  BookOpen
} from 'lucide-react';
import styles from '../../challenges.module.css';

export default function ChallengeResultsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [leaderboard, setLeaderboard] = useState([]);
  const [personalScore, setPersonalScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await challengeService.getChallengeResults(id);
        setLeaderboard(res.leaderboard || []);
        setPersonalScore(res.personalResult || null);
      } catch (err) {
        console.error('Failed to load challenge results', err);
        setError('Results are not yet released for this challenge.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading scorecard...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-danger)' }}>
        <p>{error}</p>
        <button className={styles.btnSecondary} onClick={() => router.push('/challenges')} style={{ margin: '16px auto' }}>Back</button>
      </div>
    );
  }

  const formatTime = (sec) => {
    if (!sec) return '0s';
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className={styles.btnSecondary} onClick={() => router.push('/challenges')} style={{ padding: '8px 12px' }}>
          <ChevronLeft size={16} /> Challenges
        </button>
        <div className={styles.titleSection}>
          <h1>Scorecard & Leaderboard</h1>
        </div>
      </div>

      {/* Personal Scorecard Overview */}
      {personalScore ? (
        <div className={styles.challengeCard} style={{
          cursor: 'default',
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-accent)',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Your Performance Summary</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <Award size={20} style={{ color: 'var(--accent-warning)' }} />
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rank Position</p>
                <p style={{ fontSize: '18px', fontWeight: '800' }}>#{personalScore.rank || '-'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <Trophy size={20} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score Earned</p>
                <p style={{ fontSize: '18px', fontWeight: '800' }}>{personalScore.total_score} pts</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <Target size={20} style={{ color: 'var(--accent-success)' }} />
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Accuracy Ratio</p>
                <p style={{ fontSize: '18px', fontWeight: '800' }}>{personalScore.correct_count} / {personalScore.total_questions}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <Clock size={20} style={{ color: 'var(--accent-info)' }} />
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Time Spent</p>
                <p style={{ fontSize: '18px', fontWeight: '800' }}>{formatTime(personalScore.total_time_seconds)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          No attempt registered for this challenge.
        </div>
      )}

      {/* Leaderboard Rankings */}
      <div className={styles.challengeCard} style={{ cursor: 'default' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={18} style={{ color: 'var(--accent-warning)' }} />
          <span>College Rankings Leaderboard</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {leaderboard.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No rankings posted yet.</p>
          ) : (
            leaderboard.map((item, index) => {
              const isTop3 = index < 3;
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
              
              return (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: '700', 
                      color: isTop3 ? 'var(--text-primary)' : 'var(--text-muted)',
                      width: '24px',
                      textAlign: 'center'
                    }}>
                      {medal || index + 1}
                    </span>
                    
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.users?.full_name}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Dept: {item.users?.departments?.code || '-'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>⏱️ {formatTime(item.total_time_seconds)}</span>
                    <span style={{ fontWeight: '700', color: 'var(--accent-primary)', minWidth: '60px', textAlign: 'right' }}>
                      {item.total_score} pts
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
