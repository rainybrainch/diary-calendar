/**
 * コンテキスト対応 Demo AI
 * 過去14日間のデータを参照して質問を生成
 */

import { AIProvider, AIQuestion, AIAnswerContext, AIGeneratedContent, GrowthReport } from './types';
import { PastDataContext } from '../past-data-analyzer';
import { generateGrowthReport as generateGrowthReportCore } from '../growth-report-generator';

export class ContextAwareDemoAIProvider implements AIProvider {
  private questionCount = 0;
  private pastContext: PastDataContext;

  constructor(pastContext: PastDataContext) {
    this.pastContext = pastContext;
  }

  async generateQuestions(context: AIAnswerContext): Promise<AIQuestion[]> {
    const questions: AIQuestion[] = [];

    // 質問1: 昨日の習慣に基づく気分質問
    if (this.pastContext.yesterdayHabits > 0) {
      questions.push({
        id: 'q1',
        question: `昨日は${this.pastContext.completedHabits.join('・')}に成功しました。今日の気分はいかがですか？（1-5）`,
        type: 'rating',
      });
    } else if (this.pastContext.missingHabits.length > 0) {
      questions.push({
        id: 'q1',
        question: `昨日は${this.pastContext.missingHabits[0]}ができませんでしたね。今日はどうしたいですか？（1-5）`,
        type: 'rating',
      });
    } else {
      questions.push({
        id: 'q1',
        question: '今日の朝、気分はいかがでしたか？（1-5）',
        type: 'rating',
      });
    }

    // 質問2: 先週のトレンドに基づく出来事質問
    if (this.pastContext.habitTrend === 'improving') {
      questions.push({
        id: 'q2',
        question: '先週より習慣が増えています。今日、最も良い出来事は何ですか？',
        type: 'text',
        placeholder: '例：朝早く起きて勉強できた',
      });
    } else if (this.pastContext.habitTrend === 'declining') {
      questions.push({
        id: 'q2',
        question: '先週より習慣が減ってますね。今日何か良いことはありましたか？',
        type: 'text',
        placeholder: '例：友人と話す時間が持てた',
      });
    } else {
      questions.push({
        id: 'q2',
        question: '今日、最も印象的だった出来事は何ですか？',
        type: 'text',
        placeholder: '例：新しい気づきがあった',
      });
    }

    // 質問3: 気分・エネルギートレンドに基づく学び質問
    if (this.pastContext.moodTrend === 'declining' && this.pastContext.energyTrend === 'declining') {
      questions.push({
        id: 'q3',
        question: 'ここ数日気分とエネルギーが低下してるようです。今日の学びはありますか？',
        type: 'text',
        placeholder: '例：疲れているときの対処法',
      });
    } else {
      questions.push({
        id: 'q3',
        question: '今日の学びや気づきは？',
        type: 'text',
        placeholder: '例：時間の使い方について',
      });
    }

    // 質問4: エネルギー質問
    if (this.pastContext.sleepPattern === 'lacking') {
      questions.push({
        id: 'q4',
        question: '睡眠が不足ぎみのようです。からだの調子はどうでしたか？（1-5）',
        type: 'rating',
      });
    } else {
      questions.push({
        id: 'q4',
        question: 'からだの調子はどうでしたか？（1-5）',
        type: 'rating',
      });
    }

    // 質問5: 連続記録・目標質問
    if (this.pastContext.isOnStreak && this.pastContext.consecutiveDays > 7) {
      questions.push({
        id: 'q5',
        question: `素晴らしい！${this.pastContext.consecutiveDays}日連続記録を続けています。明日の目標は？`,
        type: 'text',
        placeholder: '例：今のペースを保つ',
      });
    } else if (this.pastContext.cardTrend === 'low') {
      questions.push({
        id: 'q5',
        question: '最近記録が少なめのようです。明日はどんな1日にしたいですか？',
        type: 'text',
        placeholder: '例：バランスの取れた1日',
      });
    } else {
      questions.push({
        id: 'q5',
        question: '明日への目標は？',
        type: 'text',
        placeholder: '例：昨日以上の成果を出す',
      });
    }

    return questions;
  }

  async generateFollowUpQuestion(
    context: AIAnswerContext,
    lastAnswer: string
  ): Promise<AIQuestion | null> {
    this.questionCount++;

    if (this.questionCount > 3) {
      return null;
    }

    const followUpQuestions = [
      {
        id: 'followup1',
        question: `「${lastAnswer.slice(0, 20)}...」について、その時どんな気持ちでしたか？`,
        type: 'text' as const,
      },
      {
        id: 'followup2',
        question: 'それが今後のあなたにどのような影響を与えると思いますか？',
        type: 'text' as const,
      },
      {
        id: 'followup3',
        question: 'その経験から学んだことを、明日どのように活かしたいですか？',
        type: 'text' as const,
      },
    ];

    return followUpQuestions[this.questionCount - 1] || null;
  }

  async generateSummary(context: AIAnswerContext): Promise<string> {
    const answers = context.answers || {};

    // 連続記録を褒める
    if (this.pastContext.isOnStreak && this.pastContext.consecutiveDays > 7) {
      return `${this.pastContext.consecutiveDays}日の連続記録、素晴らしいです！今日のあなたの経験がその継続の力を証明しています。`;
    }

    // 改善を認める
    if (this.pastContext.habitTrend === 'improving') {
      return `先週と比べて習慣が増えていますね。その積み重ねが確実にあなたを成長させています。`;
    }

    // 落ち込みをサポート
    if (this.pastContext.habitTrend === 'declining') {
      return `気分やエネルギーが下がっているようですが、今日のあなたは確実に前に進んでいます。`;
    }

    return `今日もお疲れさまでした。毎日の積み重ねがあなたを作っています。`;
  }

  async generateTitle(context: AIAnswerContext): Promise<string> {
    const date = new Date().toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
    });

    // トレンドに基づいたタイトル
    if (this.pastContext.habitTrend === 'improving') {
      return `${date} - 成長の日`;
    }
    if (this.pastContext.moodTrend === 'improving') {
      return `${date} - 気分が良い日`;
    }
    if (this.pastContext.isOnStreak && this.pastContext.consecutiveDays > 7) {
      return `${date} - 継続の力`;
    }
    if (this.pastContext.sleepPattern === 'lacking') {
      return `${date} - 頑張った日`;
    }

    return `${date} - 毎日の一歩`;
  }

  async generateTags(context: AIAnswerContext): Promise<string[]> {
    const tags: string[] = [];

    // 習慣ベースのタグ
    if (this.pastContext.yesterdayHabits >= 4) {
      tags.push('継続');
      tags.push('頑張り');
    }
    if (this.pastContext.completedHabits.includes('読書')) {
      tags.push('学び');
    }
    if (this.pastContext.completedHabits.includes('ラン')) {
      tags.push('運動');
    }

    // 気分ベースのタグ
    if (this.pastContext.moodTrend === 'improving') {
      tags.push('成長');
      tags.push('ポジティブ');
    }

    // 連続記録ベースのタグ
    if (this.pastContext.isOnStreak) {
      tags.push('記録');
    }
    if (this.pastContext.consecutiveDays > 14) {
      tags.push('マイルストーン');
    }

    // 睡眠ベースのタグ
    if (this.pastContext.sleepPattern === 'good') {
      tags.push('休息');
    }

    // デフォルトタグ
    if (tags.length === 0) {
      tags.push('日常');
      tags.push('感謝');
    }

    // 最大8個に制限
    return tags.slice(0, 8);
  }

  async generateAll(context: AIAnswerContext): Promise<AIGeneratedContent> {
    return {
      title: await this.generateTitle(context),
      summary: await this.generateSummary(context),
      tags: await this.generateTags(context),
      attribute: this.selectAttributeByContext(),
      mood: context.mood || 3,
      energy: context.energy || 3,
      suggestions: [
        this.pastContext.isOnStreak ? '継続が最大の力です' : '今日から始まります',
        this.pastContext.habitTrend === 'improving' ? '良い流れが続いています' : '次に向けて準備しましょう',
        `${this.pastContext.recordedDays}日間の記録があります`,
      ],
    };
  }

  /**
   * 過去データに基づいて属性を選択
   */
  private selectAttributeByContext(): 'mind' | 'body' | 'work' | 'relation' | 'money' | 'habit' | 'dream' {
    // 習慣が多く達成されている → habit
    if (this.pastContext.yesterdayHabits >= 4) {
      return 'habit';
    }

    // 気分が良い → mind
    if (this.pastContext.moodTrend === 'improving' && this.pastContext.yesterdayMood >= 4) {
      return 'mind';
    }

    // エネルギーが良い → body
    if (this.pastContext.energyTrend === 'improving' && this.pastContext.yesterdayEnergy >= 4) {
      return 'body';
    }

    // 連続記録が長い → dream
    if (this.pastContext.consecutiveDays > 14) {
      return 'dream';
    }

    // デフォルト
    return 'habit';
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  async generateGrowthReport(): Promise<GrowthReport> {
    return generateGrowthReportCore(this.pastContext);
  }

  reset(): void {
    this.questionCount = 0;
  }
}

export function createContextAwareDemoAIProvider(
  pastContext: PastDataContext
): AIProvider {
  return new ContextAwareDemoAIProvider(pastContext);
}
