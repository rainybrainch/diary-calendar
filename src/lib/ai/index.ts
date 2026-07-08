import { AIProvider, AIConfig } from './types';
import { DemoAIProvider } from './demo-ai';
import { createContextAwareDemoAIProvider } from './context-aware-demo-ai';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { PastDataContext } from '../past-data-analyzer';

/**
 * AI プロバイダーファクトリ
 *
 * Provider 優先順位：
 * 1. 指定された Provider で API キーがあれば使用
 * 2. API キー不足なら自動フォールバック（Demo AI）
 * 3. 過去データがあれば文脈対応版 Demo AI を使用
 */
export function createAIProvider(config: AIConfig, pastContext?: PastDataContext): AIProvider {
  try {
    // OpenAI 指定かつ API キーがあれば
    if (config.provider === 'openai' && config.apiKey) {
      const openai = new OpenAIProvider(config.apiKey, config.model);
      return openai;
    }

    // Gemini 指定かつ API キーがあれば
    if (config.provider === 'gemini' && config.apiKey) {
      const gemini = new GeminiProvider(config.apiKey, config.model);
      return gemini;
    }
  } catch (error) {
    console.warn(`Failed to initialize ${config.provider} provider:`, error);
    // フォールバック処理へ
  }

  // フォールバック：文脈対応 Demo AI か通常 Demo AI
  if (pastContext) {
    return createContextAwareDemoAIProvider(pastContext);
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
