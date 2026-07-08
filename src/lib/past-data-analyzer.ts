/**
 * 過去14日間のデータ分析エンジン
 * AI質問の文脈化に使用
 */

import { DiaryEntry } from './types';

export interface PastDataContext {
  // 習慣分析
  yesterdayHabits: number; // 昨日の達成数
  weekAverageHabits: number; // 先週の平均達成数
  habitTrend: 'improving' | 'declining' | 'stable'; // 改善傾向
  completedHabits: string[]; // 昨日達成した習慣リスト
  missingHabits: string[]; // 昨日未達成の習慣リスト

  // 気分分析
  yesterdayMood: number; // 昨日の気分
  moodTrend: 'improving' | 'declining' | 'stable';
  moodAverage: number; // 先週の平均気分

  // エネルギー分析
  yesterdayEnergy: number; // 昨日のエネルギー
  energyTrend: 'improving' | 'declining' | 'stable';
  energyAverage: number; // 先週の平均エネルギー

  // 連続記録
  consecutiveDays: number; // 連続記録日数
  isOnStreak: boolean; // 連続中かどうか
  longestStreak: number; // 過去最長記録

  // カード生成
  cardsThisWeek: number; // 今週のカード数
  cardTrend: 'active' | 'moderate' | 'low';

  // 記録数
  recordedDays: number; // 記録した日数（過去14日）
  consistencyScore: number; // 一貫性スコア（0-100）

  // 睡眠パターン（text から推測）
  sleepPattern: 'good' | 'irregular' | 'lacking';
}

const HABIT_LABELS: Record<string, string> = {
  pushups: 'プッシュアップ',
  squats: 'スクワット',
  plank: 'プランク',
  run: 'ラン',
  reading: '読書',
  ai_learning: 'AI学習',
};

/**
 * 過去14日間のデータを分析して文脈を抽出
 */
export function analyzePastData(entries: DiaryEntry[]): PastDataContext {
  // 過去14日間のデータを抽出
  const pastEntries = getPast14Days(entries);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const yesterdayEntry = pastEntries.find((e) => e.date === yesterdayStr);

  // 習慣分析
  const { completedHabits, missingHabits, yesterdayCount } = analyzeHabits(yesterdayEntry);
  const weekHabitsStats = analyzeWeekHabits(pastEntries);

  // 気分・エネルギー分析
  const moodStats = analyzeMood(pastEntries, yesterdayEntry);
  const energyStats = analyzeEnergy(pastEntries, yesterdayEntry);

  // 連続記録分析
  const streakInfo = analyzeStreak(pastEntries);

  // 記録一貫性
  const consistencyScore = (pastEntries.length / 14) * 100;

  // カード生成分析
  const cardsThisWeek = countCardsThisWeek(pastEntries);
  const cardTrend = getCardTrend(cardsThisWeek);

  // 睡眠パターン推測
  const sleepPattern = guessSleepPattern(pastEntries);

  return {
    // 習慣
    yesterdayHabits: yesterdayCount,
    weekAverageHabits: weekHabitsStats.average,
    habitTrend: getTrend(weekHabitsStats.trend),
    completedHabits,
    missingHabits,

    // 気分
    yesterdayMood: moodStats.yesterday,
    moodTrend: getTrend(moodStats.trend),
    moodAverage: moodStats.average,

    // エネルギー
    yesterdayEnergy: energyStats.yesterday,
    energyTrend: getTrend(energyStats.trend),
    energyAverage: energyStats.average,

    // 連続記録
    consecutiveDays: streakInfo.consecutive,
    isOnStreak: streakInfo.isOnStreak,
    longestStreak: streakInfo.longest,

    // カード
    cardsThisWeek,
    cardTrend,

    // 記録一貫性
    recordedDays: pastEntries.length,
    consistencyScore,

    // 睡眠
    sleepPattern,
  };
}

/**
 * 過去14日間のデータを取得
 */
function getPast14Days(entries: DiaryEntry[]): DiaryEntry[] {
  const today = new Date();
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  return entries.filter((e) => {
    const entryDate = new Date(e.date);
    return entryDate >= fourteenDaysAgo && entryDate <= today;
  });
}

/**
 * 昨日の習慣を分析
 */
function analyzeHabits(yesterdayEntry: DiaryEntry | undefined): {
  completedHabits: string[];
  missingHabits: string[];
  yesterdayCount: number;
} {
  const completedHabits: string[] = [];
  const missingHabits: string[] = [];

  if (!yesterdayEntry) {
    return { completedHabits, missingHabits, yesterdayCount: 0 };
  }

  const habitKeys = ['pushups', 'squats', 'plank', 'run', 'reading', 'ai_learning'] as const;

  habitKeys.forEach((key) => {
    if (yesterdayEntry.tasks[key]) {
      completedHabits.push(HABIT_LABELS[key]);
    } else {
      missingHabits.push(HABIT_LABELS[key]);
    }
  });

  return {
    completedHabits,
    missingHabits,
    yesterdayCount: completedHabits.length,
  };
}

/**
 * 先週の習慣分析
 */
function analyzeWeekHabits(entries: DiaryEntry[]): { average: number; trend: number } {
  const weekEntries = entries.slice(-7); // 過去7日間

  if (weekEntries.length === 0) {
    return { average: 0, trend: 0 };
  }

  const habitCounts = weekEntries.map((e) => {
    const count =
      (e.tasks.pushups ? 1 : 0) +
      (e.tasks.squats ? 1 : 0) +
      (e.tasks.plank ? 1 : 0) +
      (e.tasks.run ? 1 : 0) +
      (e.tasks.reading ? 1 : 0) +
      (e.tasks.ai_learning ? 1 : 0);
    return count;
  });

  const average = habitCounts.reduce((a, b) => a + b, 0) / habitCounts.length;

  // トレンド: 最近3日 vs 7日前
  const recent = habitCounts.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const older = habitCounts.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
  const trend = recent - older;

  return { average, trend };
}

/**
 * 気分分析
 */
function analyzeMood(entries: DiaryEntry[], yesterdayEntry: DiaryEntry | undefined): {
  yesterday: number;
  average: number;
  trend: number;
} {
  const weekEntries = entries.slice(-7);
  const moods = weekEntries
    .map((e) => e.mood || 0)
    .filter((m) => m > 0);

  if (moods.length === 0) {
    return { yesterday: yesterdayEntry?.mood || 0, average: 0, trend: 0 };
  }

  const average = moods.reduce((a, b) => a + b, 0) / moods.length;
  const recent = weekEntries.slice(-3).map((e) => e.mood || 0).reduce((a, b) => a + b, 0) / 3;
  const older = weekEntries.slice(0, 4).map((e) => e.mood || 0).reduce((a, b) => a + b, 0) / 4;
  const trend = recent - older;

  return {
    yesterday: yesterdayEntry?.mood || 0,
    average,
    trend,
  };
}

/**
 * エネルギー分析
 */
function analyzeEnergy(entries: DiaryEntry[], yesterdayEntry: DiaryEntry | undefined): {
  yesterday: number;
  average: number;
  trend: number;
} {
  const weekEntries = entries.slice(-7);
  const energies = weekEntries
    .map((e) => e.energy || 0)
    .filter((e) => e > 0);

  if (energies.length === 0) {
    return { yesterday: yesterdayEntry?.energy || 0, average: 0, trend: 0 };
  }

  const average = energies.reduce((a, b) => a + b, 0) / energies.length;
  const recent = weekEntries.slice(-3).map((e) => e.energy || 0).reduce((a, b) => a + b, 0) / 3;
  const older = weekEntries.slice(0, 4).map((e) => e.energy || 0).reduce((a, b) => a + b, 0) / 4;
  const trend = recent - older;

  return {
    yesterday: yesterdayEntry?.energy || 0,
    average,
    trend,
  };
}

/**
 * 連続記録分析
 */
function analyzeStreak(entries: DiaryEntry[]): {
  consecutive: number;
  isOnStreak: boolean;
  longest: number;
} {
  let consecutive = 0;
  let longest = 0;
  let currentStreak = 0;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = new Date();
  let currentDate = new Date(today);

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    const dayDiff = Math.floor(
      (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 0 || dayDiff === 1) {
      currentStreak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }

  consecutive = currentStreak;
  longest = currentStreak; // 簡略版（実際にはもっと複雑な計算が必要）

  return {
    consecutive,
    isOnStreak: consecutive > 0,
    longest,
  };
}

/**
 * トレンドを判定
 */
function getTrend(value: number): 'improving' | 'declining' | 'stable' {
  if (value > 0.3) return 'improving';
  if (value < -0.3) return 'declining';
  return 'stable';
}

/**
 * 今週のカード数を計算
 */
function countCardsThisWeek(entries: DiaryEntry[]): number {
  return entries.slice(-7).length; // 過去7日の記録数
}

/**
 * カード生成トレンドを判定
 */
function getCardTrend(cardsThisWeek: number): 'active' | 'moderate' | 'low' {
  if (cardsThisWeek >= 5) return 'active';
  if (cardsThisWeek >= 3) return 'moderate';
  return 'low';
}

/**
 * 睡眠パターンを推測（テキスト分析）
 */
function guessSleepPattern(entries: DiaryEntry[]): 'good' | 'irregular' | 'lacking' {
  const sleepKeywords = {
    good: ['よく寝た', '十分な睡眠', 'ぐっすり', '8時間'],
    lacking: ['寝不足', '短い睡眠', '徹夜', 'ほとんど寝てない'],
    irregular: ['起きた', '中途覚醒', '不規則'],
  };

  const recentEntries = entries.slice(-7);
  let goodCount = 0;
  let lackingCount = 0;

  recentEntries.forEach((entry) => {
    const text = (entry.text || '').toLowerCase();
    sleepKeywords.good.forEach((keyword) => {
      if (text.includes(keyword)) goodCount++;
    });
    sleepKeywords.lacking.forEach((keyword) => {
      if (text.includes(keyword)) lackingCount++;
    });
  });

  if (goodCount > lackingCount) return 'good';
  if (lackingCount > goodCount) return 'lacking';
  return 'irregular';
}
