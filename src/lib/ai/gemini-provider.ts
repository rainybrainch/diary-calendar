/**
 * Google Gemini API Provider
 */

import { AIProvider, AIQuestion, AIAnswerContext, AIGeneratedContent, GrowthReport, AIAdvice } from './types';
import { generateGrowthReport } from '../growth-report-generator';
import { generateAIAdvice } from '../ai-advice-generator';

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    if (!apiKey) throw new Error('Gemini API key is required');
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateQuestions(): Promise<AIQuestion[]> {
    const prompt = `You are a helpful diary coach. Generate 5 structured questions to help the user reflect on their day.
Return as JSON array with objects containing: {id: string, question: string, type: "text"|"rating", placeholder?: string}`;

    const response = await this.callGemini(prompt);
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : this.fallbackQuestions();
    } catch {
      return this.fallbackQuestions();
    }
  }

  async generateFollowUpQuestion(
    context: AIAnswerContext,
    lastAnswer: string
  ): Promise<AIQuestion | null> {
    const prompt = `Based on this answer: "${lastAnswer}", generate a follow-up question. Return JSON: {id: string, question: string, type: "text"|"rating"}`;

    const response = await this.callGemini(prompt);
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      return null;
    }
  }

  async generateSummary(context: AIAnswerContext): Promise<string> {
    const answers = Object.values(context.answers).filter((a) => typeof a === 'string');
    const prompt = `Summarize these reflections in 1 sentence: ${answers.join('. ')}`;

    return this.callGemini(prompt);
  }

  async generateTitle(): Promise<string> {
    const today = new Date().toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
    });
    const prompt = `Create a short, engaging diary title for today (${today}). Start with the date.`;

    return this.callGemini(prompt);
  }

  async generateTags(context: AIAnswerContext): Promise<string[]> {
    const answers = Object.values(context.answers).filter((a) => typeof a === 'string');
    const prompt = `Generate 3-5 relevant tags for these topics: ${answers.join(', ')}. Return as JSON array of strings.`;

    const response = await this.callGemini(prompt);
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : ['日常', '成長'];
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
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'test' }] }],
          }),
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
