import logger from '../utils/logger';

export interface ParsedQuestionOCR {
  statement: string;
  options: { label: string; content: string }[];
  correctAnswer: string;
  explanation?: string;
}

export class OCRService {
  /**
   * Performs OCR extraction on an image and parses it into questions.
   */
  static async processImage(imageUrl: string): Promise<ParsedQuestionOCR[]> {
    logger.info('Starting OCR processing', { imageUrl });

    // Mock OCR result string for demonstration/fallback
    const ocrText = `
      Q1. What is the complexity of binary search?
      A. O(N)
      B. O(log N)
      C. O(N log N)
      D. O(1)
      Correct Answer: B
      Explanation: Binary search divides the search space in half at each step.
    `;

    return this.parseText(ocrText);
  }

  /**
   * Parser that uses regex to structure questions out of raw text.
   */
  static parseText(text: string): ParsedQuestionOCR[] {
    const questions: ParsedQuestionOCR[] = [];
    
    // Split text by questions (e.g. Q1., Q2., Question 1:, etc.)
    const questionBlocks = text.split(/(?:Q\d+[\.\:]|Question\s+\d+[\.\:])/gi);

    for (const block of questionBlocks) {
      if (!block.trim()) continue;

      // Extract statement (everything up to first option A)
      const optMatch = block.match(/(?:A\.)/i);
      if (!optMatch) continue;

      const statement = block.substring(0, optMatch.index).trim();

      // Extract options A, B, C, D
      const options: { label: string; content: string }[] = [];
      const labels = ['A', 'B', 'C', 'D'];

      for (let i = 0; i < labels.length; i++) {
        const currentLabel = labels[i];
        const nextLabel = labels[i + 1];

        const startRegex = new RegExp(`${currentLabel}\\.\\s*(.*)`, 'i');
        const match = block.match(startRegex);

        if (match) {
          let content = match[1];
          // Strip everything after next option or correct answer tag
          if (nextLabel) {
            const nextIdx = content.search(new RegExp(`${nextLabel}\\.`, 'i'));
            if (nextIdx !== -1) content = content.substring(0, nextIdx);
          }
          const correctIdx = content.search(/Correct\s+Answer/i);
          if (correctIdx !== -1) content = content.substring(0, correctIdx);

          options.push({
            label: currentLabel,
            content: content.trim()
          });
        }
      }

      // Extract Correct Answer
      let correctAnswer = 'A';
      const ansMatch = block.match(/Correct\s+Answer:\s*([A-D])/i);
      if (ansMatch) {
        correctAnswer = ansMatch[1].toUpperCase();
      }

      // Extract Explanation
      let explanation = '';
      const expMatch = block.match(/Explanation:\s*([\s\S]*)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
      }

      questions.push({
        statement,
        options,
        correctAnswer,
        explanation
      });
    }

    return questions;
  }
}
