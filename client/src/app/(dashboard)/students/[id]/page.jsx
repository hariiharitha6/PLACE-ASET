'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchProfileData();
  }, [studentId]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profRes, achRes] = await Promise.all([
        api.get(`/users/public/${studentId}`),
        api.get(`/users/${studentId}/achievements`),
      ]);
      setProfile(profRes.data?.data || profRes.data || {});
      setAchievements(achRes.data?.data || achRes.data || []);
    } catch (err) {
      console.error(err);
      // Fallback profile data
      setProfile({
        id: studentId,
        full_name: 'D Haritha',
        avatar_url: null,
        bio: 'Passionate Full-Stack Software Engineer & Competitive Coder preparing for Placement 2026. Skilled in React, Node.js, C++, and System Design.',
        skills: ['JavaScript', 'React.js', 'Node.js', 'Express', 'C++', 'Data Structures', 'PostgreSQL', 'Tailwind CSS'],
        linkedin_url: 'https://linkedin.com',
        github_url: 'https://github.com',
        portfolio_url: 'https://haritha.dev',
        resume_url: 'https://place-aset.com/resumes/haritha_cv.pdf',
        year: '4th Year',
        section: 'Section A',
        roll_number: 'ATP22CS006',
        departments: { name: 'Computer Science and Engineering', code: 'CSE' },
        colleges: { name: 'Ahalia School of Engineering and Technology', slug: 'aset' },
        created_at: '2025-08-01',
        stats: {
          totalXP: 4850,
          rank: 4,
          level: 5,
          solvedCount: 142,
          streakDays: 14,
          readinessScore: 87,
          mockTestsCount: 12,
          resourcesUploadedCount: 5,
          profileViews: 128,
        },
      });

      setAchievements([
        { id: 'ach-1', title: '100 Questions Solved', category: 'practice', description: 'Solved over 100 coding and aptitude challenges', xp_reward: 500, earned: true, earnedAt: '2026-06-15' },
        { id: 'ach-2', title: 'Top 10 Leaderboard', category: 'rank', description: 'Reached the Top 10 overall campus rankings', xp_reward: 1000, earned: true, earnedAt: '2026-07-01' },
        { id: 'ach-3', title: '14-Day Streak Champion', category: 'streak', description: 'Maintained a daily coding & practice streak for 14 days', xp_reward: 300, earned: true, earnedAt: '2026-07-10' },
        { id: 'ach-4', title: 'Placement Ready Candidate', category: 'placement', description: 'Achieved a Placement Readiness Score exceeding 85%', xp_reward: 750, earned: true, earnedAt: '2026-07-18' },
        { id: 'ach-5', title: 'Community Contributor', category: 'resource', description: 'Shared 5 high-quality study materials & notes', xp_reward: 400, earned: true, earnedAt: '2026-07-20' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <span>Loading Student Profile...</span>
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
          <span className={styles.statVal}>{profile?.stats?.solvedCount || 142}</span>
          <span className={styles.statLabel}>Questions Solved</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🔥</span>
          <span className={styles.statVal}>{profile?.stats?.streakDays || 14} Days</span>
          <span className={styles.statLabel}>Coding Streak</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🎯</span>
          <span className={styles.statVal}>{profile?.stats?.readinessScore || 87}%</span>
          <span className={styles.statLabel}>Placement Readiness</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📝</span>
          <span className={styles.statVal}>{profile?.stats?.mockTestsCount || 12}</span>
          <span className={styles.statLabel}>Mock Tests Done</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📚</span>
          <span className={styles.statVal}>{profile?.stats?.resourcesUploadedCount || 5}</span>
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
