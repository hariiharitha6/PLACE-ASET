'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { resourceService } from '../../../lib/resourceService';
import { supabase } from '../../../lib/supabase';
import { FileText, Download, Plus, Search, Eye, BookOpen, Trash2 } from 'lucide-react';
import styles from './resources.module.css';

export default function ResourcesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New resource form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resType, setResType] = useState('notes');
  const [fileUrl, setFileUrl] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadResources = async () => {
    try {
      const res = await resourceService.listResources({
        page, search, type, category_id: categoryId, sortBy, limit: 12
      });
      setResources(res.resources || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadResources();
  }, [page, search, type, categoryId, sortBy]);

  useEffect(() => {
    const loadCats = async () => {
      const { data } = await supabase.from('categories').select('id, name').order('name');
      setCategories(data || []);
    };
    loadCats();
  }, []);

  const handleDownload = async (id, url) => {
    try {
      await resourceService.downloadResource(id);
      loadResources(); // Refresh counters
      window.open(url, '_blank');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Resource',
      message: 'Are you sure you want to delete this resource?',
      type: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await resourceService.deleteResource(id);
      toast.success('Resource deleted successfully!');
      loadResources();
    } catch (e) {
      toast.error('Delete failed: ' + e.message);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!title || !fileUrl) return;
    setIsSubmitting(true);
    try {
      await resourceService.createResource({
        title, description, type: resType, file_url: fileUrl,
        category_id: newCatId || undefined, is_global: isGlobal
      });
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setFileUrl('');
      setNewCatId('');
      setIsGlobal(false);
      toast.success('Resource uploaded successfully!');
      loadResources();
    } catch (err) {
      toast.error('Failed to upload: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditor = user && ['super_admin', 'college_admin', 'host'].includes(user.role);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Resource Library</h1>
          <p>Access notes, syllabi, previous questions, and placement guides.</p>
        </div>
        {isEditor && (
          <button onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            <Plus size={16} /> Upload Resource
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className={styles.filterBar}>
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search resources..." className={styles.searchField}
          value={search} onChange={e => setSearch(e.target.value)} />
        
        <select className={styles.selectField} value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="notes">Notes</option>
          <option value="syllabus">Syllabus</option>
          <option value="question_paper">Question Paper</option>
          <option value="placement_guide">Placement Guide</option>
        </select>

        <select className={styles.selectField} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select className={styles.selectField} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="downloads">Most Downloaded</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>

      {/* Grid of resources */}
      {resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No resources found.
        </div>
      ) : (
        <div className={styles.grid}>
          {resources.map(res => (
            <div key={res.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.resourceIcon}>
                  <FileText size={20} />
                </div>
                <span className={`${styles.badge} ${res.type === 'notes' ? styles.badgeNotes : res.type === 'syllabus' ? styles.badgeSyllabus : styles.badgeQuestionPaper}`}>
                  {res.type?.replace('_', ' ')}
                </span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.resourceTitle}>{res.title}</h3>
                <p className={styles.resourceDesc}>{res.description || 'No description provided.'}</p>
              </div>

              <div className={styles.cardFooter}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span><Eye size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} /> {res.view_count || 0}</span>
                  <span><Download size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} /> {res.download_count || 0}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {isEditor && (
                    <button onClick={() => handleDelete(res.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDownload(res.id, res.file_url)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Get <Download size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Previous
          </button>
          <span style={{ padding: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
            style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Next
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modal} onSubmit={handleAddResource}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Upload Resource</h2>
            
            <div className={styles.formGroup}>
              <label>Title</label>
              <input type="text" className={styles.formInput} required placeholder="E.g., Operating Systems Complete Guide"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea className={styles.formInput} placeholder="Brief summary of the content" rows={3}
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Type</label>
              <select className={styles.formInput} value={resType} onChange={e => setResType(e.target.value)}>
                <option value="notes">Notes</option>
                <option value="syllabus">Syllabus</option>
                <option value="question_paper">Question Paper</option>
                <option value="placement_guide">Placement Guide</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Category (optional)</label>
              <select className={styles.formInput} value={newCatId} onChange={e => setNewCatId(e.target.value)}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>File URL</label>
              <input type="url" className={styles.formInput} required placeholder="Link to PDF, Doc, or Drive file"
                value={fileUrl} onChange={e => setFileUrl(e.target.value)} />
            </div>

            {user?.role === 'super_admin' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={isGlobal} onChange={e => setIsGlobal(e.target.checked)} />
                Make this resource global (accessible to all colleges)
              </label>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                {isSubmitting ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
