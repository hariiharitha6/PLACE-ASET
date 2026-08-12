'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { resourceService } from '../../../lib/resourceService';
import { 
  BookOpen, Plus, Eye, Download, Bookmark, Trash2, Edit3, 
  Sparkles, FileText, CheckCircle, BarChart2, Video, Globe, Lock
} from 'lucide-react';

export default function FacultyResourcesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [analytics, setAnalytics] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resType, setResType] = useState('notes');
  const [fileUrl, setFileUrl] = useState('');
  const [dept, setDept] = useState('Computer Science & Engineering');
  const [subj, setSubj] = useState('Operating Systems');
  const [sem, setSem] = useState('Semester 5');
  const [diff, setDiff] = useState('intermediate');
  const [tagsInput, setTagsInput] = useState('exam, notes, operating systems');
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [externalResourceUrl, setExternalResourceUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFacultyData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsData, resList] = await Promise.all([
        resourceService.getFacultyAnalytics(),
        resourceService.listResources({ faculty: user?.id, limit: 50 })
      ]);
      setAnalytics(analyticsData);
      setResources(resList.resources || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load faculty resource management data');
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      loadFacultyData();
    }
  }, [user, loadFacultyData]);

  const openCreateModal = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setResType('notes');
    setFileUrl('');
    setDept(user?.department_name || 'Computer Science & Engineering');
    setSubj('Data Structures');
    setSem('Semester 5');
    setDiff('intermediate');
    setTagsInput('lecture, exam, study material');
    setExternalVideoUrl('');
    setExternalResourceUrl('');
    setIsPublished(true);
    setShowModal(true);
  };

  const openEditModal = (res) => {
    setEditId(res.id);
    setTitle(res.title || '');
    setDescription(res.description || '');
    setResType(res.type || 'notes');
    setFileUrl(res.file_url || '');
    setDept(res.department || 'Computer Science & Engineering');
    setSubj(res.subject || '');
    setSem(res.semester || 'Semester 5');
    setDiff(res.difficulty || 'intermediate');
    setTagsInput((res.tags || []).join(', '));
    setExternalVideoUrl(res.external_video_url || '');
    setExternalResourceUrl(res.external_resource_url || '');
    setIsPublished(res.is_published !== false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    setIsSubmitting(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
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
        is_published: isPublished
      };

      if (editId) {
        await resourceService.updateResource(editId, payload);
        toast.success('Resource updated successfully');
      } else {
        await resourceService.createResource(payload);
        toast.success('Resource published & queued for AI analysis');
      }
      setShowModal(false);
      loadFacultyData();
    } catch (err) {
      toast.error('Operation failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Faculty Resource',
      message: 'Are you sure you want to delete this resource? Students will no longer be able to access it.',
      type: 'danger'
    });
    if (!isConfirmed) return;
    try {
      await resourceService.deleteResource(id);
      toast.success('Resource deleted successfully');
      loadFacultyData();
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  const togglePublishStatus = async (res) => {
    try {
      await resourceService.updateResource(res.id, { is_published: !res.is_published });
      toast.success(res.is_published ? 'Resource unpublished' : 'Resource published');
      loadFacultyData();
    } catch (err) {
      toast.error('Failed to toggle publication status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            👨‍🏫 Faculty Resource Publishing & Analytics
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Publish study materials, previous exam questions, lecture slides, and video links for students.
          </p>
        </div>

        <button onClick={openCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
          <Plus size={16} /> Publish New Resource
        </button>
      </div>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Uploads</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '4px', margin: 0 }}>{analytics.totalResources}</h2>
          </div>

          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Student Views</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-success)', marginTop: '4px', margin: 0 }}>{analytics.totalViews}</h2>
          </div>

          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Downloads</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6', marginTop: '4px', margin: 0 }}>{analytics.totalDownloads}</h2>
          </div>

          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Student Bookmarks</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b', marginTop: '4px', margin: 0 }}>{analytics.totalBookmarks}</h2>
          </div>
        </div>
      )}

      {/* Published Resources List */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>Published Learning Resources</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Sparkles size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
            <p>Loading published resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <BookOpen size={36} style={{ marginBottom: '8px' }} />
            <p>You haven&apos;t uploaded any resources yet. Click &quot;Publish New Resource&quot; to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: 'var(--text-primary)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Title & Type</th>
                  <th style={{ padding: '12px 16px' }}>Subject & Dept</th>
                  <th style={{ padding: '12px 16px' }}>Views</th>
                  <th style={{ padding: '12px 16px' }}>Downloads</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(res => (
                  <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      <Link href={`/resources/${res.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {res.title}
                      </Link>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400', marginTop: '2px' }}>
                        Type: {res.type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {res.subject || 'General'}
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{res.department}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{res.view_count || 0}</td>
                    <td style={{ padding: '14px 16px' }}>{res.download_count || 0}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => togglePublishStatus(res)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: res.is_published !== false ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                        {res.is_published !== false ? <Globe size={14} /> : <Lock size={14} />}
                        {res.is_published !== false ? 'Published' : 'Unpublished'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => openEditModal(res)} style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(res.id)} style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Publish/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyCenter: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '28px', width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: '16px', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              {editId ? 'Edit Resource' : 'Publish Learning Resource'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Title</label>
              <input type="text" required className="formInput" style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                placeholder="E.g., Operating Systems Complete Guide" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Description</label>
              <textarea rows={3} style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                placeholder="Summary of topics covered" value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Type</label>
                <select style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  value={resType} onChange={e => setResType(e.target.value)}>
                  <option value="notes">Notes</option>
                  <option value="pdf">PDF Document</option>
                  <option value="placement_paper">Placement Paper</option>
                  <option value="interview_questions">Interview Prep</option>
                  <option value="coding_resource">Coding Guide</option>
                  <option value="study_guide">Study Guide</option>
                  <option value="video">Video Lesson</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Difficulty</label>
                <select style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  value={diff} onChange={e => setDiff(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Department</label>
                <select style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  value={dept} onChange={e => setDept(e.target.value)}>
                  <option value="Computer Science & Engineering">CSE</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Electrical & Electronics">EEE</option>
                  <option value="Mechanical Engineering">ME</option>
                  <option value="Civil Engineering">CE</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Subject</label>
                <input type="text" required style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  placeholder="Subject name" value={subj} onChange={e => setSubj(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>File / Document URL</label>
              <input type="url" style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                placeholder="Link to file or document" value={fileUrl} onChange={e => setFileUrl(e.target.value)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>External Video URL (Optional)</label>
              <input type="url" style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                placeholder="YouTube / Vimeo video link" value={externalVideoUrl} onChange={e => setExternalVideoUrl(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" onClick={() => setShowModal(false)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                {isSubmitting ? 'Saving...' : 'Save & Publish'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
