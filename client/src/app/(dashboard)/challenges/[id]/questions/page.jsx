'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { challengeService } from '../../../../../lib/challengeService';
import { questionService } from '../../../../../lib/questionService';
import { useToast } from '../../../../../context/ToastContext';
import { ChevronLeft, Plus, Trash2, HelpCircle, Save, ArrowUp, ArrowDown } from 'lucide-react';
import styles from '../../challenges.module.css';

export default function ChallengeQuestionsAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const toast = useToast();

  const [challenge, setChallenge] = useState(null);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [assignedQuestions, setAssignedQuestions] = useState([]); // Array of { question_id, sort_order, points, statement }
  
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      // 1. Fetch challenge details
      const details = await challengeService.getChallengeDetails(id);
      setChallenge(details);

      // 2. Fetch all questions from the bank for picking
      const bankRes = await questionService.searchAndFilter({ page: 1, limit: 100 });
      setBankQuestions(bankRes.questions || []);

      // 3. Fetch current assigned questions mapping
      const { data: currentMappings } = await challengeService.startChallenge(id).catch(() => ({ data: [] }));
      if (currentMappings && currentMappings.questions) {
        const mapped = currentMappings.questions.map((q) => ({
          question_id: q.questions.id,
          sort_order: q.sort_order,
          points: q.points,
          statement: q.questions.statement
        }));
        setAssignedQuestions(mapped);
      }
    } catch (err) {
      console.error('Failed to load questions mappings info', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAssign = (q) => {
    const isAssigned = assignedQuestions.some(aq => aq.question_id === q.id);
    if (isAssigned) return;

    const nextOrder = assignedQuestions.length + 1;
    setAssignedQuestions([
      ...assignedQuestions,
      {
        question_id: q.id,
        sort_order: nextOrder,
        points: 1,
        statement: q.statement
      }
    ]);
  };

  const handleUnassign = (questionId) => {
    const updated = assignedQuestions.filter(aq => aq.question_id !== questionId);
    // Relabel sort orders
    const relabeled = updated.map((aq, idx) => ({
      ...aq,
      sort_order: idx + 1
    }));
    setAssignedQuestions(relabeled);
  };

  const handlePointsChange = (questionId, value) => {
    const pts = parseInt(value, 10) || 1;
    setAssignedQuestions(prev => 
      prev.map(aq => aq.question_id === questionId ? { ...aq, points: pts } : aq)
    );
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...assignedQuestions];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    
    const relabeled = updated.map((aq, index) => ({
      ...aq,
      sort_order: index + 1
    }));
    setAssignedQuestions(relabeled);
  };

  const handleMoveDown = (idx) => {
    if (idx === assignedQuestions.length - 1) return;
    const updated = [...assignedQuestions];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    
    const relabeled = updated.map((aq, index) => ({
      ...aq,
      sort_order: index + 1
    }));
    setAssignedQuestions(relabeled);
  };

  const handleSaveAssignments = async () => {
    try {
      const payload = assignedQuestions.map(aq => ({
        question_id: aq.question_id,
        sort_order: aq.sort_order,
        points: aq.points
      }));
      await challengeService.assignQuestions(id, payload);
      toast.success('Questions assigned successfully to challenge!');
      router.push(`/challenges/${id}`);
    } catch (err) {
      toast.error('Failed to save assignments: ' + err.message);
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading assignment workspace...</div>;
  }

  const filteredBank = bankQuestions.filter(q => 
    q.statement.toLowerCase().includes(search.toLowerCase()) &&
    !assignedQuestions.some(aq => aq.question_id === q.id)
  );

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className={styles.btnSecondary} onClick={() => router.push('/challenges')} style={{ padding: '8px 12px' }}>
          <ChevronLeft size={16} /> Back
        </button>
        <div className={styles.titleSection}>
          <h1>Assign Questions to Challenge</h1>
          <p>{challenge?.title}</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '24px'
      }}
      className="assignment-workspace-grid"
      >
        
        {/* Assigned Questions */}
        <div className={styles.challengeCard} style={{ cursor: 'default', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Assigned Questions ({assignedQuestions.length})</h3>
            <button 
              className={styles.btnPrimary} 
              onClick={handleSaveAssignments}
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              <Save size={14} /> Save Changes
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assignedQuestions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                No questions assigned yet. Pick questions from the right panel.
              </p>
            ) : (
              assignedQuestions.map((aq, idx) => (
                <div 
                  key={aq.question_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontWeight: '700', color: 'var(--text-muted)', flexShrink: 0 }}>#{aq.sort_order}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      fontWeight: '600', 
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {aq.statement}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {/* Move Up/Down buttons */}
                    <button 
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      style={{ background: 'none', border: 'none', color: idx === 0 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: idx === 0 ? 'default' : 'pointer', padding: '2px' }}
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === assignedQuestions.length - 1}
                      style={{ background: 'none', border: 'none', color: idx === assignedQuestions.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: idx === assignedQuestions.length - 1 ? 'default' : 'pointer', padding: '2px' }}
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>

                    <input 
                      type="number"
                      min="1"
                      value={aq.points}
                      onChange={(e) => handlePointsChange(aq.question_id, e.target.value)}
                      style={{
                        width: '44px',
                        padding: '4px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        textAlign: 'center'
                      }}
                      title="Points weightage"
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>pts</span>
                    
                    <button 
                      onClick={() => handleUnassign(aq.question_id)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bank Picker */}
        <div className={styles.challengeCard} style={{ cursor: 'default' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Pick Questions from Bank</h3>
          
          <input 
            type="text"
            placeholder="Search statement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            style={{ padding: '8px 12px 8px 12px', marginBottom: '16px' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
            {filteredBank.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                No available matching questions.
              </p>
            ) : (
              filteredBank.map((q) => (
                <div 
                  key={q.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      fontWeight: '600', 
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {q.statement}
                    </p>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Diff: {q.difficulty} | Type: {q.type}</span>
                  </div>

                  <button 
                    onClick={() => handleAssign(q)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      color: 'var(--accent-primary)',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .assignment-workspace-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
