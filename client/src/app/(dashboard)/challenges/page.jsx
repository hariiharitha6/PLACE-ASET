'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { challengeService } from '../../../lib/challengeService';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Plus, 
  Play, 
  Edit, 
  Trash2, 
  Copy,
  ChevronRight
} from 'lucide-react';
import styles from './challenges.module.css';

export default function ChallengesListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const isAdminOrHost = ['super_admin', 'college_admin', 'host'].includes(user?.role);

  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      const res = await challengeService.listChallenges();
      setChallenges(res.challenges || []);
    } catch (err) {
      console.error('Failed to load challenges list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleCardClick = (id) => {
    router.push(`/challenges/${id}`);
  };

  const handleClone = async (e, id) => {
    e.stopPropagation();
    try {
      await challengeService.cloneChallenge(id);
      toast.success('Challenge cloned successfully!');
      loadChallenges();
    } catch (err) {
      toast.error('Failed to clone: ' + err.message);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: 'Delete Challenge',
      message: 'Are you sure you want to delete this challenge permanently? This action cannot be undone.',
      type: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await challengeService.deleteChallenge(id);
      toast.success('Challenge deleted.');
      loadChallenges();
    } catch (err) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'published': return styles.statusPublished;
      case 'ended': return styles.statusEnded;
      case 'draft': return styles.statusDraft;
      default: return '';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Weekly Preparation Challenges</h1>
          <p>Compete with students in your college to build coding and aptitude speed.</p>
        </div>
        {isAdminOrHost && (
          <button 
            className={styles.btnPrimary}
            onClick={() => router.push('/challenges/new')}
          >
            <Plus size={16} /> Create Challenge
          </button>
        )}
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading challenges...
        </div>
      ) : challenges.length === 0 ? (
        <div style={{
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          No weekly challenges scheduled yet. Check back soon!
        </div>
      ) : (
        <div className={styles.grid}>
          {challenges.map((c) => (
            <div 
              key={c.id} 
              className={styles.challengeCard}
              onClick={() => handleCardClick(c.id)}
            >
              <div className={styles.cardHeader}>
                <span className={`${styles.statusBadge} ${getStatusClass(c.status)}`}>
                  {c.status}
                </span>
                {isAdminOrHost && (
                  <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.btnAction} onClick={(e) => handleClone(e, c.id)} title="Clone">
                      <Copy size={12} />
                    </button>
                    <button className={styles.btnAction} onClick={() => router.push(`/challenges/${c.id}/edit`)} title="Edit">
                      <Edit size={12} />
                    </button>
                    <button className={styles.btnAction} onClick={(e) => handleDelete(e, c.id)} title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className={styles.cardTitle}>{c.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                  {c.description?.length > 100 ? `${c.description.substring(0, 100)}...` : c.description}
                </p>
              </div>

              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <Calendar size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span>Start: {formatDate(c.start_time)}</span>
                </div>
                <div className={styles.infoItem}>
                  <Calendar size={14} style={{ color: 'var(--accent-danger)' }} />
                  <span>End: {formatDate(c.end_time)}</span>
                </div>
                <div className={styles.infoItem}>
                  <Clock size={14} style={{ color: 'var(--accent-info)' }} />
                  <span>Duration: {c.duration_minutes} Minutes</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Passing Score: {c.passing_percentage}%
                </span>
                <span style={{
                  color: 'var(--accent-primary)',
                  fontWeight: '600',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {c.status === 'active' ? 'Participate' : 'View Info'} <ChevronRight size={14} />
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
