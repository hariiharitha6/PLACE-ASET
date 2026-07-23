'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import SearchableCollegeSelect from '../../components/SearchableCollegeSelect';
import SearchableDepartmentSelect from '../../components/SearchableDepartmentSelect';
import styles from './register.module.css';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  // Metadata states
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [year, setYear] = useState('1');
  const [section, setSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Load colleges and departments on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data: cols, error: colErr } = await supabase
          .from('colleges')
          .select('id, name, slug')
          .eq('is_active', true);
        
        const { data: depts, error: deptErr } = await supabase
          .from('departments')
          .select('id, name, code, college_id')
          .eq('is_active', true);

        if (colErr) console.error('Error fetching colleges:', colErr.message);
        if (deptErr) console.error('Error fetching departments:', deptErr.message);

        let fetchedCols = cols || [];
        if (colErr || !cols || cols.length === 0) {
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
          setCollegeId(asetCollege.id);
        } else if (processedCols.length > 0) {
          setCollegeId(processedCols[0].id);
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
        setCollegeId('aset');
      }
    };

    fetchMetadata();
  }, []);

  // Filter departments when college selection changes
  useEffect(() => {
    if (collegeId) {
      const filtered = departments.filter((d) => !d.college_id || d.college_id === collegeId);
      setFilteredDepartments(filtered.length > 0 ? filtered : departments);
    } else {
      setFilteredDepartments(departments);
    }
  }, [collegeId, departments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!fullName || !email || !password || !collegeId) {
      setLocalError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please check and try again.');
      return;
    }
    if (!departmentId) {
      setLocalError('Please select your department.');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await register({
        fullName,
        email,
        password,
        collegeId,
        departmentId: departmentId || null,
        year,
        section: section || null,
        rollNumber: rollNumber || null,
      });

      router.push('/verify-email');
    } catch (err) {
      console.error('[FRONTEND REGISTRATION TRACE] Registration error', err);
      setLocalError(err.error || 'Registration failed. Please check your inputs and try again.');
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
          <h1 className={styles.title}>PLACE@ASET</h1>
          <p className={styles.subtitle}>Create your candidate account to get started</p>
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
            <label htmlFor="email" className={styles.label}>Email Address *</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="john.doe@ahalia.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password *</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              className={styles.input}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            id="register-submit-btn"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <span>Already have an account? </span>
          <Link href="/login" className={styles.loginLink} id="register-to-login-link">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
