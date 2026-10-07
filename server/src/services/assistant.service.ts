import { getSupabase } from '../config/database';
import { AIRouterService } from './ai_engine/ai_router.service';
import crypto from 'crypto';

export interface AssistantContext {
  type: 'general' | 'practice' | 'resource' | 'readiness' | 'interview' | 'personal_learning';
  questionId?: string;
  questionStatement?: string;
  options?: Array<{ label: string; content: string; is_correct?: boolean }>;
  selectedOption?: string;
  selectedOptionLabel?: string;
  correctOptionLabel?: string;
  explanation?: string;
  category?: string;
  difficulty?: string;
  timeSpentSeconds?: number;
  resourceTitle?: string;
  resourceCategory?: string;
  resourceSnippet?: string;
  weakTopics?: string[];
  accuracy?: number;
  streak?: number;
  readinessScore?: number;
  solvedQuestions?: number;
  interviewRole?: string;
  interviewTopic?: string;
  documentId?: string;
  documentTitle?: string;
}

export interface SendMessagePayload {
  conversationId?: string;
  message: string;
  context?: AssistantContext;
  mode?: 'personal' | 'institute';
}

interface MemoryConversation {
  id: string;
  user_id: string;
  title: string;
  category: string;
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

// In-memory fallback cache when Supabase schema migrations haven't run on remote DB yet
const memoryConversations = new Map<string, MemoryConversation>();
const memoryMessages = new Map<string, MemoryMessage[]>();

export class AssistantService {
  /**
   * Get all user conversations sorted by most recently updated
   */
  static async getUserConversations(userId: string) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('ai_mentor_chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch {
      // Fall through to memory store
    }

    // Fallback store
    const userConvs = Array.from(memoryConversations.values())
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return userConvs;
  }

  /**
   * Create a new conversation session
   */
  static async createConversation(userId: string, title?: string, category?: string) {
    const convId = crypto.randomUUID();
    const now = new Date().toISOString();
    const convObj: MemoryConversation = {
      id: convId,
      user_id: userId,
      title: title || 'New PLACE Session',
      category: category || 'general',
      created_at: now,
      updated_at: now,
    };

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('ai_mentor_chats')
        .insert({
          user_id: userId,
          title: convObj.title,
          category: convObj.category,
        })
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback
    }

    // Fallback store
    memoryConversations.set(convId, convObj);
    memoryMessages.set(convId, []);
    return convObj;
  }

  /**
   * Get all messages in a conversation, ensuring ownership
   */
  static async getConversationMessages(userId: string, conversationId: string) {
    try {
      const supabase = getSupabase();
      const { data: chat, error: chatErr } = await supabase
        .from('ai_mentor_chats')
        .select('id, user_id, title')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!chatErr && chat) {
        const { data: messages, error } = await supabase
          .from('ai_mentor_messages')
          .select('*')
          .eq('chat_id', conversationId)
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (!error && messages) {
          return messages;
        }
      }
    } catch {
      // Fallback
    }

    // Fallback store
    const conv = memoryConversations.get(conversationId);
    if (!conv || conv.user_id !== userId) {
      // Allow if freshly created or empty
      if (!conv) {
        return [];
      }
      throw new Error('Conversation not found or access denied');
    }

    return memoryMessages.get(conversationId) || [];
  }

  /**
   * Rename a conversation
   */
  static async renameConversation(userId: string, conversationId: string, title: string) {
    const trimmedTitle = title.trim();

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('ai_mentor_chats')
        .update({ title: trimmedTitle, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback
    }

    const conv = memoryConversations.get(conversationId);
    if (!conv || conv.user_id !== userId) {
      throw new Error('Conversation not found or access denied');
    }
    conv.title = trimmedTitle;
    conv.updated_at = new Date().toISOString();
    return conv;
  }

  /**
   * Delete a conversation
   */
  static async deleteConversation(userId: string, conversationId: string) {
    try {
      const supabase = getSupabase();
      await supabase
        .from('ai_mentor_chats')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', userId);
    } catch {
      // Fallback
    }

    const conv = memoryConversations.get(conversationId);
    if (conv && conv.user_id === userId) {
      memoryConversations.delete(conversationId);
      memoryMessages.delete(conversationId);
    }
    return { success: true };
  }

  /**
   * Clear all messages in a conversation
   */
  static async clearConversationMessages(userId: string, conversationId: string) {
    try {
      const supabase = getSupabase();
      await supabase
        .from('ai_mentor_messages')
        .delete()
        .eq('chat_id', conversationId)
        .eq('user_id', userId);

      await supabase
        .from('ai_mentor_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch {
      // Fallback
    }

    memoryMessages.set(conversationId, []);
    return { success: true };
  }

  /**
   * Send a message to PLACE Assistant with verified telemetry & context
   */
  static async sendChatMessage(userId: string, payload: SendMessagePayload) {
    const supabase = getSupabase();
    let conversationId = payload.conversationId;

    // 1. Create conversation if none provided
    if (!conversationId) {
      const generatedTitle = payload.message.length > 35
        ? `${payload.message.substring(0, 32)}...`
        : payload.message;
      const newChat = await this.createConversation(
        userId,
        generatedTitle,
        payload.context?.type || 'general'
      );
      conversationId = newChat.id;
    }

    const activeConvId: string = conversationId || crypto.randomUUID();

    // 2. Persist user message
    const userMsgId = crypto.randomUUID();
    const userNow = new Date().toISOString();
    const userMsg: MemoryMessage = {
      id: userMsgId,
      chat_id: activeConvId,
      user_id: userId,
      sender: 'user',
      message: payload.message,
      metadata: payload.context ? { context: payload.context } : {},
      created_at: userNow,
    };

    try {
      await supabase.from('ai_mentor_messages').insert({
        id: userMsgId,
        chat_id: activeConvId,
        user_id: userId,
        sender: 'user',
        message: payload.message,
        metadata: userMsg.metadata,
      });
    } catch {
      // Fallback to memory
      const list = memoryMessages.get(activeConvId) || [];
      list.push(userMsg);
      memoryMessages.set(activeConvId, list);
    }

    // 3. Resolve user profile, learning mode, and telemetry
    let userLearningMode: 'personal' | 'institute' = payload.mode || 'institute';
    let telemetryContext = '';

    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name, department, learning_mode, target_companies, daily_streak, xp')
        .eq('id', userId)
        .maybeSingle();

      if (userProfile?.learning_mode === 'personal') {
        userLearningMode = 'personal';
      }

      // Recent practice session stats
      const { data: recentSessions } = await supabase
        .from('practice_sessions')
        .select('mode, difficulty, total_questions, correct_answers, score_pct')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      const sessionCount = recentSessions?.length || 0;
      const totalAttempted = recentSessions?.reduce((acc, s) => acc + (s.total_questions || 0), 0) || 0;
      const totalCorrect = recentSessions?.reduce((acc, s) => acc + (s.correct_answers || 0), 0) || 0;
      const avgAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;

      // Recent practice mistakes
      let mistakeTopics: string[] = [];
      try {
        const { data: recentMistakes } = await supabase
          .from('practice_answers')
          .select('questions(topic, category_slug)')
          .eq('user_id', userId)
          .eq('is_correct', false)
          .order('created_at', { ascending: false })
          .limit(5);

        mistakeTopics = (recentMistakes || [])
          .map((m: any) => m.questions?.topic || m.questions?.category_slug)
          .filter(Boolean);
      } catch {
        // Fallback
      }

      telemetryContext = `Student Verified Telemetry:
- Department: ${userProfile?.department || 'Engineering'}
- Learning Mode: ${userLearningMode.toUpperCase()}
- Current Streak: ${userProfile?.daily_streak || 0} days | XP: ${userProfile?.xp || 0}
- Practice Summary: ${sessionCount} recent sessions (${totalAttempted} questions attempted, avg accuracy: ${avgAccuracy !== null ? avgAccuracy + '%' : 'No practice data yet'})
- Recent Mistakes / Review Topics: ${mistakeTopics.length > 0 ? Array.from(new Set(mistakeTopics)).join(', ') : 'None flagged'}
- Target Companies: ${userProfile?.target_companies?.length ? userProfile.target_companies.join(', ') : 'Not configured'}`;
    } catch (e) {
      // Telemetry lookup is resilient
    }

    // 4. Construct Context-Aware Block
    let contextBlock = '';
    const ctx = payload.context;
    if (ctx) {
      switch (ctx.type) {
        case 'practice':
          contextBlock = `\nContext [PRACTICE QUESTION]:
- Question: ${ctx.questionStatement || 'N/A'}
- Category/Topic: ${ctx.category || 'General'} (Difficulty: ${ctx.difficulty || 'Medium'})
${ctx.options?.length ? '- Options:\n' + ctx.options.map(o => `  [${o.label}] ${o.content}`).join('\n') : ''}
${ctx.selectedOptionLabel ? `- Student Selected: [${ctx.selectedOptionLabel}]` : '- Student has not answered yet.'}
${ctx.correctOptionLabel ? `- Correct Option: [${ctx.correctOptionLabel}]` : ''}
${ctx.explanation ? `- Official Explanation: ${ctx.explanation}` : ''}
Guidance for Practice Context:
- If the student asks why their answer is wrong, explain the concept clearly.
- Prefer guiding hints and conceptual stepping stones before directly giving the solution.`;
          break;

        case 'resource':
          contextBlock = `\nContext [STUDY RESOURCE]:
- Title: ${ctx.resourceTitle || 'Resource'}
- Category: ${ctx.resourceCategory || 'General'}
${ctx.resourceSnippet ? `- Content Summary: ${ctx.resourceSnippet}` : ''}
Guidance for Resource Context:
- Provide clear summaries, conceptual breakdowns, or sample practice questions based on this topic.`;
          break;

        case 'readiness':
          contextBlock = `\nContext [PLACEMENT READINESS]:
- Readiness Score: ${ctx.readinessScore ?? 'N/A'}/100
- Weak Topics: ${ctx.weakTopics?.length ? ctx.weakTopics.join(', ') : 'None flagged yet'}
- Solved Questions: ${ctx.solvedQuestions ?? 'N/A'}
- Accuracy: ${ctx.accuracy ? ctx.accuracy + '%' : 'N/A'}
Guidance for Readiness Context:
- Focus on practical, high-impact strategies to bridge the student's identified weak areas and boost placement test readiness.`;
          break;

        case 'interview':
          contextBlock = `\nContext [INTERVIEW PREPARATION]:
- Target Role: ${ctx.interviewRole || 'Software Development Engineer'}
- Topic: ${ctx.interviewTopic || 'Technical Interview'}
Guidance for Interview Context:
- Offer realistic interview feedback, behavioral framing (STAR method), or technical interview tips.`;
          break;

        case 'personal_learning':
          if (ctx.documentId) {
            try {
              const { data: doc } = await supabase
                .from('personal_documents')
                .select('title, ai_summary')
                .eq('id', ctx.documentId)
                .eq('user_id', userId)
                .maybeSingle();

              if (doc) {
                contextBlock = `\nContext [USER STUDY MATERIAL]:
- Document Title: ${doc.title}
- Summary: ${doc.ai_summary || 'Uploaded document content'}`;
              }
            } catch {
              // Ignore
            }
          }
          break;

        default:
          break;
      }
    }

    // 5. System prompt + user query
    const promptText = `You are PLACE Assistant, a patient academic mentor and placement-preparation assistant for an engineering (B.Tech) student on the PLACE@ASET platform.
Your mission is to help students learn deeply, prepare for technical & aptitude placement drives, and master core computer science and engineering topics.

Guidelines:
1. Explain concepts step-by-step with technical clarity, structure, and calm encouragement.
2. Format code and technical snippets inside clean markdown code blocks with language tags.
3. For practice questions, encourage reasoning and give helpful hints rather than blindly spoiling solutions unless requested.
4. Ground your recommendations strictly in the verified student telemetry and context provided. Never invent fake platform statistics.
5. If the student asks for a study plan or practice advice, make it realistic and actionable.

${telemetryContext}
${contextBlock}

Student Question: "${payload.message}"`;

    // 6. Execute task via AIRouterService
    const aiResult = await AIRouterService.executeTask('study_assistant', promptText, {
      learningMode: userLearningMode,
    });

    // 7. Persist assistant response
    const asstMsgId = crypto.randomUUID();
    const asstNow = new Date().toISOString();
    const isOffline = aiResult.providerId === 'unavailable';
    const messageContent = isOffline
      ? `🤖 **PLACE AI Engine Currently Offline**\n\nNo live AI provider could be reached to process your request.\n\n### How to activate AI:\n- **Local / Free**: Launch [Ollama](https://ollama.com) on this machine (\`ollama run llama3\` or \`ollama serve\`).\n- **Cloud**: Set \`GEMINI_API_KEY\` or \`OPENAI_API_KEY\` in \`server/.env\`.\n\n*All practice questions, timed tests, spaced repetition, scoring, and weak-topic analysis continue to work normally without AI.*`
      : aiResult.text;

    const assistantMsg: MemoryMessage = {
      id: asstMsgId,
      chat_id: activeConvId,
      user_id: userId,
      sender: 'assistant',
      message: messageContent,
      metadata: {
        provider_used: aiResult.providerId,
        is_engine_offline: isOffline,
        tokens_used: aiResult.tokensUsed,
        latency_ms: aiResult.latencyMs,
        context_type: payload.context?.type || 'general',
      },
      created_at: asstNow,
    };

    try {
      await supabase.from('ai_mentor_messages').insert(assistantMsg);
      await supabase
        .from('ai_mentor_chats')
        .update({ updated_at: asstNow })
        .eq('id', activeConvId);
    } catch {
      const list = memoryMessages.get(activeConvId) || [];
      list.push(assistantMsg);
      memoryMessages.set(activeConvId, list);

      const conv = memoryConversations.get(activeConvId);
      if (conv) {
        conv.updated_at = asstNow;
      }
    }

    return {
      conversationId: activeConvId,
      message: assistantMsg,
    };
  }

  /**
   * Execute One-Click Quick Actions
   */
  static async executeQuickAction(
    userId: string,
    action: 'daily_plan' | 'weekly_review' | 'career_roadmap' | 'practice_recommendations' | 'interview_prep'
  ) {
    const supabase = getSupabase();
    let userLearningMode: 'personal' | 'institute' = 'institute';
    let targetContext = '';

    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('learning_mode, target_companies, daily_streak, department')
        .eq('id', userId)
        .maybeSingle();

      if (userProfile?.learning_mode === 'personal') {
        userLearningMode = 'personal';
      }
      if (userProfile?.target_companies?.length) {
        targetContext = ` Target companies: ${userProfile.target_companies.join(', ')}.`;
      }
    } catch (e) {
      // Resilience
    }

    let promptText = '';
    switch (action) {
      case 'daily_plan':
        promptText = `Create a realistic, structured daily study schedule for Data Structures, Algorithms, and Core Placement Aptitude today.${targetContext}`;
        break;
      case 'weekly_review':
        promptText = `Provide a weekly placement readiness checklist and recommended focus areas for technical and aptitude tests.${targetContext}`;
        break;
      case 'career_roadmap':
        promptText = `Outline a structured semester-by-semester placement preparation roadmap for campus recruitment drives.${targetContext}`;
        break;
      case 'practice_recommendations':
        promptText = `Recommend 5 high-frequency technical interview and aptitude problem archetypes commonly asked by recruiters.${targetContext}`;
        break;
      case 'interview_prep':
        promptText = `Give me 5 essential technical interview questions with concise conceptual answers for campus placement prep.${targetContext}`;
        break;
    }

    const aiResult = await AIRouterService.executeTask('study_assistant', promptText, {
      learningMode: userLearningMode,
    });

    return {
      action,
      response: aiResult.text,
      provider: aiResult.providerId,
    };
  }
}
