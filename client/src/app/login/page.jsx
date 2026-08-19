'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.css';
import Link from 'next/link';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

function LoginForm() {
  const { login, isAuthenticated, user, getDashboardPath } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

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
      setLocalError(err.error || err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '20px', color: '#06b6d4', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>
          <Sparkles size={14} /> PLACE@ASET Workspace
        </div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Single Authentication Portal for Candidates, Faculty, HODs, Placement Cell & Admins</p>
      </div>

      {registered && !localError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#34d399', fontSize: '13px', marginBottom: '18px', fontWeight: '600' }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>Account registered successfully! Please sign in with your credentials.</span>
        </div>
      )}

      {localError && (
        <div className={styles.errorAlert} role="alert" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
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
            placeholder="e.g. candidate@ahalia.edu"
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
          {isSubmitting ? 'Authenticating...' : 'Sign In to Workspace →'}
        </button>
      </form>

      <div className={styles.footer} style={{ flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
        <div>
          <span>New Candidate? </span>
          <Link href="/register" className={styles.signupLink} id="login-to-register-link">
            Register Candidate Account
          </Link>
        </div>
        <div>
          <span>Faculty or Educator? </span>
          <Link href="/register/faculty" className={styles.signupLink} style={{ color: '#06b6d4' }}>
            Faculty Portal Registration
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <div className={styles.glowOrb} />
      <div className={styles.glowOrb2} />
      <Suspense fallback={<div className={styles.card}>Loading workspace...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
