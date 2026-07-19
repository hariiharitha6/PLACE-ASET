'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from '../login/login.module.css';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setLocalError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      await forgotPassword(email);
      setSuccessMessage('A password reset link has been sent to your email address.');
      setEmail('');
    } catch (err) {
      console.error(err);
      setLocalError(err.error || 'Failed to send reset email. Please try again.');
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
          <h1 className={styles.title}>Forgot Password</h1>
          <p className={styles.subtitle}>Enter your email to receive a recovery link</p>
        </div>

        {localError && (
          <div className={styles.errorAlert} role="alert">
            <span>⚠️</span>
            <span>{localError}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            backgroundColor: 'rgba(52, 211, 153, 0.1)',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            color: 'var(--accent-success)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }} role="alert">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="candidate@ahalia.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
            id="forgot-submit-btn"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/login" className={styles.signupLink} id="forgot-to-login-link">
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
