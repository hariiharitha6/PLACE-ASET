'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events');
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
      setEvents([
        { id: 'ev-1', title: 'TCS Digital Campus Recruitment Drive 2026', category: 'Campus Interview', venue: 'ASET Main Auditorium', eventDate: '2026-08-05', eventTime: '09:30 AM', deadline: '2026-08-01', seats: 250, registeredCount: 184, status: 'Open', eligibleDepartments: ['CSE', 'ECE', 'AI&DS'], eligibleYear: '4th Year' },
        { id: 'ev-2', title: 'Advanced Data Structures & Algorithms Masterclass', category: 'Workshop', venue: 'Lab 3, CSE Block', eventDate: '2026-07-28', eventTime: '02:00 PM', deadline: '2026-07-27', seats: 60, registeredCount: 58, status: 'Open', eligibleDepartments: ['All Departments'], eligibleYear: '3rd & 4th Year' },
        { id: 'ev-3', title: 'PLACE@ASET Summer Hackathon 2026', category: 'Hackathon', venue: 'ASET Innovation Lab', eventDate: '2026-08-12', eventTime: '09:00 AM', deadline: '2026-08-10', seats: 120, registeredCount: 95, status: 'Upcoming', eligibleDepartments: ['All Departments'], eligibleYear: 'All Years' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/events', form);
      setEvents([res.data, ...events]);
      setMsg('Event created successfully and notifications dispatched to eligible candidates!');
      setShowModal(false);
      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Event & Campus Activity Management</h1>
          <p className={styles.subtitle}>Schedule placement drives, workshops, hackathons, and instant candidate alerts</p>
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
      <div className={styles.eventsGrid}>
        {loading ? (
          <div className={styles.textCenter}>Loading scheduled campus events...</div>
        ) : (
          events.map((ev) => (
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
                  <span>📍 {ev.venue}</span>
                  <span>📅 {ev.eventDate} ({ev.eventTime})</span>
                </div>

                <div className={styles.infoRow}>
                  <span>⏰ Deadline: {ev.deadline}</span>
                  <span>🎟️ {ev.registeredCount || 0} / {ev.seats} Seats</span>
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
          ))
        )}
      </div>

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
                  placeholder="e.g. TCS Digital Campus Recruitment Drive"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className={styles.rowTwo}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="Placement Drive">Placement Drive</option>
                    <option value="Campus Interview">Campus Interview</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Coding Contest">Coding Contest</option>
                    <option value="Training Session">Training Session</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ASET Main Auditorium"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.rowThree}>
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
                  <label>Time</label>
                  <input
                    type="text"
                    required
                    placeholder="09:30 AM"
                    value={form.eventTime}
                    onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Registration Deadline</label>
                  <input
                    type="date"
                    required
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Schedule Event & Notify Students</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
