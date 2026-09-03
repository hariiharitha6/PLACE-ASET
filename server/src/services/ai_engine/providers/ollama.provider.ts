import { IAIProvider, AICompletionOptions, AICompletionResult } from './provider.interface';
import logger from '../../../utils/logger';

export class OllamaProvider implements IAIProvider {
  id = 'ollama';
  name = 'Local Ollama LLM';

  private getBaseUrl(): string {
    return (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '');
  }

  private getModel(): string {
    return process.env.OLLAMA_MODEL || 'llama3';
  }

  isConfigured(): boolean {
    return true;
  }

  async checkHealth() {
    const start = Date.now();
    const baseUrl = this.getBaseUrl();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        const models = (data.models || []).map((m: any) => m.name || m.model);
        const latency = Date.now() - start;
        return {
          status: 'healthy' as const,
          latencyMs: latency,
          message: `Local Ollama active at ${baseUrl}. Models available: ${models.length > 0 ? models.slice(0, 3).join(', ') : this.getModel()}`,
        };
      }

      return {
        status: 'unreachable' as const,
        latencyMs: Date.now() - start,
        message: `Ollama returned HTTP ${res.status} at ${baseUrl}. Ensure model '${this.getModel()}' is pulled with 'ollama pull ${this.getModel()}'.`,
      };
    } catch (err: any) {
      return {
        status: 'unreachable' as const,
        latencyMs: Date.now() - start,
        message: `Local Ollama service offline at ${baseUrl}. To run offline AI without API keys: install Ollama from https://ollama.com and run 'ollama run ${this.getModel()}'.`,
      };
    }
  }

  async complete(prompt: string, options?: AICompletionOptions): Promise<AICompletionResult> {
    const start = Date.now();
    const baseUrl = this.getBaseUrl();
    const model = (options as any)?.model || this.getModel();

    logger.info('Executing Ollama Local HTTP Completion', {
      promptLength: prompt.length,
      endpoint: baseUrl,
      model,
    });

    try {
      const controller = new AbortController();
      const timeoutMs = options?.timeoutMs || 45000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 1024,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama HTTP ${response.status}: ${errText || response.statusText}`);
      }

      const data: any = await response.json();
      const outputText = data.response || '';
      const promptTokens = data.prompt_eval_count || Math.ceil(prompt.length / 4);
      const evalTokens = data.eval_count || Math.ceil(outputText.length / 4);
      const latencyMs = data.total_duration ? Math.round(data.total_duration / 1e6) : Date.now() - start;

      return {
        text: outputText,
        tokensUsed: promptTokens + evalTokens,
        latencyMs,
        providerId: this.id,
        model: model,
      };
    } catch (err: any) {
      logger.warn('Ollama completion call failed', { error: err.message, endpoint: baseUrl });
      throw new Error(`Ollama connection error: ${err.message}. Ensure Ollama is running at ${baseUrl}.`);
    }
  }

  async embed(text: string): Promise<number[]> {
    const baseUrl = this.getBaseUrl();
    const model = this.getModel();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: text,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        if (Array.isArray(data.embedding) && data.embedding.length > 0) {
          const raw = data.embedding;
          const mag = Math.sqrt(raw.reduce((sum: number, v: number) => sum + v * v, 0)) || 1;
          return raw.map((v: number) => v / mag);
        }
      }
    } catch (err) {
      // Fall through to deterministic high-dimension token vector calculation
    }

    // High-dimension deterministic fallback embedding
    const vector = new Array(128).fill(0);
    const clean = text.toLowerCase().replace(/[^\w\s]/g, '');
    const words = clean.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const idx = (j + i * 3) % 128;
        vector[idx] += (word.charCodeAt(j) % 100) / 100;
      }
    }
    const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(val => val / mag);
  }
}
