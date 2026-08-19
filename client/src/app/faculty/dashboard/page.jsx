'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import PageHeader from '../../../components/ui/PageHeader';
import EmptyState from '../../../components/ui/EmptyState';
import { Users, BookOpen, BarChart3, GraduationCap, CheckCircle2, Sparkles } from 'lucide-react';

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacultyData() {
      try {
        const res = await api.get('/admin/students');
        setStudents(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load faculty students', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    loadFacultyData();
  }, []);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <PageHeader
        badge="Faculty Portal"
        badgeIcon={<GraduationCap size={14} />}
        title={`Welcome, ${user?.fullName || user?.full_name || 'Faculty Member'}`}
        subtitle="Departmental Student Roster, Practice Reports & Academic Placement Analytics"
        breadcrumbs={[
          { label: 'Portal', href: '/faculty/dashboard' },
          { label: 'Department Roster' }
        ]}
      />

      {/* Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enrolled Candidates</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-primary)' }}>{students.length}</h2>
          <span style={{ fontSize: '11px', color: 'var(--accent-success)' }}>Department Active</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Academic Evaluation</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-teal)' }}>Ready</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live Question Analytics</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Department Scope</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-warning)' }}>{user?.department || 'ASET Campus'}</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ahalia Engineering</span>
        </div>
      </div>

      {/* Department Roster Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Department Student Performance Roster</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Sparkles size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
            <p>Loading departmental roster from Supabase...</p>
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={<Users size={32} />}
            title="No Candidates Found"
            description="There are currently no students enrolled under this department profile. Candidates will appear automatically when registered."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Student Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Roll Number</th>
                  <th style={{ padding: '12px' }}>Year & Sec</th>
                  <th style={{ padding: '12px' }}>XP & Level</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{st.full_name || st.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{st.email}</td>
                    <td style={{ padding: '12px' }}><code>{st.roll_number || 'N/A'}</code></td>
                    <td style={{ padding: '12px' }}>Year {st.year || 4} - {st.section || 'A'}</td>
                    <td style={{ padding: '12px', color: 'var(--accent-primary)', fontWeight: '700' }}>{st.xp || 0} XP (Lvl {st.level || 1})</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: st.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: st.is_active ? '#34d399' : '#f87171', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                        {st.is_active ? 'Active' : 'Suspended'}
                      </span>
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
