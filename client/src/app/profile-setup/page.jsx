'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import SearchableCollegeSelect from '../../components/SearchableCollegeSelect';
import SearchableDepartmentSelect from '../../components/SearchableDepartmentSelect';
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
          .select('id, name, slug')
          .eq('is_active', true);
        
        const { data: depts } = await supabase
          .from('departments')
          .select('id, name, code, college_id')
          .eq('is_active', true);

        let fetchedCols = cols || [];
        if (!cols || cols.length === 0) {
          fetchedCols = [
            {
              id: 'aset',
              name: 'ASET',
              slug: 'aset',
              full_name: 'Ahalia School of Engineering and Technology'
            }
          ];
        }

        const processedCols = fetchedCols.map(c => {
          if (c.slug === 'aset' || c.name.toLowerCase().includes('ahalia')) {
            return {
              ...c,
              name: 'ASET',
              full_name: 'Ahalia School of Engineering and Technology'
            };
          }
          return {
            ...c,
            full_name: c.name
          };
        });

        const hasAset = processedCols.some(c => c.name === 'ASET');
        if (!hasAset) {
          processedCols.unshift({
            id: 'aset',
            name: 'ASET',
            slug: 'aset',
            full_name: 'Ahalia School of Engineering and Technology'
          });
        }

        processedCols.sort((a, b) => {
          if (a.name === 'ASET') return -1;
          if (b.name === 'ASET') return 1;
          return a.name.localeCompare(b.name);
        });

        setColleges(processedCols);
        setDepartments(depts || []);

        const asetCollege = processedCols.find(c => c.name === 'ASET');
        if (asetCollege) {
          setCollegeId(prev => prev || asetCollege.id);
        } else if (processedCols.length > 0) {
          setCollegeId(prev => prev || processedCols[0].id);
        }
      } catch (err) {
        console.error('Failed to load form metadata', err);
        const fallback = [
          {
            id: 'aset',
            name: 'ASET',
            full_name: 'Ahalia School of Engineering and Technology'
          }
        ];
        setColleges(fallback);
        setCollegeId(prev => prev || 'aset');
      }
    };

    fetchMetadata();
  }, []);

  // Filter departments when college selection changes
  useEffect(() => {
    if (collegeId) {
      const filtered = departments.filter((d) => d.college_id === collegeId);
      setFilteredDepartments(filtered);
    }
  }, [collegeId, departments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !collegeId) {
      setLocalError('Full Name and College selection are required.');
      return;
    }
    if (!departmentId) {
      setLocalError('Please select your department.');
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
            <SearchableCollegeSelect
              colleges={colleges}
              selectedId={collegeId}
              onChange={(val) => setCollegeId(val)}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="department" className={styles.label}>Department *</label>
            <SearchableDepartmentSelect
              collegeId={collegeId}
              departments={filteredDepartments}
              selectedId={departmentId}
              onChange={(val) => setDepartmentId(val)}
              disabled={isSubmitting}
            />
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
