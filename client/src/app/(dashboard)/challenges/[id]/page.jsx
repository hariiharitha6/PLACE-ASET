'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { challengeService } from '../../../../lib/challengeService';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { useConfirm } from '../../../../context/ConfirmContext';
import { 
  ChevronLeft, 
  Clock, 
  HelpCircle, 
  AlertCircle, 
  Play,
  Trophy,
  BookOpen,
  BarChart2,
  Archive,
  Globe,
  EyeOff
} from 'lucide-react';
import styles from '../challenges.module.css';

export default function ChallengeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const isAdminOrHost = ['super_admin', 'college_admin', 'host'].includes(user?.role);

  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await challengeService.getChallengeDetails(id);
        setChallenge(res);
      } catch (err) {
        console.error('Failed to load challenge details', err);
        setError('Challenge not found or not active.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading details...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-danger)' }}>
        <p>{error}</p>
        <button className={styles.btnSecondary} onClick={() => router.push('/challenges')} style={{ margin: '16px auto' }}>Back</button>
      </div>
    );
  }

  const handleStart = async () => {
    const isConfirmed = await confirm({
      title: 'Start Challenge Timed Arena',
      message: 'Once you start, the exam timer will begin and you cannot pause it. Are you ready to begin?',
      confirmText: 'Start Test',
      type: 'info',
    });
    if (isConfirmed) {
      router.push(`/challenges/${id}/arena`);
    }
  };

  const handleStatusAction = async (action) => {
    const isConfirmed = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Challenge`,
      message: `Are you sure you want to ${action} this challenge?`,
      type: 'warning',
    });
    if (!isConfirmed) return;
    setActionLoading(action);
    try {
      await challengeService[`${action}Challenge`](id);
      const res = await challengeService.getChallengeDetails(id);
      setChallenge(res);
      toast.success(`Challenge ${action}d successfully!`);
    } catch (err) {
      toast.error(`Failed to ${action}: ` + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const isChallengeEnded = challenge.status === 'ended';
  const isChallengeActive = challenge.status === 'active';

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className={styles.btnSecondary} onClick={() => router.push('/challenges')} style={{ padding: '8px 12px' }}>
          <ChevronLeft size={16} /> Back
        </button>
        <div className={styles.titleSection}>
          <h1>Challenge Details</h1>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}
      className="challenge-detail-grid"
      >
        {/* Main descriptions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.challengeCard} style={{ cursor: 'default' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{challenge.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              {challenge.description}
            </p>
          </div>

          <div className={styles.challengeCard} style={{ cursor: 'default' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} style={{ color: 'var(--accent-warning)' }} />
              <span>Instructions & Rules</span>
            </h3>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.7',
              whiteSpace: 'pre-wrap'
            }}>
              {challenge.instructions || (
                `1. Ensure a stable internet connection before starting.\n2. Do not switch tabs or blur the browser window. Tab switches are logged and reviewed.\n3. The quiz will auto-submit when the countdown timer hits 0.\n4. You can submit answers incrementally. Your latest answers are auto-saved every 30 seconds.`
              )}
            </div>
          </div>
        </div>

        {/* Info panel sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.challengeCard} style={{ cursor: 'default' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Challenge Summary</h3>
            
            <div className={styles.infoRow} style={{ gap: '12px' }}>
              <div className={styles.infoItem}>
                <Clock size={16} />
                <span>Time Limit: {challenge.duration_minutes} Mins</span>
              </div>
              <div className={styles.infoItem}>
                <HelpCircle size={16} />
                <span>Passing Mark: {challenge.passing_percentage}%</span>
              </div>
              {challenge.negative_marking && (
                <div className={styles.infoItem} style={{ color: 'var(--accent-danger)' }}>
                  <AlertCircle size={16} />
                  <span>Negative Marking Enabled (-{challenge.negative_marks_value})</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isChallengeActive ? (
                <button 
                  className={styles.btnPrimary} 
                  onClick={handleStart}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  <Play size={16} /> Start Challenge
                </button>
              ) : isChallengeEnded ? (
                <>
                  <button 
                    className={styles.btnPrimary}
                    onClick={() => router.push(`/challenges/${id}/results`)}
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  >
                    <Trophy size={16} /> View Leaderboard
                  </button>
                  <button 
                    className={styles.btnSecondary}
                    onClick={() => router.push(`/challenges/${id}/solutions`)}
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  >
                    <BookOpen size={16} /> View Solution Walkthrough
                  </button>
                </>
              ) : (
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  textAlign: 'center'
                }}>
                  This challenge is not currently active.
                </div>
              )}

              {/* Host/Admin Actions */}
              {isAdminOrHost && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Host Controls</p>
                  <button 
                    className={styles.btnSecondary}
                    onClick={() => router.push(`/challenges/${id}/analytics`)}
                    style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px' }}
                  >
                    <BarChart2 size={14} /> View Analytics
                  </button>
                  {challenge.status === 'draft' && (
                    <button 
                      className={styles.btnSecondary}
                      onClick={() => handleStatusAction('publish')}
                      disabled={actionLoading === 'publish'}
                      style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px' }}
                    >
                      <Globe size={14} /> {actionLoading === 'publish' ? 'Publishing...' : 'Publish Challenge'}
                    </button>
                  )}
                  {challenge.status === 'published' && (
                    <button 
                      className={styles.btnSecondary}
                      onClick={() => handleStatusAction('unpublish')}
                      disabled={actionLoading === 'unpublish'}
                      style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px' }}
                    >
                      <EyeOff size={14} /> {actionLoading === 'unpublish' ? 'Unpublishing...' : 'Unpublish'}
                    </button>
                  )}
                  {challenge.status !== 'archived' && (
                    <button 
                      onClick={() => handleStatusAction('archive')}
                      disabled={actionLoading === 'archive'}
                      style={{ 
                        width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px',
                        border: 'none', borderRadius: 'var(--radius-sm)',
                        background: 'rgba(107, 107, 128, 0.1)', 
                        color: 'var(--text-muted)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <Archive size={14} /> {actionLoading === 'archive' ? 'Archiving...' : 'Archive Challenge'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .challenge-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
