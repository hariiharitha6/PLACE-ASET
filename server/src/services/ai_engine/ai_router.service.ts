import { IAIProvider, AICompletionOptions, AICompletionResult } from './providers/provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { AzureProvider } from './providers/azure.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { getSupabase } from '../../config/database';
import logger from '../../utils/logger';
import crypto from 'crypto';

export class AIRouterService {
  private static providers: Map<string, IAIProvider> = new Map<string, IAIProvider>([
    ['gemini', new GeminiProvider()],
    ['openai', new OpenAIProvider()],
    ['ollama', new OllamaProvider()],
    ['azure', new AzureProvider()],
    ['anthropic', new AnthropicProvider()],
  ]);

  private static taskRouting: Record<string, { primary: string; fallback: string }> = {
    ocr: { primary: 'gemini', fallback: 'openai' },
    categorization: { primary: 'gemini', fallback: 'openai' },
    explanation: { primary: 'openai', fallback: 'gemini' },
    question_gen: { primary: 'openai', fallback: 'gemini' },
    duplicate_detection: { primary: 'gemini', fallback: 'openai' },
    resume_analysis: { primary: 'openai', fallback: 'gemini' },
    interview_feedback: { primary: 'openai', fallback: 'gemini' },
  };

  /**
   * Get all registered providers and health status
   */
  static async getProvidersStatus() {
    const list = [];
    for (const [id, provider] of this.providers.entries()) {
      const health = await provider.checkHealth();
      list.push({
        id,
        name: provider.name,
        isConfigured: provider.isConfigured(),
        status: health.status,
        latencyMs: health.latencyMs,
        message: health.message,
      });
    }
    return list;
  }

  /**
   * Update task routing assignment
   */
  static setTaskRouting(taskType: string, primaryProviderId: string, fallbackProviderId: string) {
    this.taskRouting[taskType] = { primary: primaryProviderId, fallback: fallbackProviderId };
    logger.info('Updated AI Task Routing', { taskType, primaryProviderId, fallbackProviderId });
  }

  /**
   * Get current task routing setup
   */
  static getTaskRouting() {
    return this.taskRouting;
  }

  /**
   * Execute completion with Fallback System and Caching
   */
  static async executeTask(taskType: string, prompt: string, options?: AICompletionOptions): Promise<AICompletionResult> {
    // 1. Check AI Cache
    const promptHash = crypto.createHash('sha256').update(`${taskType}:${prompt}`).digest('hex');
    const cachedResponse = await this.getCachedResponse(promptHash);
    if (cachedResponse) {
      logger.info('AI Response served from Cache', { taskType, promptHash });
      return cachedResponse;
    }

    const route = this.taskRouting[taskType] || { primary: 'gemini', fallback: 'openai' };
    const primaryProvider = this.providers.get(route.primary) || this.providers.get('gemini')!;
    const fallbackProvider = this.providers.get(route.fallback) || this.providers.get('ollama')!;

    // 2. Try Primary Provider
    try {
      const result = await primaryProvider.complete(prompt, options);
      await this.saveCache(promptHash, taskType, result);
      await this.logUsage(taskType, result);
      return result;
    } catch (primaryErr: any) {
      logger.warn(`Primary AI Provider (${primaryProvider.id}) failed. Triggering Fallback (${fallbackProvider.id})`, {
        error: primaryErr.message,
      });

      // 3. Try Fallback Provider
      try {
        const result = await fallbackProvider.complete(prompt, options);
        await this.saveCache(promptHash, taskType, result);
        await this.logUsage(taskType, result);
        return result;
      } catch (fallbackErr: any) {
        logger.error(`Fallback AI Provider (${fallbackErr}) failed. Queueing task for retry.`);
        const ollamaProvider = this.providers.get('ollama')!;
        const result = await ollamaProvider.complete(prompt, options);
        await this.saveCache(promptHash, taskType, result);
        await this.logUsage(taskType, result);
        return result;
      }
    }
  }

  private static async getCachedResponse(promptHash: string): Promise<AICompletionResult | null> {
    try {
      const supabase = getSupabase();
      const { data } = await supabase.from('ai_cache').select('response_json, provider_id').eq('prompt_hash', promptHash).maybeSingle();
      if (data && data.response_json) {
        return {
          text: typeof data.response_json === 'string' ? data.response_json : JSON.stringify(data.response_json),
          tokensUsed: 0,
          latencyMs: 1,
          providerId: data.provider_id || 'cache',
          model: 'cached',
        };
      }
    } catch (err) {
      // Ignore cache lookup errors
    }
    return null;
  }

  private static async saveCache(promptHash: string, taskType: string, result: AICompletionResult) {
    try {
      const supabase = getSupabase();
      await supabase.from('ai_cache').upsert({
        prompt_hash: promptHash,
        task_type: taskType,
        response_json: result.text,
        provider_id: result.providerId,
        last_accessed: new Date().toISOString(),
      }, { onConflict: 'prompt_hash' });
    } catch (err) {
      // Cache saving error ignored
    }
  }

  private static async logUsage(taskType: string, result: AICompletionResult) {
    try {
      const supabase = getSupabase();
      await supabase.from('ai_job_logs').insert({
        prompt: taskType,
        response: result.text.substring(0, 500),
        tokens_used: result.tokensUsed,
        latency_ms: result.latencyMs,
        estimated_cost_usd: (result.tokensUsed * 0.000002).toFixed(6),
        provider_id: result.providerId,
        status: 'success',
      });
    } catch (err) {
      // Ignore log error
    }
  }
}
