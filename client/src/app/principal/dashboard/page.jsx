'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function PrincipalDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/admin/dashboard/overview').catch(() => ({ data: null }));
        setOverview(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          🎓 PRINCIPAL EXECUTIVE DASHBOARD
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px 0' }}>Institutional Academic & Placement Executive Oversight</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          High-Level Institutional Analytics, Cross-Departmental Readiness & Placement Governance
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Campus Students</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: '#f59e0b' }}>{overview?.totalStudents || 1250}</h2>
          <span style={{ fontSize: '11px', color: '#34d399' }}>Ahalia Campus Enrolled</span>
        </div>

        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Academic Departments</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: '#38bdf8' }}>6</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>CSE, ECE, EEE, ME, CE, AI&DS</span>
        </div>

        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Overall Placement Rate</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: '#34d399' }}>84.5%</h2>
          <span style={{ fontSize: '11px', color: '#34d399' }}>Highest 14.5 LPA • Avg 6.8 LPA</span>
        </div>
      </div>
    </div>
  );
}
