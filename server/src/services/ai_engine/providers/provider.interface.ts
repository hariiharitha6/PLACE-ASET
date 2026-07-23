export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string;
}

export interface AICompletionResult {
  text: string;
  tokensUsed: number;
  latencyMs: number;
  providerId: string;
  model: string;
}

export interface IAIProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  checkHealth(): Promise<{ status: 'healthy' | 'unhealthy' | 'unreachable'; latencyMs: number; message?: string }>;
  complete(prompt: string, options?: AICompletionOptions): Promise<AICompletionResult>;
  embed(text: string): Promise<number[]>;
}
