'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '../../../../context/ToastContext';
import { questionService } from '../../../../lib/questionService';
import QuestionForm from '../../../../components/questions/QuestionForm';
import styles from '../questions.module.css';

export default function NewQuestionPage() {
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (payload) => {
    try {
      await questionService.createQuestion(payload);
      toast.success('Question created successfully!');
      router.push('/questions');
    } catch (err) {
      toast.error('Failed to create question: ' + err.message);
    }
  };

  const handleCancel = () => {
    router.push('/questions');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Create New Question</h1>
          <p>Add a new entry to the shared college Question Bank.</p>
        </div>
      </div>

      <QuestionForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
