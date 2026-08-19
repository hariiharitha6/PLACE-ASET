'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Bell, Sparkles, Plus, Pin, Trash2 } from 'lucide-react';
import styles from './announcements.module.css';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/announcements');
      setAnnouncements(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load announcements from API', err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Campus Announcements & Urgents</h1>
          <p className={styles.subtitle}>Publish important notices, placement updates, and scheduled broadcasts</p>
        </div>
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.textCenter} style={{ padding: '40px', color: 'var(--text-muted)' }}>
            <Sparkles size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
            <p>Loading campus announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <Bell size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>No announcements published</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Published placement updates and urgent notices will appear here in real-time.</p>
          </div>
        ) : (
          announcements.map((anc) => (
            <div key={anc.id} className={`${styles.ancCard} ${anc.isPinned ? styles.pinned : ''}`}>
              <div className={styles.ancHeader}>
                <div className={styles.titleArea}>
                  {anc.isPinned && <span className={styles.pinTag}>📌 PINNED</span>}
                  <span className={`${styles.priorityTag} ${styles[(anc.priority || 'normal').toLowerCase()]}`}>{anc.priority || 'Normal'}</span>
                  <h3 className={styles.ancTitle}>{anc.title}</h3>
                </div>
                <span className={styles.categoryBadge}>{anc.category || 'General'}</span>
              </div>

              <p className={styles.ancContent}>{anc.content || anc.message}</p>

              <div className={styles.ancFooter}>
                <span>Published by {anc.author || 'Placement Cell'} &bull; {anc.publishedAt ? new Date(anc.publishedAt).toLocaleDateString() : 'Recent'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
