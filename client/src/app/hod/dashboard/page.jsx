'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

export default function HODDashboardPage() {
  const { user } = useAuth();
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHODData() {
      try {
        const res = await api.get('/admin/dashboard/overview').catch(() => ({ data: null }));
        setDepartmentData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHODData();
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          🏛️ HEAD OF DEPARTMENT (HOD) PORTAL
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px 0' }}>Department Governance & Placement Readiness</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          Executive Departmental Analytics, Student Placement Readiness & Performance Reports
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Department Students</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: '#38bdf8' }}>450</h2>
          <span style={{ fontSize: '11px', color: '#34d399' }}>98.2% Enrolled & Verified</span>
        </div>

        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Placement Readiness Rate</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: '#34d399' }}>88.6%</h2>
          <span style={{ fontSize: '11px', color: '#34d399' }}>Eligible for Tier 1 Drives</span>
        </div>

        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Department Faculty Count</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: '#fbbf24' }}>14</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Professors & Instructors</span>
        </div>
      </div>

      <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Department Placement & Assessment Readiness Breakdown</h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          Strictly scoped to your department. HOD access grants full read-only progress analytics for student cohorts.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '10px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>4th Year Placement Eligibility</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', margin: '6px 0' }}>112 / 120 Candidates</div>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>CGPA &gt; 7.0 & Zero Active Backlogs</span>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Mock Technical Assessment Avg</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#818cf8', margin: '6px 0' }}>84.2 / 100 Marks</div>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Data Structures, SQL & OS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
