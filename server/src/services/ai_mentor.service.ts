import { getSupabase } from '../config/database';
import { AIRouterService } from './ai_engine/ai_router.service';
import crypto from 'crypto';

interface MemoryChat {
  id: string;
  user_id: string;
  category: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface MemoryMessage {
  id: string;
  chat_id: string;
  user_id: string;
  sender: 'user' | 'assistant';
  message: string;
  metadata?: any;
  created_at: string;
}

// In-memory resilient storage for environments where DB migration 023 is pending
const memoryChats = new Map<string, MemoryChat[]>();
const memoryMessages = new Map<string, MemoryMessage[]>();

export class AIMentorService {
  /**
   * Get user AI mentor chat sessions
   */
  static async getUserChats(userId: string): Promise<MemoryChat[]> {
    const supabase = getSupabase();

    try {
      const { data: chats, error } = await supabase
        .from('ai_mentor_chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!error && chats && chats.length > 0) {
        return chats;
      }
    } catch {
      // Fall through to memory store
    }

    return memoryChats.get(userId) || [];
  }

  /**
   * Create new mentor chat session
   */
  static async createChatSession(userId: string, category?: string, title?: string): Promise<MemoryChat> {
    const supabase = getSupabase();
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newChat: MemoryChat = {
      id: newId,
      user_id: userId,
      category: category || 'general',
      title: title || 'AI Mentor Session',
      created_at: now,
      updated_at: now,
    };

    try {
      const { data: chat, error } = await supabase
        .from('ai_mentor_chats')
        .insert({
          id: newId,
          user_id: userId,
          category: newChat.category,
          title: newChat.title
        })
        .select()
        .single();

      if (!error && chat) return chat;
    } catch {
      // Use resilient memory store
    }

    const userList = memoryChats.get(userId) || [];
    userList.unshift(newChat);
    memoryChats.set(userId, userList);
    return newChat;
  }

  /**
   * Get messages in a chat session
   */
  static async getChatMessages(chatId: string, userId: string): Promise<MemoryMessage[]> {
    const supabase = getSupabase();

    try {
      const { data: messages, error } = await supabase
        .from('ai_mentor_messages')
        .select('*')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && messages && messages.length > 0) {
        return messages;
      }
    } catch {
      // Fall through to memory store
    }

    return memoryMessages.get(chatId) || [];
  }

  /**
   * Send user message & generate AI response via AIRouterService
   */
  static async sendMentorMessage(userId: string, chatId: string, userMessage: string, category?: string) {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const userMsgId = crypto.randomUUID();

    // 1. Save user message locally or in DB
    const userMsgRecord: MemoryMessage = {
      id: userMsgId,
      chat_id: chatId,
      user_id: userId,
      sender: 'user',
      message: userMessage,
      created_at: now
    };

    try {
      await supabase.from('ai_mentor_messages').insert({
        id: userMsgId,
        chat_id: chatId,
        user_id: userId,
        sender: 'user',
        message: userMessage
      });
    } catch {
      // Ignore DB error
    }

    const currentMsgs = memoryMessages.get(chatId) || [];
    currentMsgs.push(userMsgRecord);
    memoryMessages.set(chatId, currentMsgs);

    // 2. Fetch context from real practice activity, telemetry, personal documents, and profile
    let telemetryContext = '';
    let userLearningMode: 'personal' | 'institute' = 'institute';

    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('learning_mode, learning_goals, target_companies, current_streak, xp')
        .eq('id', userId)
        .maybeSingle();

      if (userProfile?.learning_mode === 'personal') {
        userLearningMode = 'personal';
      }

      const { data: recentSessions } = await supabase
        .from('practice_sessions')
        .select('difficulty, total_questions, correct_answers, score_pct')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      const sessionCount = recentSessions?.length || 0;
      const totalAttempted = recentSessions?.reduce((acc, s) => acc + (s.total_questions || 0), 0) || 0;
      const totalCorrect = recentSessions?.reduce((acc, s) => acc + (s.correct_answers || 0), 0) || 0;
      const avgAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;

      telemetryContext = `
Student Verified Telemetry:
- Learning Mode: ${userLearningMode.toUpperCase()}
- Current Streak: ${userProfile?.current_streak || 0} days | XP: ${userProfile?.xp || 0}
- Practice Summary: ${sessionCount} recent sessions (${totalAttempted} questions attempted, accuracy: ${avgAccuracy !== null ? avgAccuracy + '%' : 'No practice data yet'})
- Target Companies: ${userProfile?.target_companies?.length ? userProfile.target_companies.join(', ') : 'General Placement'}`;
    } catch {
      // Telemetry lookup is non-blocking
    }

    // 3. Build context-aware prompt for AI Router
    const promptText = `You are PLACE@ASET's Academic Mentor and Placement Preparation Assistant.
You give actionable, technically precise, and honest guidance grounded strictly in the student's actual learning context below.
Never invent fake progress statistics or assume tests the student hasn't taken.

Category: ${category || 'General Placement Engineering'}
${telemetryContext}

Student Query: "${userMessage}"`;

    const aiResult = await AIRouterService.executeTask('study_assistant', promptText, {
      learningMode: userLearningMode
    });

    let responseText = aiResult.text;
    if (aiResult.providerId === 'unavailable') {
      responseText = "AI is currently unavailable because no configured provider is reachable. Please start Ollama locally (http://localhost:11434) or configure cloud AI keys (Gemini, OpenAI, Anthropic).";
    }

    // 4. Save assistant message
    const assistantMsgId = crypto.randomUUID();
    const assistantNow = new Date().toISOString();
    const assistantMsgRecord: MemoryMessage = {
      id: assistantMsgId,
      chat_id: chatId,
      user_id: userId,
      sender: 'assistant',
      message: responseText,
      metadata: {
        provider_used: aiResult.providerId,
        tokens_used: aiResult.tokensUsed,
        latency_ms: aiResult.latencyMs
      },
      created_at: assistantNow
    };

    try {
      await supabase.from('ai_mentor_messages').insert({
        id: assistantMsgId,
        chat_id: chatId,
        user_id: userId,
        sender: 'assistant',
        message: responseText,
        metadata: assistantMsgRecord.metadata
      });
      await supabase.from('ai_mentor_chats').update({ updated_at: assistantNow }).eq('id', chatId);
    } catch {
      // Ignore DB error
    }

    currentMsgs.push(assistantMsgRecord);
    memoryMessages.set(chatId, currentMsgs);

    // Update memory chat timestamp
    const userChatList = memoryChats.get(userId) || [];
    const targetChat = userChatList.find(c => c.id === chatId);
    if (targetChat) targetChat.updated_at = assistantNow;

    return assistantMsgRecord;
  }

  /**
   * Execute One-Click Quick AI Mentor Actions
   */
  static async executeQuickPrompt(_userId: string, mode: 'daily_plan' | 'weekly_review' | 'career_guide' | 'practice_recs'): Promise<{ mode: string; response: string; provider: string; tokensUsed?: number }> {
    let promptText = '';
    switch (mode) {
      case 'daily_plan':
        promptText = 'Create a realistic, targeted daily study plan for Data Structures, Algorithms, and Core Placement Aptitude.';
        break;
      case 'weekly_review':
        promptText = 'Provide a weekly performance checklist and readiness recommendations for placement season.';
        break;
      case 'career_guide':
        promptText = 'Give actionable guidance for placement interview rounds (Aptitude -> Technical Round -> System Design -> HR Round).';
        break;
      case 'practice_recs':
      default:
        promptText = 'Recommend high-yield placement topics to practice today based on placement trends.';
        break;
    }

    const aiResult = await AIRouterService.executeTask('study_assistant', promptText, {
      learningMode: 'personal'
    });

    let text = aiResult.text;
    if (aiResult.providerId === 'unavailable') {
      text = "AI is currently unavailable because no configured provider is reachable. Please check your AI provider configuration.";
    }

    return {
      mode,
      response: text,
      provider: aiResult.providerId,
      tokensUsed: aiResult.tokensUsed
    };
  }
}
