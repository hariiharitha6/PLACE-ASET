'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { personalDocumentService } from '../../../lib/personalDocumentService';
import { 
  UserCheck, Upload, FileText, Sparkles, BookOpen, Layers, 
  HelpCircle, Trash2, Plus, ArrowRight, ShieldCheck, CheckCircle2, Bot 
} from 'lucide-react';
import Link from 'next/link';
import styles from './personal.module.css';

export default function PersonalLearningModePage() {
  const { user } = useAuth();
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState(null);
  
  // Upload modal / form state
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [tags, setTags] = useState('DSA, Cheatsheet');
  const [uploading, setUploading] = useState(false);

  // Q&A state
  const [query, setQuery] = useState('');
  const [queryAnswer, setQueryAnswer] = useState(null);
  const [querying, setQuerying] = useState(false);

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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter a title');
    if (!rawText.trim()) return toast.error('Please paste or enter study content');

    setUploading(true);
    try {
      const doc = await personalDocumentService.uploadDocument({
        title,
        rawText,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        fileName: `${title.toLowerCase().replace(/\s+/g, '_')}.txt`,
        fileType: 'text/plain',
        fileSize: rawText.length,
      });

      setDocuments(prev => [doc, ...prev]);
      setActiveDoc(doc);
      setShowUpload(false);
      setTitle('');
      setRawText('');
      toast.success('Document uploaded and AI processed into summary, flashcards & quiz!');
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    try {
      await personalDocumentService.deleteDocument(docId);
      const updated = documents.filter(d => d.id !== docId);
      setDocuments(updated);
      if (activeDoc?.id === docId) {
        setActiveDoc(updated[0] || null);
      }
      toast.success('Document removed');
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
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={28} style={{ color: 'var(--accent-primary)' }} /> Personal Learning Mode & Private Studio
          </h1>
          <p>
            Independent learning space for personal notes, custom study materials, automated AI flashcards, quizzes, and private knowledge exploration.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowUpload(!showUpload)} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
          >
            <Plus size={16} /> Upload Notes / Material
          </button>
          
          <Link 
            href="/mentor" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}
          >
            <Bot size={16} style={{ color: '#818cf8' }} /> Chat in AI Mentor
          </Link>
        </div>
      </div>

      {/* Upload Form Modal / Drawer */}
      {showUpload && (
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} style={{ color: 'var(--accent-primary)' }} /> Add Personal Study Material
          </h3>
          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Dynamic Programming Memoization Notes"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Tags (comma-separated)</label>
                <input 
                  type="text" 
                  value={tags} 
                  onChange={e => setTags(e.target.value)} 
                  placeholder="e.g. DP, Algorithms, Cheatsheet"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Content / Notes Text (Extracted or Pasted):</label>
              <textarea 
                rows={6}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste summary notes, definitions, formulas, or code snippets here for AI indexing..."
                style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowUpload(false)} style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={uploading} style={{ padding: '10px 22px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> {uploading ? 'Processing with AI...' : 'Index with AI'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className={styles.grid}>
        {/* Left Column: Material Index */}
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Layers size={18} style={{ color: 'var(--accent-info)' }} /> Private Materials ({documents.length})
            </h3>
            <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> 100% Private (RLS Protected)
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              <Sparkles size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Loading private studio items...</p>
            </div>
          ) : documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <FileText size={36} style={{ opacity: 0.4, marginBottom: '10px' }} />
              <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>Your personal library is empty</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Upload your first notes or PDF text to generate automated flashcards, summaries, and quizzes.</p>
              <button onClick={() => setShowUpload(true)} style={{ marginTop: '12px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                Upload First Material
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documents.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => { setActiveDoc(doc); setQueryAnswer(null); }}
                  className={`${styles.docItem} ${activeDoc?.id === doc.id ? styles.docItemActive : ''}`}
                >
                  <div style={{ maxWidth: '80%' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{(doc.flashcards || []).length} Flashcards</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => handleDelete(doc.id, e)} 
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                    title="Delete Material"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Document Intelligence Studio */}
        <div className={styles.card}>
          {activeDoc ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{activeDoc.title}</h2>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {(activeDoc.tags || []).map((t, i) => (
                      <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '600' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                  <CheckCircle2 size={14} /> AI Indexed
                </span>
              </div>

              {/* AI Summary */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}>
                  <Sparkles size={16} /> AI Executive Summary
                </h4>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {activeDoc.ai_summary || 'Summary generated upon indexing.'}
                </div>
              </div>

              {/* Key Takeaways */}
              {activeDoc.key_takeaways?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}>
                    <BookOpen size={16} /> Key Takeaways
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
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                    🗂️ Active Recall Flashcards ({activeDoc.flashcards.length})
                  </h4>
                  <div className={styles.flashcardGrid}>
                    {activeDoc.flashcards.map((fc, i) => (
                      <div key={i} className={styles.flashcard}>
                        <div className={styles.flashcardQ}>Q: {fc.question}</div>
                        <div className={styles.flashcardA}>A: {fc.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ask Document AI */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                  💬 Ask Questions About This Document
                </h4>
                <form onSubmit={handleAskAI} style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. What is the time complexity mentioned in this document?"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <button type="submit" disabled={querying || !query.trim()} style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                    {querying ? 'Thinking...' : 'Ask AI'}
                  </button>
                </form>

                {queryAnswer && (
                  <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-primary)' }}>
                    <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>AI Answer:</strong>
                    {queryAnswer.answer}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Select a personal material from the left panel to inspect its AI summary, flashcards, and quizzes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
