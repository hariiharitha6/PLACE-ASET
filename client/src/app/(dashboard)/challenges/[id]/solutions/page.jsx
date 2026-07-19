'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { challengeService } from '../../../../../lib/challengeService';
import { useToast } from '../../../../../context/ToastContext';
import { 
  ChevronLeft, 
  BookOpen, 
  MessageSquare, 
  CornerDownRight, 
  Send 
} from 'lucide-react';
import styles from '../../challenges.module.css';

export default function ChallengeSolutionsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null); // commentId
  const [replyText, setReplyText] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSolutionsAndComments = async () => {
    try {
      // 1. Fetch questions with solutions via authenticated API endpoint
      const solutionsData = await challengeService.getChallengeQuestionsWithSolutions(id);
      setQuestions(solutionsData || []);

      // 2. Fetch discussions comments
      const comms = await challengeService.getChallengeDiscussions(id);
      setComments(comms || []);
    } catch (err) {
      console.error('Failed to load solution walk', err);
      setError('Could not retrieve solutions or discussions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutionsAndComments();
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const added = await challengeService.postComment(id, newComment);
      setComments(prev => [...prev, added]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error('Failed to post comment: ' + err.message);
    }
  };

  const handlePostReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const added = await challengeService.postComment(id, replyText, parentId);
      setComments(prev => [...prev, added]);
      setReplyText('');
      setReplyTo(null);
      toast.success('Reply posted!');
    } catch (err) {
      toast.error('Failed to post reply: ' + err.message);
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading solutions walkthrough...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-danger)' }}>
        <p>{error}</p>
        <button className={styles.btnSecondary} onClick={() => router.push('/challenges')} style={{ margin: '16px auto' }}>Back</button>
      </div>
    );
  }

  // Filter top-level comments vs replies
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className={styles.btnSecondary} onClick={() => router.push(`/challenges/${id}`)} style={{ padding: '8px 12px' }}>
          <ChevronLeft size={16} /> Challenge details
        </button>
        <div className={styles.titleSection}>
          <h1>Solutions & Q&A Discussion</h1>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.2fr',
        gap: '24px'
      }}
      className="solutions-grid-layout"
      >
        
        {/* Walkthrough list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, idx) => {
            const question = q.questions;
            return (
              <div key={idx} className={styles.challengeCard} style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>Question {idx + 1} ({q.points} Points)</span>
                  <span style={{ textTransform: 'capitalize' }}>Type: {question.type?.replace(/_/g, ' ')}</span>
                </div>

                <div className={styles.statement} style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
                  {question.statement}
                </div>

                {/* Options List */}
                {question.question_options && question.question_options.length > 0 && (
                  <div className={styles.optionsList}>
                    {question.question_options.map((opt) => (
                      <div 
                        key={opt.id}
                        className={`${styles.optionItem} ${opt.is_correct ? styles.optionItemCorrect : ''}`}
                      >
                        <span className={`${styles.optionLabel} ${opt.is_correct ? styles.optionLabelCorrect : styles.optionLabelNormal}`}>
                          {opt.label}
                        </span>
                        <span className={styles.optionText}>{opt.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                  <div style={{ marginTop: '16px' }}>
                    <div className={styles.previewLabel} style={{ fontSize: '11px' }}>Official Solution Explanation</div>
                    <div className={styles.explanationBox}>
                      {question.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Discussion Sidebar */}
        <div className={styles.discussionSection}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} />
            <span>Discussion Board</span>
          </h3>

          {/* Comment Form */}
          <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or comment..."
              className={styles.searchInput}
              style={{ padding: '10px 12px 10px 12px' }}
            />
            <button type="submit" className={styles.btnPrimary} style={{ padding: '10px' }}>
              <Send size={16} />
            </button>
          </form>

          {/* Comments List */}
          <div className={styles.commentsList}>
            {rootComments.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '16px 0' }}>
                No comments posted yet. Start the conversation!
              </p>
            ) : (
              rootComments.map((comment) => (
                <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Root Comment */}
                  <div className={styles.commentCard}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{comment.users?.full_name}</span>
                      <span className={styles.commentTime}>{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className={styles.commentText}>{comment.comment}</p>
                    <button 
                      onClick={() => setReplyTo(comment.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '500',
                        alignSelf: 'flex-end'
                      }}
                    >
                      Reply
                    </button>
                  </div>

                  {/* Replies list */}
                  {getReplies(comment.id).map((rep) => (
                    <div 
                      key={rep.id} 
                      className={styles.commentCard}
                      style={{
                        marginLeft: '24px',
                        borderLeft: '2px solid var(--border-accent)',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <div className={styles.commentHeader}>
                        <CornerDownRight size={12} style={{ color: 'var(--text-muted)' }} />
                        <span className={styles.commentAuthor}>{rep.users?.full_name}</span>
                        <span className={styles.commentTime}>{new Date(rep.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className={styles.commentText} style={{ marginLeft: '16px' }}>{rep.comment}</p>
                    </div>
                  ))}

                  {/* Reply Input Form */}
                  {replyTo === comment.id && (
                    <form 
                      onSubmit={(e) => handlePostReply(e, comment.id)}
                      style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}
                    >
                      <input 
                        type="text" 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Reply to comment..."
                        className={styles.searchInput}
                        style={{ padding: '8px 10px', fontSize: '12px' }}
                        autoFocus
                      />
                      <button type="submit" className={styles.btnPrimary} style={{ padding: '8px' }}>
                        <Send size={14} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setReplyTo(null)}
                        className={styles.btnSecondary}
                        style={{ padding: '8px', fontSize: '12px' }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .solutions-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
