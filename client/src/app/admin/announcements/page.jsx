'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
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
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
      setAnnouncements([
        { id: 'anc-1', title: 'TCS Ninja & Digital Mock Assessment Schedule Released', category: 'Placement Update', content: 'All 4th-year CSE and ECE students are hereby instructed to take part in the mandatory mock assessment scheduled for Saturday.', isPinned: true, priority: 'Urgent', publishedAt: '2026-07-20 10:00 AM', author: 'Placement Cell (TPO)' },
        { id: 'anc-2', title: 'Resume Verification & Placement Registration Extension', category: 'Important Notice', content: 'The deadline for updating complete academic details on PLACE@ASET profile has been extended till July 25th.', isPinned: true, priority: 'High', publishedAt: '2026-07-18 04:30 PM', author: 'Super Admin' },
        { id: 'anc-3', title: 'Web Development & System Design Bootcamp Details', category: 'Training Schedule', content: 'Interactive 3-week bootcamp starting from August 1st. Attendance mandatory for pre-final year students.', isPinned: false, priority: 'Normal', publishedAt: '2026-07-15 11:15 AM', author: 'Department of CSE' },
      ]);
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
        <button className={styles.primaryBtn}>+ Publish Notice</button>
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.textCenter}>Loading announcements...</div>
        ) : (
          announcements.map((anc) => (
            <div key={anc.id} className={`${styles.ancCard} ${anc.isPinned ? styles.pinned : ''}`}>
              <div className={styles.ancHeader}>
                <div className={styles.titleArea}>
                  {anc.isPinned && <span className={styles.pinTag}>📌 PINNED</span>}
                  <span className={`${styles.priorityTag} ${styles[anc.priority.toLowerCase()]}`}>{anc.priority}</span>
                  <h3 className={styles.ancTitle}>{anc.title}</h3>
                </div>
                <span className={styles.categoryBadge}>{anc.category}</span>
              </div>

              <p className={styles.ancContent}>{anc.content}</p>

              <div className={styles.ancFooter}>
                <span>Published by {anc.author} &bull; {anc.publishedAt}</span>
                <div className={styles.cardBtnRow}>
                  <button className={styles.btnSecondary}>Unpin</button>
                  <button className={styles.btnDanger}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
