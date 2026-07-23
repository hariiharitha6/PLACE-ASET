'use client';

import { useState } from 'react';
import styles from './adminSettings.module.css';

export default function AdminSettingsPage() {
  const [saveMsg, setSaveMsg] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveMsg('System settings saved and security policies reloaded.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>System Control & Security Settings</h1>
          <p className={styles.subtitle}>Configure institutional policies, SMTP mailers, RBAC role permissions, and API credentials</p>
        </div>
      </div>

      {saveMsg && (
        <div className={styles.alertSuccess}>
          <span>✅</span>
          <span>{saveMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className={styles.settingsForm}>
        {/* 1. College Information */}
        <div className={styles.sectionCard}>
          <h3>🏫 College Information</h3>
          <div className={styles.gridTwo}>
            <div className={styles.group}>
              <label>College Full Name</label>
              <input type="text" defaultValue="Ahalia School of Engineering and Technology" />
            </div>
            <div className={styles.group}>
              <label>Campus Slug Identifier</label>
              <input type="text" defaultValue="aset" disabled />
            </div>
          </div>
        </div>

        {/* 2. Academic & Registration Policy */}
        <div className={styles.sectionCard}>
          <h3>🎓 Academic Year & Registration Policy</h3>
          <div className={styles.gridTwo}>
            <div className={styles.group}>
              <label>Active Academic Year</label>
              <select defaultValue="2025-2026">
                <option value="2025-2026">2025 - 2026</option>
                <option value="2026-2027">2026 - 2027</option>
              </select>
            </div>
            <div className={styles.group}>
              <label>Self-Registration Mode</label>
              <select defaultValue="APPROVAL_REQUIRED">
                <option value="APPROVAL_REQUIRED">Open with Admin Verification</option>
                <option value="INSTANT">Instant Activation</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Security & RBAC */}
        <div className={styles.sectionCard}>
          <h3>🛡️ Security & Role Permissions Matrix</h3>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkItem}>
              <input type="checkbox" defaultChecked />
              <span>Enforce JWT Token Expiry & Automatic Cookie Refresh</span>
            </label>
            <label className={styles.checkItem}>
              <input type="checkbox" defaultChecked />
              <span>Enable Rate Limiting (20 requests / 15 mins for Auth)</span>
            </label>
            <label className={styles.checkItem}>
              <input type="checkbox" defaultChecked />
              <span>Require Faculty Verification for Question Bank Uploads</span>
            </label>
          </div>
        </div>

        {/* 4. API Keys & Webhooks */}
        <div className={styles.sectionCard}>
          <h3>🗝️ API Credentials & Webhook Endpoints</h3>
          <div className={styles.gridTwo}>
            <div className={styles.group}>
              <label>Supabase Service Role Key</label>
              <input type="password" defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." disabled />
            </div>
            <div className={styles.group}>
              <label>Resend Email SMTP Key</label>
              <input type="password" defaultValue="re_123456789_abcdefg" />
            </div>
          </div>
        </div>

        <div className={styles.btnBar}>
          <button type="submit" className={styles.primaryBtn}>Save Configuration Settings</button>
        </div>
      </form>
    </div>
  );
}
