'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import UserMenu from '../UserMenu';
import styles from './adminNavbar.module.css';

export default function AdminNavbar({ onMenuClick }) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const notifications = [
    { id: 1, title: '📁 Dataset Uploaded', desc: 'TCS_NQT_2026.csv uploaded to AI processing queue', time: '5m ago', unread: true },
    { id: 2, title: '⚡ AI Pipeline Finished', desc: '150 questions extracted and sent to approval queue', time: '12m ago', unread: true },
    { id: 3, title: '⏳ Question Pending Review', desc: 'Binary Tree Traversal submitted by Dr. Suresh Kumar', time: '45m ago', unread: true },
    { id: 4, title: '🔍 Duplicate Found (94%)', desc: 'Question "LRU Cache Implementation" matched existing bank', time: '1h ago', unread: false },
    { id: 5, title: '🤖 AI Model Health Operational', desc: 'Google Gemini 1.5 Flash active with 38ms latency', time: '2h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data?.results || []);
        setShowSearchResults(true);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (link) => {
    setShowSearchResults(false);
    setSearchQuery('');
    router.push(link);
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          ☰
        </button>
        <div className={styles.searchBox} style={{ position: 'relative' }}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Global search (questions, datasets, users, companies, challenges)..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
          />

          {showSearchResults && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              backgroundColor: '#0b1120',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 50,
              maxHeight: '350px',
              overflowY: 'auto',
              padding: '8px',
            }}>
              {isSearching ? (
                <div style={{ padding: '12px', color: '#94a3b8', fontSize: '12px' }}>Searching across system...</div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: '12px', color: '#94a3b8', fontSize: '12px' }}>No matching items found.</div>
              ) : (
                searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleResultClick(res.link)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <div style={{ color: '#f8fafc', fontSize: '13px', fontWeight: '600' }}>{res.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>{res.meta}</div>
                    </div>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#818cf8', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                      {res.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.statusPill}>
          <span className={styles.statusDot} />
          <span>System Operational</span>
        </div>

        <div className={styles.notifWrapper}>
          <button
            className={styles.iconBtn}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Admin Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span>System Notifications</span>
                <button onClick={() => setShowNotifications(false)} className={styles.clearBtn}>Close</button>
              </div>
              <div className={styles.notifList}>
                {notifications.map((n) => (
                  <div key={n.id} className={`${styles.notifItem} ${n.unread ? styles.unread : ''}`}>
                    <span className={styles.notifTitle}>{n.title}</span>
                    <span className={styles.notifDesc}>{n.desc}</span>
                    <span className={styles.notifTime}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
