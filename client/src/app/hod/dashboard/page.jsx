'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import PageHeader from '../../../components/ui/PageHeader';
import { Building2, Award, Users, BarChart3, Sparkles } from 'lucide-react';

export default function HODDashboardPage() {
  const { user } = useAuth();
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHODData() {
      try {
        const res = await api.get('/admin/dashboard/overview').catch(() => ({ data: null }));
        setDepartmentData(res.data?.data || res.data || null);
      } catch (err) {
        console.error('Failed to load HOD data', err);
      } finally {
        setLoading(false);
      }
    }
    loadHODData();
  }, []);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <PageHeader
        badge="HOD Governance Portal"
        badgeIcon={<Building2 size={14} />}
        title="Department Placement & Readiness Oversight"
        subtitle={`Executive Departmental Analytics, Candidate Readiness & Performance Reports for ${user?.department || 'Department'}`}
        breadcrumbs={[
          { label: 'HOD Portal', href: '/hod/dashboard' },
          { label: 'Overview' }
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Department Scope</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-primary)' }}>{user?.department || 'Engineering'}</h2>
          <span style={{ fontSize: '11px', color: 'var(--accent-success)' }}>Active Academic Cohort</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Placement Readiness Threshold</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-teal)' }}>88.6%</h2>
          <span style={{ fontSize: '11px', color: 'var(--accent-success)' }}>Eligible for Tier-1 Recruiters</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assessment Status</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-warning)' }}>Live Telemetry</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Continuous Practice Sync</span>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Department Cohort Readiness Breakdown</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
          Strictly scoped to your department. HOD access grants read-only progress analytics for student batches across core modules.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '10px' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pre-Final & Final Year Candidates</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-success)', margin: '6px 0' }}>Enrolled & Tracked</div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily Practice & Diagnostic Testing Active</span>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Technical Core Coverage</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-primary)', margin: '6px 0' }}>85.4% Benchmark</div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Data Structures, SQL, OS & Aptitude</span>
          </div>
        </div>
      </div>
    </div>
  );
}
