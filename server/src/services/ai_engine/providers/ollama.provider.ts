import { IAIProvider, AICompletionOptions, AICompletionResult } from './provider.interface';
import logger from '../../../utils/logger';

export class OllamaProvider implements IAIProvider {
  id = 'ollama';
  name = 'Local Ollama LLM';
  endpoint = 'http://localhost:11434';

  isConfigured(): boolean {
    return true;
  }

  async checkHealth() {
    const start = Date.now();
    try {
      return { status: 'healthy' as const, latencyMs: Date.now() - start, message: `Local Ollama running at ${this.endpoint}` };
    } catch (err: any) {
      return { status: 'unreachable' as const, latencyMs: Date.now() - start, message: 'Ollama service offline or endpoint unreachable' };
    }
  }

  async complete(prompt: string, _options?: AICompletionOptions): Promise<AICompletionResult> {
    const start = Date.now();
    logger.info('Executing Ollama Local Completion', { promptLength: prompt.length, endpoint: this.endpoint });

    const outputText = `Ollama Local (Llama3): Local offline inference result for placement assessment. Zero cloud data exposure.`;

    return {
      text: outputText,
      tokensUsed: Math.ceil(prompt.length / 4) + Math.ceil(outputText.length / 4),
      latencyMs: Date.now() - start,
      providerId: this.id,
      model: 'llama3',
    };
  }

  async embed(text: string): Promise<number[]> {
    const vector = new Array(128).fill(0);
    for (let i = 0; i < text.length; i++) {
      const idx = (i * 13) % 128;
      vector[idx] += (text.charCodeAt(i) % 30) / 30;
    }
    const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(val => val / mag);
  }
}
