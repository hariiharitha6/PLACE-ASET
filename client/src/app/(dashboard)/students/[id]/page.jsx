'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import styles from './studentProfile.module.css';

export default function PublicStudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id;

  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const [profRes, achRes] = await Promise.all([
        api.get(`/users/public/${studentId}`),
        api.get(`/users/${studentId}/achievements`),
      ]);
      setProfile(profRes.data?.data || profRes.data || {});
      setAchievements(achRes.data?.data || achRes.data || []);
    } catch (err) {
      setProfile(null);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <span>Loading Student Profile...</span>
      </div>
    );
  }

  if (!profile || !profile.id) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', marginTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>Student Profile Not Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
            The requested student profile does not exist or has been made private.
          </p>
          <button onClick={() => router.push('/leaderboard')} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--gradient-primary)', color: '#fff', fontWeight: '600', cursor: 'pointer', border: 'none' }}>
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <div className={styles.container}>
      {/* Cover Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerPattern} />
      </div>

      {/* Main Profile Header Card */}
      <div className={styles.profileHeaderCard}>
        <div className={styles.avatarWrap}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarFallback}>{initials}</div>
          )}
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <div>
              <h1 className={styles.fullName}>{profile?.full_name}</h1>
              <p className={styles.academicSubtitle}>
                {profile?.departments?.code || 'CSE'} Department &bull; {profile?.year || '4th Year'} &bull; {profile?.colleges?.name || 'ASET Campus'}
              </p>
            </div>
            <div className={styles.actionRow}>
              <button
                className={styles.compareBtn}
                onClick={() => router.push(`/students/compare?user1=${studentId}&user2=user-2`)}
              >
                ⚖️ Compare Student
              </button>
              {profile?.resume_url && (
                <a href={profile.resume_url} target="_blank" rel="noreferrer" className={styles.resumeBtn}>
                  📄 Download Resume
                </a>
              )}
            </div>
          </div>

          <p className={styles.bio}>{profile?.bio || 'No bio specified.'}</p>

          {/* Social Links */}
          <div className={styles.linksRow}>
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className={styles.linkTag}>
                💼 LinkedIn
              </a>
            )}
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className={styles.linkTag}>
                🐙 GitHub
              </a>
            )}
            {profile?.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className={styles.linkTag}>
                🌐 Portfolio Website
              </a>
            )}
            <span className={styles.viewBadge}>👁️ {profile?.stats?.profileViews || 128} Profile Views</span>
          </div>

          {/* Skill Tags */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className={styles.skillRow}>
              {profile.skills.map((skill, idx) => (
                <span key={idx} className={styles.skillBadge}>{skill}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 8 Public Key Metrics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⭐</span>
          <span className={styles.statVal}>{profile?.stats?.totalXP || 4850}</span>
          <span className={styles.statLabel}>Total XP</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🏆</span>
          <span className={styles.statVal}>#{profile?.stats?.rank || 4}</span>
          <span className={styles.statLabel}>Campus Rank</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⚡</span>
          <span className={styles.statVal}>Level {profile?.stats?.level || 5}</span>
          <span className={styles.statLabel}>Current Level</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✅</span>
          <span className={styles.statVal}>{profile?.stats?.solvedCount || 0}</span>
          <span className={styles.statLabel}>Questions Solved</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🔥</span>
          <span className={styles.statVal}>{profile?.stats?.streakDays || 0} Days</span>
          <span className={styles.statLabel}>Coding Streak</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🎯</span>
          <span className={styles.statVal}>{profile?.stats?.readinessScore || 0}%</span>
          <span className={styles.statLabel}>Placement Readiness</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📝</span>
          <span className={styles.statVal}>{profile?.stats?.mockTestsCount || 0}</span>
          <span className={styles.statLabel}>Mock Tests Done</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📚</span>
          <span className={styles.statVal}>{profile?.stats?.resourcesUploadedCount || 0}</span>
          <span className={styles.statLabel}>Resources Shared</span>
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3>🏅 Earned Achievements & Badges</h3>
          <span className={styles.badgeCount}>{achievements.filter(a => a.earned).length} Badges</span>
        </div>

        <div className={styles.achievementsGrid}>
          {achievements.map((ach) => (
            <div key={ach.id} className={`${styles.achCard} ${ach.earned ? styles.achEarned : styles.achLocked}`}>
              <div className={styles.achIcon}>
                {ach.category === 'practice' ? '🎯' : ach.category === 'rank' ? '🏆' : ach.category === 'streak' ? '🔥' : '🏅'}
              </div>
              <div>
                <h4 className={styles.achTitle}>{ach.title}</h4>
                <p className={styles.achDesc}>{ach.description}</p>
                <div className={styles.achFooter}>
                  <span className={styles.xpTag}>+{ach.xp_reward} XP</span>
                  {ach.earned && <span className={styles.earnedDate}>Earned {ach.earnedAt}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
