'use client';

import { useAuth } from '../../../context/AuthContext';
import styles from './adminProfile.module.css';

export default function AdminProfilePage() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Super Admin Profile & Security Credentials</h1>
          <p className={styles.subtitle}>Administrative identity management and security audit overview</p>
        </div>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.avatarLarge}>
          {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'SA'}
        </div>

        <div className={styles.infoArea}>
          <h2 className={styles.name}>{user?.full_name || 'System Super Admin'}</h2>
          <span className={styles.roleTag}>{user?.role || 'super_admin'}</span>
          <span className={styles.email}>{user?.email || 'admin@ahalia.edu'}</span>
        </div>
      </div>

      <div className={styles.secCard}>
        <h3>🔒 Account Security Overview</h3>
        <div className={styles.secRow}>
          <span>Super Admin Password Hash</span>
          <span className={styles.greenText}>Encrypted via Bcrypt / Supabase Auth</span>
        </div>
        <div className={styles.secRow}>
          <span>Multi-Factor Authentication (MFA)</span>
          <span className={styles.blueText}>Configured (TOTP Authenticator)</span>
        </div>
        <div className={styles.secRow}>
          <span>Active Session Timeout</span>
          <span>30 Days (Refresh Token Rotation)</span>
        </div>
      </div>
    </div>
  );
}
