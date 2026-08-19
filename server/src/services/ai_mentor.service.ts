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

    // 2. Fetch context from user's personal documents and learning profile
    let contextSnippet = '';
    try {
      const { data: personalDocs } = await supabase
        .from('personal_documents')
        .select('title, ai_summary')
        .eq('user_id', userId)
        .limit(3);

      if (personalDocs && personalDocs.length > 0) {
        contextSnippet = `\nUser's Uploaded Personal Materials:\n` + personalDocs.map(d => `- ${d.title}: ${d.ai_summary?.substring(0, 150)}...`).join('\n');
      }
    } catch (e) {
      // Continue without personal doc context if none
    }

    // 3. Build context-aware prompt for AI Router
    const promptText = `You are PLACE@ASET's AI Personal Mentor & Career Copilot. Provide encouraging, technically rigorous, and actionable guidance for placement preparation.
Topic Category: ${category || 'General Placement Engineering'}
${contextSnippet}
Student Query: "${userMessage}"`;

    const aiResult = await AIRouterService.executeTask('explanation', promptText);

    // 4. Save assistant message
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
  static async executeQuickPrompt(userId: string, mode: 'daily_plan' | 'weekly_review' | 'career_guide' | 'practice_recs') {
    const supabase = getSupabase();
    let userGoalContext = '';
    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('learning_mode, learning_goals, target_companies')
        .eq('id', userId)
        .maybeSingle();

      if (userProfile?.target_companies?.length) {
        userGoalContext = ` Targeting: ${userProfile.target_companies.join(', ')}.`;
      }
    } catch (e) {
      // Ignore
    }

    let promptText = '';
    switch (mode) {
      case 'daily_plan':
        promptText = `Create a targeted daily study plan for Data Structures, Algorithms, and Core Placement Aptitude.${userGoalContext}`;
        break;
      case 'weekly_review':
        promptText = `Provide a weekly performance checklist and readiness recommendations for placement season.${userGoalContext}`;
        break;
      case 'career_guide':
        promptText = `Give me a structured preparation roadmap for Software Development Engineer (SDE-1) campus recruitment drives.${userGoalContext}`;
        break;
      case 'practice_recs':
        promptText = `Recommend 5 high-frequency coding and aptitude practice problem archetypes for technical assessments.${userGoalContext}`;
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
