'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './adminLogin.module.css';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState('super_admin');
  const [email, setEmail] = useState('admin@aset.ac.in');
  const [password, setPassword] = useState('Admin@12345');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'super_admin') {
      setEmail('admin@aset.ac.in');
      setPassword('Admin@12345');
    } else if (newRole === 'college_admin') {
      setEmail('collegeadmin@aset.ac.in');
      setPassword('Admin@12345');
    } else if (newRole === 'host') {
      setEmail('host@aset.ac.in');
      setPassword('Host@12345');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await login(email, password);
      const userRole = res?.user?.role || role;

      if (userRole === 'super_admin' || userRole === 'college_admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'host' || userRole === 'faculty') {
        router.push('/host/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.error || 'Invalid credentials or unauthorized role. Access denied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.glowOrb1} />
      <div className={styles.glowOrb2} />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.badge}>ENTERPRISE ADMIN & HOST PORTAL</div>
          <h1 className={styles.title}>PLACE@ASET</h1>
          <p className={styles.subtitle}>Administrative & Faculty Control Console</p>
        </div>

        {error && (
          <div className={styles.errorAlert} role="alert">
            <span>🛡️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="admin-role" className={styles.label}>Select Administrative Role</label>
            <select
              id="admin-role"
              className={styles.input}
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="super_admin">⚡ Super Admin (Full System Access)</option>
              <option value="college_admin">🏛️ College Admin (College & Department Access)</option>
              <option value="host">👨‍🏫 Host / Faculty (Questions, Challenges & Reviews)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="admin-email" className={styles.label}>Account Email</label>
            <input
              type="email"
              id="admin-email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aset.ac.in"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="admin-password" className={styles.label}>Password</label>
            <input
              type="password"
              id="admin-password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={isSubmitting}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#94a3b8' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Remember Me</span>
            </label>
            <a href="/forgot-password" style={{ color: '#818cf8', textDecoration: 'none' }}>Forgot Password?</a>
          </div>

          <div className={styles.infoBox}>
            <span className={styles.infoIcon}>🔒</span>
            <span className={styles.infoText}>
              Role: <strong>{role.toUpperCase()}</strong> &bull; Credential pre-filled for rapid setup. Authorized personnel only.
            </span>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
            id="admin-login-btn"
          >
            {isSubmitting ? 'Authenticating Role...' : `Login as ${role === 'super_admin' ? 'Super Admin' : role === 'college_admin' ? 'College Admin' : 'Host'}`}
          </button>
        </form>

        <div className={styles.footer}>
          <span>PLACE@ASET Security Architecture &bull; RBAC Protected</span>
        </div>
      </div>
    </main>
  );
}
