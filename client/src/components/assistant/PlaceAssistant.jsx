'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, Send, Plus, Trash2, Edit2, Check, X, Sparkles, 
  RotateCcw, Copy, History, BookOpen, Brain, Target, 
  Calendar, Layers, MessageSquare, ChevronLeft, ChevronRight,
  AlertCircle
} from 'lucide-react';
import { assistantService } from '../../lib/assistantService';
import { useToast } from '../../context/ToastContext';
import { useAssistant } from '../../context/AssistantContext';
import MarkdownView from './MarkdownView';
import styles from './assistant.module.css';

const STARTER_PROMPTS = [
  { icon: <BookOpen size={14} />, text: 'Explain binary search simply' },
  { icon: <Brain size={14} />, text: 'Give me 10 aptitude questions' },
  { icon: <Target size={14} />, text: 'Help me prepare for an interview' },
  { icon: <AlertCircle size={14} />, text: 'Explain my practice mistake' },
  { icon: <Calendar size={14} />, text: 'Create a study plan for today' },
  { icon: <Layers size={14} />, text: 'Teach me DBMS from basics' },
];

export default function PlaceAssistant({ isDrawer = false, onClose = null }) {
  const toast = useToast();
  const { activeContext, initialPrompt, clearContext, clearInitialPrompt } = useAssistant();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingConvId, setEditingConvId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [lastError, setLastError] = useState(null);
  const [aiEngineStatus, setAiEngineStatus] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Check AI Engine operational status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const st = await assistantService.getStatus();
        setAiEngineStatus(st);
      } catch (e) {
        setAiEngineStatus({ isAvailable: false, reason: 'Backend service offline' });
      }
    };
    fetchStatus();
  }, []);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      const data = await assistantService.getConversations();
      setConversations(data || []);
      if (data && data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages whenever active conversation changes
  const loadMessages = useCallback(async (convId) => {
    if (!convId) {
      setMessages([]);
      return;
    }
    try {
      const msgs = await assistantService.getMessages(convId);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      toast.error('Failed to load conversation history');
    }
  }, [toast]);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  // Handle incoming initialPrompt from context (e.g. "Explain this question")
  useEffect(() => {
    if (initialPrompt) {
      setInputMessage(initialPrompt);
      clearInitialPrompt();
      textareaRef.current?.focus();
    }
  }, [initialPrompt, clearInitialPrompt]);

  const handleNewConversation = async () => {
    try {
      const newConv = await assistantService.createConversation({
        title: `Session ${conversations.length + 1}`,
      });
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
      setShowHistory(false);
      setLastError(null);
      toast.success('Started a new conversation');
    } catch (err) {
      toast.error('Failed to create new conversation');
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || sending) return;

    setInputMessage('');
    setSending(true);
    setLastError(null);

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`;
    const userMsg = {
      id: tempId,
      sender: 'user',
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await assistantService.sendMessage({
        conversationId: activeConversationId || undefined,
        message: text,
        context: activeContext || undefined,
      });

      if (res?.conversationId && res.conversationId !== activeConversationId) {
        setActiveConversationId(res.conversationId);
        loadConversations();
      }

      // Replace temp with real assistant message
      if (res?.message) {
        setMessages(prev => [...prev.filter(m => m.id !== tempId), userMsg, res.message]);
      }
    } catch (err) {
      setLastError(text);
      if (err?.status === 401 || err?.statusCode === 401) {
        toast.error('Session expired. Please log in again.');
      } else if (err?.code === 'ECONNABORTED' || err?.message?.toLowerCase?.()?.includes('timeout')) {
        toast.error('AI provider timed out. The model may be busy.');
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        toast.error('Network disconnected. Check your internet connection.');
      } else if (err?.message === 'Network Error' || !err?.status) {
        toast.error('Backend server unreachable. Ensure API is running.');
      } else {
        toast.error(err?.message || 'Assistant request failed.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Response copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleStartRename = (conv, e) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (convId, e) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    try {
      await assistantService.renameConversation(convId, editTitle.trim());
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: editTitle.trim() } : c));
      setEditingConvId(null);
      toast.success('Conversation renamed');
    } catch {
      toast.error('Failed to rename conversation');
    }
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await assistantService.deleteConversation(convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (activeConversationId === convId) {
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const handleClearMessages = async () => {
    if (!activeConversationId) return;
    try {
      await assistantService.clearConversation(activeConversationId);
      setMessages([]);
      toast.success('Conversation cleared');
    } catch {
      toast.error('Failed to clear conversation');
    }
  };

  const handleQuickAction = async (actionKey) => {
    setSending(true);
    setLastError(null);
    try {
      const res = await assistantService.executeQuickAction(actionKey);
      const actionLabels = {
        daily_plan: 'Daily Study Plan',
        weekly_review: 'Weekly Placement Review',
        career_roadmap: 'Campus Placement Roadmap',
        practice_recommendations: 'Recommended Practice Archetypes',
        interview_prep: 'Interview Preparation Tips',
      };
      const label = actionLabels[actionKey] || 'Quick Action';

      const promptMsg = {
        id: `action-${Date.now()}-u`,
        sender: 'user',
        message: `Generate: ${label}`,
        created_at: new Date().toISOString(),
      };
      const assistantMsg = {
        id: `action-${Date.now()}-a`,
        sender: 'assistant',
        message: res.response,
        metadata: { provider_used: res.provider },
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, promptMsg, assistantMsg]);
    } catch {
      toast.error('Failed to execute quick action');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.assistantContainer}>
      
      {/* Header */}
      <div className={styles.assistantHeader}>
        <div className={styles.titleArea}>
          <div className={styles.assistantBadge}>
            <Bot size={18} />
          </div>
          <div className={styles.headerText}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className={styles.headerTitle}>PLACE Assistant</h2>
              {aiEngineStatus && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: aiEngineStatus.isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: aiEngineStatus.isAvailable ? '#10b981' : '#f59e0b',
                    border: `1px solid ${aiEngineStatus.isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  title={aiEngineStatus.reason}
                >
                  {aiEngineStatus.isAvailable ? `AI: ${aiEngineStatus.activeProvider}` : 'AI Offline'}
                </span>
              )}
            </div>
            <p className={styles.headerSubtitle}>Your personal study and placement assistant</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={() => setShowHistory(prev => !prev)}
            className={styles.headerBtn}
            title={showHistory ? 'Hide Conversations' : 'View Conversations'}
            aria-label="Toggle Conversation History"
          >
            <History size={16} />
          </button>

          <button
            onClick={handleNewConversation}
            className={styles.headerBtn}
            title="Start New Chat"
            aria-label="Start New Chat"
          >
            <Plus size={16} />
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleClearMessages}
              className={styles.headerBtn}
              title="Clear Conversation"
              aria-label="Clear Conversation"
            >
              <RotateCcw size={15} />
            </button>
          )}

          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className={styles.headerBtn}
              title="Close Assistant"
              aria-label="Close Assistant"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Active Context Chip Banner */}
      {activeContext && (
        <div className={styles.contextChip}>
          <div className={styles.contextChipContent}>
            <span>📌</span>
            <span>
              <strong>Grounded in {activeContext.type.toUpperCase()}:</strong>{' '}
              {activeContext.questionStatement
                ? activeContext.questionStatement.substring(0, 75) + '...'
                : activeContext.resourceTitle || activeContext.category || 'Platform Telemetry'}
            </span>
          </div>
          <button
            onClick={clearContext}
            className={styles.contextChipClose}
            title="Remove Context"
            aria-label="Remove Context"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className={styles.bodyArea}>
        
        {/* Slide-out History Drawer */}
        {showHistory && (
          <div className={styles.historyDrawer}>
            <div className={styles.historyHeader}>
              <span>Saved Conversations</span>
              <button
                onClick={() => setShowHistory(false)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                aria-label="Close history"
              >
                <X size={14} />
              </button>
            </div>

            <div className={styles.historyList}>
              {conversations.length === 0 ? (
                <div style={{ padding: '16px 8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No prior sessions found.
                </div>
              ) : (
                conversations.map(conv => {
                  const isActive = conv.id === activeConversationId;
                  const isEditing = conv.id === editingConvId;

                  return (
                    <div
                      key={conv.id}
                      className={`${styles.historyItem} ${isActive ? styles.historyItemActive : ''}`}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        if (window.innerWidth < 768) setShowHistory(false);
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{
                              padding: '2px 6px',
                              fontSize: '12px',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-accent)',
                              borderRadius: '4px',
                              color: 'var(--text-primary)',
                              width: '100%',
                            }}
                            autoFocus
                          />
                          <button
                            onClick={e => handleSaveRename(conv.id, e)}
                            className={styles.historyActionBtn}
                            title="Save"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={styles.historyItemText}>{conv.title}</span>
                          <div className={styles.historyActions}>
                            <button
                              onClick={e => handleStartRename(conv, e)}
                              className={styles.historyActionBtn}
                              title="Rename"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={e => handleDeleteConversation(conv.id, e)}
                              className={styles.historyActionBtn}
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Messages Stream */}
        <div className={styles.messagesArea}>
          {messages.length === 0 ? (
            <div className={styles.emptyStateContainer}>
              <div className={styles.emptyIconBox}>
                <Bot size={28} />
              </div>
              <div>
                <h3 className={styles.emptyTitle}>How can I help your preparation today?</h3>
                <p className={styles.emptyDescription}>
                  Ask technical questions, request step-by-step explanations, or choose a recommended prompt below.
                </p>
              </div>

              <div className={styles.suggestionsGrid}>
                {STARTER_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    className={styles.suggestionBtn}
                    onClick={() => handleSendMessage(p.text)}
                  >
                    <span style={{ color: 'var(--accent-primary)', display: 'flex', flexShrink: 0 }}>
                      {p.icon}
                    </span>
                    <span>{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => {
              if (m.sender === 'user') {
                return (
                  <div key={m.id || idx} className={styles.userMessageBubble}>
                    {m.message}
                  </div>
                );
              }

              return (
                <div key={m.id || idx} className={styles.assistantMessageCard}>
                  <div className={styles.assistantMsgHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={13} />
                      <span>PLACE Assistant</span>
                      {m.metadata?.provider_used && m.metadata.provider_used !== 'unavailable' && (
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(14, 165, 233, 0.1)',
                          fontSize: '10px',
                          fontWeight: '600',
                          color: 'var(--text-accent)',
                        }}>
                          {m.metadata.provider_used}
                        </span>
                      )}
                    </div>
                    <div className={styles.assistantMsgActions}>
                      <button
                        onClick={() => handleCopyMessage(m.message)}
                        className={styles.copyMsgBtn}
                        title="Copy answer"
                        aria-label="Copy answer"
                      >
                        <Copy size={12} />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  <MarkdownView content={m.message} />
                </div>
              );
            })
          )}

          {/* Reasoning / Thinking State */}
          {sending && (
            <div className={styles.loadingBubble}>
              <div className={styles.reasoningPulse} />
              <span>PLACE Assistant is reasoning...</span>
            </div>
          )}

          {/* Retry on error */}
          {lastError && !sending && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontSize: '12px',
              color: 'var(--accent-danger)',
            }}>
              <span>Response generation was interrupted.</span>
              <button
                onClick={() => handleSendMessage(lastError)}
                style={{
                  background: 'none',
                  border: '1px solid var(--accent-danger)',
                  color: 'var(--accent-danger)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className={styles.inputSection}>
        {/* Quick Action Chips */}
        <div className={styles.quickActionRow}>
          <button onClick={() => handleQuickAction('daily_plan')} className={styles.quickActionPill}>
            <Calendar size={12} style={{ color: 'var(--accent-primary)' }} /> Daily Plan
          </button>
          <button onClick={() => handleQuickAction('weekly_review')} className={styles.quickActionPill}>
            <Target size={12} style={{ color: 'var(--accent-success)' }} /> Weekly Review
          </button>
          <button onClick={() => handleQuickAction('career_roadmap')} className={styles.quickActionPill}>
            <Layers size={12} style={{ color: 'var(--accent-warning)' }} /> Placement Roadmap
          </button>
          <button onClick={() => handleQuickAction('practice_recommendations')} className={styles.quickActionPill}>
            <Brain size={12} style={{ color: '#a855f7' }} /> Recommended Problems
          </button>
        </div>

        {/* Multiline Composer */}
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeContext
                ? `Ask about this ${activeContext.type} (Shift+Enter for new line)...`
                : 'Ask PLACE Assistant a study question (Shift+Enter for new line)...'
            }
            className={styles.chatTextarea}
            disabled={sending}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={sending || !inputMessage.trim()}
            className={styles.sendBtn}
            title="Send Message (Enter)"
            aria-label="Send Message"
          >
            <Send size={15} />
          </button>
        </div>

        <p className={styles.disclaimerText}>
          Academic responses grounded in verified curriculum & student telemetry.
        </p>
      </div>

    </div>
  );
}
