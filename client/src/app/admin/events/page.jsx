'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import EmptyState from '../../../components/ui/EmptyState';
import { Calendar, Plus, MapPin, Clock, Users, CheckCircle2 } from 'lucide-react';
import styles from './events.module.css';

export default function EventManagementPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Placement Drive',
    venue: '',
    eventDate: '',
    eventTime: '',
    deadline: '',
    seats: 100,
    banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    eligibleDepartments: 'CSE, ECE, AI&DS',
    eligibleYear: '4th Year',
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events');
      setEvents(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch events from database', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/events', form);
      const created = res.data?.data || res.data;
      setEvents([created, ...events]);
      setMsg('Event created successfully and registered in system!');
      setShowModal(false);
      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      console.error('Failed to create event', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Event & Campus Activity Management</h1>
          <p className={styles.subtitle}>Schedule placement drives, workshops, hackathons, and contest sessions</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
          + Schedule New Event
        </button>
      </div>

      {msg && (
        <div className={styles.alertSuccess}>
          <span>🔔</span>
          <span>{msg}</span>
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className={styles.textCenter} style={{ padding: '40px', color: 'var(--text-muted)' }}>
          Loading scheduled campus events from database...
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Calendar size={36} style={{ color: 'var(--text-muted)' }} />}
          title="No Campus Events Scheduled"
          description="Schedule a recruitment drive, mock test, or departmental hackathon to alert eligible students."
          actionText="+ Schedule New Event"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className={styles.eventsGrid}>
          {events.map((ev) => (
            <div key={ev.id} className={styles.eventCard}>
              <div
                className={styles.cardBanner}
                style={{ backgroundImage: `url(${ev.banner || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'})` }}
              >
                <span className={styles.categoryBadge}>{ev.category}</span>
                <span className={styles.statusBadge}>{ev.status}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.eventTitle}>{ev.title}</h3>

                <div className={styles.infoRow}>
                  <span>📍 {ev.venue || 'Campus Auditorium'}</span>
                  <span>📅 {ev.eventDate} {ev.eventTime ? `(${ev.eventTime})` : ''}</span>
                </div>

                <div className={styles.infoRow}>
                  <span>⏰ Deadline: {ev.deadline || 'Open'}</span>
                  <span>🎟️ {ev.registeredCount || 0} / {ev.seats || 100} Seats</span>
                </div>

                <div className={styles.tagRow}>
                  {Array.isArray(ev.eligibleDepartments) ? (
                    ev.eligibleDepartments.map((d, i) => <span key={i} className={styles.deptTag}>{d}</span>)
                  ) : (
                    <span className={styles.deptTag}>{ev.eligibleDepartments}</span>
                  )}
                  <span className={styles.yearTag}>{ev.eligibleYear}</span>
                </div>

                <div className={styles.cardFooter}>
                  <button className={styles.actionBtn}>Manage Registrations</button>
                  <button className={styles.editBtn}>Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Event Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Schedule Campus Event</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS Digital Campus Assessment 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Placement Drive">Placement Drive</option>
                    <option value="Campus Interview">Campus Interview</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Guest Lecture">Guest Lecture</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Venue / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Auditorium / Online"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Event Date</label>
                  <input
                    type="date"
                    required
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Event Time</label>
                  <input
                    type="text"
                    placeholder="09:30 AM"
                    value={form.eventTime}
                    onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Registration Deadline</label>
                  <input
                    type="date"
                    required
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Seat Capacity</label>
                  <input
                    type="number"
                    min="10"
                    value={form.seats}
                    onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Eligible Departments</label>
                  <input
                    type="text"
                    placeholder="CSE, ECE, AI&DS"
                    value={form.eligibleDepartments}
                    onChange={(e) => setForm({ ...form, eligibleDepartments: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Eligible Year</label>
                  <select
                    value={form.eligibleYear}
                    onChange={(e) => setForm({ ...form, eligibleYear: e.target.value })}
                  >
                    <option value="All Years">All Years</option>
                    <option value="4th Year">4th Year (Final)</option>
                    <option value="3rd & 4th Year">3rd & 4th Year</option>
                    <option value="1st & 2nd Year">1st & 2nd Year</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Confirm & Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
