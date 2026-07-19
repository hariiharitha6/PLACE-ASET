'use client';

import { useAuth } from '../../context/AuthContext';
import { 
  Edit, 
  Trash2, 
  Archive, 
  Copy, 
  Eye, 
  Tag 
} from 'lucide-react';
import styles from '../../app/(dashboard)/questions/questions.module.css';

export default function QuestionCard({ 
  question, 
  onPreview, 
  onEdit, 
  onDelete, 
  onArchive, 
  onClone 
}) {
  const { user } = useAuth();
  const isAdminOrHost = ['super_admin', 'college_admin', 'host'].includes(user?.role);

  const getDifficultyClass = (diff) => {
    switch (diff) {
      case 'easy': return styles.badgeEasy;
      case 'medium': return styles.badgeMedium;
      case 'hard': return styles.badgeHard;
      case 'expert': return styles.badgeExpert;
      default: return '';
    }
  };

  const getQuestionTypeLabel = (type) => {
    return type?.replace(/_/g, ' ') || 'MCQ';
  };

  return (
    <div className={styles.questionCard} onClick={() => onPreview(question)}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span className={`${styles.badge} ${getDifficultyClass(question.difficulty)}`}>
            {question.difficulty}
          </span>
          <span className={`${styles.badge} ${styles.badgeType}`}>
            {getQuestionTypeLabel(question.type)}
          </span>
          {question.categories?.name && (
            <span className={`${styles.badge} ${styles.badgeStatus}`}>
              {question.categories.name}
            </span>
          )}
          {question.visibility !== 'public' && (
            <span className={`${styles.badge} ${styles.badgeType}`}>
              🔒 {question.visibility}
            </span>
          )}
        </div>

        {/* Action icons for Admins */}
        {isAdminOrHost && (
          <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.btnAction} 
              title="Preview Question"
              onClick={() => onPreview(question)}
            >
              <Eye size={14} />
            </button>
            <button 
              className={styles.btnAction} 
              title="Clone Question"
              onClick={() => onClone(question.id)}
            >
              <Copy size={14} />
            </button>
            <button 
              className={styles.btnAction} 
              title="Edit Question"
              onClick={() => onEdit(question.id)}
            >
              <Edit size={14} />
            </button>
            <button 
              className={styles.btnAction} 
              title="Archive Question"
              onClick={() => onArchive(question.id)}
            >
              <Archive size={14} />
            </button>
            <button 
              className={`${styles.btnAction} ${styles.btnActionDelete}`} 
              title="Delete Question"
              onClick={() => onDelete(question.id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.statement}>
        {question.statement.length > 200 
          ? `${question.statement.substring(0, 200)}...` 
          : question.statement}
      </div>

      <div className={styles.cardFooter}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tag size={12} />
          <span>
            {question.question_tags && question.question_tags.length > 0
              ? question.question_tags.map(qt => qt.tags?.name).join(', ')
              : 'No tags'}
          </span>
        </div>
        <span>Success rate: {Math.round(question.success_rate || 0)}%</span>
      </div>
    </div>
  );
}
