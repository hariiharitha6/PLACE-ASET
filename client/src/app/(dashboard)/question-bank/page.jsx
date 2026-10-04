'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useAssistant } from '../../../context/AssistantContext';
import { questionService } from '../../../lib/questionService';
import { supabase } from '../../../lib/supabase';
import { 
  BookOpen, Search, Filter, Layers, CheckCircle2, 
  HelpCircle, PlayCircle, Bot, Sparkles, ChevronRight,
  Eye, EyeOff, ArrowUpDown, Tag
} from 'lucide-react';
import Link from 'next/link';

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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={26} style={{ color: 'var(--accent-primary, #6366f1)' }} />
            Question Bank
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            Comprehensive hierarchical repository of placement aptitude, logical reasoning, and technical interview questions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link
            href="/practice"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary, #6366f1)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            <PlayCircle size={16} /> Start Practice
          </Link>
          
          <Link
            href="/personal"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            <Layers size={16} /> Upload Notes / PDF
          </Link>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL QUESTIONS</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{totalCount}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>CATEGORIES / TOPICS</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-primary, #6366f1)', marginTop: '4px' }}>{categories.length || 38}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>SOURCE TYPES</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>Institution & Personal</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ flex: '2 1 280px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search questions by keyword, formula, or concept..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
            />
          </div>

          {/* Category Dropdown */}
          <select 
            value={selectedCategory} 
            onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
            style={{ flex: '1 1 180px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Difficulty Dropdown */}
          <select 
            value={selectedDifficulty} 
            onChange={e => { setSelectedDifficulty(e.target.value); setPage(1); }}
            style={{ flex: '1 1 140px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Source Dropdown */}
          <select 
            value={selectedSource} 
            onChange={e => { setSelectedSource(e.target.value); setPage(1); }}
            style={{ flex: '1 1 150px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
          >
            <option value="all">All Sources</option>
            <option value="institution">Institution Question Bank</option>
            <option value="personal">My Personal Uploads</option>
          </select>
        </div>
      </div>

      {/* Questions Listing */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={24} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--accent-primary)' }} />
          <p style={{ fontSize: '14px', marginTop: '12px' }}>Loading verified questions from Question Bank...</p>
        </div>
      ) : questions.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '50px 20px', textAlign: 'center' }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>No questions found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>Try broadening your search or filter criteria.</p>
          <button 
            onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedDifficulty(''); setSelectedSource('all'); }}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {questions.map((q, idx) => {
            const isRevealed = !!revealedAnswers[q.id];
            const correctOpt = q.question_options?.find(o => o.is_correct);

            return (
              <div 
                key={q.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'border 0.2s ease'
                }}
              >
                {/* Badges & Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)' }}>
                      #{idx + 1 + (page - 1) * pageSize}
                    </span>

                    {q.categories?.name && (
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        {q.categories.name}
                      </span>
                    )}

                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      background: q.difficulty === 'easy' ? 'rgba(16,185,129,0.1)' : q.difficulty === 'hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: q.difficulty === 'easy' ? '#10b981' : q.difficulty === 'hard' ? '#ef4444' : '#f59e0b'
                    }}>
                      {q.difficulty || 'medium'}
                    </span>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Source: {q.is_global ? 'Institutional Material' : 'Personal Document'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleAskAssistant(q)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        color: 'var(--accent-primary)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <Bot size={14} /> Ask Assistant
                    </button>

                    <button 
                      onClick={() => toggleReveal(q.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                      {isRevealed ? 'Hide Answer' : 'Show Answer'}
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {q.statement}
                </div>

                {/* Options List */}
                {q.question_options && q.question_options.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', marginTop: '4px' }}>
                    {q.question_options.map(opt => {
                      const isCorrect = isRevealed && opt.is_correct;
                      return (
                        <div 
                          key={opt.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            background: isCorrect ? 'rgba(16,185,129,0.1)' : 'var(--bg-primary)',
                            border: isCorrect ? '1px solid #10b981' : '1px solid var(--border-color)',
                            fontSize: '13px',
                            color: isCorrect ? '#10b981' : 'var(--text-primary)',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center'
                          }}
                        >
                          <strong style={{ minWidth: '18px' }}>{opt.label}.</strong>
                          <span>{opt.content}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation (when revealed) */}
                {isRevealed && (
                  <div style={{ marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                      Correct Answer: Option {correctOpt?.label || 'N/A'}
                    </div>
                    {q.explanation || 'No step-by-step explanation recorded for this question.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
          <button 
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: page <= 1 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: page >= totalPages ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
