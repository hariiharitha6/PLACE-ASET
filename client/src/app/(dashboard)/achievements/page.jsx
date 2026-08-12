'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { certificateService } from '../../../lib/certificateService';
import { 
  Trophy, Award, Sparkles, CheckCircle2, Lock, Flame, 
  Target, MessageSquare, Zap, Star, Shield 
} from 'lucide-react';
import styles from '../certificates/certificates.module.css';

export default function AchievementsGalleryPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await certificateService.getUserAchievements();
      setAchievements(res || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load achievement badges');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const handleCheckAchievements = async () => {
    setChecking(true);
    try {
      const res = await certificateService.checkAndUnlockAchievements();
      if (res.newly_unlocked?.length > 0) {
        toast.success(`🎉 Congratulations! Unlocked: ${res.newly_unlocked.join(', ')}`);
      } else {
        toast.info('All eligible achievements already synced!');
      }
      loadAchievements();
    } catch (err) {
      toast.error('Failed to sync achievements');
    } finally {
      setChecking(false);
    }
  };

  const getTierClass = (tier) => {
    switch ((tier || '').toLowerCase()) {
      case 'silver': return styles.tierSilver;
      case 'gold': return styles.tierGold;
      case 'platinum': return styles.tierPlatinum;
      case 'legend': return styles.tierLegend;
      default: return styles.tierBronze;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy size={26} style={{ color: '#f59e0b' }} /> Digital Achievements & Badge Gallery
          </h1>
          <p>Earn XP rewards, unlock coding streak milestones, challenge mastery badges, and community honors.</p>
        </div>

        <button onClick={handleCheckAchievements} disabled={checking}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
          <Sparkles size={16} /> {checking ? 'Syncing Progress...' : 'Check & Unlock Badges'}
        </button>
      </div>

      {/* Achievement Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Loading digital achievement badges...</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {achievements.map(ach => (
            <div key={ach.id} className={styles.certCard} style={{ opacity: ach.is_unlocked ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`${styles.tierBadge} ${getTierClass(ach.tier)}`}>
                  {ach.tier || 'Bronze'} Tier
                </span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={14} /> +{ach.xp_reward || 50} XP
                </span>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: ach.is_unlocked ? 'rgba(245,158,11,0.15)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ach.is_unlocked ? '#f59e0b' : 'var(--text-muted)' }}>
                  {ach.is_unlocked ? <Trophy size={24} /> : <Lock size={24} />}
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{ach.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{ach.description}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                {ach.is_unlocked ? (
                  <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Unlocked on {new Date(ach.unlocked_at || Date.now()).toLocaleDateString()}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} /> Locked Badge
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
