'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { questionService } from '../../lib/questionService';

export default function RecentQuestionsWidget() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRecent() {
      try {
        const res = await questionService.searchQuestions({ limit: 4 });
        if (isMounted) {
          setQuestions(res?.questions || res?.data || []);
        }
      } catch (err) {
        // Fallback gracefully to empty array
        if (isMounted) setQuestions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRecent();
    return () => { isMounted = false; };
  }, []);

  return (
    <div style={{
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-glass)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} style={{ color: 'var(--accent-info)' }} />
          <span>Recent Practice Questions</span>
        </h3>
        <Link href="/questions" style={{ fontSize: '12px', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>
          Explore Bank →
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '12px', gap: '8px' }}>
          <Sparkles size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading active questions...
        </div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <BookOpen size={24} style={{ opacity: 0.5, marginBottom: '6px' }} />
          <p style={{ margin: 0 }}>No recent questions found.</p>
          <Link href="/practice" style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '600' }}>
            Start a practice session
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {questions.map((q) => {
            const title = q.statement || q.title || 'Practice Question';
            const category = q.subject || q.category || 'General';
            const difficulty = (q.difficulty || 'medium').toLowerCase();
            return (
              <div 
                key={q.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ maxWidth: '85%' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {title}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{category}</span>
                    <span style={{ 
                      color: difficulty === 'easy' ? 'var(--accent-success)' : difficulty === 'medium' ? 'var(--accent-warning)' : 'var(--accent-danger)',
                      textTransform: 'capitalize'
                    }}>
                      {difficulty}
                    </span>
                  </div>
                </div>

                <Link href={`/questions/${q.id}`} style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', padding: '6px' }} title="View Question">
                  <ExternalLink size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
