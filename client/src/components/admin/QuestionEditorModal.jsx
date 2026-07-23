'use client';

import { useState } from 'react';
import styles from './QuestionEditorModal.module.css';

export default function QuestionEditorModal({ question, isOpen, onClose, onSave }) {
  const [statement, setStatement] = useState(question?.statement || '');
  const [questionType, setQuestionType] = useState(question?.type || question?.question_type || 'mcq_single');
  const [difficulty, setDifficulty] = useState(question?.difficulty || 'medium');
  const [subject, setSubject] = useState(question?.subject || 'Computer Science');
  const [topic, setTopic] = useState(question?.topic || 'Data Structures');
  const [company, setCompany] = useState(question?.company || 'TCS');
  const [explanation, setExplanation] = useState(question?.explanation || '');
  const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer || 'A');
  const [options, setOptions] = useState(
    question?.options || [
      { label: 'A', content: '' },
      { label: 'B', content: '' },
      { label: 'C', content: '' },
      { label: 'D', content: '' },
    ]
  );
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'

  if (!isOpen) return null;

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].content = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    const updated = {
      ...question,
      statement,
      type: questionType,
      difficulty,
      subject,
      topic,
      company,
      explanation,
      options,
      correct_answer: correctAnswer,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {question ? '✏️ Professional Question Editor' : '➕ Create New Question'}
            </h2>
            <p className={styles.modalSubtitle}>
              Markdown, LaTeX math, code snippets, tables & instant preview mode
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.tabToggle}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'edit' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                📝 Edit Mode
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                👁️ Live Preview
              </button>
            </div>
            <button onClick={onClose} className={styles.closeBtn}>✕</button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {activeTab === 'edit' ? (
            <div className={styles.formGrid}>
              <div className={styles.row3}>
                <div className={styles.fieldGroup}>
                  <label>Question Type</label>
                  <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                    <option value="mcq_single">MCQ (Single Choice)</option>
                    <option value="mcq_multiple">MSQ (Multiple Select)</option>
                    <option value="coding">Coding Challenge</option>
                    <option value="numerical">Numerical Value</option>
                    <option value="true_false">True / False</option>
                    <option value="fill_blank">Fill in the Blank</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Target Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. TCS, Amazon, Google"
                  />
                </div>
              </div>

              <div className={styles.row2}>
                <div className={styles.fieldGroup}>
                  <label>Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Binary Search Trees"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Question Statement (Supports Markdown & LaTeX \(..\))</label>
                <textarea
                  rows={5}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Enter the question statement. Use ```code``` for code blocks and \( E = mc^2 \) for LaTeX formulas."
                />
              </div>

              {(questionType === 'mcq_single' || questionType === 'mcq_multiple') && (
                <div className={styles.fieldGroup}>
                  <label>Answer Options</label>
                  <div className={styles.optionsGrid}>
                    {options.map((opt, idx) => (
                      <div key={idx} className={styles.optionInputRow}>
                        <span className={styles.optionTag}>{opt.label}</span>
                        <input
                          type="text"
                          value={opt.content}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${opt.label} content`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.row2}>
                <div className={styles.fieldGroup}>
                  <label>Correct Answer Key</label>
                  <input
                    type="text"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="e.g. A, or Option A, or numerical solution"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Explanation & Solution Steps</label>
                  <input
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Detailed explanation for students"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.previewBox}>
              <div className={styles.previewHeader}>
                <span className={styles.badge}>{questionType.toUpperCase()}</span>
                <span className={`${styles.badge} ${styles[difficulty]}`}>{difficulty.toUpperCase()}</span>
                <span className={styles.companyPill}>🏢 {company}</span>
              </div>

              <div className={styles.renderedStatement}>
                <h3>Question Statement:</h3>
                <div className={styles.renderedBox}>
                  {statement || 'No statement provided yet.'}
                </div>
              </div>

              {options.some(o => o.content) && (
                <div className={styles.renderedOptions}>
                  <h4>Options:</h4>
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`${styles.renderedOption} ${correctAnswer.includes(opt.label) ? styles.correctOption : ''}`}
                    >
                      <span className={styles.optLabel}>{opt.label}</span>
                      <span>{opt.content || '(Empty option)'}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.renderedExplanation}>
                <h4>Explanation:</h4>
                <p>{explanation || 'No explanation specified.'}</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave}>💾 Save & Sync Question</button>
        </div>
      </div>
    </div>
  );
}
