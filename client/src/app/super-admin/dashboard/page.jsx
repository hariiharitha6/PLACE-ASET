'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';
import PageHeader from '../../../components/ui/PageHeader';
import EmptyState from '../../../components/ui/EmptyState';
import { ShieldCheck, Users, Activity, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSuperAdminData() {
      try {
        const reqRes = await api.get('/admin/permissions/requests').catch(() => ({ data: [] }));
        setRequests(reqRes.data?.data || reqRes.data || []);
      } catch (err) {
        console.error('Failed to load permission requests', err);
      } finally {
        setLoading(false);
      }
    }
    loadSuperAdminData();
  }, []);

  const handleApprove = async (requestId, durationDays) => {
    try {
      await api.patch(`/admin/permissions/requests/${requestId}/approve`, { durationDays });
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Failed to approve permission request.', err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.patch(`/admin/permissions/requests/${requestId}/reject`, { reason: 'Rejected by Super Admin' });
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Failed to reject permission request.', err);
    }
  };

  return (
    <div style={{ maxWidth: '1500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <PageHeader
        badge="Super Admin Governance"
        badgeIcon={<ShieldCheck size={14} />}
        title="Platform Governance & Permission Engine"
        subtitle="Master Governance, Role Hierarchy Control, Temporary Permission Grants & Live Telemetry"
        breadcrumbs={[
          { label: 'Super Admin', href: '/super-admin/dashboard' },
          { label: 'Governance' }
        ]}
      >
        <Link href="/admin/system-users" style={{ backgroundColor: 'var(--gradient-primary)', color: '#fff', padding: '9px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
          🟢 Live User Monitor
        </Link>
        <Link href="/admin/logs" style={{ backgroundColor: 'var(--bg-glass)', color: '#fff', border: '1px solid var(--border-color)', padding: '9px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
          📜 Audit Logs
        </Link>
      </PageHeader>

      {/* Permission Requests Moderation Panel */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>🔑 Temporary Permission Requests Queue</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Review user requests for elevated privileges. Granted permissions expire automatically based on selected duration.</p>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading permission requests...</div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck size={32} />}
            title="No Pending Permission Requests"
            description="All role permissions and temporary access grants across departments are currently synchronized."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {requests.map((r) => (
              <div key={r.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '14px' }}>{r.users?.full_name || r.user_id}</strong>
                    <span style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>{r.users?.role || 'User'}</span>
                  </div>
                  <div style={{ color: 'var(--accent-teal)', fontSize: '13px', fontWeight: '600', margin: '4px 0' }}>Request: {r.permission_id}</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>Reason: {r.reason}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => handleApprove(r.id, 1)} style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                    Approve 1 Day
                  </button>
                  <button onClick={() => handleApprove(r.id, 7)} style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                    Approve 7 Days
                  </button>
                  <button onClick={() => handleReject(r.id)} style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
