'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';

export default function SuperAdminDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSuperAdminData() {
      try {
        const [reqRes, ovRes] = await Promise.all([
          api.get('/admin/permissions/requests').catch(() => ({ data: [] })),
          api.get('/admin/dashboard/overview').catch(() => ({ data: [] })),
        ]);
        setRequests(reqRes.data || []);
        setOverview(ovRes.data);
      } catch (err) {
        console.error(err);
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
      alert(`Temporary permission granted for ${durationDays} days!`);
    } catch (err) {
      alert('Failed to approve permission request.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.patch(`/admin/permissions/requests/${requestId}/reject`, { reason: 'Rejected by Super Admin' });
      setRequests(requests.filter(r => r.id !== requestId));
      alert('Permission request rejected.');
    } catch (err) {
      alert('Failed to reject permission request.');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#c084fc', backgroundColor: 'rgba(192,132,252,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
            ⚡ SUPER ADMIN SYSTEM GOVERNANCE
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px 0' }}>Super Admin Governance & Permission Requests</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            Master Governance, Role Hierarchy Control, Temporary Permission Approvals & Live System Telemetry
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/admin/system-users" style={{ backgroundColor: '#6366f1', color: '#fff', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
            🟢 Live Users Monitor
          </Link>
          <Link href="/admin/logs" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
            📜 Audit Logs
          </Link>
        </div>
      </div>

      {/* Permission Requests Moderation Panel */}
      <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#c084fc' }}>🔑 Temporary Permission Requests Queue</h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Review user requests for elevated privileges. Granted permissions expire automatically based on selected duration.</p>

        {loading ? (
          <div style={{ color: '#94a3b8' }}>Loading permission requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', color: '#34d399', textAlign: 'center', fontSize: '13px' }}>
            🎉 No pending permission requests. All governance controls are synchronized.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {requests.map((r) => (
              <div key={r.id} style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '14px' }}>{r.users?.full_name || r.user_id}</strong>
                    <span style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>{r.users?.role || 'User'}</span>
                  </div>
                  <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '600', margin: '4px 0' }}>Request: {r.permission_id}</div>
                  <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Reason: {r.reason}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => handleApprove(r.id, 1)} style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                    Approve 1 Day
                  </button>
                  <button onClick={() => handleApprove(r.id, 7)} style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                    Approve 7 Days
                  </button>
                  <button onClick={() => handleApprove(r.id, 30)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                    Approve 30 Days
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
