// AI Types and Interfaces for Forest Note

/**
 * AI質問インターフェース
 */
export interface AIQuestion {
  id: string;
  question: string;
  placeholder?: string;
  type: 'text' | 'rating' | 'checkbox';
}

/**
 * AI回答コンテキスト
 */
export interface AIAnswerContext {
  answers: Record<string, any>;
  previousAnswers?: string[];
  mood?: number;
  energy?: number;
}

/**
 * AI生成コンテンツ
 */
export interface AIGeneratedContent {
  title: string;
  summary: string;
  tags: string[];
  attribute: 'mind' | 'body' | 'work' | 'relation' | 'money' | 'habit' | 'dream';
  mood?: number;
  energy?: number;
  suggestions?: string[];
}

/**
 * 成長レポート（保存後の励まし）
 */
export interface GrowthReport {
  title: string;
  messages: string[];
  emoji: string;
  tone: 'encouraging' | 'celebrating' | 'supportive' | 'motivating';
}

/**
 * AI プロバイダー抽象インターフェース
 */
export interface AIProvider {
  /**
   * 質問を生成
   */
  generateQuestions(context: AIAnswerContext): Promise<AIQuestion[]>;

  /**
   * 次の質問を生成
   */
  generateFollowUpQuestion(context: AIAnswerContext, lastAnswer: string): Promise<AIQuestion | null>;

  /**
   * 要約を生成
   */
  generateSummary(context: AIAnswerContext): Promise<string>;

  /**
   * タイトルを生成
   */
  generateTitle(context: AIAnswerContext): Promise<string>;

  /**
   * タグを生成
   */
  generateTags(context: AIAnswerContext): Promise<string[]>;

  /**
   * 全コンテンツを生成
   */
  generateAll(context: AIAnswerContext): Promise<AIGeneratedContent>;

  /**
   * 成長レポートを生成（保存後）
   * 過去データに基づいた励ましのコメント
   */
  generateGrowthReport?(context?: AIAnswerContext): Promise<GrowthReport>;

  /**
   * プロバイダーの健全性確認
   */
  isHealthy(): Promise<boolean>;
}

/**
 * AI設定
 */
export interface AIConfig {
  provider: 'demo' | 'openai' | 'gemini';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
