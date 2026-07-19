'use client';

import { HelpCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function RecentQuestionsWidget() {
  // Solved topics mock placeholder data matching placement tests
  const mockQuestions = [
    { id: 1, title: 'Reverse a Linked List in place', category: 'Technical (DSA)', difficulty: 'Medium' },
    { id: 2, title: 'Find correct coding logic matching recursion tree', category: 'Logical Reasoning', difficulty: 'Easy' },
    { id: 3, title: 'Calculate compound interest ratios', category: 'Quantitative Aptitude', difficulty: 'Hard' },
  ];

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
          <span>Recent Questions</span>
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {mockQuestions.map((q) => (
          <div 
            key={q.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {q.title}
              </p>
              <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{q.category}</span>
                <span style={{ 
                  color: q.difficulty === 'Easy' ? 'var(--accent-success)' : q.difficulty === 'Medium' ? 'var(--accent-warning)' : 'var(--accent-danger)' 
                }}>
                  {q.difficulty}
                </span>
              </div>
            </div>

            <Link href="/practice" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}>
              <ExternalLink size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
