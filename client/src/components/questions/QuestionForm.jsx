'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getDepartmentsForCollege } from '../../constants/departments';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import styles from '../../app/(dashboard)/questions/questions.module.css';

export default function QuestionForm({ initialData, onSubmit, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [type, setType] = useState(initialData?.type || 'mcq_single');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'medium');
  const [statement, setStatement] = useState(initialData?.statement || '');
  const [explanation, setExplanation] = useState(initialData?.explanation || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [isGlobal, setIsGlobal] = useState(initialData?.is_global || false);
  const [approvalStatus, setApprovalStatus] = useState(initialData?.approval_status || 'approved');
  const [visibility, setVisibility] = useState(initialData?.visibility || 'public');

  // Multi-option state
  const defaultOptions = [
    { label: 'A', content: '', is_correct: false },
    { label: 'B', content: '', is_correct: false },
    { label: 'C', content: '', is_correct: false },
    { label: 'D', content: '', is_correct: false },
  ];
  const [options, setOptions] = useState(initialData?.question_options || defaultOptions);
  
  // Selected department and company IDs
  const [selectedDepts, setSelectedDepts] = useState(
    initialData?.question_departments?.map(d => d.department_id) || []
  );
  const [selectedComps, setSelectedComps] = useState(
    initialData?.company_questions?.map(c => c.company_id) || []
  );

  // Tags list entered as comma-separated
  const [tagsInput, setTagsInput] = useState(
    initialData?.question_tags?.map(t => t.tags?.name).join(', ') || ''
  );

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const { data: cats } = await supabase.from('categories').select('id, name').order('name');
        const { data: depts } = await supabase.from('departments').select('id, name, code').order('name');
        const { data: comps } = await supabase.from('companies').select('id, name').order('name');
        
        setCategories(cats || []);
        setDepartments(getDepartmentsForCollege('aset', depts || []));
        setCompanies(comps || []);
      } catch (err) {
        console.error('Failed to load metadata inside QuestionForm', err);
      }
    };
    loadMetadata();
  }, []);

  const handleOptionChange = (idx, field, value) => {
    const updated = [...options];
    updated[idx] = { ...updated[idx], [field]: value };
    
    // For single-choice MCQ, ensure only one correct option is ticked
    if (type === 'mcq_single' && field === 'is_correct' && value === true) {
      updated.forEach((opt, oIdx) => {
        if (oIdx !== idx) opt.is_correct = false;
      });
    }

    setOptions(updated);
  };

  const addOption = () => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const nextLabel = labels[options.length] || String.fromCharCode(65 + options.length);
    setOptions([...options, { label: nextLabel, content: '', is_correct: false }]);
  };

  const removeOption = (idx) => {
    const updated = options.filter((_, oIdx) => oIdx !== idx);
    // Re-label
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const relabeled = updated.map((opt, oIdx) => ({
      ...opt,
      label: labels[oIdx] || String.fromCharCode(65 + oIdx)
    }));
    setOptions(relabeled);
  };

  const handleDeptToggle = (deptId) => {
    setSelectedDepts(prev => 
      prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
    );
  };

  const handleCompToggle = (compId) => {
    setSelectedComps(prev => 
      prev.includes(compId) ? prev.filter(id => id !== compId) : [...prev, compId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Map tags
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      category_id: categoryId || null,
      type,
      difficulty,
      statement,
      explanation: explanation || null,
      image_url: imageUrl || null,
      is_global: isGlobal,
      approval_status: approvalStatus,
      visibility,
      options: ['mcq_single', 'mcq_multiple', 'true_false'].includes(type) ? options : [],
      departments: selectedDepts,
      companies: selectedComps,
      tags,
    };

    onSubmit(payload);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      
      {/* Statement */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Question Statement *</label>
        <textarea 
          required 
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Type the question content here..."
          className={`${styles.input} ${styles.textarea}`}
        />
      </div>

      {/* Grid: Type & Difficulty */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Question Type</label>
          <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="mcq_single">Single Choice MCQ</option>
            <option value="mcq_multiple">Multi Correct MCQ</option>
            <option value="true_false">True / False</option>
            <option value="fill_in_the_blank">Fill in the Blank</option>
            <option value="descriptive">Descriptive</option>
            <option value="image_based">Image Based</option>
            <option value="code_snippet_mcq">Code Snippet MCQ</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Difficulty Level</label>
          <select className={styles.select} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Category */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Category</label>
          <select className={styles.select} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tags (comma-separated)</label>
          <input 
            type="text" 
            value={tagsInput} 
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="dsa, arrays, recursion"
            className={styles.input}
          />
        </div>
      </div>

      {/* Image URL & Explanation */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Optional Diagram Image URL</label>
        <input 
          type="url" 
          value={imageUrl} 
          onChange={(e) => setImageUrl(e.target.value)} 
          placeholder="https://example.com/diagram.png"
          className={styles.input}
        />
      </div>

      {/* Options section for MCQ / True False */}
      {['mcq_single', 'mcq_multiple', 'true_false'].includes(type) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className={styles.formLabel}>Options Details</label>
            {type !== 'true_false' && (
              <button type="button" className={styles.btnSecondary} onClick={addOption} style={{ padding: '6px 12px', fontSize: '12px' }}>
                <Plus size={14} /> Add Option
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {options.map((opt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => handleOptionChange(idx, 'is_correct', !opt.is_correct)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: opt.is_correct ? 'var(--accent-success)' : 'var(--text-muted)'
                  }}
                >
                  <CheckCircle2 size={20} />
                </button>

                <span style={{ fontSize: '14px', fontWeight: '700', width: '20px' }}>{opt.label}</span>
                
                <input 
                  type="text" 
                  required 
                  value={opt.content} 
                  onChange={(e) => handleOptionChange(idx, 'content', e.target.value)} 
                  placeholder={`Option ${opt.label} content`}
                  className={styles.input}
                  style={{ flex: 1 }}
                />

                {type !== 'true_false' && options.length > 2 && (
                  <button type="button" onClick={() => removeOption(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Answer Explanation</label>
        <textarea 
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain the solution reasoning..."
          className={`${styles.input} ${styles.textarea}`}
        />
      </div>

      {/* RLS Visibility Scopes */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Visibility Scope</label>
          <select className={styles.select} value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="public">Public (Visible to all Colleges)</option>
            <option value="college">College Specific</option>
            <option value="private">Private (Created by User Only)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Approval Status</label>
          <select className={styles.select} value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)}>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Toggle Global Option */}
      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} />
          <span>Set as Global Question (Cross-tenant placement prep)</span>
        </label>
      </div>

      {/* Mapping Departments */}
      <div className={styles.formGroup} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <label className={styles.formLabel}>Tag Departments</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {departments.map((d) => {
            const isChecked = selectedDepts.includes(d.id);
            return (
              <button 
                key={d.id} 
                type="button" 
                onClick={() => handleDeptToggle(d.id)}
                className={styles.btnSecondary}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: isChecked ? 'var(--accent-primary)' : 'var(--bg-glass)',
                  color: isChecked ? '#fff' : 'var(--text-primary)',
                  borderColor: isChecked ? 'var(--accent-primary)' : 'var(--border-color)',
                }}
              >
                {d.code || d.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mapping Companies */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tag Companies (For placement queries)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {companies.map((c) => {
            const isChecked = selectedComps.includes(c.id);
            return (
              <button 
                key={c.id} 
                type="button" 
                onClick={() => handleCompToggle(c.id)}
                className={styles.btnSecondary}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: isChecked ? 'var(--accent-primary)' : 'var(--bg-glass)',
                  color: isChecked ? '#fff' : 'var(--text-primary)',
                  borderColor: isChecked ? 'var(--accent-primary)' : 'var(--border-color)',
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Submission buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.btnPrimary}>
          Save Question
        </button>
      </div>

    </form>
  );
}
