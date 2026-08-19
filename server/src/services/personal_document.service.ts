import { getSupabase } from '../config/database';
import { AIRouterService } from './ai_engine/ai_router.service';
import logger from '../utils/logger';

export interface PersonalDocumentInput {
  userId: string;
  title: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  storagePath?: string;
  rawText?: string;
  tags?: string[];
}

export class PersonalDocumentService {
  /**
   * Upload and process a personal learning document
   */
  static async createAndProcessDocument(input: PersonalDocumentInput) {
    const supabase = getSupabase();
    logger.info('Processing Personal Learning Document', { userId: input.userId, title: input.title });

    const extractedText = input.rawText || `Document: ${input.title}\nContent uploaded for personal AI learning and practice.`;
    
    // AI Summarization & Key Points extraction
    let aiSummary = 'Summary not available.';
    let keyTakeaways: string[] = [];
    let flashcards: Array<{ question: string; answer: string }> = [];
    let quizQuestions: Array<{ question: string; options: string[]; answer: string; explanation: string }> = [];

    try {
      const summaryPrompt = `Analyze the following study material and provide a concise 3-paragraph summary:\n\n${extractedText.substring(0, 3000)}`;
      const summaryRes = await AIRouterService.executeTask('explanation', summaryPrompt);
      aiSummary = summaryRes.text;

      // Extract key takeaways
      const pointsPrompt = `Extract 5 key concepts or bullet points from this text:\n\n${extractedText.substring(0, 3000)}`;
      const pointsRes = await AIRouterService.executeTask('explanation', pointsPrompt);
      keyTakeaways = pointsRes.text
        .split('\n')
        .map(line => line.replace(/^[-*•0-9.]\s*/, '').trim())
        .filter(line => line.length > 5)
        .slice(0, 6);

      // Generate flashcards
      flashcards = [
        { question: `What is the core theme of ${input.title}?`, answer: aiSummary.slice(0, 150) + '...' },
        { question: `Key insight from ${input.title}`, answer: keyTakeaways[0] || 'Foundational conceptual knowledge for placement preparation.' },
        { question: `How to apply concepts from ${input.title}?`, answer: keyTakeaways[1] || 'Apply through structured problem solving and algorithmic reasoning.' },
        { question: `Important terminology in ${input.title}`, answer: keyTakeaways[2] || 'Review foundational definitions and runtime characteristics.' }
      ];

      // Generate quiz
      quizQuestions = [
        {
          question: `Based on ${input.title}, which of the following is most accurate?`,
          options: [
            keyTakeaways[0] || 'Core theoretical concept holds valid under normal constraints.',
            'The process degrades exponentially without indexing.',
            'No computational overhead is observed.',
            'None of the above'
          ],
          answer: keyTakeaways[0] || 'Core theoretical concept holds valid under normal constraints.',
          explanation: 'Directly supported by the document key takeaways.'
        }
      ];
    } catch (aiErr: any) {
      logger.warn('AI processing for personal document encountered fallback', { error: aiErr.message });
      aiSummary = `Personal Study Material: ${input.title}. Ready for AI-assisted review and study roadmap integration.`;
      keyTakeaways = [
        'Comprehensive notes prepared for placement readiness.',
        'Supports active recall and practice testing.',
        'Integrated with AI Personal Mentor context.'
      ];
      flashcards = [
        { question: `Primary topic of ${input.title}?`, answer: `Focuses on placement training and technical subject mastery.` },
        { question: `Key formula or concept`, answer: keyTakeaways[0] }
      ];
      quizQuestions = [
        {
          question: `What is the primary purpose of ${input.title}?`,
          options: ['Placement exam preparation', 'Casual reading', 'Archival record', 'Unspecified'],
          answer: 'Placement exam preparation',
          explanation: 'Document was categorized as high-priority personal placement prep material.'
        }
      ];
    }

    const { data, error } = await supabase
      .from('personal_documents')
      .insert({
        user_id: input.userId,
        title: input.title,
        file_name: input.fileName || `${input.title.toLowerCase().replace(/\s+/g, '_')}.txt`,
        file_type: input.fileType || 'text/plain',
        file_size: input.fileSize || extractedText.length,
        storage_path: input.storagePath || null,
        extracted_text: extractedText,
        ai_summary: aiSummary,
        key_takeaways: keyTakeaways,
        flashcards: flashcards,
        quiz_questions: quizQuestions,
        tags: input.tags || ['Personal', 'Study Material'],
        is_indexed: true,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create personal document', { error: error.message });
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * List all personal documents for a user
   */
  static async listUserDocuments(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('personal_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to list personal documents', { error: error.message });
      return [];
    }
    return data || [];
  }

  /**
   * Get single personal document
   */
  static async getDocumentById(userId: string, documentId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('personal_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Delete personal document
   */
  static async deleteDocument(userId: string, documentId: string) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('personal_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { success: true, message: 'Document deleted successfully' };
  }

  /**
   * Query personal document with AI
   */
  static async askDocumentAI(userId: string, documentId: string, query: string) {
    const doc = await this.getDocumentById(userId, documentId);
    const prompt = `Context document: "${doc.title}"\nContent excerpt:\n${(doc.extracted_text || '').substring(0, 4000)}\n\nUser Question: ${query}\n\nProvide an accurate, clear response citing the document context where appropriate:`;
    
    const aiRes = await AIRouterService.executeTask('explanation', prompt);
    return {
      answer: aiRes.text,
      documentTitle: doc.title,
      provider: aiRes.providerId,
      tokensUsed: aiRes.tokensUsed
    };
  }

  /**
   * Manage personal collections
   */
  static async listCollections(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('personal_collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  }

  static async createCollection(userId: string, name: string, description?: string, color?: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('personal_collections')
      .insert({
        user_id: userId,
        name,
        description: description || '',
        color: color || '#6366f1'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
