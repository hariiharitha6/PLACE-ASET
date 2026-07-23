import { getSupabase } from '../../config/database';

export class EmbeddingService {
  static calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const minLen = Math.min(vecA.length, vecB.length);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < minLen; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  static generateEmbedding(text: string): number[] {
    const vector = new Array(128).fill(0);
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
    const words = cleanText.split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const idx = (j + i * 3) % 128;
        vector[idx] += (word.charCodeAt(j) % 100) / 100;
      }
    }

    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(v => Math.round((v / norm) * 10000) / 10000);
  }

  static async findSemanticDuplicates(statement: string, collegeId?: string, threshold = 0.75) {
    const targetVector = this.generateEmbedding(statement);
    const supabase = getSupabase();

    let query = supabase.from('questions').select('id, statement, subject, topic, difficulty');
    if (collegeId) query = query.eq('college_id', collegeId);

    const { data: questions } = await query;
    if (!questions || questions.length === 0) return [];

    const results = [];
    for (const q of questions) {
      const qVector = this.generateEmbedding(q.statement);
      const similarity = this.calculateCosineSimilarity(targetVector, qVector);

      if (similarity >= threshold) {
        results.push({
          question: q,
          similarityPct: Math.round(similarity * 100),
          matchType: similarity > 0.95 ? 'Exact Duplicate' : similarity > 0.85 ? 'Near Duplicate' : 'Semantic Duplicate',
        });
      }
    }

    return results.sort((a, b) => b.similarityPct - a.similarityPct);
  }
}
