'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import PageHeader from '../../../components/ui/PageHeader';
import EmptyState from '../../../components/ui/EmptyState';
import { Briefcase, FileText, CheckCircle2, Building, Sparkles } from 'lucide-react';

export default function PlacementCellDashboardPage() {
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlacementData() {
      try {
        const [driveRes, stRes] = await Promise.allSettled([
          api.get('/admin/placement-drives'),
          api.get('/admin/students'),
        ]);
        if (driveRes.status === 'fulfilled') {
          setDrives(driveRes.value.data?.data || driveRes.value.data || []);
        }
        if (stRes.status === 'fulfilled') {
          setStudents(stRes.value.data?.data || stRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load placement data', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlacementData();
  }, []);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <PageHeader
        badge="Placement Cell Portal"
        badgeIcon={<Briefcase size={14} />}
        title="Campus Recruitment & Placement Readiness"
        subtitle="Student Placement Eligibility, Resume Completion & Corporate Drive Management"
        breadcrumbs={[
          { label: 'Placement Cell', href: '/placement/dashboard' },
          { label: 'Drives' }
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Registered Candidates</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-primary)' }}>{students.length}</h2>
          <span style={{ fontSize: '11px', color: 'var(--accent-success)' }}>Campus Enrolled</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Corporate Drives</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-teal)' }}>{drives.length}</h2>
          <span style={{ fontSize: '11px', color: 'var(--accent-teal)' }}>Active Placement Drives</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AI Resume Verification</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-warning)' }}>Ready</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ATS Scoring Active</span>
        </div>
      </div>

      {/* Active Campus Drives Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Active Corporate Recruitment Drives</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Sparkles size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
            <p>Loading placement drives from database...</p>
          </div>
        ) : drives.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={32} />}
            title="No Active Placement Drives"
            description="There are currently no active corporate placement drives registered. When drives are published by the Placement Officer, they will appear here."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Company Name</th>
                  <th style={{ padding: '12px' }}>Package Offer (LPA)</th>
                  <th style={{ padding: '12px' }}>CGPA Cutoff</th>
                  <th style={{ padding: '12px' }}>Eligible Branches</th>
                  <th style={{ padding: '12px' }}>Drive Status</th>
                </tr>
              </thead>
              <tbody>
                {drives.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{d.companyName || d.company_name || d.title}</td>
                    <td style={{ padding: '12px', color: 'var(--accent-teal)', fontWeight: '700' }}>{d.packageLpa || d.package_lpa || 'Competitive'}</td>
                    <td style={{ padding: '12px' }}>{d.cgpaCutoff || d.min_cgpa || '6.5'} CGPA</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {(d.eligibleBranches || d.branches || ['All Branches']).map((b, i) => (
                          <span key={i} style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{b}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>● {d.status || 'Active'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
