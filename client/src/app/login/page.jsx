'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import Link from 'next/link';

export default function LoginPage() {
  const { login, isAuthenticated, user, getDashboardPath } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      const targetPath = getDashboardPath(user.role);
      router.push(targetPath);
    }
  }, [isAuthenticated, user, router, getDashboardPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      const res = await login(email, password);
      const targetRole = res?.user?.role || 'student';
      const targetPath = getDashboardPath(targetRole);
      router.push(targetPath);
    } catch (err) {
      console.error(err);
      setLocalError(err.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.glowOrb} />
      <div className={styles.glowOrb2} />

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>PLACE@ASET</h1>
          <p className={styles.subtitle}>Single Authentication Portal for Students, Faculty, HODs, Placement Officers & Admins</p>
        </div>

        {localError && (
          <div className={styles.errorAlert} role="alert">
            <span>⚠️</span>
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="user@ahalia.edu or user@aset.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.options}>
            <label className={styles.rememberMe}>
              <input type="checkbox" className={styles.checkbox} />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footer} style={{ flexDirection: 'column', gap: '8px' }}>
          <div>
            <span>Student Candidate? </span>
            <Link href="/register" className={styles.signupLink} id="login-to-register-link">
              Student Registration
            </Link>
          </div>
          <div>
            <span>Faculty or Educator? </span>
            <Link href="/register/faculty" className={styles.signupLink} style={{ color: '#818cf8' }}>
              Faculty Registration
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
