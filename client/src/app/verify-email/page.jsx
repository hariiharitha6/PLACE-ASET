'use client';

import styles from '../login/login.module.css';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <main className={styles.container}>
      <div className={styles.glowOrb} />
      <div className={styles.glowOrb2} />

      <div className={styles.card} style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '24px'
        }}>
          ✉️
        </div>
        
        <div className={styles.header}>
          <h1 className={styles.title}>Confirm Your Email</h1>
          <p className={styles.subtitle}>Registration completed successfully!</p>
        </div>

        <div style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          lineHeight: '1.7',
          marginBottom: '32px'
        }}>
          We have sent a verification link to your registered email address. 
          Please click the link in the email to verify and activate your account. 
          <br /><br />
          If you don&apos;t see it, please check your <strong>Spam</strong> or <strong>Junk</strong> folder.
        </div>

        <Link
          href="/login"
          className={styles.submitBtn}
          style={{
            display: 'block',
            textAlign: 'center',
            textDecoration: 'none',
            lineHeight: 'normal'
          }}
          id="verify-to-login-btn"
        >
          Back to Sign In
        </Link>
      </div>
    </main>
  );
}
