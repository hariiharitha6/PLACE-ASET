'use client';

import { Calendar, Clock } from 'lucide-react';

export default function UpcomingEventsWidget({ events }) {
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-glass)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={18} style={{ color: 'var(--accent-warning)' }} />
        <span>Upcoming Events</span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {events.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: '13px' }}>
            No upcoming events scheduled.
          </p>
        ) : (
          events.map((evt) => (
            <div 
              key={evt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{
                color: 'var(--accent-warning)',
                backgroundColor: 'rgba(251, 191, 36, 0.05)',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={18} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {evt.title}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {formatDate(evt.start_time)} ({evt.duration_minutes}m)
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
