'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { supabase } from '../../../lib/supabase';
import SearchableCollegeSelect from '../../../components/SearchableCollegeSelect';
import SearchableDepartmentSelect from '../../../components/SearchableDepartmentSelect';
import api from '../../../lib/api';
import { Bell, User, Save, Upload, Trash2 } from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user, refetchProfile } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
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
      setBio(user.bio || '');
      setSkills(Array.isArray(user.skills) ? user.skills.join(', ') : user.skills || '');
      setLinkedinUrl(user.linkedin_url || '');
      setGithubUrl(user.github_url || '');
      setPortfolioUrl(user.portfolio_url || '');
      setResumeUrl(user.resume_url || '');
      setRollNumber(user.roll_number || '');
      setSection(user.section || '');
      if (user.college_id) setCollegeId(user.college_id);
      if (user.department_id) setDepartmentId(user.department_id);
    }
  }, [user]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data: cols } = await supabase
          .from('colleges')
          .select('id, name, slug')
          .eq('is_active', true);
        const { data: depts } = await supabase
          .from('departments')
          .select('id, name, code, college_id')
          .eq('is_active', true);

        if (!cols || cols.length === 0) {
          setColleges([
            { id: 'aset', name: 'ASET', slug: 'aset', full_name: 'Ahalia School of Engineering and Technology' }
          ]);
        } else {
          setColleges(cols);
        }
        setDepartments(depts || []);
      } catch (err) {
        console.error('Failed to fetch metadata', err);
        setColleges([
          { id: 'aset', name: 'ASET', slug: 'aset', full_name: 'Ahalia School of Engineering and Technology' }
        ]);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (collegeId) {
      const filtered = departments.filter((d) => d.college_id === collegeId);
      setFilteredDepartments(filtered);
    }
  }, [collegeId, departments]);

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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(event.target.result);
      toast.success('Photo preview ready. Click Save Profile to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    toast.info('Photo removed.');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const skillArray = skills
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const res = await api.put('/users/profile', {
        fullName,
        avatarUrl: avatarUrl || null,
        bio: bio || null,
        skills: skillArray,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        portfolioUrl: portfolioUrl || null,
        resumeUrl: resumeUrl || null,
        rollNumber: rollNumber || null,
        section: section || null,
        collegeId: collegeId || null,
        departmentId: departmentId || null
      });
      if (res.data?.success || res.status === 200) {
        await refetchProfile();
        toast.success('Profile & community preferences updated successfully!');
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
          <h1>Account & Profile Settings</h1>
          <p>Manage your public candidate profile, avatar, portfolio links, and alert preferences.</p>
        </div>
      </div>

      <div className={styles.tabBar}>
        <button className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('profile')}>
          <User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Public Profile Settings
        </button>
        <button className={`${styles.tab} ${activeTab === 'notifications' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('notifications')}>
          <Bell size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Notification Preferences
        </button>
      </div>

      {activeTab === 'profile' ? (
        <form className={styles.section} onSubmit={handleSaveProfile}>
          
          {/* Avatar Upload Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-glass)',
              border: '2px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '24px',
              color: 'var(--text-primary)'
            }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                fullName ? fullName.substring(0, 2).toUpperCase() : 'ST'
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#818cf8',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Upload size={14} /> Upload Photo (Max 5MB)
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>

              {avatarUrl && (
                <button type="button" onClick={handleRemovePhoto} style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" className={styles.formInput} required value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>Bio / About Candidate</label>
            <textarea
              className={styles.formInput}
              rows={3}
              placeholder="Write a brief professional summary for visiting campus recruiters..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              style={{ height: '80px', resize: 'vertical' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Skills & Technologies (comma separated)</label>
            <input type="text" className={styles.formInput} placeholder="JavaScript, React, Node.js, C++, Data Structures" value={skills} onChange={e => setSkills(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>LinkedIn Profile URL</label>
              <input type="url" className={styles.formInput} placeholder="https://linkedin.com/in/username" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>GitHub Profile URL</label>
              <input type="url" className={styles.formInput} placeholder="https://github.com/username" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Portfolio Website URL</label>
              <input type="url" className={styles.formInput} placeholder="https://yourwebsite.com" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Resume Download PDF Link</label>
              <input type="url" className={styles.formInput} placeholder="https://drive.google.com/your-resume.pdf" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>College</label>
            <SearchableCollegeSelect
              colleges={colleges}
              selectedId={collegeId}
              onChange={(val) => setCollegeId(val)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Department</label>
            <SearchableDepartmentSelect
              collegeId={collegeId}
              departments={filteredDepartments}
              selectedId={departmentId}
              onChange={(val) => setDepartmentId(val)}
              disabled={isSavingProfile}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Roll Number</label>
              <input type="text" className={styles.formInput} placeholder="E.g., ATP22CS006" value={rollNumber} onChange={e => setRollNumber(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Section</label>
              <input type="text" className={styles.formInput} placeholder="E.g., A" value={section} onChange={e => setSection(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={isSavingProfile}
            style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', marginTop: '12px' }}>
            <Save size={16} /> {isSavingProfile ? 'Saving...' : 'Save Public Profile'}
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
