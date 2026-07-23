'use client';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { APP_NAME, APP_FULL_NAME } from '@/lib/constants';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('[ROOT PAGE TRACE] Authenticated user detected, redirecting to /dashboard');
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.glowOrb} />
        <div className={styles.glowOrb2} />
        <div className={styles.content}>
          <div className={styles.badge}>🚀 Now in Development</div>
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>{APP_NAME}</span>
          </h1>
          <p className={styles.subtitle}>{APP_FULL_NAME}</p>
          <p className={styles.description}>
            Compete. Practice. Contribute. Rank.<br />
            The ultimate platform for placement preparation.
          </p>
          <div className={styles.actions}>
            <a href="/register" className={styles.primaryBtn} id="hero-register-btn">
              Get Started
            </a>
            <a href="/login" className={styles.secondaryBtn} id="hero-login-btn">
              Sign In
            </a>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>20K+</span>
              <span className={styles.statLabel}>Students</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>50K+</span>
              <span className={styles.statLabel}>Questions</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>13</span>
              <span className={styles.statLabel}>Companies</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>100+</span>
              <span className={styles.statLabel}>Challenges</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
