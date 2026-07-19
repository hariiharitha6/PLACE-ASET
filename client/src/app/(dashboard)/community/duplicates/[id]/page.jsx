'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { communityService } from '../../../../../lib/communityService';
import { useToast } from '../../../../../context/ToastContext';
import { ArrowLeft, GitMerge, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function DuplicateComparisonPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [duplicates, setDuplicates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await communityService.getDuplicates(params.id);
        setDuplicates(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load duplicate matches: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleMerge = async (duplicateId) => {
    try {
      await communityService.reviewSubmission(params.id, {
        action: 'merge',
        notes: `Merged automatically with question bank entry ID: ${duplicateId}`
      });
      toast.success('Successfully merged duplicate submissions!');
      router.push('/community/review');
    } catch (err) {
      console.error(err);
      toast.error('Merge failed: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', marginBottom: '16px' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Duplicate Comparison Panel</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Compare the submitted question against existing entries to determine if they should be merged.
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Comparing questions...</div>
      ) : duplicates.length === 0 ? (
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No duplicate matches found for this submission.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid var(--border-accent)', padding: '16px 20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-warning)' }}>
            <AlertTriangle size={20} />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>
              Warning: Merging will close this community submission and map it directly to the matching question bank ID.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {duplicates.map(dup => (
              <div key={dup.id} style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px'
              }}>
                {/* Left: Match score summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} style={{ color: 'var(--accent-warning)' }} />
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Match score: {(dup.similarity_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Matched Question Statement:</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '6px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                      {dup.questions?.statement || 'N/A'}
                    </p>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Difficulty level: {dup.questions?.difficulty || 'N/A'}
                  </div>
                </div>

                {/* Right: Action */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyCenter: 'center', alignItems: 'flex-start', alignSelf: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '32px', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Resolve Match</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                      If this is the same question with minor formatting differences, merge them.
                    </p>
                  </div>

                  <button
                    onClick={() => handleMerge(dup.matching_question_id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                  >
                    <GitMerge size={16} /> Merge with Bank Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
