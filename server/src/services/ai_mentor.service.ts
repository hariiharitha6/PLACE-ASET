import { getSupabase } from '../config/database';
import { AIRouterService } from './ai_engine/ai_router.service';

export class AIMentorService {
  /**
   * Get user AI mentor chat sessions
   */
  static async getUserChats(userId: string) {
    const supabase = getSupabase();

    const { data: chats, error } = await supabase
      .from('ai_mentor_chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return chats || [];
  }

  /**
   * Create new mentor chat session
   */
  static async createChatSession(userId: string, category?: string, title?: string) {
    const supabase = getSupabase();

    const { data: chat, error } = await supabase
      .from('ai_mentor_chats')
      .insert({
        user_id: userId,
        category: category || 'general',
        title: title || 'AI Mentor Session'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return chat;
  }

  /**
   * Get messages in a chat session
   */
  static async getChatMessages(chatId: string, userId: string) {
    const supabase = getSupabase();

    const { data: messages, error } = await supabase
      .from('ai_mentor_messages')
      .select('*')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return messages || [];
  }

  /**
   * Send user message & generate AI response via AIRouterService
   */
  static async sendMentorMessage(userId: string, chatId: string, userMessage: string, category?: string) {
    const supabase = getSupabase();

    // 1. Save user message
    await supabase.from('ai_mentor_messages').insert({
      chat_id: chatId,
      user_id: userId,
      sender: 'user',
      message: userMessage
    });

    // 2. Build system context for AI Router
    const promptText = `You are PLACE@ASET's AI Personal Mentor. Provide encouraging, highly technical, and actionable guidance for an engineering student.
Topic Category: ${category || 'General Computer Science'}
Student Query: "${userMessage}"`;

    const aiResult = await AIRouterService.executeTask('explanation', promptText);

    // 3. Save assistant message
    const { data: assistantMsg, error } = await supabase
      .from('ai_mentor_messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        sender: 'assistant',
        message: aiResult.text,
        metadata: {
          provider_used: aiResult.providerId,
          tokens_used: aiResult.tokensUsed,
          latency_ms: aiResult.latencyMs
        }
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update chat updated_at timestamp
    await supabase.from('ai_mentor_chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);

    return assistantMsg;
  }

  /**
   * Execute One-Click Quick AI Mentor Actions
   */
  static async executeQuickPrompt(_userId: string, mode: 'daily_plan' | 'weekly_review' | 'career_guide' | 'practice_recs') {
    let promptText = '';
    switch (mode) {
      case 'daily_plan':
        promptText = 'Create a targeted 24-hour daily study plan focusing on Data Structures, Algorithms, and Aptitude practice.';
        break;
      case 'weekly_review':
        promptText = 'Provide a weekly performance review summarizing key focus areas for interview readiness.';
        break;
      case 'career_guide':
        promptText = 'Give me a roadmap for preparing for SDE-1 roles at tier-1 product companies.';
        break;
      case 'practice_recs':
        promptText = 'Recommend 5 high-yield coding practice problems for Array, Dynamic Programming, and SQL.';
        break;
    }

    const aiResult = await AIRouterService.executeTask('explanation', promptText);
    return {
      mode,
      response: aiResult.text,
      provider: aiResult.providerId
    };
  }
}
