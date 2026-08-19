'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import PageHeader from '../../../components/ui/PageHeader';
import { GraduationCap, BarChart3, Building, Award } from 'lucide-react';

export default function PrincipalDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/admin/dashboard/overview').catch(() => ({ data: null }));
        setOverview(res.data?.data || res.data || null);
      } catch (err) {
        console.error('Failed to load principal overview', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <PageHeader
        badge="Principal Executive Portal"
        badgeIcon={<GraduationCap size={14} />}
        title="Institutional Academic & Placement Governance"
        subtitle="High-Level Campus Analytics, Cross-Departmental Readiness & Institutional Benchmarks"
        breadcrumbs={[
          { label: 'Principal Portal', href: '/principal/dashboard' },
          { label: 'Executive Oversight' }
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Institutional Scope</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-warning)' }}>ASET Campus</h2>
          <span style={{ fontSize: '11px', color: 'var(--accent-success)' }}>Ahalia School of Engg. & Tech</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Engineering Departments</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-primary)' }}>6 Branches</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CSE, ECE, EEE, ME, CE, AI&DS</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Placement Readiness Metric</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-teal)' }}>86.2% Avg</h2>
          <span style={{ fontSize: '11px', color: 'var(--accent-success)' }}>Campus Standard Met</span>
        </div>
      </div>
    </div>
  );
}
