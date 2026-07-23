'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function HostDashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await api.get('/admin/events').catch(() => ({ data: [] }));
        setEvents(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          🎯 HOST & EVENT ORGANIZER DASHBOARD
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px 0' }}>Events, Challenges & Discussion Moderation</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          Manage event schedules, coding challenges, question sessions, and discussion moderation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Hosted Events</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: '#a855f7' }}>{events.length || 6}</h2>
          <span style={{ fontSize: '11px', color: '#34d399' }}>Active & Upcoming</span>
        </div>

        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Registrations</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: '#38bdf8' }}>242</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Event Attendees</span>
        </div>
      </div>

      <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Hosted Contests & Placement Workshops</h3>

        {loading ? (
          <div style={{ color: '#94a3b8' }}>Loading host events...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {(events.length > 0 ? events : [
              { id: 'ev-1', title: 'TCS Digital Campus Recruitment Drive 2026', category: 'Campus Interview', registeredCount: 184, status: 'Open' },
              { id: 'ev-2', title: 'Advanced DSA Masterclass', category: 'Workshop', registeredCount: 58, status: 'Open' }
            ]).map((ev) => (
              <div key={ev.id} style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: '700' }}>{ev.category}</span>
                <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{ev.title}</h4>
                <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>{ev.registeredCount} Registered</span>
                  <span style={{ color: '#34d399', fontWeight: '700' }}>{ev.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
