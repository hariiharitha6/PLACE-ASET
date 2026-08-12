'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { calendarService } from '../../../lib/calendarService';
import { 
  Calendar as CalendarIcon, Plus, Sparkles, Clock, MapPin, 
  Trash2, CheckCircle2, BookOpen, Trophy, Briefcase, Bell, ChevronLeft, ChevronRight 
} from 'lucide-react';
import styles from './calendar.module.css';

export default function CalendarPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Schedule State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSchedule, setAiSchedule] = useState(null);
  const [scheduleType, setScheduleType] = useState('daily');

  // Add Event Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('personal');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await calendarService.getEvents();
      setEvents(res || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleGenerateAISchedule = async () => {
    setAiLoading(true);
    try {
      const res = await calendarService.generateAISchedule(scheduleType);
      setAiSchedule(res.plan);
      toast.success('AI personalized study plan generated');
    } catch (err) {
      toast.error('Failed to generate AI schedule');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !startTime) return;
    setIsSubmitting(true);
    try {
      await calendarService.createEvent({
        title,
        description,
        event_type: eventType,
        start_time: startTime,
        is_personal: eventType === 'personal'
      });
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      toast.success('Event added to calendar');
      loadEvents();
    } catch (err) {
      toast.error('Failed to add event: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await calendarService.deleteEvent(id);
      toast.success('Event removed');
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'contest': return { bg: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', icon: Trophy };
      case 'assignment': return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', icon: BookOpen };
      case 'placement': return { bg: 'rgba(16,185,129,0.1)', color: '#10b981', icon: Briefcase };
      default: return { bg: 'rgba(168,85,247,0.1)', color: '#a855f7', icon: Bell };
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={26} style={{ color: 'var(--accent-primary)' }} /> Calendar & Smart Schedule
          </h1>
          <p>Unified view of your assignments, coding contests, placement drives, workshops, and AI study plans.</p>
        </div>

        <button onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
          <Plus size={16} /> Add Event / Reminder
        </button>
      </div>

      <div className={styles.grid}>
        {/* Agenda & Upcoming Deadlines Column */}
        <div className={styles.calendarCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Upcoming Agenda & Events</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{events.length} Events Total</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Sparkles size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
              <p>Syncing calendar events...</p>
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No upcoming events scheduled. Add a reminder or generate an AI study plan!
            </div>
          ) : (
            <div className={styles.agendaList}>
              {events.map(item => {
                const badge = getBadgeStyle(item.type);
                const IconComponent = badge.icon;
                return (
                  <div key={item.id} className={styles.eventItem}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: badge.bg, color: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComponent size={18} />
                      </div>

                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{item.title}</h4>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {new Date(item.start_time).toLocaleString()}
                          </span>
                          {item.description && <span>• {item.description}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-full)', background: badge.bg, color: badge.color, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
                        {item.type}
                      </span>
                      {item.source === 'reminder' && (
                        <button onClick={() => handleDeleteEvent(item.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Planner & Study Schedule Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.aiPlanCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>AI Smart Study Planner</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Generate an optimized time-blocked study & preparation schedule tailored to your active learning goals.
            </p>

            <select className={styles.formInput} value={scheduleType} onChange={e => setScheduleType(e.target.value)}>
              <option value="daily">Daily Placement & Coding Plan</option>
              <option value="weekly">Weekly Skill Improvement Plan</option>
              <option value="revision">Exam Revision Schedule</option>
              <option value="placement">Placement Drive Prep Blitz</option>
            </select>

            <button onClick={handleGenerateAISchedule} disabled={aiLoading}
              style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Sparkles size={14} /> {aiLoading ? 'Generating Plan...' : 'Generate AI Schedule'}
            </button>
          </div>

          {aiSchedule && (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} /> Your AI Personal Schedule
              </h4>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {aiSchedule}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modal} onSubmit={handleCreateEvent}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Add Event or Reminder</h2>

            <div className={styles.formGroup}>
              <label>Title</label>
              <input type="text" className={styles.formInput} required placeholder="E.g., Practice 3 Dynamic Programming Questions"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Event Type</label>
              <select className={styles.formInput} value={eventType} onChange={e => setEventType(e.target.value)}>
                <option value="personal">Personal Reminder</option>
                <option value="assignment">Assignment Task</option>
                <option value="contest">Coding Practice Session</option>
                <option value="placement">Placement Prep</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Date & Time</label>
              <input type="datetime-local" className={styles.formInput} required
                value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Notes / Description</label>
              <textarea className={styles.formInput} rows={3} placeholder="Add optional details or notes..."
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                {isSubmitting ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
