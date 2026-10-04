'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../lib/api';
import QuestionEditorModal from '../../../components/admin/QuestionEditorModal';
import EmptyState from '../../../components/ui/EmptyState';
import { 
  HelpCircle, Plus, Search, Filter, Trash2, Edit3, CheckCircle2, 
  AlertCircle, Archive, Upload, FileText, Check, X, Sparkles, RefreshCw
} from 'lucide-react';
import styles from './adminQuestions.module.css';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filterType, setFilterType] = useState('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msg, setMsg] = useState(null);

  // PDF Ingestion & Import Workflow State (Phase 8 & 10)
  const importFileRef = useRef(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState('idle'); // idle | uploading | reviewing | publishing | done | error
  const [importError, setImportError] = useState('');
  const [detectedQuestions, setDetectedQuestions] = useState([]);
  const [importDocTitle, setImportDocTitle] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions', {
        params: {
          search: search || undefined,
          type: filterType !== 'ALL' ? filterType : undefined,
          difficulty: filterDifficulty !== 'ALL' ? filterDifficulty.toLowerCase() : undefined,
          status: filterStatus !== 'ALL' ? filterStatus.toLowerCase() : undefined,
          limit: 50,
        },
      });
      const data = res?.data?.questions || res?.data || [];
      setQuestions(Array.isArray(data) ? data : []);
      setTotalCount(res?.data?.total || (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      console.error('Failed to load questions from database', err);
      setQuestions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterDifficulty, filterStatus]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleOpenCreate = () => {
    setSelectedQuestion(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setSelectedQuestion(q);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (updated) => {
    try {
      if (updated.id && !String(updated.id).startsWith('q-')) {
        await api.put(`/questions/${updated.id}`, updated);
      } else {
        await api.post('/questions', updated);
      }
      setMsg('Question successfully saved to database.');
      fetchQuestions();
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save question', err);
      setMsg('Error saving question: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleArchive = async (qId) => {
    try {
      await api.put(`/questions/${qId}/archive`);
      setQuestions((prev) => prev.filter((item) => item.id !== qId));
      setMsg('Question archived.');
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error('Failed to archive question', err);
    }
  };

  // Trigger browser file chooser for PDF import
  const handleSelectPdf = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAndExtractPdf(file);
  };

  const uploadAndExtractPdf = async (file) => {
    setIsImportModalOpen(true);
    setImportStatus('uploading');
    setImportError('');
    setImportDocTitle(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/admin/content/import-questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const extracted = res.data?.data?.questions || [];
      const cats = res.data?.data?.availableCategories || [];
      
      setDetectedQuestions(extracted);
      setAvailableCategories(cats);
      setImportStatus('reviewing');
    } catch (err) {
      console.error(err);
      setImportStatus('error');
      setImportError(err.response?.data?.message || err.message || 'Question extraction failed.');
    }
  };

  const handleUpdateQuestionCategory = (tempId, newCategoryId) => {
    setDetectedQuestions(prev => prev.map(q => {
      if (q.tempId === tempId) {
        const cat = availableCategories.find(c => c.id === newCategoryId);
        return { ...q, categoryId: newCategoryId, categoryName: cat?.name || q.categoryName };
      }
      return q;
    }));
  };

  const handleToggleApprove = (tempId) => {
    setDetectedQuestions(prev => prev.map(q => {
      if (q.tempId === tempId) {
        const nextStatus = q.approvalStatus === 'approved' ? 'rejected' : 'approved';
        return { ...q, approvalStatus: nextStatus };
      }
      return q;
    }));
  };

  const handlePublishAll = async () => {
    setImportStatus('publishing');
    try {
      const res = await api.post('/admin/content/publish-imported', {
        questions: detectedQuestions,
        sourceName: importDocTitle
      });

      setImportStatus('done');
      setMsg(`Published ${res.data?.data?.publishedCount || detectedQuestions.length} questions into Question Bank!`);
      fetchQuestions();
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportStatus('idle');
        setDetectedQuestions([]);
        setMsg(null);
      }, 2000);
    } catch (err) {
      console.error(err);
      setImportStatus('error');
      setImportError(err.response?.data?.message || err.message || 'Failed to publish questions.');
    }
  };

  return (
    <div className={styles.container}>
      {/* Hidden file input for question PDF upload */}
      <input 
        type="file" 
        ref={importFileRef} 
        style={{ display: 'none' }} 
        accept=".pdf,.docx,.txt"
        onChange={handleSelectPdf}
      />

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Institutional Question Bank Management</h1>
          <p className={styles.subtitle}>Curate, review, categorize, and publish academic exam and placement preparation questions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className={styles.secondaryBtn} 
            onClick={() => importFileRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
          >
            <Upload size={16} /> Import from PDF / Material
          </button>
          <button className={styles.primaryBtn} onClick={handleOpenCreate}>+ Create Question</button>
        </div>
      </div>

      {msg && (
        <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✅</span>
          <span>{msg}</span>
        </div>
      )}

      {/* Import & Review Workflow Modal (Phase 8 & 10) */}
      {isImportModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface, #1e293b)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={18} style={{ color: 'var(--accent-primary)' }} />
                  Question Import & Categorization Review
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  File: {importDocTitle}
                </span>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {importStatus === 'uploading' && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <Sparkles size={32} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--accent-primary)', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Extracting Questions from Document...</h4>
                  <p style={{ fontSize: '13px', margin: 0 }}>Running PDF parser, detecting MCQs, parsing options and answer keys.</p>
                </div>
              )}

              {importStatus === 'error' && (
                <div style={{ padding: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '700' }}>Extraction Failed</h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>{importError}</p>
                  <button 
                    onClick={() => importFileRef.current?.click()}
                    style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: '#ef4444', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Select Another File
                  </button>
                </div>
              )}

              {importStatus === 'publishing' && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <RefreshCw size={32} style={{ animation: 'spin 1.5s linear infinite', color: '#10b981', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Publishing Approved Questions...</h4>
                  <p style={{ fontSize: '13px', margin: 0 }}>Inserting verified questions and options into the institutional Question Bank.</p>
                </div>
              )}

              {importStatus === 'done' && (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#10b981' }}>
                  <CheckCircle2 size={44} style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', margin: '0 0 6px 0' }}>Import & Publishing Complete!</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>The questions are now live and accessible in the student Question Bank.</p>
                </div>
              )}

              {importStatus === 'reviewing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      🎉 {detectedQuestions.length} Questions Detected from Document
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Review categorizations, edit or reject, then click Publish.
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {detectedQuestions.map((q, idx) => (
                      <div 
                        key={q.tempId}
                        style={{
                          background: 'var(--bg-primary)',
                          border: q.approvalStatus === 'rejected' ? '1px solid #ef4444' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          opacity: q.approvalStatus === 'rejected' ? 0.6 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                            Q{q.questionNumber || idx + 1}. [{q.topic || 'General'}]
                          </span>

                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {/* Category Selector */}
                            <select
                              value={q.categoryId}
                              onChange={e => handleUpdateQuestionCategory(q.tempId, e.target.value)}
                              style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '11px', outline: 'none' }}
                            >
                              {availableCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleToggleApprove(q.tempId)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                background: q.approvalStatus === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                border: q.approvalStatus === 'approved' ? '1px solid #10b981' : '1px solid #ef4444',
                                color: q.approvalStatus === 'approved' ? '#10b981' : '#ef4444',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {q.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {q.statement}
                        </div>

                        {/* Options */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                          {q.options?.map((opt, oIdx) => (
                            <div 
                              key={oIdx}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '4px',
                                background: opt.label?.toUpperCase() === q.correctLetter?.toUpperCase() ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface)',
                                border: opt.label?.toUpperCase() === q.correctLetter?.toUpperCase() ? '1px solid #10b981' : '1px solid var(--border-color)',
                                fontSize: '11px',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <strong>{opt.label}.</strong> {opt.content}
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: '4px' }}>
                            <strong>Answer / Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {importStatus === 'reviewing' && (
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {detectedQuestions.filter(q => q.approvalStatus === 'approved').length} of {detectedQuestions.length} questions approved for publishing.
                </span>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setIsImportModalOpen(false)}
                    style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePublishAll}
                    style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Check size={16} /> Publish to Question Bank
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Questions in Bank</span>
          <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--text-primary)' }}>{totalCount}</h3>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Published to Students</span>
          <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--accent-success)' }}>
            {questions.filter(q => q.approval_status === 'approved' || q.is_published).length}
          </h3>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending Moderation</span>
          <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--accent-warning)' }}>
            {questions.filter(q => q.approval_status === 'pending').length}
          </h3>
        </div>
      </div>

      {/* Filter Controls */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="🔍 Search question statement, topic, keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={styles.select}>
          <option value="ALL">All Types</option>
          <option value="mcq_single">Single Choice MCQ</option>
          <option value="mcq_multiple">Multiple Choice MCQ</option>
          <option value="coding">Coding Problem</option>
          <option value="numerical">Numerical</option>
        </select>
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className={styles.select}>
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={styles.select}>
          <option value="ALL">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Main Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <p>Loading Question Bank...</p>
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={<HelpCircle size={44} style={{ opacity: 0.5 }} />}
          title="No questions found"
          description="Adjust your search filters or import a question bank PDF."
          actionText="+ Create Question"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Statement</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>
                    <div className={styles.statementText}>{q.statement}</div>
                  </td>
                  <td>
                    <span className={styles.badge}>{q.type}</span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[q.difficulty?.toLowerCase()] || ''}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${q.approval_status === 'approved' ? styles.approved : styles.pending}`}>
                      {q.approval_status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.iconBtn} onClick={() => handleOpenEdit(q)} title="Edit Question">
                        <Edit3 size={15} />
                      </button>
                      <button className={styles.iconBtn} onClick={() => handleArchive(q.id)} title="Archive">
                        <Archive size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Question Editor / Creator Modal */}
      {isModalOpen && (
        <QuestionEditorModal
          question={selectedQuestion}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveQuestion}
        />
      )}
    </div>
  );
}
