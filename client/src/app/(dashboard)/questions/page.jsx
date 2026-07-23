'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { questionService } from '../../../lib/questionService';
import { supabase } from '../../../lib/supabase';
import { getDepartmentsForCollege } from '../../../constants/departments';
import QuestionCard from '../../../components/questions/QuestionCard';
import QuestionPreviewModal from '../../../components/questions/QuestionPreviewModal';
import { Search, Plus, Filter } from 'lucide-react';
import styles from './questions.module.css';

export default function QuestionsManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const isAdminOrHost = ['super_admin', 'college_admin', 'host'].includes(user?.role);

  // States
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');
  const [department, setDepartment] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('');

  // Dropdowns lists
  const [categoriesList, setCategoriesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);

  // Preview overlay state
  const [previewQuestion, setPreviewQuestion] = useState(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const { data: cats } = await supabase.from('categories').select('id, name').order('name');
        const { data: depts } = await supabase.from('departments').select('id, name, code').order('name');
        const { data: comps } = await supabase.from('companies').select('id, name').order('name');
        setCategoriesList(cats || []);
        setDepartmentsList(getDepartmentsForCollege('aset', depts || []));
        setCompaniesList(comps || []);
      } catch (err) {
        console.error('Failed to load metadata in Questions List', err);
      }
    };
    loadMetadata();
  }, []);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        type: type || undefined,
        department: department || undefined,
        company: company || undefined,
        status: status || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      };
      
      const res = await questionService.searchAndFilter(params);
      setQuestions(res.questions || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load questions list', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, difficulty, type, department, company, status]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadQuestions();
  };

  // Actions
  const handlePreview = (question) => {
    setPreviewQuestion(question);
  };

  const handleEdit = (id) => {
    router.push(`/questions/${id}/edit`);
  };

  const handleClone = async (id) => {
    try {
      await questionService.cloneQuestion(id);
      toast.success('Question cloned successfully!');
      loadQuestions();
    } catch (err) {
      toast.error('Failed to clone question: ' + err.message);
    }
  };

  const handleArchive = async (id) => {
    const isConfirmed = await confirm({
      title: 'Archive Question',
      message: 'Are you sure you want to archive this question?',
      type: 'warning',
    });
    if (!isConfirmed) return;
    try {
      await questionService.archiveQuestion(id);
      toast.success('Question archived.');
      loadQuestions();
    } catch (err) {
      toast.error('Failed to archive question: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Question',
      message: 'Are you sure you want to delete this question permanently? This cannot be undone.',
      type: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await questionService.deleteQuestion(id);
      toast.success('Question deleted.');
      loadQuestions();
    } catch (err) {
      toast.error('Failed to delete question: ' + err.message);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Question Bank Arena</h1>
          <p>Manage and practice assessment prep questions.</p>
        </div>
        {isAdminOrHost && (
          <button 
            className={styles.btnPrimary}
            onClick={() => router.push('/questions/new')}
          >
            <Plus size={16} /> New Question
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className={styles.filterCard}>
        <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search statement..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </form>

        <div className={styles.filtersGrid}>
          <select className={styles.select} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categoriesList.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select className={styles.select} value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}>
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>

          <select className={styles.select} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="mcq_single">Single MCQ</option>
            <option value="mcq_multiple">Multi MCQ</option>
            <option value="true_false">True / False</option>
            <option value="fill_in_the_blank">Fill Blank</option>
            <option value="descriptive">Descriptive</option>
            <option value="image_based">Image Based</option>
            <option value="code_snippet_mcq">Code MCQ</option>
          </select>

          <select className={styles.select} value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {departmentsList.map(d => (
              <option key={d.id} value={d.id}>{d.code || d.name}</option>
            ))}
          </select>

          <select className={styles.select} value={company} onChange={(e) => { setCompany(e.target.value); setPage(1); }}>
            <option value="">All Companies</option>
            {companiesList.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {isAdminOrHost && (
            <select className={styles.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
        </div>
      </div>

      {/* List content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading questions bank...
        </div>
      ) : questions.length === 0 ? (
        <div style={{
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          No questions found matching the filter criteria.
        </div>
      ) : (
        <div className={styles.grid}>
          {questions.map((q) => (
            <QuestionCard 
              key={q.id}
              question={q}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onClone={handleClone}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={styles.btnSecondary}
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                style={{ padding: '8px 14px' }}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages} ({total} total questions)
              </span>
              <button 
                className={styles.btnSecondary}
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                style={{ padding: '8px 14px' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewQuestion && (
        <QuestionPreviewModal 
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
        />
      )}

    </div>
  );
}
