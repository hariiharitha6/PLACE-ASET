'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { communityService } from '../../../../lib/communityService';
import { useToast } from '../../../../context/ToastContext';
import { Check, X, ShieldAlert, Award, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import styles from '../community.module.css';

export default function ReviewQueuePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await communityService.getReviewQueue({ page, limit: 10 });
      setSubmissions(res.submissions || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load review queue: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleReviewAction = async (id, action, notes) => {
    try {
      await communityService.reviewSubmission(id, { action, notes });
      toast.success(`Submission ${action}d successfully!`);
      loadQueue();
    } catch (err) {
      console.error(err);
      toast.error('Action failed: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Moderation Review Queue</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Review, edit, and approve community-submitted questions and resources for standard database insertion.
          </p>
        </div>
        <button onClick={loadQueue} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading review queue...</div>
      ) : submissions.length === 0 ? (
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          All caught up! No submissions pending moderation.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {submissions.map(sub => (
            <div key={sub.id} style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: '3fr 1.2fr',
              gap: '24px',
              alignItems: 'start'
            }}>
              {/* Submission details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    color: sub.type === 'question' ? 'var(--accent-primary)' : 'var(--accent-success)',
                    border: `1px solid ${sub.type === 'question' ? 'var(--border-accent)' : 'var(--accent-success)'}`,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {sub.type}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Submitted by {sub.users?.full_name || 'Student'} on {new Date(sub.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{sub.title}</h3>
                  {sub.explanation && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                      {sub.explanation}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  {sub.department && <span>Dept: <strong>{sub.department}</strong></span>}
                  {sub.topic && <span>Topic: <strong>{sub.topic}</strong></span>}
                  {sub.company && <span>Company: <strong>{sub.company}</strong></span>}
                  {sub.difficulty && <span>Difficulty: <strong>{sub.difficulty}</strong></span>}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignSelf: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
                <button
                  onClick={() => handleReviewAction(sub.id, 'approve', 'Approved by Moderator')}
                  style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--accent-success)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  <Check size={16} style={{ margin: '0 auto 0 0' }} /> Approve & Publish
                </button>
                
                <button
                  onClick={() => handleReviewAction(sub.id, 'reject', 'Rejected: Quality guidelines mismatch')}
                  style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--accent-danger)', border: '1px solid var(--accent-danger)', fontWeight: '600', cursor: 'pointer' }}
                >
                  <X size={16} style={{ margin: '0 auto 0 0' }} /> Reject
                </button>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    onClick={() => router.push(`/community/duplicates/${sub.id}`)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    <ShieldAlert size={12} /> Duplicates
                  </button>
                </div>
              </div>
            </div>
          ))}

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
        </div>
      )}
    </div>
  );
}
