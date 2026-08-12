'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { mentorService } from '../../../lib/mentorService';
import { 
  Bot, Send, Plus, Sparkles, Calendar, TrendingUp, 
  Compass, Code, BookOpen, User, Cpu, ShieldCheck 
} from 'lucide-react';
import styles from './mentor.module.css';

export default function AIMentorPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const list = await mentorService.getUserChats();
      setChats(list || []);
      if (list && list.length > 0) {
        setActiveChatId(list[0].id);
      } else {
        // Create initial session
        const newChat = await mentorService.createChatSession({ title: 'Welcome Session', category: 'general' });
        setChats([newChat]);
        setActiveChatId(newChat.id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load AI mentor sessions');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    try {
      const msgs = await mentorService.getChatMessages(chatId);
      setMessages(msgs || []);
    } catch (err) {
      toast.error('Failed to load chat thread');
    }
  }, [toast]);

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId, loadMessages]);

  const handleNewChat = async () => {
    try {
      const newChat = await mentorService.createChatSession({ title: `Mentor Session ${chats.length + 1}` });
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setMessages([]);
      toast.success('New AI mentor session created');
    } catch (err) {
      toast.error('Failed to create new session');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChatId || sending) return;
    const msgText = inputMessage;
    setInputMessage('');
    setSending(true);

    // Optimistic user message append
    setMessages(prev => [...prev, { id: 'temp-user', sender: 'user', message: msgText }]);

    try {
      const res = await mentorService.sendMentorMessage(activeChatId, { message: msgText });
      setMessages(prev => [...prev.filter(m => m.id !== 'temp-user'), { id: 'temp-user-real', sender: 'user', message: msgText }, res]);
    } catch (err) {
      toast.error('AI mentor failed to respond: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = async (mode) => {
    setSending(true);
    try {
      const res = await mentorService.executeQuickPrompt(mode);
      setMessages(prev => [
        ...prev,
        { id: `quick-${Date.now()}-u`, sender: 'user', message: `Execute Quick Mentor Action: ${mode.replace('_', ' ').toUpperCase()}` },
        { id: `quick-${Date.now()}-a`, sender: 'assistant', message: res.response, metadata: { provider_used: res.provider } }
      ]);
      toast.success('AI plan generated');
    } catch (err) {
      toast.error('Quick prompt failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={26} style={{ color: 'var(--accent-primary)' }} /> AI Personal Learning & Career Mentor
          </h1>
          <p>Conversational AI mentor for daily study plans, weekly reviews, concept explanations, and placement guidance.</p>
        </div>
      </div>

      <div className={styles.chatLayout}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <button onClick={handleNewChat} style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Plus size={16} /> New Session
          </button>

          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quick AI Actions</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              <button className={styles.quickBtn} onClick={() => handleQuickPrompt('daily_plan')}>
                <Calendar size={14} style={{ color: 'var(--accent-primary)' }} /> Daily Study Plan
              </button>
              <button className={styles.quickBtn} onClick={() => handleQuickPrompt('weekly_review')}>
                <TrendingUp size={14} style={{ color: '#10b981' }} /> Weekly Review
              </button>
              <button className={styles.quickBtn} onClick={() => handleQuickPrompt('career_guide')}>
                <Compass size={14} style={{ color: '#f59e0b' }} /> Career Roadmap
              </button>
              <button className={styles.quickBtn} onClick={() => handleQuickPrompt('practice_recs')}>
                <Code size={14} style={{ color: '#a855f7' }} /> Recommended Questions
              </button>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recent Sessions</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`${styles.chatItem} ${activeChatId === chat.id ? styles.chatItemActive : ''}`}
                >
                  {chat.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          <div className={styles.messagesArea}>
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', maxWidth: '400px' }}>
                <Bot size={48} style={{ color: 'var(--accent-primary)', marginBottom: '12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Welcome to your AI Personal Mentor</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Ask any question about DSA, DBMS, System Design, placement interviews, or use a Quick AI Action on the sidebar.</p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={m.id || idx} className={m.sender === 'user' ? styles.userBubble : styles.assistantBubble}>
                  {m.sender === 'assistant' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '700' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Cpu size={12} /> AI Mentor Response
                      </span>
                      {m.metadata?.provider_used && (
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', fontSize: '10px' }}>
                          Provider: {m.metadata.provider_used}
                        </span>
                      )}
                    </div>
                  )}
                  {m.message}
                </div>
              ))
            )}

            {sending && (
              <div className={styles.assistantBubble} style={{ opacity: 0.8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Sparkles size={14} style={{ animation: 'spin 1s linear infinite' }} /> AI Personal Mentor is thinking...
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className={styles.inputArea}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Ask your AI Mentor a question or request code help..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
            />
            <button type="submit" disabled={sending || !inputMessage.trim()}
              style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
