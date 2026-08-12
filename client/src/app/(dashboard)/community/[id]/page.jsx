'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { communityService } from '../../../../lib/communityService';
import { 
  ArrowLeft, ThumbsUp, Bookmark, MessageSquare, CheckCircle2, 
  Pin, Sparkles, Send, ShieldAlert, Code, CornerDownRight, User, Award 
} from 'lucide-react';
import styles from '../community.module.css';

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();
  const toast = useToast();

  const [disc, setDisc] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Suggestion State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState(null);

  // New Reply State
  const [replyContent, setReplyContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [parentReplyId, setParentReplyId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDiscussion = useCallback(async () => {
    setLoading(true);
    try {
      const data = await communityService.getDiscussionDetail(id);
      setDisc(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load discussion detail');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadDiscussion();
  }, [loadDiscussion]);

  const handleUpvoteDiscussion = async () => {
    if (!disc) return;
    try {
      const res = await communityService.toggleReaction({ discussionId: id, reactionType: 'upvote' });
      const delta = res.reacted ? 1 : -1;
      setDisc(prev => ({ ...prev, upvotes_count: Math.max(0, (prev.upvotes_count || 0) + delta) }));
    } catch (err) {
      toast.error('Upvote failed');
    }
  };

  const handleUpvoteReply = async (replyId) => {
    try {
      const res = await communityService.toggleReaction({ replyId, reactionType: 'upvote' });
      const delta = res.reacted ? 1 : -1;
      setDisc(prev => ({
        ...prev,
        replies: prev.replies.map(r => r.id === replyId ? { ...r, upvotes_count: Math.max(0, (r.upvotes_count || 0) + delta) } : r)
      }));
    } catch (err) {
      toast.error('Reply upvote failed');
    }
  };

  const handleAcceptAnswer = async (replyId) => {
    try {
      await communityService.acceptAnswer(id, replyId);
      toast.success('Reply marked as accepted solution');
      loadDiscussion();
    } catch (err) {
      toast.error('Failed to mark accepted answer: ' + err.message);
    }
  };

  const handleTogglePin = async () => {
    try {
      const res = await communityService.togglePin(id);
      toast.success(res.is_pinned ? 'Discussion pinned' : 'Discussion unpinned');
      setDisc(prev => ({ ...prev, is_pinned: res.is_pinned }));
    } catch (err) {
      toast.error('Pin action failed');
    }
  };

  const handleGetAISuggestion = async () => {
    setAiLoading(true);
    try {
      const res = await communityService.getAISuggestedAnswer(id);
      setAiAnswer(res.ai_suggested_answer);
      toast.success('AI solution generated');
    } catch (err) {
      toast.error('AI suggestion failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyContent) return;
    setIsSubmitting(true);
    try {
      await communityService.createReply(id, {
        content: replyContent,
        code_snippet: codeSnippet || undefined,
        parent_reply_id: parentReplyId || undefined
      });
      setReplyContent('');
      setCodeSnippet('');
      setParentReplyId(null);
      toast.success('Reply posted successfully');
      loadDiscussion();
    } catch (err) {
      toast.error('Failed to post reply: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <Sparkles size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <p>Loading discussion thread...</p>
      </div>
    );
  }

  if (!disc) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Discussion not found</h2>
        <button onClick={() => router.push('/community')} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Back to Community
        </button>
      </div>
    );
  }

  const isModerator = user && ['super_admin', 'college_admin', 'faculty', 'hod', 'host'].includes(user.role);
  const isOwner = user && user.id === disc.user_id;

  return (
    <div className={styles.container}>
      {/* Back button */}
      <button onClick={() => router.push('/community')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
        <ArrowLeft size={16} /> Back to Community Forum
      </button>

      {/* Main Discussion Post Header */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div className={styles.userLine}>
            <div className={styles.userAvatar}>
              {disc.users?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>{disc.users?.full_name || 'Student Author'}</span>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                {disc.users?.role || 'Member'} • Posted on {new Date(disc.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {disc.is_pinned && <span className={`${styles.badge} ${styles.badgePinned}`}><Pin size={12} /> Pinned</span>}
            {disc.is_solved && <span className={`${styles.badge} ${styles.badgeSolved}`}><CheckCircle2 size={12} /> Solved</span>}
            <span className={`${styles.badge} ${styles.badgeCategory}`}>{disc.category}</span>
            {isModerator && (
              <button onClick={handleTogglePin} style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                {disc.is_pinned ? 'Unpin' : 'Pin'}
              </button>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{disc.title}</h1>
        <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {disc.content}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button onClick={handleUpvoteDiscussion} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              <ThumbsUp size={16} style={{ color: 'var(--accent-primary)' }} /> Upvote ({disc.upvotes_count || 0})
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <MessageSquare size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {disc.replies?.length || 0} Replies
            </span>
          </div>

          <button onClick={handleGetAISuggestion} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            <Sparkles size={16} /> AI Suggested Solution
          </button>
        </div>
      </div>

      {/* AI Solution Box */}
      {aiLoading ? (
        <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
          <Sparkles size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
          <p>Generating AI code explanation & solution...</p>
        </div>
      ) : aiAnswer && (
        <div className={styles.aiBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> AI Solution & Concept Explanation
            </span>
            <button onClick={() => setAiAnswer(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>Dismiss</button>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {aiAnswer}
          </div>
        </div>
      )}

      {/* Replies Thread Header */}
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '8px' }}>
        Replies & Answers ({disc.replies?.length || 0})
      </h3>

      {/* Replies List */}
      {disc.replies?.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
          No answers posted yet. Be the first to answer this question!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {disc.replies.map(rep => (
            <div key={rep.id} className={`${styles.replyCard} ${rep.is_accepted_answer ? styles.replyAccepted : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={styles.userLine}>
                  <div className={styles.userAvatar}>
                    {rep.users?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{rep.users?.full_name || 'Contributor'}</span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {rep.users?.role || 'Member'} • {new Date(rep.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {rep.is_accepted_answer && (
                    <span className={`${styles.badge} ${styles.badgeSolved}`}>
                      <CheckCircle2 size={12} /> Accepted Solution
                    </span>
                  )}
                  {(isOwner || isModerator) && !rep.is_accepted_answer && (
                    <button onClick={() => handleAcceptAnswer(rep.id)} style={{ padding: '4px 10px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                      Mark Accepted
                    </button>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {rep.content}
              </div>

              {rep.code_snippet && (
                <div className={styles.codeBox}>
                  <code>{rep.code_snippet}</code>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px' }}>
                <button onClick={() => handleUpvoteReply(rep.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <ThumbsUp size={14} style={{ color: 'var(--accent-primary)' }} /> Helpful ({rep.upvotes_count || 0})
                </button>

                <button onClick={() => { setParentReplyId(rep.id); setReplyContent(`@${rep.users?.full_name || 'user'} `); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <CornerDownRight size={14} /> Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Reply Form */}
      <form onSubmit={handlePostReply} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
          {parentReplyId ? 'Post Nested Reply' : 'Post Your Answer'}
        </h3>

        <div className={styles.formGroup}>
          <label>Your Answer / Discussion Reply</label>
          <textarea
            className={styles.formInput}
            rows={4}
            required
            placeholder="Write your explanation or answer step by step..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Code Snippet (Optional)</label>
          <textarea
            className={styles.formInput}
            rows={3}
            style={{ fontFamily: 'monospace' }}
            placeholder="// Add code snippet if relevant..."
            value={codeSnippet}
            onChange={e => setCodeSnippet(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {parentReplyId && (
            <button type="button" onClick={() => setParentReplyId(null)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Cancel Nested Reply
            </button>
          )}
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} /> {isSubmitting ? 'Posting...' : 'Post Answer'}
          </button>
        </div>
      </form>
    </div>
  );
}
