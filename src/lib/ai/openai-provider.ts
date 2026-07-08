/**
 * OpenAI Chat Completions Provider
 */

import { AIProvider, AIQuestion, AIAnswerContext, AIGeneratedContent, GrowthReport, AIAdvice } from './types';
import { generateGrowthReport } from '../growth-report-generator';
import { generateAIAdvice } from '../ai-advice-generator';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    if (!apiKey) throw new Error('OpenAI API key is required');
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateQuestions(): Promise<AIQuestion[]> {
    // OpenAI API を使用して質問を生成
    const prompt = `You are a helpful diary coach. Generate 5 structured questions to help the user reflect on their day.
Return as JSON array with objects containing: {id: string, question: string, type: "text"|"rating", placeholder?: string}`;

    const response = await this.callOpenAI(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return this.fallbackQuestions();
    }
  }

  async generateFollowUpQuestion(
    context: AIAnswerContext,
    lastAnswer: string
  ): Promise<AIQuestion | null> {
    const prompt = `Based on this answer: "${lastAnswer}", generate a follow-up question. Return JSON: {id: string, question: string, type: "text"|"rating"}`;

    const response = await this.callOpenAI(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return null;
    }
  }

  async generateSummary(context: AIAnswerContext): Promise<string> {
    const answers = Object.values(context.answers).filter((a) => typeof a === 'string');
    const prompt = `Summarize these reflections in 1 sentence: ${answers.join('. ')}`;

    return this.callOpenAI(prompt);
  }

  async generateTitle(): Promise<string> {
    const today = new Date().toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
    });
    const prompt = `Create a short, engaging diary title for today (${today}). Start with the date.`;

    return this.callOpenAI(prompt);
  }

  async generateTags(context: AIAnswerContext): Promise<string[]> {
    const answers = Object.values(context.answers).filter((a) => typeof a === 'string');
    const prompt = `Generate 3-5 relevant tags for these topics: ${answers.join(', ')}. Return as JSON array of strings.`;

    const response = await this.callOpenAI(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return ['日常', '成長'];
    }
  }

  async generateAll(context: AIAnswerContext): Promise<AIGeneratedContent> {
    return {
      title: await this.generateTitle(),
      summary: await this.generateSummary(context),
      tags: await this.generateTags(context),
      attribute: 'mind',
      mood: context.mood || 3,
      energy: context.energy || 3,
    };
  }

  async generateGrowthReport(): Promise<GrowthReport> {
    // OpenAI は使用せず、既存ロジックを使用
    return generateGrowthReport({
      habitTrend: 'stable',
      moodTrend: 'stable',
      energyTrend: 'stable',
      consecutiveDays: 0,
      isOnStreak: false,
      sleepPattern: 'irregular',
      recordedDays: 1,
      consistencyScore: 10,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  async generateAdvice(): Promise<AIAdvice> {
    // OpenAI は使用せず、既存ロジックを使用
    return generateAIAdvice({
      habitTrend: 'stable',
      moodTrend: 'stable',
      energyTrend: 'stable',
      consecutiveDays: 0,
      isOnStreak: false,
      sleepPattern: 'irregular',
      recordedDays: 1,
      consistencyScore: 10,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private fallbackQuestions(): AIQuestion[] {
    return [
      {
        id: 'q1',
        question: '今日の気分は？',
        type: 'rating',
      },
      {
        id: 'q2',
        question: '最も良かったことは？',
        type: 'text',
        placeholder: '例：友人と過ごせた',
      },
    ];
  }
}
