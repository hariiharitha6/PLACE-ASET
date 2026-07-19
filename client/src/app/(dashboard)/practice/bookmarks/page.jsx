'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../../context/ToastContext';
import { practiceService } from '../../../../lib/practiceService';
import { supabase } from '../../../../lib/supabase';
import { ChevronLeft, Trash2, ArrowLeft, Bookmark, Zap, BookOpen } from 'lucide-react';
import styles from '../practice.module.css';

export default function BookmarksWorkspacePage() {
  const router = useRouter();
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookmarks = async () => {
    setIsLoading(true);
    try {
      const qIds = await practiceService.getBookmarks();
      if (qIds.length === 0) {
        setQuestions([]);
        setIsLoading(false);
        return;
      }

      // Fetch questions corresponding to these IDs
      const { data: qData, error } = await supabase
        .from('questions')
        .select('id, statement, difficulty, type, categories(name)')
        .in('id', qIds);

      if (error) throw new Error(error.message);
      setQuestions(qData || []);
    } catch (err) {
      toast.error('Failed to load bookmarks: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleUnbookmark = async (questionId) => {
    try {
      await practiceService.toggleBookmark(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      toast.success('Question removed from bookmarks.');
    } catch (err) {
      toast.error('Failed to remove bookmark: ' + err.message);
    }
  };

  const handleStartPractice = async () => {
    try {
      const res = await practiceService.startSession({
        mode: 'mixed',
        questionCount: Math.min(questions.length, 15),
        bookmarked_only: true
      });
      sessionStorage.setItem('practiceSession', JSON.stringify(res));
      toast.success('Practice session started with bookmarked questions!');
      router.push(`/practice/arena`);
    } catch (err) {
      toast.error('Failed to start session: ' + err.message);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => router.push('/practice')}
          style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px 12px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>Bookmarked Questions</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Review and re-solve questions you flagged during practice.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Main List */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>Loading bookmarked questions...</p>
          ) : questions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>
              No bookmarks found. Flag questions in the practice arena to review them here!
            </p>
          ) : (
            questions.map((q) => (
              <div 
                key={q.id}
                style={{
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: '700' }}>
                      {q.difficulty}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Topic: {q.categories?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {q.statement}
                  </p>
                </div>
                <button 
                  onClick={() => handleUnbookmark(q.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '6px' }}
                  title="Remove Bookmark"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Right Info Box */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} /> Bookmark Practice
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Practice makes perfect. You can quickly configure a custom test sheet using only your bookmarked questions.
          </p>
          <button 
            onClick={handleStartPractice}
            disabled={questions.length === 0}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              color: '#fff',
              border: 'none',
              cursor: questions.length === 0 ? 'default' : 'pointer',
              fontWeight: '700',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: questions.length === 0 ? 0.6 : 1
            }}
          >
            <Zap size={14} /> Practice Bookmarks
          </button>
        </div>
      </div>
    </div>
  );
}
