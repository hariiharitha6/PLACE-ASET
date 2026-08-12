'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../lib/api';
import { 
  Bell, CheckCheck, Sparkles, BookOpen, Briefcase, 
  MessageSquare, Trophy, ShieldAlert, CheckCircle2, ArrowRight 
} from 'lucide-react';
import styles from './notifications.module.css';

const TABS = [
  { id: 'all', label: 'All Notifications' },
  { id: 'academic', label: '📚 Academic' },
  { id: 'placement', label: '💼 Placement' },
  { id: 'community', label: '💬 Community' },
  { id: 'ai', label: '✨ AI Insights' },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/notifications');
      setNotifications(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/dashboard/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/dashboard/notifications/read-all');
      toast.success('All notifications marked as read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return (n.type || '').toLowerCase().includes(activeTab);
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'academic': return <BookOpen size={18} style={{ color: '#f59e0b' }} />;
      case 'placement': return <Briefcase size={18} style={{ color: '#10b981' }} />;
      case 'community': return <MessageSquare size={18} style={{ color: '#a855f7' }} />;
      case 'ai': return <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />;
      default: return <Bell size={18} style={{ color: 'var(--accent-primary)' }} />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={26} style={{ color: 'var(--accent-primary)' }} /> Notification Center
          </h1>
          <p>Real-time updates on assignments, community replies, placement drives, and AI recommendations.</p>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            <CheckCheck size={16} /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Fetching smart notifications...</p>
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <Bell size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>No notifications in this tab</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>You are completely caught up!</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredNotifs.map(n => (
            <div key={n.id} className={`${styles.card} ${!n.is_read ? styles.cardUnread : ''}`}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getIcon(n.type)}
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{n.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>{n.message}</p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {n.action_url && (
                  <Link href={n.action_url} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none' }}>
                    View <ArrowRight size={12} />
                  </Link>
                )}
                {!n.is_read && (
                  <button onClick={() => handleMarkRead(n.id)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
