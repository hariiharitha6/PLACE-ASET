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
    ['ollama', new OllamaProvider()],
    ['gemini', new GeminiProvider()],
    ['openai', new OpenAIProvider()],
    ['azure', new AzureProvider()],
    ['anthropic', new AnthropicProvider()],
  ]);

  private static taskRouting: Record<string, { primary: string; fallback: string }> = {
    summarization: { primary: 'ollama', fallback: 'gemini' },
    explanation: { primary: 'ollama', fallback: 'openai' },
    flashcards: { primary: 'ollama', fallback: 'gemini' },
    question_gen: { primary: 'ollama', fallback: 'openai' },
    classification: { primary: 'ollama', fallback: 'gemini' },
    categorization: { primary: 'ollama', fallback: 'gemini' },
    duplicate_detection: { primary: 'ollama', fallback: 'gemini' },
    study_assistant: { primary: 'ollama', fallback: 'openai' },
    personal_learning: { primary: 'ollama', fallback: 'gemini' },
    ocr: { primary: 'ollama', fallback: 'gemini' },
    resume_analysis: { primary: 'ollama', fallback: 'gemini' },
    interview_feedback: { primary: 'ollama', fallback: 'gemini' },
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
   * Execute completion with intelligent fallback system and caching
   */
  static async executeTask(taskType: string, prompt: string, options?: AICompletionOptions): Promise<AICompletionResult> {
    // 1. Check AI Cache
    const promptHash = crypto.createHash('sha256').update(`${taskType}:${prompt}`).digest('hex');
    const cachedResponse = await this.getCachedResponse(promptHash);
    if (cachedResponse) {
      logger.info('AI Response served from Cache', { taskType, promptHash });
      return cachedResponse;
    }

    // 2. Resolve preferred providers based on mode, learningMode, and configuration
    const globalMode = process.env.AI_PROVIDER_MODE || 'auto';
    const isPersonalMode = options?.learningMode === 'personal' || taskType === 'personal_learning';
    const isInstituteMode = options?.learningMode === 'institute';
    const hasGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);

    let primaryId = 'ollama';
    let fallbackId = 'gemini';

    if (isPersonalMode || globalMode === 'local') {
      // Personal Learning Mode: Ollama FIRST -> Gemini -> OpenAI -> Anthropic
      primaryId = 'ollama';
      fallbackId = hasGemini ? 'gemini' : hasOpenAI ? 'openai' : hasAnthropic ? 'anthropic' : 'gemini';
    } else if (isInstituteMode || globalMode === 'cloud') {
      // Institute Mode: Configured cloud provider FIRST -> Ollama fallback
      primaryId = hasGemini ? 'gemini' : hasOpenAI ? 'openai' : hasAnthropic ? 'anthropic' : 'ollama';
      fallbackId = 'ollama';
    } else {
      // Auto mode: follow configured task route
      const route = this.taskRouting[taskType];
      if (route) {
        primaryId = route.primary;
        fallbackId = route.fallback;
      }
      // If primary is cloud but no keys configured, switch primary to ollama
      if ((primaryId === 'gemini' && !hasGemini) || (primaryId === 'openai' && !hasOpenAI)) {
        primaryId = 'ollama';
        fallbackId = hasGemini ? 'gemini' : hasOpenAI ? 'openai' : 'ollama';
      }
    }

    const primaryProvider = this.providers.get(primaryId) || this.providers.get('ollama')!;
    const fallbackProvider = this.providers.get(fallbackId) || this.providers.get('gemini')!;

    // 3. Try Primary Provider
    try {
      const result = await primaryProvider.complete(prompt, options);
      await this.saveCache(promptHash, taskType, result);
      await this.logUsage(taskType, result);
      return result;
    } catch (primaryErr: any) {
      logger.warn(`Primary AI Provider (${primaryProvider.id}) failed: ${primaryErr.message}. Triggering Fallback (${fallbackProvider.id})`);

      // 4. Try Fallback Provider
      if (fallbackProvider.id !== primaryProvider.id) {
        try {
          const result = await fallbackProvider.complete(prompt, options);
          await this.saveCache(promptHash, taskType, result);
          await this.logUsage(taskType, result);
          return result;
        } catch (fallbackErr: any) {
          logger.warn(`Fallback AI Provider (${fallbackProvider.id}) failed: ${fallbackErr.message}`);
        }
      }

      // 5. If all configured live providers fail or are offline, provide structured instructional guidance
      const guidanceMessage = `[PLACE@ASET AI Engine]: Local AI is unavailable. Start Ollama or choose a configured cloud provider.
Ollama URL: ${(process.env.OLLAMA_BASE_URL || 'http://localhost:11434')}
Model: ${process.env.OLLAMA_MODEL || 'llama3'}`;

      const safeResult: AICompletionResult = {
        text: guidanceMessage,
        tokensUsed: 0,
        latencyMs: 1,
        providerId: 'unavailable',
        model: 'system-guidance',
      };

      return safeResult;
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
