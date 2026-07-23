'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function SystemUsersMonitorPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSystemUsers() {
      try {
        const res = await api.get('/admin/system-users').catch(() => ({ data: [] }));
        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSystemUsers();
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          🟢 LIVE SYSTEM USERS MONITOR
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px 0' }}>Real-time System Users Telemetry</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          Monitor active user sessions, device types, IP addresses, browser agents, and online status.
        </p>
      </div>

      <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', color: '#94a3b8' }}>Loading active user sessions...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                <th style={{ padding: '14px 20px' }}>User Candidate</th>
                <th style={{ padding: '14px 20px' }}>Role Claim</th>
                <th style={{ padding: '14px 20px' }}>Department</th>
                <th style={{ padding: '14px 20px' }}>Online Status</th>
                <th style={{ padding: '14px 20px' }}>Last Active</th>
                <th style={{ padding: '14px 20px' }}>Device & Browser</th>
                <th style={{ padding: '14px 20px' }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '700', color: '#f8fafc' }}>{u.name}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{u.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>{u.department}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ backgroundColor: u.isOnline ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: u.isOnline ? '#34d399' : '#94a3b8', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                      ● {u.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '12px' }}>{u.lastActive}</td>
                  <td style={{ padding: '14px 20px', color: '#cbd5e1', fontSize: '12px' }}>{u.device} &bull; {u.browser}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '12px' }}><code>{u.ip}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
