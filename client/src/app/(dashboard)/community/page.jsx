'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { communityService } from '../../../lib/communityService';
import { 
  Users, MessageSquare, ThumbsUp, Plus, Search, CheckCircle2, 
  Pin, Sparkles, Filter, Bookmark, User, Tag, ArrowRight, ShieldCheck 
} from 'lucide-react';
import styles from './community.module.css';

const FILTER_TABS = [
  { id: 'all', label: 'All Discussions' },
  { id: 'trending', label: '🔥 Trending' },
  { id: 'unanswered', label: '❓ Unanswered' },
  { id: 'solved', label: '✅ Solved' },
  { id: 'pinned', label: '📌 Pinned' },
];

export default function CommunityHubPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [category, setCategory] = useState('All');

  // Create Discussion Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dept, setDept] = useState('Computer Science & Engineering');
  const [cat, setCat] = useState('DSA & Programming');
  const [tagsInput, setTagsInput] = useState('dsa, algorithms, interview');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communityService.listDiscussions({
        page,
        limit: 12,
        search,
        department: department === 'All' ? undefined : department,
        category: category === 'All' ? undefined : category,
        filterType: activeFilter
      });
      setDiscussions(res.discussions || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, [page, search, department, category, activeFilter, toast]);

  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  const handleReaction = async (e, discussionId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await communityService.toggleReaction({ discussionId, reactionType: 'upvote' });
      setDiscussions(prev => prev.map(d => {
        if (d.id === discussionId) {
          const delta = res.reacted ? 1 : -1;
          return { ...d, upvotes_count: Math.max(0, (d.upvotes_count || 0) + delta) };
        }
        return d;
      }));
    } catch (err) {
      toast.error('Upvote failed');
    }
  };

  const handleBookmark = async (e, discussionId, currentBookmarked) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await communityService.toggleBookmark(discussionId);
      toast.success(res.bookmarked ? 'Discussion bookmarked' : 'Bookmark removed');
      setDiscussions(prev => prev.map(d => d.id === discussionId ? { ...d, is_bookmarked: res.bookmarked } : d));
    } catch (err) {
      toast.error('Bookmark toggle failed');
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsSubmitting(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      await communityService.createDiscussion({
        title,
        content,
        department: dept,
        category: cat,
        tags
      });
      setShowAddModal(false);
      setTitle('');
      setContent('');
      toast.success('Discussion posted successfully');
      loadDiscussions();
    } catch (err) {
      toast.error('Failed to post discussion: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={26} style={{ color: 'var(--accent-primary)' }} /> Community & Collaboration Forum
          </h1>
          <p>Ask coding doubts, discuss interview preparation, share DSA & SQL solutions, and collaborate.</p>
        </div>

        <button onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
          <Plus size={16} /> Start Discussion
        </button>
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabBar}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveFilter(tab.id); setPage(1); }}
            className={`${styles.tab} ${activeFilter === tab.id ? styles.tabActive : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search questions, topics, or code snippets..."
          className={styles.searchField}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <select className={styles.selectField} value={department} onChange={e => setDepartment(e.target.value)}>
          <option value="All">All Departments</option>
          <option value="Computer Science & Engineering">CSE</option>
          <option value="Electronics & Communication">ECE</option>
          <option value="Electrical & Electronics">EEE</option>
          <option value="Mechanical Engineering">ME</option>
          <option value="Civil Engineering">CE</option>
        </select>

        <select className={styles.selectField} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="DSA & Programming">DSA & Coding</option>
          <option value="DBMS & SQL">DBMS & SQL</option>
          <option value="Operating Systems">Operating Systems</option>
          <option value="Computer Networks">Networks</option>
          <option value="Placement & Interview Prep">Placement & Interview</option>
          <option value="Aptitude & Reasoning">Aptitude</option>
          <option value="Web & Fullstack">Web Development</option>
          <option value="Machine Learning">Machine Learning</option>
        </select>
      </div>

      {/* Discussion List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Loading community discussions...</p>
        </div>
      ) : discussions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <MessageSquare size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>No discussions found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Be the first student or faculty member to start a discussion in this topic.</p>
          <button onClick={() => setShowAddModal(true)} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            Start a Discussion
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {discussions.map(disc => (
            <Link key={disc.id} href={`/community/${disc.id}`} style={{ textDecoration: 'none' }}>
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className={styles.userLine}>
                    <div className={styles.userAvatar}>
                      {disc.users?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{disc.users?.full_name || 'Student'}</span>
                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>{disc.users?.role || 'Member'} • {new Date(disc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {disc.is_pinned && <span className={`${styles.badge} ${styles.badgePinned}`}><Pin size={10} /> Pinned</span>}
                    {disc.is_solved && <span className={`${styles.badge} ${styles.badgeSolved}`}><CheckCircle2 size={10} /> Solved</span>}
                    <button
                      onClick={e => handleBookmark(e, disc.id, disc.is_bookmarked)}
                      style={{ background: 'none', border: 'none', color: disc.is_bookmarked ? '#f59e0b' : 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                    >
                      <Bookmark size={16} fill={disc.is_bookmarked ? '#f59e0b' : 'none'} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className={styles.statement}>{disc.title}</h3>
                  <p className={styles.contentPreview}>{disc.content}</p>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span className={`${styles.badge} ${styles.badgeCategory}`}>{disc.category}</span>
                  {disc.department && <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', fontSize: '11px', color: 'var(--text-secondary)' }}>{disc.department}</span>}
                </div>

                <div className={styles.cardFooter}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button onClick={e => handleReaction(e, disc.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                      <ThumbsUp size={14} style={{ color: 'var(--accent-primary)' }} /> {disc.upvotes_count || 0}
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <MessageSquare size={14} /> {disc.replies_count || 0} replies
                    </span>
                  </div>

                  <span style={{ color: 'var(--accent-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    View Post <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
            Previous
          </button>
          <span style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
            Next
          </button>
        </div>
      )}

      {/* Start Discussion Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modal} onSubmit={handleCreateDiscussion}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Start New Discussion</h2>
            
            <div className={styles.formGroup}>
              <label>Discussion Title</label>
              <input type="text" className={styles.formInput} required placeholder="E.g., How to optimize Dijkstra's Algorithm for min heap?"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Discussion Content / Problem Description</label>
              <textarea className={styles.formInput} required rows={5} placeholder="Explain your question, code problem, or concept query in detail..."
                value={content} onChange={e => setContent(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select className={styles.formInput} value={cat} onChange={e => setCat(e.target.value)}>
                  <option value="DSA & Programming">DSA & Coding</option>
                  <option value="DBMS & SQL">DBMS & SQL</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Computer Networks">Networks</option>
                  <option value="Placement & Interview Prep">Placement & Interview</option>
                  <option value="Aptitude & Reasoning">Aptitude</option>
                  <option value="Web & Fullstack">Web Development</option>
                  <option value="Machine Learning">Machine Learning</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Department</label>
                <select className={styles.formInput} value={dept} onChange={e => setDept(e.target.value)}>
                  <option value="Computer Science & Engineering">CSE</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Electrical & Electronics">EEE</option>
                  <option value="Mechanical Engineering">ME</option>
                  <option value="Civil Engineering">CE</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Tags (comma separated)</label>
              <input type="text" className={styles.formInput} placeholder="dsa, heap, shortest-path, java"
                value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                {isSubmitting ? 'Posting...' : 'Post Discussion'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
