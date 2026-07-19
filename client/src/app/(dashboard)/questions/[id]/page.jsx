'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { useConfirm } from '../../../../context/ConfirmContext';
import { questionService } from '../../../../lib/questionService';
import { ChevronLeft, History, Calendar, User } from 'lucide-react';
import styles from '../questions.module.css';

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const isAdminOrHost = ['super_admin', 'college_admin', 'host'].includes(user?.role);

  const [question, setQuestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    try {
      const res = await questionService.getQuestionDetails(id);
      setQuestion(res);
      
      if (isAdminOrHost) {
        const hist = await questionService.getVersionHistory(id);
        setHistory(hist || []);
      }
    } catch (err) {
      console.error('Failed to load question details page', err);
      setError('Could not retrieve question details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleBack = () => {
    router.push('/questions');
  };

  const handleRestoreVersion = async (versionItem) => {
    const isConfirmed = await confirm({
      title: 'Restore Version',
      message: `Are you sure you want to restore the question statement and explanation back to Version ${versionItem.version}?`,
      type: 'warning',
    });
    if (!isConfirmed) return;
    try {
      await questionService.updateQuestion(id, {
        statement: versionItem.statement,
        explanation: versionItem.explanation,
        options: versionItem.options,
        change_reason: `Restored back to Version ${versionItem.version}`
      });
      toast.success(`Restored to Version ${versionItem.version} successfully!`);
      fetchDetails();
    } catch (err) {
      toast.error('Failed to restore version: ' + err.message);
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading details...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-danger)' }}>
        <p>{error}</p>
        <button className={styles.btnSecondary} onClick={handleBack} style={{ margin: '16px auto' }}>Back to Bank</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className={styles.btnSecondary} onClick={handleBack} style={{ padding: '8px 12px' }}>
          <ChevronLeft size={16} /> Back
        </button>
        <div className={styles.titleSection}>
          <h1>Question Information</h1>
        </div>
      </div>

      {/* Details grid layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isAdminOrHost ? '2fr 1fr' : '1fr',
        gap: '24px'
      }}>
        
        {/* Main Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.filterCard}>
            <div className={styles.previewLabel}>Statement</div>
            <div className={styles.statement} style={{ fontSize: '18px', marginBottom: '16px' }}>
              {question.statement}
            </div>
            {question.image_url && (
              <img 
                src={question.image_url} 
                alt="Question diagram" 
                style={{
                  maxWidth: '100%',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '16px'
                }}
              />
            )}

            {question.question_options && question.question_options.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div className={styles.previewLabel}>Options</div>
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
              </div>
            )}

            {question.explanation && (
              <div style={{ marginTop: '20px' }}>
                <div className={styles.previewLabel}>Explanation</div>
                <div className={styles.explanationBox}>
                  {question.explanation}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Version History */}
        {isAdminOrHost && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className={styles.filterCard}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <History size={16} />
                <span>Version History</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No edits recorded yet.
                  </p>
                ) : (
                  history.map((h) => (
                    <div 
                      key={h.id}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border-color)',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                        <span>Version {h.version}</span>
                        <button 
                          onClick={() => handleRestoreVersion(h)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Restore
                        </button>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        &ldquo;{h.change_reason}&rdquo;
                      </p>
                      <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={10} /> {h.changed_by_user?.full_name || 'Admin'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={10} /> {new Date(h.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
