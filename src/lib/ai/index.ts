import { AIProvider, AIConfig } from './types';
import { DemoAIProvider } from './demo-ai';

/**
 * AI プロバイダーファクトリ
 */
export function createAIProvider(config: AIConfig): AIProvider {
  if (config.provider === 'demo' || !config.apiKey) {
    return new DemoAIProvider();
  }

  if (config.provider === 'openai') {
    // OpenAI プロバイダーは後で実装
    // return new OpenAIProvider(config);
    console.warn('OpenAI provider not yet implemented, falling back to Demo AI');
    return new DemoAIProvider();
  }

  if (config.provider === 'gemini') {
    // Gemini プロバイダーは後で実装
    // return new GeminiProvider(config);
    console.warn('Gemini provider not yet implemented, falling back to Demo AI');
    return new DemoAIProvider();
  }

  return new DemoAIProvider();
}

/**
 * デフォルト AI 設定を取得
 */
export function getDefaultAIConfig(): AIConfig {
  const provider = process.env.NEXT_PUBLIC_AI_PROVIDER as 'demo' | 'openai' | 'gemini' || 'demo';
  const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY;

  return {
    provider,
    apiKey,
    model: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
  };
}

export type { AIProvider, AIQuestion, AIAnswerContext, AIGeneratedContent } from './types';
