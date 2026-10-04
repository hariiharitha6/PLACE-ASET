'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { personalDocumentService } from '../../../lib/personalDocumentService';
import { 
  UserCheck, Upload, FileText, Sparkles, BookOpen, Layers, 
  HelpCircle, Trash2, Plus, ArrowRight, ShieldCheck, CheckCircle2, 
  Bot, ExternalLink, RefreshCw, X, File, AlertCircle, PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import EmptyState from '../../../components/ui/EmptyState';
import styles from './personal.module.css';

export default function PersonalLearningModePage() {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState(null);
  
  // Real File Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('Aptitude, Core Placement');
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | processing | ready | error
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Q&A with Document
  const [query, setQuery] = useState('');
  const [queryAnswer, setQueryAnswer] = useState(null);
  const [querying, setQuerying] = useState(false);

  // Document Signed URL opening state
  const [openingDocId, setOpeningDocId] = useState(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const list = await personalDocumentService.getUserDocuments();
      setDocuments(list || []);
      if (list && list.length > 0) {
        setActiveDoc(list[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load personal documents');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Handle file selection from browser file chooser
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file) => {
    const maxSizeBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error('File size exceeds the 25MB limit.');
      return;
    }

    const allowed = ['pdf', 'txt', 'md', 'docx', 'png', 'jpg', 'jpeg'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Supported formats: PDF, DOCX, TXT, PNG, JPG');
      return;
    }

    setSelectedFile(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
    setTitle(cleanTitle);
    setUploadStatus('idle');
    setUploadError('');
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setTitle('');
    setUploadStatus('idle');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit file upload to backend pipeline
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return toast.error('Please select a file to upload');
    }
    if (!title.trim()) {
      return toast.error('Please enter a title for the material');
    }

    setUploadStatus('uploading');
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('tags', tags);

      setUploadStatus('processing');
      const doc = await personalDocumentService.uploadFile(formData);

      setUploadStatus('ready');
      setDocuments(prev => [doc, ...prev]);
      setActiveDoc(doc);
      toast.success(`"${doc.title}" processed! Extracted ${doc.extracted_questions?.length || 0} questions.`);
      
      // Reset form
      setTimeout(() => {
        handleClearSelectedFile();
        setShowUpload(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'File upload failed. Please try again.';
      setUploadStatus('error');
      setUploadError(errMsg);
      toast.error(errMsg);
    }
  };

  // Open secure signed URL for viewing uploaded PDF
  const handleOpenDocument = async (docId, storagePath) => {
    setOpeningDocId(docId);
    try {
      const signedUrl = await personalDocumentService.getSignedUrl(docId);
      if (signedUrl) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.info('Direct viewing URL not available for this document.');
      }
    } catch (err) {
      toast.error('Could not open document: ' + err.message);
    } finally {
      setOpeningDocId(null);
    }
  };

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this study material?')) return;
    try {
      await personalDocumentService.deleteDocument(docId);
      const updated = documents.filter(d => d.id !== docId);
      setDocuments(updated);
      if (activeDoc?.id === docId) {
        setActiveDoc(updated[0] || null);
      }
      toast.success('Document removed from your private library.');
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!activeDoc || !query.trim() || querying) return;

    setQuerying(true);
    try {
      const res = await personalDocumentService.askDocumentAI(activeDoc.id, query);
      setQueryAnswer(res);
      toast.success('AI answer generated from document context');
    } catch (err) {
      toast.error('Query failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hidden File Picker Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={28} style={{ color: 'var(--accent-primary)' }} /> Personal Learning
          </h1>
          <p>
            Your private study workspace. Upload your notes or PDFs. AI will extract practice questions, create chapter summaries, and interactive flashcards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setShowUpload(true); setTimeout(() => fileInputRef.current?.click(), 100); }} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--accent-primary, #6366f1)', 
              color: '#fff', 
              border: 'none', 
              fontWeight: '700', 
              fontSize: '13px', 
              cursor: 'pointer' 
            }}
          >
            <Upload size={16} /> Upload Material (PDF / Notes)
          </button>
          
          <Link 
            href="/assistant" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 18px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--bg-glass)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-primary)', 
              textDecoration: 'none', 
              fontWeight: '600', 
              fontSize: '13px' 
            }}
          >
            <Bot size={16} style={{ color: '#818cf8' }} /> PLACE Assistant
          </Link>
        </div>
      </div>

      {/* Upload Modal / Drop Area */}
      {showUpload && (
        <div style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Upload size={18} style={{ color: 'var(--accent-primary)' }} /> Upload Study Material
            </h3>
            <button 
              onClick={() => setShowUpload(false)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleUploadSubmit}>
            {/* Drag & Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragOver ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragOver ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-primary)',
                transition: 'all 0.2s ease',
                marginBottom: '16px'
              }}
            >
              {selectedFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                    <FileText size={24} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); handleClearSelectedFile(); }} 
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                    title="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={36} style={{ color: 'var(--accent-primary)', marginBottom: '10px', opacity: 0.8 }} />
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    Click to select a file or drag and drop here
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Supports PDF, DOCX, TXT, or scan images (Max: 25 MB)
                  </p>
                </div>
              )}
            </div>

            {/* Title & Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Material Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Placement Aptitude Study Material"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Tags</label>
                <input 
                  type="text" 
                  value={tags} 
                  onChange={e => setTags(e.target.value)} 
                  placeholder="e.g. Aptitude, Percentages"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            {/* Status / Error Alert */}
            {uploadStatus === 'error' && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>Upload Failed: {uploadError}</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => { setShowUpload(false); handleClearSelectedFile(); }} 
                style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'processing'} 
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'var(--accent-primary, #6366f1)', 
                  color: '#fff', 
                  border: 'none', 
                  fontWeight: '700', 
                  cursor: (!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'processing') ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '13px',
                  opacity: (!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'processing') ? 0.7 : 1
                }}
              >
                {uploadStatus === 'uploading' ? (
                  <>Uploading to Storage...</>
                ) : uploadStatus === 'processing' ? (
                  <>
                    <Sparkles size={16} style={{ animation: 'spin 1.5s linear infinite' }} />
                    Processing with AI...
                  </>
                ) : uploadStatus === 'ready' ? (
                  <>
                    <CheckCircle2 size={16} />
                    Ready!
                  </>
                ) : uploadStatus === 'error' ? (
                  <>
                    <RefreshCw size={16} />
                    Retry Upload
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload & Extract
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className={styles.grid}>
        {/* Left Column: My Materials (Persistent List) */}
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Layers size={18} style={{ color: 'var(--accent-primary)' }} /> My Materials ({documents.length})
            </h3>
            <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
              <ShieldCheck size={14} /> Private & RLS Scoped
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Sparkles size={22} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--accent-primary)' }} />
              <p style={{ fontSize: '13px', marginTop: '10px' }}>Loading private materials...</p>
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={<FileText size={44} style={{ opacity: 0.5 }} />}
              title="No study materials yet"
              description="Upload your placement PDFs or notes. AI will extract practice questions and chapter flashcards."
              actionText="Upload First Document"
              onAction={() => { setShowUpload(true); setTimeout(() => fileInputRef.current?.click(), 100); }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documents.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => { setActiveDoc(doc); setQueryAnswer(null); }}
                  className={`${styles.docItem} ${activeDoc?.id === doc.id ? styles.docItemActive : ''}`}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: activeDoc?.id === doc.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: activeDoc?.id === doc.id ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    transition: 'border 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ maxWidth: '80%' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>● Ready</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      {doc.file_name && <span>• {doc.file_name}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button 
                      onClick={(e) => handleDelete(doc.id, e)} 
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                      title="Delete Material"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick links to Question Bank and Practice */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link 
              href="/practice" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlayCircle size={16} style={{ color: '#10b981' }} /> Practice Question Arena
              </span>
              <ArrowRight size={14} />
            </Link>

            <Link 
              href="/dashboard" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} style={{ color: 'var(--accent-primary)' }} /> Placement Dashboard
              </span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Column: AI Document Intelligence Studio */}
        <div className={styles.card}>
          {activeDoc ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Document Header & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{activeDoc.title}</h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    File: {activeDoc.file_name} • {(activeDoc.extracted_text || '').length} characters indexed
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(activeDoc.tags || []).map((t, i) => (
                      <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '600' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {activeDoc.storage_path && (
                    <button 
                      onClick={() => handleOpenDocument(activeDoc.id, activeDoc.storage_path)}
                      disabled={openingDocId === activeDoc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <ExternalLink size={14} /> {openingDocId === activeDoc.id ? 'Opening...' : 'Open File'}
                    </button>
                  )}

                  <Link
                    href={`/practice?topic=${encodeURIComponent(activeDoc.title)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-primary)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '700',
                      textDecoration: 'none'
                    }}
                  >
                    <PlayCircle size={14} /> Practice Questions
                  </Link>
                </div>
              </div>

              {/* Extracted Questions Notice */}
              {activeDoc.extracted_questions && activeDoc.extracted_questions.length > 0 && (
                <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#10b981', fontWeight: '600' }}>
                    <CheckCircle2 size={16} />
                    <span>{activeDoc.extracted_questions.length} questions extracted and saved to your Question Bank</span>
                  </div>
                  <Link 
                    href="/practice" 
                    style={{ fontSize: '12px', color: '#10b981', textDecoration: 'underline', fontWeight: '700' }}
                  >
                    Start Practice →
                  </Link>
                </div>
              )}

              {/* AI Summary */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}>
                  <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} /> Summary & Study Notes
                </h4>
                <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {activeDoc.ai_summary || 'Summary generated upon indexing.'}
                </div>
              </div>

              {/* Key Takeaways */}
              {activeDoc.key_takeaways?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}>
                    <BookOpen size={15} style={{ color: '#f59e0b' }} /> Key Concepts
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {activeDoc.key_takeaways.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Generated Flashcards */}
              {activeDoc.flashcards?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                    Active Recall Flashcards ({activeDoc.flashcards.length})
                  </h4>
                  <div className={styles.flashcardGrid}>
                    {activeDoc.flashcards.map((fc, i) => (
                      <div key={i} className={styles.flashcard} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '6px' }}>Q: {fc.question}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>A: {fc.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ask Document AI */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot size={15} style={{ color: 'var(--accent-primary)' }} /> Ask Questions About This Document
                </h4>
                <form onSubmit={handleAskAI} style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. What is the time complexity or main formula in this material?"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                  />
                  <button 
                    type="submit" 
                    disabled={querying || !query.trim()} 
                    style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                  >
                    {querying ? 'Thinking...' : 'Ask AI'}
                  </button>
                </form>

                {queryAnswer && (
                  <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>AI Answer:</strong>
                    {queryAnswer.answer}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Select a personal material from the list to view its summary, flashcards, and quizzes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
