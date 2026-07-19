'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../lib/api';
import { Shield, Bell, User, Mail, Save } from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user, refetchProfile } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification Preferences State
  const [prefs, setPrefs] = useState({
    challenge_reminders: true,
    challenge_results: true,
    achievement_alerts: true,
    resource_alerts: true,
    community_updates: true,
    email_notifications: true
  });
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || '');
      setRollNumber(user.roll_number || '');
      setSection(user.section || '');
    }
  }, [user]);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const res = await api.get('/users/notifications/preferences');
        if (res.data?.success) {
          setPrefs(res.data.data);
        }
      } catch (e) {
        console.error('Failed to load preferences', e);
      }
    };
    if (activeTab === 'notifications') {
      loadPrefs();
    }
  }, [activeTab]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.put('/users/profile', {
        fullName,
        avatarUrl: avatarUrl || null,
        rollNumber: rollNumber || null,
        section: section || null
      });
      if (res.data?.success) {
        await refetchProfile();
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error('Failed to update profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleTogglePref = (key) => {
    setPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    try {
      const res = await api.put('/users/notifications/preferences', prefs);
      if (res.data?.success) {
        toast.success('Notification preferences saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save preferences: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSavingPrefs(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Account Settings</h1>
          <p>Manage your profile info, avatar and notification alerts.</p>
        </div>
      </div>

      <div className={styles.tabBar}>
        <button className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('profile')}>
          <User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Profile Settings
        </button>
        <button className={`${styles.tab} ${activeTab === 'notifications' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('notifications')}>
          <Bell size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Notification Preferences
        </button>
      </div>

      {activeTab === 'profile' ? (
        <form className={styles.section} onSubmit={handleSaveProfile}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" className={styles.formInput} required value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>Avatar URL</label>
            <input type="url" className={styles.formInput} placeholder="Link to public image URL" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>Roll Number (optional)</label>
            <input type="text" className={styles.formInput} placeholder="E.g., 20CS101" value={rollNumber} onChange={e => setRollNumber(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>Section (optional)</label>
            <input type="text" className={styles.formInput} placeholder="E.g., A" value={section} onChange={e => setSection(e.target.value)} />
          </div>

          <button type="submit" disabled={isSavingProfile}
            style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            <Save size={16} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      ) : (
        <div className={styles.section}>
          <div className={styles.prefRow}>
            <div className={styles.prefInfo}>
              <span className={styles.prefTitle}>Challenge Reminders</span>
              <span className={styles.prefDesc}>Get alerts when a new weekly challenge is scheduled or starts.</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={prefs.challenge_reminders} onChange={() => handleTogglePref('challenge_reminders')} />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.prefRow}>
            <div className={styles.prefInfo}>
              <span className={styles.prefTitle}>Challenge Results</span>
              <span className={styles.prefDesc}>Receive notifications when grading and final scores are posted.</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={prefs.challenge_results} onChange={() => handleTogglePref('challenge_results')} />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.prefRow}>
            <div className={styles.prefInfo}>
              <span className={styles.prefTitle}>Achievement & Badges</span>
              <span className={styles.prefDesc}>Notifications when you unlock badges or level up.</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={prefs.achievement_alerts} onChange={() => handleTogglePref('achievement_alerts')} />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.prefRow}>
            <div className={styles.prefInfo}>
              <span className={styles.prefTitle}>Resource Alerts</span>
              <span className={styles.prefDesc}>Get notified when new placement notes or syllabi are published.</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={prefs.resource_alerts} onChange={() => handleTogglePref('resource_alerts')} />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.prefRow}>
            <div className={styles.prefInfo}>
              <span className={styles.prefTitle}>Community Updates</span>
              <span className={styles.prefDesc}>Receive alerts when your submitted question gets approved or commented on.</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={prefs.community_updates} onChange={() => handleTogglePref('community_updates')} />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.prefRow}>
            <div className={styles.prefInfo}>
              <span className={styles.prefTitle}>Email Notifications</span>
              <span className={styles.prefDesc}>Forward alerts directly to your registered email address.</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={prefs.email_notifications} onChange={() => handleTogglePref('email_notifications')} />
              <span className={styles.slider}></span>
            </label>
          </div>

          <button onClick={handleSavePrefs} disabled={isSavingPrefs}
            style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            <Save size={16} /> {isSavingPrefs ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
        </div>
      )}
    </div>
  );
}
