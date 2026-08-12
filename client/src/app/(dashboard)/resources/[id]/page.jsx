'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { resourceService } from '../../../../lib/resourceService';
import { 
  FileText, Download, Bookmark, Eye, ArrowLeft, ExternalLink, 
  Sparkles, Video, HelpCircle, CheckCircle2, BookOpen, Layers, 
  Send, User, Clock, Award
} from 'lucide-react';
import styles from '../resources.module.css';

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();
  const toast = useToast();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Interactive state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiActivePrompt, setAiActivePrompt] = useState(null);
  const [customQuery, setCustomQuery] = useState('');

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resourceService.getResource(id);
      setResource(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resource details');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleBookmarkToggle = async () => {
    if (!resource) return;
    try {
      if (resource.is_bookmarked) {
        await resourceService.removeBookmark(id);
        toast.success('Removed from bookmarks');
      } else {
        await resourceService.addBookmark(id);
        toast.success('Resource bookmarked');
      }
      setResource(prev => ({ ...prev, is_bookmarked: !prev.is_bookmarked }));
    } catch (err) {
      toast.error('Bookmark toggle failed: ' + err.message);
    }
  };

  const handleDownload = async () => {
    if (!resource) return;
    try {
      await resourceService.downloadResource(id);
      if (resource.file_url && resource.file_url.startsWith('http')) {
        window.open(resource.file_url, '_blank');
      } else {
        toast.success('Resource download initiated');
      }
    } catch (err) {
      toast.error('Download error: ' + err.message);
    }
  };

  const handleRunAIPrompt = async (promptType, customText) => {
    setAiLoading(true);
    setAiActivePrompt(promptType);
    try {
      const res = await resourceService.runResourceAIPrompt(id, promptType, customText);
      setAiResponse(res.response);
      toast.success('AI insights generated');
    } catch (err) {
      toast.error('AI prompt failed: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <Sparkles size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <p>Loading resource preview and AI analysis...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Resource not found</h2>
        <button onClick={() => router.push('/resources')} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Back to Resource Hub
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Back Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.push('/resources')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          <ArrowLeft size={16} /> Back to Hub
        </button>
      </div>

      {/* Resource Detail Header */}
      <div className={styles.detailHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span className={`${styles.badge} ${resource.type === 'video' ? styles.badgeVideo : styles.badgePdf}`}>
                {resource.type?.replace('_', ' ')}
              </span>
              {resource.difficulty && (
                <span className={`${styles.difficultyBadge} ${
                  resource.difficulty === 'beginner' ? styles.diffBeginner :
                  resource.difficulty === 'advanced' ? styles.diffAdvanced : styles.diffIntermediate
                }`}>
                  {resource.difficulty}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>{resource.title}</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{resource.description || 'No description provided.'}</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={handleBookmarkToggle}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: resource.is_bookmarked ? '#f59e0b' : 'var(--text-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              <Bookmark size={16} fill={resource.is_bookmarked ? '#f59e0b' : 'none'} />
              {resource.is_bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button onClick={handleDownload}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              <Download size={16} /> Download Resource
            </button>
          </div>
        </div>

        <div className={styles.detailMeta}>
          <span><User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {resource.users?.full_name || resource.author || 'Faculty Member'}</span>
          <span><BookOpen size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {resource.subject || 'General Subject'}</span>
          <span><Layers size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {resource.department || 'General Dept'}</span>
          <span><Eye size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {resource.view_count || 0} views</span>
          <span><Download size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {resource.download_count || 0} downloads</span>
          <span><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {new Date(resource.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Grid: Previewer + AI Engine Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px' }}>
        
        {/* Left Column: Preview & Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Document / Video Previewer */}
          <div className={styles.previewContainer}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Resource Viewer & Document Preview</span>
              {resource.file_url && (
                <a href={resource.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Open Source <ExternalLink size={12} />
                </a>
              )}
            </div>

            {resource.external_video_url ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe
                  src={resource.external_video_url.replace('watch?v=', 'embed/')}
                  title="Resource Video"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allowFullScreen
                />
              </div>
            ) : resource.file_url && resource.file_url.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(resource.file_url)}&embedded=true`}
                className={styles.previewIframe}
                title="PDF Preview"
              />
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <FileText size={48} style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{resource.file_name || resource.title}</h3>
                <p style={{ fontSize: '13px', marginTop: '6px', maxWidth: '400px', margin: '6px auto 16px auto' }}>
                  Preview is available directly via download or external link.
                </p>
                <button onClick={handleDownload} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                  Open & Download File
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Tags:</span>
              {resource.tags.map((t, i) => (
                <span key={i} style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Related Resources */}
          {resource.related && resource.related.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Related Resources</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {resource.related.map(r => (
                  <Link key={r.id} href={`/resources/${r.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '12px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>{r.title}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.subject} • {r.view_count || 0} views</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Engine Assistant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className={styles.aiCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>AI Academic Assistant</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Powered by PLACE@ASET AI Engine</span>
              </div>
            </div>

            {/* AI Summary Banner */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>AI Summary</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                {resource.ai_summary || 'AI has analyzed this resource and indexed core topics for instant student review.'}
              </p>
            </div>

            {/* Quick Action Prompt Buttons */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Ask AI Assistant:</span>
              <div className={styles.aiActions}>
                <button onClick={() => handleRunAIPrompt('summarize')} className={styles.aiBtn}>
                  <FileText size={13} /> Summarize resource
                </button>
                <button onClick={() => handleRunAIPrompt('explain_simple')} className={styles.aiBtn}>
                  <HelpCircle size={13} /> Explain topic simply
                </button>
                <button onClick={() => handleRunAIPrompt('practice_questions')} className={styles.aiBtn}>
                  <CheckCircle2 size={13} /> Generate practice questions
                </button>
                <button onClick={() => handleRunAIPrompt('interview_questions')} className={styles.aiBtn}>
                  <Award size={13} /> Generate interview questions
                </button>
                <button onClick={() => handleRunAIPrompt('revision_points')} className={styles.aiBtn}>
                  <Sparkles size={13} /> Generate revision points
                </button>
              </div>
            </div>

            {/* Custom Query Box */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                type="text"
                className={styles.formInput}
                style={{ flex: 1, fontSize: '12px' }}
                placeholder="Ask custom question about this resource..."
                value={customQuery}
                onChange={e => setCustomQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && customQuery) handleRunAIPrompt('custom', customQuery); }}
              />
              <button
                onClick={() => { if (customQuery) handleRunAIPrompt('custom', customQuery); }}
                disabled={!customQuery || aiLoading}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                <Send size={14} />
              </button>
            </div>

            {/* AI Output Response Display */}
            {aiLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <Sparkles size={16} style={{ animation: 'spin 1s linear infinite', marginBottom: '6px' }} />
                <p>Generating AI response using provider router...</p>
              </div>
            ) : aiResponse && (
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', padding: '16px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>AI Generated Result</span>
                  <button onClick={() => setAiResponse(null)} style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>Dismiss</button>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {aiResponse}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
