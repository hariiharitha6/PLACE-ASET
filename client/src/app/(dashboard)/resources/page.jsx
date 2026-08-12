'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { resourceService } from '../../../lib/resourceService';
import { 
  FileText, Download, Plus, Search, Eye, Bookmark, Trash2, 
  Sparkles, Filter, RotateCcw, ExternalLink, Video, Award, 
  CheckCircle, Layers, BookOpen, User, Star
} from 'lucide-react';
import styles from './resources.module.css';

const SECTIONS = [
  { id: 'all', label: 'All Resources', icon: Layers },
  { id: 'featured', label: 'Featured', icon: Star },
  { id: 'recentlyAdded', label: 'Recently Added', icon: Sparkles },
  { id: 'mostViewed', label: 'Most Viewed', icon: Eye },
  { id: 'mostBookmarked', label: 'Most Bookmarked', icon: Bookmark },
  { id: 'recommended', label: 'Recommended For You', icon: Award },
  { id: 'departmentResources', label: 'Department', icon: BookOpen },
  { id: 'subjectResources', label: 'Subject', icon: FileText },
  { id: 'placementResources', label: 'Placement', icon: CheckCircle },
  { id: 'interviewResources', label: 'Interview Prep', icon: CheckCircle },
  { id: 'programmingResources', label: 'Programming', icon: Layers },
  { id: 'examPreparation', label: 'Exam Prep', icon: BookOpen },
  { id: 'facultyResources', label: 'Faculty Uploads', icon: User }
];

export default function ResourceHubHome() {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState('all');
  const [hubData, setHubData] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [subject, setSubject] = useState('All');
  const [semester, setSemester] = useState('All');
  const [type, setType] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Upload Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resType, setResType] = useState('notes');
  const [fileUrl, setFileUrl] = useState('');
  const [dept, setDept] = useState('Computer Science & Engineering');
  const [subj, setSubj] = useState('Data Structures & Algorithms');
  const [sem, setSem] = useState('Semester 5');
  const [diff, setDiff] = useState('intermediate');
  const [tagsInput, setTagsInput] = useState('placement, dsa, notes');
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [externalResourceUrl, setExternalResourceUrl] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const res = await resourceService.listResources({
          page,
          search,
          type: type === 'All' ? undefined : type,
          department: department === 'All' ? undefined : department,
          subject: subject === 'All' ? undefined : subject,
          semester: semester === 'All' ? undefined : semester,
          difficulty: difficulty === 'All' ? undefined : difficulty,
          sortBy,
          limit: 12
        });
        setResources(res.resources || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } else {
        if (!hubData) {
          const hubRes = await resourceService.getHubSections();
          setHubData(hubRes);
          setResources(hubRes[activeTab] || []);
        } else {
          setResources(hubData[activeTab] || []);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search, type, department, subject, semester, difficulty, sortBy, hubData, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetFilters = () => {
    setSearch('');
    setDepartment('All');
    setSubject('All');
    setSemester('All');
    setType('All');
    setDifficulty('All');
    setSortBy('newest');
    setPage(1);
    setActiveTab('all');
  };

  const handleBookmarkToggle = async (e, id, currentBookmarked) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (currentBookmarked) {
        await resourceService.removeBookmark(id);
        toast.success('Removed from bookmarks');
      } else {
        await resourceService.addBookmark(id);
        toast.success('Resource bookmarked');
      }
      setResources(prev => prev.map(r => r.id === id ? { ...r, is_bookmarked: !currentBookmarked } : r));
    } catch (err) {
      toast.error(err.message || 'Bookmark action failed');
    }
  };

  const handleDownload = async (e, id, url) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await resourceService.downloadResource(id);
      if (url && url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        toast.success('Download recorded');
      }
    } catch (err) {
      toast.error('Download failed: ' + err.message);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: 'Delete Resource',
      message: 'Are you sure you want to permanently delete this resource?',
      type: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await resourceService.deleteResource(id);
      toast.success('Resource deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!title) return;
    setIsSubmitting(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      await resourceService.createResource({
        title,
        description,
        type: resType,
        file_url: fileUrl || externalResourceUrl,
        department: dept,
        subject: subj,
        semester: sem,
        difficulty: diff,
        tags,
        external_video_url: externalVideoUrl,
        external_resource_url: externalResourceUrl,
        is_global: isGlobal
      });
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setFileUrl('');
      setExternalVideoUrl('');
      setExternalResourceUrl('');
      toast.success('Resource published & queued for AI processing');
      loadData();
    } catch (err) {
      toast.error('Failed to publish resource: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditor = user && ['super_admin', 'college_admin', 'faculty', 'hod', 'host', 'placement_cell'].includes(user.role);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>🎓 Resource Hub</h1>
          <p>Discover academic study guides, placement papers, video lectures, and AI-summarized notes.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/resources/bookmarks" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              <Bookmark size={16} style={{ color: '#f59e0b' }} /> Saved Bookmarks
            </button>
          </Link>
          {isEditor && (
            <button onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              <Plus size={16} /> Publish Resource
            </button>
          )}
        </div>
      </div>

      {/* Discovery Hub Section Tabs */}
      <div className={styles.tabContainer}>
        {SECTIONS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className={styles.filterBar}>
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by title, description, subject, or tags..."
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

        <select className={styles.selectField} value={type} onChange={e => setType(e.target.value)}>
          <option value="All">All Types</option>
          <option value="notes">Notes</option>
          <option value="pdf">PDF Document</option>
          <option value="placement_paper">Placement Paper</option>
          <option value="interview_questions">Interview Prep</option>
          <option value="coding_resource">Coding Guide</option>
          <option value="study_guide">Study Guide</option>
          <option value="video">Video Lesson</option>
          <option value="external_link">External Link</option>
        </select>

        <select className={styles.selectField} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value="All">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select className={styles.selectField} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="views">Most Viewed</option>
          <option value="downloads">Most Downloaded</option>
        </select>

        <button onClick={resetFilters} className={styles.resetBtn} title="Reset Filters">
          <RotateCcw size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Reset
        </button>
      </div>

      {/* Grid of Resources */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Loading curated resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <BookOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>No resources found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Try adjusting your search criteria or resetting filters.</p>
          <button onClick={resetFilters} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Reset Filters
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
                      res.type === 'pdf' ? styles.badgePdf :
                      res.type === 'placement_paper' ? styles.badgeQuestionPaper : styles.badgeNotes
                    }`}>
                      {res.type?.replace('_', ' ')}
                    </span>
                    <button
                      className={`${styles.bookmarkBtn} ${res.is_bookmarked ? styles.bookmarked : ''}`}
                      onClick={e => handleBookmarkToggle(e, res.id, res.is_bookmarked)}
                      title={res.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
                    >
                      <Bookmark size={18} fill={res.is_bookmarked ? '#f59e0b' : 'none'} />
                    </button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.resourceTitle}>{res.title}</h3>
                  <p className={styles.resourceDesc}>{res.description || 'Comprehensive learning material prepared for academic and placement success.'}</p>
                  
                  <div className={styles.metaPills}>
                    {res.subject && <span className={styles.metaPill}>{res.subject}</span>}
                    {res.department && <span className={styles.metaPill}>{res.department}</span>}
                    {res.difficulty && (
                      <span className={`${styles.difficultyBadge} ${
                        res.difficulty === 'beginner' ? styles.diffBeginner :
                        res.difficulty === 'advanced' ? styles.diffAdvanced : styles.diffIntermediate
                      }`}>
                        {res.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span><Eye size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> {res.view_count || 0}</span>
                    <span><Download size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> {res.download_count || 0}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {user && ['super_admin', 'college_admin', 'faculty'].includes(user.role) && (
                      <button onClick={e => handleDelete(e, res.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                    <span onClick={e => handleDownload(e, res.id, res.file_url)}
                      style={{ color: 'var(--accent-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      Get <Download size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {activeTab === 'all' && totalPages > 1 && (
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

      {/* Publish Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modal} onSubmit={handleAddResource}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Publish Learning Resource</h2>
            
            <div className={styles.formGroup}>
              <label>Resource Title</label>
              <input type="text" className={styles.formInput} required placeholder="E.g., Operating Systems Complete Guide & Question Bank"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea className={styles.formInput} placeholder="Brief summary of concepts, target semester, and key topics" rows={3}
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className={styles.formGroup}>
                <label>Resource Type</label>
                <select className={styles.formInput} value={resType} onChange={e => setResType(e.target.value)}>
                  <option value="notes">Notes</option>
                  <option value="pdf">PDF Document</option>
                  <option value="placement_paper">Placement Paper</option>
                  <option value="interview_questions">Interview Questions</option>
                  <option value="coding_resource">Coding Guide</option>
                  <option value="study_guide">Study Guide</option>
                  <option value="video">Video Lesson</option>
                  <option value="external_link">External Link</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Difficulty Level</label>
                <select className={styles.formInput} value={diff} onChange={e => setDiff(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

              <div className={styles.formGroup}>
                <label>Subject</label>
                <input type="text" className={styles.formInput} required placeholder="E.g., Operating Systems"
                  value={subj} onChange={e => setSubj(e.target.value)} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Tags (comma separated)</label>
              <input type="text" className={styles.formInput} placeholder="placement, dsa, notes, exam"
                value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>File URL / Resource Link</label>
              <input type="url" className={styles.formInput} placeholder="Link to PDF, Google Drive, or document"
                value={fileUrl} onChange={e => setFileUrl(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>External Video URL (Optional Youtube/Vimeo)</label>
              <input type="url" className={styles.formInput} placeholder="https://www.youtube.com/watch?v=..."
                value={externalVideoUrl} onChange={e => setExternalVideoUrl(e.target.value)} />
            </div>

            {user?.role === 'super_admin' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={isGlobal} onChange={e => setIsGlobal(e.target.checked)} />
                Make global (accessible across all institution colleges)
              </label>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
