'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import styles from '../../app/(dashboard)/questions/questions.module.css';

export default function QuestionPreviewModal({ question, onClose }) {
  if (!question) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>Question Preview</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          
          {/* Statement */}
          <div>
            <div className={styles.previewLabel}>Statement</div>
            <div className={styles.statement} style={{ fontSize: '16px' }}>
              {question.statement}
            </div>
            {question.image_url && (
              <div style={{ position: 'relative', width: '100%', marginTop: '16px' }}>
                <Image 
                  src={question.image_url} 
                  alt="Question diagram" 
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
            )}
          </div>

          {/* Options */}
          {question.question_options && question.question_options.length > 0 && (
            <div>
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

          {/* Explanation */}
          {question.explanation && (
            <div>
              <div className={styles.previewLabel}>Explanation</div>
              <div className={styles.explanationBox}>
                {question.explanation}
              </div>
            </div>
          )}

          {/* Metadata badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <span className={`${styles.badge} ${styles.badgeType}`}>
              Difficulty: {question.difficulty}
            </span>
            <span className={`${styles.badge} ${styles.badgeType}`}>
              Type: {question.type?.replace(/_/g, ' ')}
            </span>
            <span className={`${styles.badge} ${styles.badgeType}`}>
              Visibility: {question.visibility}
            </span>
            <span className={`${styles.badge} ${styles.badgeType}`}>
              Approval: {question.approval_status}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
