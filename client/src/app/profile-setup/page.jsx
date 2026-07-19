'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import styles from '../register/register.module.css';

export default function ProfileSetupPage() {
  const { user, updateProfile, isLoading } = useAuth();
  const router = useRouter();

  // Metadata states
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  // Form states
  const [fullName, setFullName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [year, setYear] = useState('1');
  const [section, setSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load profile values when user object is loaded
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setYear(user.year || '1');
      setSection(user.section || '');
      setRollNumber(user.roll_number || '');
      if (user.college_id) setCollegeId(user.college_id);
      if (user.department_id) setDepartmentId(user.department_id);
    }
  }, [user]);

  // Load colleges and departments on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data: cols } = await supabase
          .from('colleges')
          .select('id, name')
          .eq('is_active', true);
        
        const { data: depts } = await supabase
          .from('departments')
          .select('id, name, code, college_id')
          .eq('is_active', true);

        setColleges(cols || []);
        setDepartments(depts || []);

        if (cols && cols.length > 0) {
          setCollegeId(prev => prev || cols[0].id);
        }
      } catch (err) {
        console.error('Failed to load form metadata', err);
      }
    };

    fetchMetadata();
  }, []);

  // Filter departments when college selection changes
  useEffect(() => {
    if (collegeId) {
      const filtered = departments.filter((d) => d.college_id === collegeId);
      setFilteredDepartments(filtered);
      
      // Keep selected department if it belongs to the selected college, else select first
      const belongs = filtered.some(d => d.id === departmentId);
      if (!belongs) {
        setDepartmentId(filtered.length > 0 ? filtered[0].id : '');
      }
    }
  }, [collegeId, departments, departmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !collegeId) {
      setLocalError('Full Name and College selection are required.');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await updateProfile({
        fullName,
        collegeId,
        departmentId: departmentId || null,
        year,
        section: section || null,
        rollNumber: rollNumber || null,
      });

      // On successful onboarding, go to home page
      router.push('/');
    } catch (err) {
      console.error(err);
      setLocalError(err.error || 'Failed to update academic profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.05)',
          borderLeftColor: 'var(--accent-primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.glowOrb} />
      <div className={styles.glowOrb2} />

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Complete Your Profile</h1>
          <p className={styles.subtitle}>Specify your academic details to access PLACE@ASET</p>
        </div>

        {localError && (
          <div className={styles.errorAlert} role="alert">
            <span>⚠️</span>
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="fullName" className={styles.label}>Full Name *</label>
            <input
              type="text"
              id="fullName"
              className={styles.input}
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="college" className={styles.label}>College *</label>
            <select
              id="college"
              className={styles.select}
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              disabled={isSubmitting}
              required
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="department" className={styles.label}>Department</label>
            <select
              id="department"
              className={styles.select}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={isSubmitting || filteredDepartments.length === 0}
            >
              <option value="">Select Department</option>
              {filteredDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="year" className={styles.label}>Current Academic Year</label>
            <select
              id="year"
              className={styles.select}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="section" className={styles.label}>Section</label>
            <input
              type="text"
              id="section"
              className={styles.input}
              placeholder="e.g. A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="rollNumber" className={styles.label}>Roll Number / Student ID</label>
            <input
              type="text"
              id="rollNumber"
              className={styles.input}
              placeholder="A2305221001"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
            id="profile-setup-submit-btn"
          >
            {isSubmitting ? 'Saving profile...' : 'Complete Onboarding'}
          </button>
        </form>
      </div>
    </main>
  );
}
