import { AIProvider, AIQuestion, AIAnswerContext, AIGeneratedContent, GrowthReport } from './types';
import { generateGrowthReport } from '../growth-report-generator';

/**
 * Demo AI Provider - API無しで固定ロジックで動作
 * ローカルテスト・デモ用
 */
export class DemoAIProvider implements AIProvider {
  private questionCount = 0;
  private predefinedQuestions: AIQuestion[] = [
    {
      id: 'q1',
      question: '今日の朝、気分はいかがでしたか？',
      type: 'rating',
    },
    {
      id: 'q2',
      question: '最も印象的だった出来事は何ですか？',
      type: 'text',
      placeholder: '例：○○さんと良い話ができた',
    },
    {
      id: 'q3',
      question: '今日の学びや気づきは？',
      type: 'text',
      placeholder: '例：時間管理の大切さに気づいた',
    },
    {
      id: 'q4',
      question: 'からだの調子はどうでしたか？',
      type: 'rating',
    },
    {
      id: 'q5',
      question: '明日への目標は？',
      type: 'text',
      placeholder: '例：○○に取り組む',
    },
  ];

  async generateQuestions(context: AIAnswerContext): Promise<AIQuestion[]> {
    // デモ：常に同じ質問セットを返す
    return this.predefinedQuestions.slice(0, 5);
  }

  async generateFollowUpQuestion(
    context: AIAnswerContext,
    lastAnswer: string
  ): Promise<AIQuestion | null> {
    this.questionCount++;

    // 3回までフォローアップ質問を返す
    if (this.questionCount > 3) {
      return null;
    }

    const followUpQuestions: Record<number, AIQuestion> = {
      1: {
        id: 'followup1',
        question: 'その時のお気持ちをもう少し詳しく教えていただけますか？',
        type: 'text',
      },
      2: {
        id: 'followup2',
        question: 'それが自分にどのような影響をもたらしそうですか？',
        type: 'text',
      },
      3: {
        id: 'followup3',
        question: 'そのために明日できることは何ですか？',
        type: 'text',
      },
    };

    return followUpQuestions[this.questionCount] || null;
  }

  async generateSummary(context: AIAnswerContext): Promise<string> {
    const answers = context.answers || {};
    const answerStrings = Object.values(answers)
      .filter((a) => typeof a === 'string')
      .slice(0, 3);

    if (answerStrings.length === 0) {
      return '今日の日記を記録しました。続けることが大事です。';
    }

    return `今日は${answerStrings[0]}という出来事がありました。${answerStrings[1] || '考えさせられた1日になりました。'}その経験から${answerStrings[2] || '新しい視点'}を得ることができました。`;
  }

  async generateTitle(context: AIAnswerContext): Promise<string> {
    const keywords = [
      '気づき',
      '成長',
      'チャレンジ',
      '思考',
      '発見',
      'つながり',
      '変化',
      '目標',
    ];
    const randomKeyword =
      keywords[Math.floor(Math.random() * keywords.length)];
    const date = new Date().toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
    });

    return `${date} - 今日の${randomKeyword}`;
  }

  async generateTags(context: AIAnswerContext): Promise<string[]> {
    const allTags = [
      '日常',
      '学び',
      '成長',
      '感動',
      '課題',
      '目標',
      '人間関係',
      '体調',
      '思考',
    ];

    // ランダムに3～5個選ぶ
    const count = Math.floor(Math.random() * 3) + 3; // 3-5
    const shuffled = [...allTags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  async generateAll(context: AIAnswerContext): Promise<AIGeneratedContent> {
    const attributes: Array<'mind' | 'body' | 'work' | 'relation' | 'money' | 'habit' | 'dream'> = [
      'mind',
      'body',
      'work',
      'relation',
      'habit',
      'dream',
    ];
    const randomAttribute =
      attributes[Math.floor(Math.random() * attributes.length)];

    return {
      title: await this.generateTitle(context),
      summary: await this.generateSummary(context),
      tags: await this.generateTags(context),
      attribute: randomAttribute,
      mood: context.mood || Math.floor(Math.random() * 5) + 1,
      energy: context.energy || Math.floor(Math.random() * 5) + 1,
      suggestions: [
        '明日もこの調子で続けましょう',
        '今日の学びを忘れずに',
        'チャレンジは続きます',
      ],
    };
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  async generateGrowthReport(): Promise<GrowthReport> {
    // Demo モードは過去データなしで一般的な励ましを返す
    const defaultContext = {
      yesterdayHabits: 0,
      weekAverageHabits: 0,
      habitTrend: 'stable' as const,
      completedHabits: [],
      missingHabits: [],
      yesterdayMood: 0,
      moodTrend: 'stable' as const,
      moodAverage: 3,
      yesterdayEnergy: 0,
      energyTrend: 'stable' as const,
      energyAverage: 3,
      consecutiveDays: 0,
      isOnStreak: false,
      longestStreak: 0,
      cardsThisWeek: 0,
      cardTrend: 'low' as const,
      recordedDays: 1,
      consistencyScore: 10,
      sleepPattern: 'irregular' as const,
    };

    return generateGrowthReport(defaultContext);
  }

  reset(): void {
    this.questionCount = 0;
  }
}

export const createDemoAIProvider = (): AIProvider => {
  return new DemoAIProvider();
};
