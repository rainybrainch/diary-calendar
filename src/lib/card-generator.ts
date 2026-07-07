import { DiaryEntry } from './types';

export interface DiaryCard {
  date: string;
  title: string;
  attribute: 'mind' | 'body' | 'work' | 'relation' | 'money' | 'habit' | 'dream';
  rarity: 1 | 2 | 3 | 4 | 5;
  stats: {
    mind: number;
    body: number;
    work: number;
    relation: number;
    money: number;
    habit: number;
    dream: number;
  };
  habitCount: number;
  isOwner: boolean; // 本人か（裏面を見せるかの判定）
  diary?: string; // 本人だけ見える
}

const ATTRIBUTES = ['mind', 'body', 'work', 'relation', 'money', 'habit', 'dream'] as const;

export function generateCard(entry: DiaryEntry, isOwner: boolean = true): DiaryCard {
  const habitCount =
    (entry.tasks.pushups ? 1 : 0) +
    (entry.tasks.squats ? 1 : 0) +
    (entry.tasks.plank ? 1 : 0) +
    (entry.tasks.run ? 1 : 0) +
    (entry.tasks.reading ? 1 : 0) +
    (entry.tasks.ai_learning ? 1 : 0);

  const stats = {
    mind: entry.mood || 0,
    body: entry.energy || 0,
    work: entry.workTime ? Math.min(10, Math.floor(entry.workTime / 60)) : 0,
    relation: 5, // TODO: 将来的に diary_entries に relation フィールドを追加
    money: 5, // TODO: 将来的に diary_entries に money フィールドを追加
    habit: habitCount,
    dream: 5, // TODO: 将来的に diary_entries に dream フィールドを追加
  };

  // Attribute 決定：スコアが最も高い項目（同点時は優先順）
  const attribute = determineAttribute(stats);

  // Rarity 決定：習慣達成数から
  const rarity = determineRarity(habitCount);

  const dateObj = new Date(entry.date + 'T00:00:00');
  const dayOfMonth = dateObj.getDate();
  const dayName = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];

  return {
    date: entry.date,
    title: `${dayOfMonth} (${dayName})`,
    attribute,
    rarity,
    stats,
    habitCount,
    isOwner,
    diary: isOwner ? entry.text : undefined,
  };
}

function determineAttribute(
  stats: Record<string, number>
): 'mind' | 'body' | 'work' | 'relation' | 'money' | 'habit' | 'dream' {
  const priority = ['mind', 'body', 'work', 'relation', 'money', 'habit', 'dream'] as const;
  let maxScore = -1;
  let selectedAttribute: 'mind' | 'body' | 'work' | 'relation' | 'money' | 'habit' | 'dream' = priority[0];

  for (const attr of priority) {
    if (stats[attr] > maxScore) {
      maxScore = stats[attr];
      selectedAttribute = attr;
    }
  }

  return selectedAttribute;
}

function determineRarity(habitCount: number): 1 | 2 | 3 | 4 | 5 {
  if (habitCount === 0) return 1;
  if (habitCount === 1) return 2;
  if (habitCount <= 3) return 3;
  if (habitCount <= 5) return 4;
  return 5;
}

export function getAttributeColor(attribute: DiaryCard['attribute']): string {
  const colors: Record<DiaryCard['attribute'], string> = {
    mind: 'from-purple-400 to-purple-600',
    body: 'from-red-400 to-red-600',
    work: 'from-blue-400 to-blue-600',
    relation: 'from-pink-400 to-pink-600',
    money: 'from-yellow-400 to-yellow-600',
    habit: 'from-green-400 to-green-600',
    dream: 'from-indigo-400 to-indigo-600',
  };
  return colors[attribute];
}

export function getAttributeEmoji(attribute: DiaryCard['attribute']): string {
  const emojis: Record<DiaryCard['attribute'], string> = {
    mind: '🧠',
    body: '💪',
    work: '💼',
    relation: '🤝',
    money: '💰',
    habit: '⚡',
    dream: '🌟',
  };
  return emojis[attribute];
}

export function getRarityEmoji(rarity: 1 | 2 | 3 | 4 | 5): string {
  const emojis = ['☆', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐'];
  return emojis[rarity - 1];
}

export function getRarityName(rarity: 1 | 2 | 3 | 4 | 5): string {
  const names = ['common', 'rare', 'epic', 'legendary', 'legendary'];
  return names[rarity - 1];
}
