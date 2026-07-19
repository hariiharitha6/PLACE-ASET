'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '../../../../../context/ToastContext';
import { questionService } from '../../../../../lib/questionService';
import QuestionForm from '../../../../../components/questions/QuestionForm';
import styles from '../../questions.module.css';

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const toast = useToast();

  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await questionService.getQuestionDetails(id);
        setQuestion(res);
      } catch (err) {
        console.error('Failed to load question details for edit', err);
        setError('Failed to load question data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      await questionService.updateQuestion(id, {
        ...payload,
        change_reason: 'Updated via Question Bank Editor'
      });
      toast.success('Question updated successfully!');
      router.push('/questions');
    } catch (err) {
      toast.error('Failed to save question edits: ' + err.message);
    }
  };

  const handleCancel = () => {
    router.push('/questions');
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading editor state...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-danger)' }}>
        <p>{error}</p>
        <button className={styles.btnSecondary} onClick={handleCancel} style={{ margin: '16px auto' }}>Back to Bank</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Edit Question</h1>
          <p>Update question details and create a version history checkpoint.</p>
        </div>
      </div>

      <QuestionForm 
        initialData={question}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
