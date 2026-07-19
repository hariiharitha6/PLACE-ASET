import { getSupabase } from '../config/database';

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
}
