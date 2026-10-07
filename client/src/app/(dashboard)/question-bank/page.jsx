'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useAssistant } from '../../../context/AssistantContext';
import { questionService } from '../../../lib/questionService';
import { supabase } from '../../../lib/supabase';
import { BookOpen, Search, Layers, PlayCircle, Bot, Eye, EyeOff } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/ui/LoadingState';
import EmptyState from '../../../components/ui/EmptyState';
import styles from './questionBank.module.css';

export default function QuestionBankPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { openAssistant } = useAssistant();

  const [questions, setQuestions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedSource, setSelectedSource] = useState('all'); // all | institution | personal | curated
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  // Load Categories for filter dropdown
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, parent_id')
          .order('name');
        if (!error && data) {
          setCategories(data);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    }
    fetchCategories();
  }, []);

  // Fetch Questions matching all filters
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        status: 'approved',
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      const res = await questionService.searchAndFilter(params);
      let list = res?.data?.questions || res?.questions || [];
      const total = res?.data?.pagination?.total || res?.pagination?.total || list.length;

      // Filter by source in memory if selected
      if (selectedSource === 'personal' && user) {
        list = list.filter(q => q.created_by === user.id);
      } else if (selectedSource === 'institution') {
        list = list.filter(q => q.is_global === true);
      }

      setQuestions(list);
      setTotalCount(total);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Question Bank items');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, selectedCategory, selectedDifficulty, selectedSource, user, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadQuestions();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadQuestions]);

  const toggleReveal = (id) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAskAssistant = (q) => {
    openAssistant({
      type: 'practice',
      title: q.categories?.name || 'Question Review',
      data: {
        statement: q.statement,
        difficulty: q.difficulty,
        category: q.categories?.name,
        options: q.question_options?.map(o => `${o.label}: ${o.content}`).join('\n'),
        explanation: q.explanation
      }
    }, `Can you explain the solution and concept behind this question: "${q.statement}"?`);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const difficultyVariant = (level) => {
    if (level === 'easy') return 'success';
    if (level === 'hard') return 'danger';
    return 'warning';
  };

  return (
    <div className={styles.page}>
      <PageHeader
        badge="Question repository"
        badgeIcon={<BookOpen size={14} />}
        title="Question Bank"
        subtitle="Browse approved aptitude, reasoning, and technical items. Filter, review answers, or start a practice set."
      >
        <Button href="/practice" size="sm">
          <PlayCircle size={16} /> Start Practice
        </Button>
        <Button href="/personal" variant="secondary" size="sm">
          <Layers size={16} /> Upload material
        </Button>
      </PageHeader>

      <div className={styles.summary} aria-live="polite">
        <span className={styles.summaryItem}><strong>{totalCount}</strong> questions match your filters</span>
        <span className={styles.summaryItem}><strong>{categories.length}</strong> categories loaded</span>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search by keyword, topic, or concept…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              aria-label="Search questions"
            />
          </div>

          <select
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={selectedDifficulty}
            onChange={(e) => { setSelectedDifficulty(e.target.value); setPage(1); }}
            aria-label="Filter by difficulty"
          >
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className={styles.filterSelect}
            value={selectedSource}
            onChange={(e) => { setSelectedSource(e.target.value); setPage(1); }}
            aria-label="Filter by source"
          >
            <option value="all">All sources</option>
            <option value="institution">Institution bank</option>
            <option value="personal">My uploads</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading verified questions…" />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="No questions found"
          description="Try broadening your search or clearing filters to see more items."
          actionText="Reset filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('');
            setSelectedDifficulty('');
            setSelectedSource('all');
          }}
          secondaryText="Start practice"
          secondaryHref="/practice"
        />
      ) : (
        <div className={styles.list}>
          {questions.map((q, idx) => {
            const isRevealed = !!revealedAnswers[q.id];
            const correctOpt = q.question_options?.find((o) => o.is_correct);

            return (
              <article key={q.id} className={styles.row}>
                <div className={styles.rowTop}>
                  <div className={styles.meta}>
                    <Badge variant="primary">#{idx + 1 + (page - 1) * pageSize}</Badge>
                    {q.categories?.name && <Badge>{q.categories.name}</Badge>}
                    <Badge variant={difficultyVariant(q.difficulty)}>
                      {q.difficulty || 'medium'}
                    </Badge>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {q.is_global ? 'Institution' : 'Personal'}
                    </span>
                  </div>

                  <div className={styles.rowActions}>
                    <Button variant="ghost" size="sm" onClick={() => handleAskAssistant(q)}>
                      <Bot size={14} /> Explain
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => toggleReveal(q.id)}>
                      {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                      {isRevealed ? 'Hide answer' : 'Show answer'}
                    </Button>
                  </div>
                </div>

                <p className={styles.statement}>{q.statement}</p>

                {isRevealed && q.question_options?.length > 0 && (
                  <div className={styles.optionsGrid}>
                    {q.question_options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`${styles.optionCell} ${opt.is_correct ? styles.optionCorrect : ''}`}
                      >
                        <strong>{opt.label}.</strong>
                        <span>{opt.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {isRevealed && (
                  <div className={styles.explanation}>
                    <strong>Correct answer: {correctOpt?.label || 'N/A'}</strong>
                    <p style={{ margin: '6px 0 0' }}>
                      {q.explanation || 'No step-by-step explanation is recorded for this question yet.'}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
