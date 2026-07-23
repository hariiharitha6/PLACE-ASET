import { IAIProvider, AICompletionOptions, AICompletionResult } from './provider.interface';

export class AzureProvider implements IAIProvider {
  id = 'azure';
  name = 'Azure OpenAI Service';

  isConfigured(): boolean { return true; }

  async checkHealth() {
    return { status: 'healthy' as const, latencyMs: 12, message: 'Azure OpenAI Instance Active' };
  }

  async complete(_prompt: string, _options?: AICompletionOptions): Promise<AICompletionResult> {
    return {
      text: 'Azure OpenAI Output: Enterprise grade deployment response.',
      tokensUsed: 150,
      latencyMs: 45,
      providerId: this.id,
      model: 'gpt-4-turbo',
    };
  }

  async embed(_text: string): Promise<number[]> {
    return new Array(128).fill(0.01);
  }
}
