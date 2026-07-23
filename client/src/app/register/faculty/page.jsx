'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import Link from 'next/link';
import styles from '../../login/login.module.css';

export default function FacultyRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    employeeId: '',
    phone: '',
    collegeId: '',
    departmentId: '',
    designation: 'Assistant Professor',
  });

  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMetaData() {
      try {
        const [colRes, deptRes, desigRes] = await Promise.all([
          api.get('/admin/colleges').catch(() => ({ data: [] })),
          api.get('/admin/departments').catch(() => ({ data: [] })),
          api.get('/admin/designations').catch(() => ({ data: [] })),
        ]);
        if (colRes.data) setColleges(colRes.data);
        if (deptRes.data) setDepartments(deptRes.data);
        if (desigRes.data) setDesignations(desigRes.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadMetaData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName || !formData.employeeId) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/auth/register-faculty', formData);
      alert('Faculty Registration submitted successfully! Please sign in.');
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Faculty Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.glowOrb} />
      <div className={styles.glowOrb2} />

      <div className={styles.card} style={{ maxWidth: '520px' }}>
        <div className={styles.header}>
          <h1 className={styles.title}>Faculty Registration</h1>
          <p className={styles.subtitle}>Create your educator or institutional account</p>
        </div>

        {error && (
          <div className={styles.errorAlert} role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name *</label>
            <input
              type="text"
              name="fullName"
              className={styles.input}
              placeholder="Dr. Suresh Kumar"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Employee ID *</label>
              <input
                type="text"
                name="employeeId"
                className={styles.input}
                placeholder="EMP-1042"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number</label>
              <input
                type="text"
                name="phone"
                className={styles.input}
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Department</label>
              <select name="departmentId" className={styles.input} value={formData.departmentId} onChange={handleChange}>
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Designation</label>
              <select name="designation" className={styles.input} value={formData.designation} onChange={handleChange}>
                {designations.length > 0 ? (
                  designations.map((des) => (
                    <option key={des.id} value={des.title}>{des.title}</option>
                  ))
                ) : (
                  <>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Placement Officer">Placement Officer</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Principal">Principal</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Institutional Email *</label>
            <input
              type="email"
              name="email"
              className={styles.input}
              placeholder="faculty@aset.ac.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              className={styles.input}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Registering...' : 'Complete Faculty Registration'}
          </button>
        </form>

        <div className={styles.footer} style={{ marginTop: '16px' }}>
          <span>Already registered? </span>
          <Link href="/login" className={styles.signupLink}>
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
