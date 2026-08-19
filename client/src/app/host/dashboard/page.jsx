'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import PageHeader from '../../../components/ui/PageHeader';
import EmptyState from '../../../components/ui/EmptyState';
import { Trophy, Calendar, Users, Plus, Sparkles } from 'lucide-react';

export default function HostDashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await api.get('/admin/events');
        setEvents(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load host events', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <PageHeader
        badge="Host & Organizer Portal"
        badgeIcon={<Trophy size={14} />}
        title="Contests, Challenges & Discussion Moderation"
        subtitle="Manage contest schedules, coding challenges, question sets, and discussion moderation."
        breadcrumbs={[
          { label: 'Host Portal', href: '/host/dashboard' },
          { label: 'Events' }
        ]}
      >
        <Link href="/challenges/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'var(--gradient-primary)', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}>
          <Plus size={16} /> Create New Contest
        </Link>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hosted Contests</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-primary)' }}>{events.length}</h2>
          <span style={{ fontSize: '11px', color: 'var(--accent-success)' }}>Active Registrations</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Moderation Status</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0', color: 'var(--accent-teal)' }}>Operational</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Community Q&A</span>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Hosted Contests & Placement Workshops</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Sparkles size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
            <p>Loading host events from Supabase...</p>
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<Trophy size={32} />}
            title="No Hosted Contests Scheduled"
            description="Create an official placement contest, coding challenge, or academic workshop to begin onboarding candidate attendees."
            actionText="+ Create First Contest"
            actionHref="/challenges/new"
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-teal)', fontWeight: '700', textTransform: 'uppercase' }}>{ev.category || 'Contest'}</span>
                <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>{ev.title}</h4>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>{ev.registeredCount || 0} Registered</span>
                  <span style={{ color: 'var(--accent-success)', fontWeight: '700' }}>{ev.status || 'Active'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
