/**
 * カレンダー詳細データ
 * 日付ごとのカード・習慣・AI生成内容を統一
 */

import { DiaryCard } from './card-generator';
import { GrowthReport } from './ai/types';
import { AIAdvice } from './ai/types';
import { ForestState } from './forest-calculator';
import { ForestNoteJSON, CardJSON } from './types';

export interface ForestNoteScores {
  mental: number; // 0-100
  body: number; // 0-100
  work: number; // 0-100
  relationship: number; // 0-100
  money: number; // 0-100
  habit: number; // 0-100
  dream: number; // 0-100
}

export interface DayDetailData {
  date: string; // YYYY-MM-DD
  card?: DiaryCard; // その日のカード
  habits: {
    pushups: boolean;
    squats: boolean;
    plank: boolean;
    run: boolean;
    reading: boolean;
    ai_learning: boolean;
  };
  mood: number; // 1-5
  energy: number; // 1-5
  diary?: string; // 日記テキスト
  growthReport?: GrowthReport; // 成長レポート
  aiAdvice?: AIAdvice; // AI アドバイス
  forestState?: ForestState; // その日の森の状態
  workTime: number; // 作業時間（分）
  consecutiveDays: number; // その日での連続記録日数
  forestNoteJson?: ForestNoteJSON; // Forest Note v1.0 JSON
  forestNoteScores?: ForestNoteScores; // 7項目スコア（0-100）
  cardJson?: CardJSON; // Card JSON v1.0
}

export interface DayStats {
  habitCount: number; // その日の習慣達成数
  hasCard: boolean; // カードがあるか
  hasGrowthReport: boolean;
  hasAdvice: boolean;
  forestLevel: number; // 森の成長度（0-100）
  moodEmoji: string; // 気分を絵文字で
  energyEmoji: string; // エネルギーを絵文字で
}

/**
 * 指定日付のすべてのデータを取得
 */
export function getDayDetailData(
  date: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allEntries: any[],
  allCards?: DiaryCard[]
): DayDetailData {
  // 対象日の日記エントリを探す
  const entry = allEntries.find((e) => e.date === date);

  if (!entry) {
    // データなし
    return {
      date,
      habits: {
        pushups: false,
        squats: false,
        plank: false,
        run: false,
        reading: false,
        ai_learning: false,
      },
      mood: 0,
      energy: 0,
      workTime: 0,
      consecutiveDays: 0,
    };
  }

  // 習慣データを取得
  const habits = entry.habit_checks?.[0]
    ? {
        pushups: entry.habit_checks[0].pushups || false,
        squats: entry.habit_checks[0].squats || false,
        plank: entry.habit_checks[0].plank || false,
        run: entry.habit_checks[0].run || false,
        reading: entry.habit_checks[0].reading || false,
        ai_learning: entry.habit_checks[0].ai_learning || false,
      }
    : {
        pushups: false,
        squats: false,
        plank: false,
        run: false,
        reading: false,
        ai_learning: false,
      };

  // 対応するカードを探す
  const card = allCards?.find((c) => c.date === date);

  // 連続記録日数を取得
  const consecutiveDays = entry.consecutive_days || 0;

  // Forest Note スコアを抽出（0-100）
  const forestNoteScores = entry.forestNoteJson
    ? {
        mental: entry.forestNoteJson.scores.mental || 0,
        body: entry.forestNoteJson.scores.body || 0,
        work: entry.forestNoteJson.scores.work || 0,
        relationship: entry.forestNoteJson.scores.relationship || 0,
        money: entry.forestNoteJson.scores.money || 0,
        habit: entry.forestNoteJson.scores.habit || 0,
        dream: entry.forestNoteJson.scores.dream || 0,
      }
    : {
        mental: entry.mental || 0,
        body: entry.body || 0,
        work: entry.work || 0,
        relationship: entry.relationship || 0,
        money: entry.money || 0,
        habit: entry.habit || 0,
        dream: entry.dream || 0,
      };

  return {
    date,
    card,
    habits,
    mood: entry.mood || 0,
    energy: entry.energy || 0,
    diary: entry.text,
    workTime: entry.work_time || 0,
    consecutiveDays,
    growthReport: entry.growth_report,
    aiAdvice: entry.ai_advice,
    forestState: entry.forest_state,
    forestNoteJson: entry.forestNoteJson,
    forestNoteScores,
    cardJson: entry.cardJson,
  };
}

/**
 * 日別統計情報を計算
 */
export function calculateDayStats(dayData: DayDetailData): DayStats {
  const habitCount =
    (dayData.habits.pushups ? 1 : 0) +
    (dayData.habits.squats ? 1 : 0) +
    (dayData.habits.plank ? 1 : 0) +
    (dayData.habits.run ? 1 : 0) +
    (dayData.habits.reading ? 1 : 0) +
    (dayData.habits.ai_learning ? 1 : 0);

  const moodEmojis = ['❌', '😢', '😐', '😊', '😄', '🤩'];
  const energyEmojis = ['❌', '😴', '😒', '😐', '💪', '🔥'];

  return {
    habitCount,
    hasCard: !!dayData.card,
    hasGrowthReport: !!dayData.growthReport,
    hasAdvice: !!dayData.aiAdvice,
    forestLevel: dayData.forestState?.level || 0,
    moodEmoji: moodEmojis[dayData.mood] || '❌',
    energyEmoji: energyEmojis[dayData.energy] || '❌',
  };
}

/**
 * 気分・エネルギーの背景色を取得
 */
export function getMoodColor(mood: number): string {
  if (mood <= 1) return 'bg-red-100 border-red-300';
  if (mood <= 2) return 'bg-orange-100 border-orange-300';
  if (mood <= 3) return 'bg-yellow-100 border-yellow-300';
  if (mood <= 4) return 'bg-lime-100 border-lime-300';
  return 'bg-green-100 border-green-300';
}

export function getEnergyColor(energy: number): string {
  if (energy <= 1) return 'bg-slate-100 border-slate-300';
  if (energy <= 2) return 'bg-blue-100 border-blue-300';
  if (energy <= 3) return 'bg-cyan-100 border-cyan-300';
  if (energy <= 4) return 'bg-emerald-100 border-emerald-300';
  return 'bg-red-100 border-red-300';
}
