'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { resourceService } from '../../../../lib/resourceService';
import { 
  Bookmark, FileText, Eye, Download, Search, Trash2, ArrowLeft, 
  Sparkles, RotateCcw, Video 
} from 'lucide-react';
import styles from '../resources.module.css';

export default function BookmarksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await resourceService.getUserBookmarks({ search, sortBy });
      setResources(res.resources || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load saved bookmarks');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, toast]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemoveBookmark = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await resourceService.removeBookmark(id);
      toast.success('Removed from bookmarks');
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  const handleDownload = async (e, id, url) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await resourceService.downloadResource(id);
      if (url && url.startsWith('http')) {
        window.open(url, '_blank');
      }
    } catch (err) {
      toast.error('Download error');
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.push('/resources')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          <ArrowLeft size={16} /> Back to Resource Hub
        </button>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bookmark size={24} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> Bookmarked Resources
          </h1>
          <p>Your saved study guides, notes, and preparation resources.</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search within bookmarked resources..."
          className={styles.searchField}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <select className={styles.selectField} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Recently Saved</option>
          <option value="views">Most Viewed</option>
          <option value="downloads">Most Downloaded</option>
        </select>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Loading bookmarks...</p>
        </div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <Bookmark size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>No bookmarked resources</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Browse the Resource Hub and click the bookmark icon to save materials here.</p>
          <button onClick={() => router.push('/resources')} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            Explore Resource Hub
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {resources.map(res => (
            <Link key={res.id} href={`/resources/${res.id}`} style={{ textDecoration: 'none' }}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.resourceIcon}>
                    {res.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`${styles.badge} ${
                      res.type === 'video' ? styles.badgeVideo :
                      res.type === 'pdf' ? styles.badgePdf : styles.badgeNotes
                    }`}>
                      {res.type?.replace('_', ' ')}
                    </span>
                    <button
                      className={styles.bookmarkBtn}
                      onClick={e => handleRemoveBookmark(e, res.id)}
                      title="Remove Bookmark"
                    >
                      <Trash2 size={16} style={{ color: 'var(--accent-danger)' }} />
                    </button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.resourceTitle}>{res.title}</h3>
                  <p className={styles.resourceDesc}>{res.description || 'Saved study material.'}</p>
                  
                  <div className={styles.metaPills}>
                    {res.subject && <span className={styles.metaPill}>{res.subject}</span>}
                    {res.department && <span className={styles.metaPill}>{res.department}</span>}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span><Eye size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> {res.view_count || 0}</span>
                    <span><Download size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> {res.download_count || 0}</span>
                  </div>

                  <span onClick={e => handleDownload(e, res.id, res.file_url)}
                    style={{ color: 'var(--accent-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    Get <Download size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
