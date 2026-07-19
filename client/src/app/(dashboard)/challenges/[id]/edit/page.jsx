'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { challengeService } from '../../../../../lib/challengeService';
import { useToast } from '../../../../../context/ToastContext';
import { ChevronLeft } from 'lucide-react';
import styles from '../../challenges.module.css';

export default function EditChallengePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingPercentage, setPassingPercentage] = useState(40);
  const [status, setStatus] = useState('draft');
  
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [showResultsAfter, setShowResultsAfter] = useState(true);
  const [allowReview, setAllowReview] = useState(true);
  
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [negativeMarksValue, setNegativeMarksValue] = useState(0.25);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format local date string to datetime-local input format
  const formatDateTimeLocal = (dateStr) => {
    const d = new Date(dateStr);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const c = await challengeService.getChallengeDetails(id);
        setTitle(c.title);
        setDescription(c.description || '');
        setInstructions(c.instructions || '');
        setStartTime(formatDateTimeLocal(c.start_time));
        setEndTime(formatDateTimeLocal(c.end_time));
        setDuration(c.duration_minutes);
        setPassingPercentage(c.passing_percentage);
        setStatus(c.status);
        setRandomizeQuestions(c.randomize_questions);
        setRandomizeOptions(c.randomize_options);
        setShowResultsAfter(c.show_results_after);
        setAllowReview(c.allow_review);
        setNegativeMarking(c.negative_marking);
        setNegativeMarksValue(c.negative_marks_value);
      } catch (err) {
        console.error('Failed to load challenge details for edit', err);
        setError('Challenge not found.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      instructions,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      duration_minutes: parseInt(duration, 10),
      passing_percentage: parseFloat(passingPercentage),
      status,
      randomize_questions: randomizeQuestions,
      randomize_options: randomizeOptions,
      show_results_after: showResultsAfter,
      allow_review: allowReview,
      negative_marking: negativeMarking,
      negative_marks_value: parseFloat(negativeMarksValue)
    };

    try {
      await challengeService.updateChallenge(id, payload);
      toast.success('Challenge configurations updated successfully!');
      router.push(`/challenges/${id}`);
    } catch (err) {
      toast.error('Failed to update challenge: ' + err.message);
    }
  };

  const handleCancel = () => {
    router.push('/challenges');
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading challenge details...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-danger)' }}>
        <p>{error}</p>
        <button className={styles.btnSecondary} onClick={handleCancel} style={{ margin: '16px auto' }}>Back</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className={styles.btnSecondary} onClick={handleCancel} style={{ padding: '8px 12px' }}>
          <ChevronLeft size={16} /> Back
        </button>
        <div className={styles.titleSection}>
          <h1>Edit Weekly Challenge</h1>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSubmit} style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        
        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600' }}>Challenge Title *</label>
          <input 
            type="text" 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className={styles.searchInput}
            style={{ padding: '10px 12px 10px 12px' }}
          />
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600' }}>Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className={styles.searchInput}
            style={{ padding: '10px 12px', minHeight: '80px', resize: 'vertical' }}
          />
        </div>

        {/* Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600' }}>Rules & Instructions</label>
          <textarea 
            value={instructions} 
            onChange={(e) => setInstructions(e.target.value)} 
            className={styles.searchInput}
            style={{ padding: '10px 12px', minHeight: '120px', resize: 'vertical' }}
          />
        </div>

        {/* Start / End Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-mobile">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Start Time *</label>
            <input 
              type="datetime-local" 
              required 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)} 
              className={styles.searchInput}
              style={{ padding: '10px 12px 10px 12px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>End Time *</label>
            <input 
              type="datetime-local" 
              required 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)} 
              className={styles.searchInput}
              style={{ padding: '10px 12px 10px 12px' }}
            />
          </div>
        </div>

        {/* Duration & Passing mark & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }} className="grid-mobile">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Duration (Minutes) *</label>
            <input 
              type="number" 
              required 
              min="1"
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              className={styles.searchInput}
              style={{ padding: '10px 12px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Passing score (%) *</label>
            <input 
              type="number" 
              required 
              min="0"
              max="100"
              value={passingPercentage} 
              onChange={(e) => setPassingPercentage(e.target.value)} 
              className={styles.searchInput}
              style={{ padding: '10px 12px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className={styles.select}
              style={{ padding: '10px 12px' }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="active">Active (Live for participation)</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Negative marking settings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-mobile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '100%', marginTop: '24px' }}>
            <input type="checkbox" checked={negativeMarking} onChange={(e) => setNegativeMarking(e.target.checked)} />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Enable Negative Marking</span>
          </div>
          {negativeMarking && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Negative Mark Weightage</label>
              <input 
                type="number" 
                step="0.05"
                min="0"
                value={negativeMarksValue} 
                onChange={(e) => setNegativeMarksValue(e.target.value)} 
                className={styles.searchInput}
                style={{ padding: '10px 12px' }}
              />
            </div>
          )}
        </div>

        {/* Checkbox settings options */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={randomizeQuestions} onChange={(e) => setRandomizeQuestions(e.target.checked)} />
            <span>Randomize Question Order</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={randomizeOptions} onChange={(e) => setRandomizeOptions(e.target.checked)} />
            <span>Randomize Options Order</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showResultsAfter} onChange={(e) => setShowResultsAfter(e.target.checked)} />
            <span>Show Results After Ending</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={allowReview} onChange={(e) => setAllowReview(e.target.checked)} />
            <span>Allow Answer Reviews</span>
          </label>
        </div>

        {/* Footer buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" className={styles.btnSecondary} onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className={styles.btnPrimary}>
            Save Changes
          </button>
        </div>

      </form>

      <style jsx global>{`
        @media (max-width: 600px) {
          .grid-mobile {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
