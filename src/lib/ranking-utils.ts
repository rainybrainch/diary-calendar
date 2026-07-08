import { DiaryEntry } from './types';

export interface RankingUser {
  userId: string;
  username: string;
  displayName: string;
  score: number;
  rank: number;
  continuousDays: number;
  entries: DiaryEntry[];
}

export function calculateDailyScore(entries: DiaryEntry[]): number {
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find((e) => e.date === today);

  if (!todayEntry) return 0;

  const habitCount =
    (todayEntry.tasks.pushups ? 1 : 0) +
    (todayEntry.tasks.squats ? 1 : 0) +
    (todayEntry.tasks.plank ? 1 : 0) +
    (todayEntry.tasks.run ? 1 : 0) +
    (todayEntry.tasks.reading ? 1 : 0) +
    (todayEntry.tasks.ai_learning ? 1 : 0);

  return habitCount;
}

export function calculateWeeklyScore(entries: DiaryEntry[]): number {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  let total = 0;
  for (const entry of entries) {
    const entryDate = new Date(entry.date);
    if (entryDate >= weekAgo && entryDate <= today) {
      const habitCount =
        (entry.tasks.pushups ? 1 : 0) +
        (entry.tasks.squats ? 1 : 0) +
        (entry.tasks.plank ? 1 : 0) +
        (entry.tasks.run ? 1 : 0) +
        (entry.tasks.reading ? 1 : 0) +
        (entry.tasks.ai_learning ? 1 : 0);

      total += habitCount;
    }
  }
  return total;
}

export function calculateMonthlyScore(entries: DiaryEntry[]): number {
  const today = new Date();
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  let total = 0;
  for (const entry of entries) {
    const entryDate = new Date(entry.date);
    if (entryDate >= monthAgo && entryDate <= today) {
      const habitCount =
        (entry.tasks.pushups ? 1 : 0) +
        (entry.tasks.squats ? 1 : 0) +
        (entry.tasks.plank ? 1 : 0) +
        (entry.tasks.run ? 1 : 0) +
        (entry.tasks.reading ? 1 : 0) +
        (entry.tasks.ai_learning ? 1 : 0);

      total += habitCount;
    }
  }
  return total;
}

export function calculateContinuousDays(entries: DiaryEntry[]): number {
  if (entries.length === 0) return 0;

  const sorted = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let continuous = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor(
      (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === continuous) {
      const habitCount =
        (entry.tasks.pushups ? 1 : 0) +
        (entry.tasks.squats ? 1 : 0) +
        (entry.tasks.plank ? 1 : 0) +
        (entry.tasks.run ? 1 : 0) +
        (entry.tasks.reading ? 1 : 0) +
        (entry.tasks.ai_learning ? 1 : 0);

      if (habitCount > 0) {
        continuous++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return continuous;
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}
