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

    // 2. Fetch context from real practice activity, weak topics, personal documents, and profile
    let telemetryContext = '';
    let userLearningMode: 'personal' | 'institute' = 'institute';

    try {
      // Fetch user profile and goals
      const { data: userProfile } = await supabase
        .from('users')
        .select('learning_mode, learning_goals, target_companies, daily_streak, xp')
        .eq('id', userId)
        .maybeSingle();

      if (userProfile?.learning_mode === 'personal') {
        userLearningMode = 'personal';
      }

      // Fetch real practice sessions & accuracy
      const { data: recentSessions } = await supabase
        .from('practice_sessions')
        .select('difficulty, total_questions, correct_answers, score_pct')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch missed questions to identify weak areas
      const { data: missedAnswers } = await supabase
        .from('practice_answers')
        .select('question_id, practice_sessions!inner(user_id)')
        .eq('practice_sessions.user_id', userId)
        .eq('is_correct', false)
        .limit(8);

      // Fetch personal docs
      const { data: personalDocs } = await supabase
        .from('personal_documents')
        .select('title, ai_summary')
        .eq('user_id', userId)
        .limit(3);

      const sessionCount = recentSessions?.length || 0;
      const totalAttempted = recentSessions?.reduce((acc, s) => acc + (s.total_questions || 0), 0) || 0;
      const totalCorrect = recentSessions?.reduce((acc, s) => acc + (s.correct_answers || 0), 0) || 0;
      const avgAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;

      telemetryContext = `
Student Verified Telemetry:
- Learning Mode: ${userLearningMode.toUpperCase()}
- Current Streak: ${userProfile?.daily_streak || 0} days | XP: ${userProfile?.xp || 0}
- Recent Practice Sessions: ${sessionCount} (${totalAttempted} questions attempted, overall accuracy: ${avgAccuracy !== null ? avgAccuracy + '%' : 'No practice data yet'})
- Target Companies: ${userProfile?.target_companies?.length ? userProfile.target_companies.join(', ') : 'Not set'}
- Recorded Missed Question Count: ${missedAnswers?.length || 0}
${personalDocs && personalDocs.length > 0 ? 'Uploaded Study Materials:\n' + personalDocs.map(d => `  * ${d.title}: ${(d.ai_summary || '').substring(0, 120)}...`).join('\n') : 'No personal documents uploaded yet.'}`;
    } catch (e) {
      // Continue gracefully if telemetry lookup encounters an issue
    }

    // 3. Build context-aware prompt for AI Router
    const promptText = `You are PLACE@ASET's AI Personal Mentor & Career Copilot.
You give actionable, technically precise, and honest guidance grounded strictly in the student's actual learning telemetry below.
Never invent fake progress statistics or assume tests the student hasn't taken. If telemetry indicates "No practice data yet", advise them to start practicing in the Arena.

Category: ${category || 'General Placement Engineering'}
${telemetryContext}

Student Query: "${userMessage}"`;

    const aiResult = await AIRouterService.executeTask('study_assistant', promptText, {
      learningMode: userLearningMode
    });

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
    let userLearningMode: 'personal' | 'institute' = 'institute';

    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('learning_mode, learning_goals, target_companies, daily_streak')
        .eq('id', userId)
        .maybeSingle();

      if (userProfile?.learning_mode === 'personal') {
        userLearningMode = 'personal';
      }

      if (userProfile?.target_companies?.length) {
        userGoalContext = ` Targeting companies: ${userProfile.target_companies.join(', ')}.`;
      }
    } catch (e) {
      // Ignore
    }

    let promptText = '';
    switch (mode) {
      case 'daily_plan':
        promptText = `Create a realistic, targeted daily study plan for Data Structures, Algorithms, and Core Placement Aptitude.${userGoalContext}`;
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

    const aiResult = await AIRouterService.executeTask('study_assistant', promptText, {
      learningMode: userLearningMode
    });
    return {
      mode,
      response: aiResult.text,
      provider: aiResult.providerId
    };
  }
}
