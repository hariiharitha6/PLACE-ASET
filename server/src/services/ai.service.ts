import { getSupabase } from '../config/database';
import logger from '../utils/logger';

export interface ParsedQuestionOCR {
  statement: string;
  options: { label: string; content: string }[];
  correctAnswer: string;
  explanation?: string;
}

export class AIService {
  /**
   * Tokenizes a text string into a set of normalized words.
   */
  private static tokenize(text: string): Set<string> {
    const stopWords = new Set([
      'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
      'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
      'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
      'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres',
      'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into',
      'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
      'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
      'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that',
      'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd',
      'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
      'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres',
      'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd',
      'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/);

    return new Set(words.filter(w => w.length > 1 && !stopWords.has(w)));
  }

  /**
   * Calculates the Jaccard similarity coefficient between two sets.
   */
  private static calculateJaccard(setA: Set<string>, setB: Set<string>): number {
    if (setA.size === 0 || setB.size === 0) return 0;
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
  }

  /**
   * Scans the database for duplicate questions based on statement similarity.
   */
  static async detectDuplicates(statement: string, collegeId: string, threshold = 0.7) {
    const supabase = getSupabase();
    
    // Fetch all active, approved questions for the college to compare
    const { data: questions } = await supabase
      .from('questions')
      .select('id, statement, type, difficulty')
      .eq('college_id', collegeId)
      .eq('approval_status', 'approved')
      .eq('is_archived', false);

    if (!questions || questions.length === 0) {
      return [];
    }

    const inputTokens = this.tokenize(statement);
    const duplicates: any[] = [];

    for (const q of questions) {
      const qTokens = this.tokenize(q.statement);
      const similarity = this.calculateJaccard(inputTokens, qTokens);

      if (similarity >= threshold) {
        duplicates.push({
          question: q,
          similarity: Math.round(similarity * 100) / 100
        });
      }
    }

    // Sort by highest similarity first
    return duplicates.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Get or create learning profile.
   */
  static async getOrCreateLearningProfile(userId: string) {
    const supabase = getSupabase();
    
    const { data: profile, error } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      logger.error('Failed to get learning profile', { userId, error: error.message });
      throw error;
    }

    if (profile) {
      return profile;
    }

    // Create a default learning profile
    const defaultProfile = {
      user_id: userId,
      mastery_score: 10,
      weak_topics: [],
      strong_topics: [],
      learning_velocity: 1.0,
      practice_frequency: 0.0,
      average_response_time: 0.0,
      preferred_difficulty: 'medium',
      preferred_companies: [],
      preferred_departments: []
    };

    const { data: newProfile, error: createError } = await supabase
      .from('learning_profiles')
      .insert(defaultProfile)
      .select()
      .single();

    if (createError) {
      logger.error('Failed to create default learning profile', { userId, error: createError.message });
      throw createError;
    }

    return newProfile;
  }

  /**
   * Computes the learning profile metrics based on the user's practice history.
   */
  static async computeLearningProfile(userId: string) {
    const supabase = getSupabase();
    const startTime = Date.now();

    // 1. Fetch practice sessions for user
    const { data: sessions, error: sessionsError } = await supabase
      .from('practice_sessions')
      .select('id, started_at')
      .eq('user_id', userId);

    if (sessionsError) {
      logger.error('Error fetching practice sessions for profile', { userId, error: sessionsError.message });
      throw sessionsError;
    }

    const sessionIds = (sessions || []).map(s => s.id);

    let weakTopics: string[] = [];
    let strongTopics: string[] = [];
    let averageResponseTime = 0;
    let practiceFrequency = 0;
    let learningVelocity = 1.0;
    let masteryScore = 10;
    let preferredDifficulty = 'medium';

    if (sessionIds.length > 0) {
      // 2. Fetch answers with question details
      const { data: answers, error: answersError } = await supabase
        .from('practice_answers')
        .select('*, questions(*, categories(*))')
        .in('session_id', sessionIds);

      if (answersError) {
        logger.error('Error fetching practice answers for profile', { userId, error: answersError.message });
        throw answersError;
      }

      if (answers && answers.length > 0) {
        // Group by category name
        const categoriesMap: Record<string, { attempted: number; correct: number; totalTime: number }> = {};
        const difficultiesMap: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
        let totalCorrect = 0;
        let totalResponseTime = 0;

        for (const ans of answers) {
          const q = ans.questions;
          if (!q) continue;

          const catName = q.categories?.name || 'General';
          if (!categoriesMap[catName]) {
            categoriesMap[catName] = { attempted: 0, correct: 0, totalTime: 0 };
          }

          categoriesMap[catName].attempted += 1;
          if (ans.is_correct) {
            categoriesMap[catName].correct += 1;
            totalCorrect += 1;
          }
          categoriesMap[catName].totalTime += ans.time_spent_seconds || 0;
          totalResponseTime += ans.time_spent_seconds || 0;

          if (q.difficulty) {
            difficultiesMap[q.difficulty] = (difficultiesMap[q.difficulty] || 0) + 1;
          }
        }

        averageResponseTime = Math.round((totalResponseTime / answers.length) * 10) / 10;

        // Find weak and strong topics
        for (const [cat, stats] of Object.entries(categoriesMap)) {
          if (stats.attempted >= 3) {
            const accuracy = stats.correct / stats.attempted;
            if (accuracy < 0.6) {
              weakTopics.push(cat);
            } else if (accuracy >= 0.8) {
              strongTopics.push(cat);
            }
          }
        }

        // Calculate mastery score (out of 100)
        const overallAccuracy = totalCorrect / answers.length;
        masteryScore = Math.min(100, Math.max(10, Math.round(overallAccuracy * 100)));

        // Preferred difficulty is the one user attempts most
        preferredDifficulty = Object.entries(difficultiesMap).reduce(
          (a, b) => (b[1] > a[1] ? b : a),
          ['medium', 0]
        )[0];

        // Practice frequency (active days in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const uniqueDays = new Set(
          sessions
            .filter(s => new Date(s.started_at) >= thirtyDaysAgo)
            .map(s => new Date(s.started_at).toDateString())
        );
        practiceFrequency = uniqueDays.size;

        // Learning velocity (questions solved per day in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentAnswers = answers.filter(a => new Date(a.created_at) >= sevenDaysAgo);
        learningVelocity = Math.round((recentAnswers.length / 7) * 10) / 10;
      }
    }

    // 3. Update learning profile
    const profileData = {
      mastery_score: masteryScore,
      weak_topics: weakTopics,
      strong_topics: strongTopics,
      learning_velocity: learningVelocity,
      practice_frequency: practiceFrequency,
      average_response_time: averageResponseTime,
      preferred_difficulty: preferredDifficulty,
      updated_at: new Date().toISOString()
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from('learning_profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update learning profile metrics', { userId, error: updateError.message });
      throw updateError;
    }

    // Log prediction metrics
    const latencyMs = Date.now() - startTime;
    await supabase.from('prediction_logs').insert({
      user_id: userId,
      task_type: 'compute_learning_profile',
      input_data: { sessionCount: sessionIds.length },
      output_data: profileData,
      latency_ms: latencyMs
    });

    return updatedProfile;
  }

  /**
   * Generates AI recommendations for the user and stores them.
   */
  static async getRecommendations(userId: string) {
    const supabase = getSupabase();
    
    // 1. Fetch user profile
    const profile = await this.getOrCreateLearningProfile(userId);
    const weakTopics: string[] = profile.weak_topics || [];
    
    // 2. Fetch questions user has already answered to exclude them
    const { data: sessions } = await supabase
      .from('practice_sessions')
      .select('id')
      .eq('user_id', userId);
    
    const sessionIds = (sessions || []).map(s => s.id);
    let answeredQIds: string[] = [];

    if (sessionIds.length > 0) {
      const { data: answers } = await supabase
        .from('practice_answers')
        .select('question_id')
        .in('session_id', sessionIds);
      answeredQIds = (answers || []).map(a => a.question_id);
    }

    // 3. Find target candidate questions to recommend
    let query = supabase
      .from('questions')
      .select('*, categories(name)')
      .eq('approval_status', 'approved')
      .eq('is_archived', false);

    if (answeredQIds.length > 0) {
      query = query.not('id', 'in', `(${answeredQIds.join(',')})`);
    }

    const { data: candidates } = await query.limit(20);

    const recommendationsToInsert: any[] = [];
    
    if (candidates && candidates.length > 0) {
      for (const q of candidates) {
        const categoryName = q.categories?.name || '';
        const isWeak = weakTopics.includes(categoryName);
        const matchesDiff = q.difficulty === profile.preferred_difficulty;
        
        let confidenceScore = 0.5;
        let reason = `Recommended practice question to build foundational skills in ${categoryName || 'Aptitude'}.`;

        if (isWeak) {
          confidenceScore += 0.3;
          reason = `Improve your weak topic: our analysis shows you need practice in ${categoryName}.`;
        }
        if (matchesDiff) {
          confidenceScore += 0.1;
        }

        recommendationsToInsert.push({
          user_id: userId,
          item_type: 'question',
          item_id: q.id,
          reason,
          confidence_score: Math.round(confidenceScore * 100) / 100,
          is_viewed: false
        });
      }
    }

    // Recommend resources
    const { data: resources } = await supabase
      .from('resources')
      .select('*, categories(name)')
      .eq('is_active', true)
      .limit(5);

    if (resources && resources.length > 0) {
      for (const r of resources) {
        const catName = r.categories?.name || '';
        const isWeak = weakTopics.includes(catName);
        let confidenceScore = 0.6;
        let reason = `Study resource for ${catName || 'general preparation'}.`;

        if (isWeak) {
          confidenceScore += 0.25;
          reason = `Recommended reading material to boost accuracy in your weak area: ${catName}.`;
        }

        recommendationsToInsert.push({
          user_id: userId,
          item_type: 'resource',
          item_id: r.id,
          reason,
          confidence_score: confidenceScore,
          is_viewed: false
        });
      }
    }

    // Filter and save top recommendations
    if (recommendationsToInsert.length > 0) {
      // Sort by confidence
      recommendationsToInsert.sort((a, b) => b.confidence_score - a.confidence_score);
      const topRecs = recommendationsToInsert.slice(0, 8);

      // Insert recommendations
      await supabase.from('ai_recommendations').insert(topRecs);
    }

    // Retrieve active recommendations
    const { data: activeRecs } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return activeRecs || [];
  }

  /**
   * Log action on recommendation.
   */
  static async recordRecommendationAction(userId: string, recId: string, action: 'click' | 'ignore' | 'complete') {
    const supabase = getSupabase();
    
    // 1. Mark as viewed
    await supabase
      .from('ai_recommendations')
      .update({ is_viewed: true })
      .eq('id', recId);

    // 2. Add history entry
    const { data: history, error } = await supabase
      .from('recommendation_history')
      .insert({
        user_id: userId,
        recommendation_id: recId,
        action
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to log recommendation history', { error: error.message });
      throw error;
    }

    return history;
  }

  /**
   * Gets personalized study path.
   */
  static async getPersonalizedStudyPath(userId: string) {
    const supabase = getSupabase();
    const profile = await this.getOrCreateLearningProfile(userId);
    const weakTopics: string[] = profile.weak_topics || [];

    if (weakTopics.length === 0) {
      return {
        message: 'Great job! You do not have any flagged weak topics yet. Keep practicing to maintain high accuracy.',
        path: []
      };
    }

    const path: any[] = [];

    // For each weak topic, recommend target questions to build mastery
    for (let i = 0; i < weakTopics.length; i++) {
      const topic = weakTopics[i];

      // Fetch category ID by name
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('name', topic)
        .maybeSingle();

      if (!cat) continue;

      // Select 3 target questions for this topic: 1 Easy, 1 Medium, 1 Hard
      const targetQuestions: any[] = [];
      const difficulties = ['easy', 'medium', 'hard'];

      for (const diff of difficulties) {
        const { data: q } = await supabase
          .from('questions')
          .select('id, statement, difficulty, type')
          .eq('category_id', cat.id)
          .eq('difficulty', diff)
          .eq('approval_status', 'approved')
          .eq('is_archived', false)
          .limit(1)
          .maybeSingle();
        
        if (q) {
          targetQuestions.push(q);
        }
      }

      path.push({
        step: i + 1,
        topic,
        categoryId: cat.id,
        targetQuestions,
        relevance: `Ranked #${i + 1} weak area. High impact target milestone.`
      });
    }

    return {
      message: 'Here is your structured learning path to target and master your weak areas.',
      path
    };
  }

  /**
   * Generates mock 384-dimensional vector embedding for a question.
   */
  static async generateEmbeddings(questionId: string) {
    const supabase = getSupabase();

    const { data: question } = await supabase
      .from('questions')
      .select('statement, difficulty')
      .eq('id', questionId)
      .single();

    if (!question) {
      throw new Error('Question not found for embedding generation');
    }

    const text = question.statement || '';
    
    // Deterministic embedding vector generator based on text hashes
    const vector: number[] = Array.from({ length: 384 }, (_, idx) => {
      if (text.length === 0) return 0;
      const charCode = text.charCodeAt(idx % text.length) || 0;
      return Math.sin(charCode + idx + (question.difficulty === 'hard' ? 1.5 : 0.5));
    });

    // Normalize vector to unit length
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    const normalizedVector = magnitude > 0 ? vector.map(v => v / magnitude) : vector;

    // Save to database
    const { data: embedding, error } = await supabase
      .from('question_embeddings')
      .upsert({
        question_id: questionId,
        embedding_vector: normalizedVector
      }, { onConflict: 'question_id' })
      .select()
      .single();

    if (error) {
      logger.error('Failed to save question embeddings', { error: error.message });
      throw error;
    }

    return embedding;
  }

  /**
   * Finds similar questions using cosine similarity on embeddings.
   */
  static async getSimilarQuestions(questionId: string, limit = 5) {
    const supabase = getSupabase();

    // 1. Fetch current question embedding
    const { data: currentEmb } = await supabase
      .from('question_embeddings')
      .select('embedding_vector')
      .eq('question_id', questionId)
      .maybeSingle();

    if (!currentEmb || !currentEmb.embedding_vector) {
      // Fallback: Jaccard similarity using text
      const { data: currentQ } = await supabase.from('questions').select('statement, college_id').eq('id', questionId).single();
      if (!currentQ) throw new Error('Question not found');
      return this.detectDuplicates(currentQ.statement, currentQ.college_id, 0.3);
    }

    const currentVector = currentEmb.embedding_vector;

    // 2. Fetch all other question embeddings
    const { data: allEmbs } = await supabase
      .from('question_embeddings')
      .select('question_id, embedding_vector')
      .neq('question_id', questionId);

    if (!allEmbs || allEmbs.length === 0) {
      return [];
    }

    const matches: any[] = [];

    // Helper: Compute cosine similarity
    const cosineSimilarity = (vecA: number[], vecB: number[]) => {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
      }
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    for (const emb of allEmbs) {
      if (!emb.embedding_vector || emb.embedding_vector.length !== currentVector.length) continue;
      const sim = cosineSimilarity(currentVector, emb.embedding_vector);

      // Fetch question details for matches
      const { data: q } = await supabase
        .from('questions')
        .select('id, statement, type, difficulty')
        .eq('id', emb.question_id)
        .maybeSingle();

      if (q) {
        matches.push({
          question: q,
          similarity: Math.round(sim * 100) / 100
        });
      }
    }

    // Sort descending by similarity
    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}
