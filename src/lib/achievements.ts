/**
 * 実績システム
 * バッジ・称号・解除ロジック
 */

export type BadgeCategory = 'streak' | 'habits' | 'cardEvolution' | 'forestGrowth' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  unlockedAt?: string; // ISO timestamp
  requirement?: {
    type: 'streak' | 'habitCount' | 'cardLevel' | 'forestLevel' | 'special';
    value: number;
  };
}

export interface Title {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirementType: 'achievementCount' | 'streakDays' | 'cardLevel';
  requirementValue: number;
  unlockedAt?: string;
}

export interface AchievementState {
  unlockedAchievements: Achievement[];
  equippedTitle?: Title;
  totalAchievements: number;
  newlyUnlocked?: Achievement[]; // 今回ロック解除されたもの
}

/**
 * すべての実績定義
 */
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // ストリーク実績
  {
    id: 'streak_3',
    name: '3日連続',
    description: '3日間連続で記録',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_7',
    name: '1週間',
    description: '7日間連続で記録',
    icon: '🔥🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_14',
    name: '2週間',
    description: '14日間連続で記録',
    icon: '🔥🔥🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 14 },
  },
  {
    id: 'streak_30',
    name: '1ヶ月',
    description: '30日間連続で記録',
    icon: '🔥🔥🔥🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'streak_100',
    name: '100日の伝説',
    description: '100日間連続で記録',
    icon: '👑',
    category: 'streak',
    requirement: { type: 'streak', value: 100 },
  },

  // 習慣実績
  {
    id: 'habits_10',
    name: '習慣マスター',
    description: '習慣を10回達成',
    icon: '⚡',
    category: 'habits',
    requirement: { type: 'habitCount', value: 10 },
  },
  {
    id: 'habits_50',
    name: '習慣の達人',
    description: '習慣を50回達成',
    icon: '⚡⚡',
    category: 'habits',
    requirement: { type: 'habitCount', value: 50 },
  },
  {
    id: 'habits_100',
    name: '習慣の王',
    description: '習慣を100回達成',
    icon: '⚡⚡⚡',
    category: 'habits',
    requirement: { type: 'habitCount', value: 100 },
  },

  // カード進化実績
  {
    id: 'card_rare',
    name: 'Rare カード',
    description: 'カードが Rare に進化',
    icon: '💫',
    category: 'cardEvolution',
    requirement: { type: 'cardLevel', value: 10 },
  },
  {
    id: 'card_epic',
    name: 'Epic カード',
    description: 'カードが Epic に進化',
    icon: '⚡',
    category: 'cardEvolution',
    requirement: { type: 'cardLevel', value: 30 },
  },
  {
    id: 'card_legendary',
    name: 'Legendary カード',
    description: 'カードが Legendary に進化',
    icon: '👑',
    category: 'cardEvolution',
    requirement: { type: 'cardLevel', value: 60 },
  },
  {
    id: 'card_mythic',
    name: 'Mythic カード',
    description: 'カードが最高レアリティに',
    icon: '🌈',
    category: 'cardEvolution',
    requirement: { type: 'cardLevel', value: 100 },
  },

  // 森の成長実績
  {
    id: 'forest_growing',
    name: '森が育ち始めた',
    description: '森が Level 10 に',
    icon: '🌱',
    category: 'forestGrowth',
    requirement: { type: 'forestLevel', value: 10 },
  },
  {
    id: 'forest_flourish',
    name: '森が繁茂した',
    description: '森が Level 30 に',
    icon: '🌿',
    category: 'forestGrowth',
    requirement: { type: 'forestLevel', value: 30 },
  },
  {
    id: 'forest_magnificent',
    name: '壮大な森',
    description: '森が Level 60 に',
    icon: '🌳',
    category: 'forestGrowth',
    requirement: { type: 'forestLevel', value: 60 },
  },
  {
    id: 'forest_eternal',
    name: '永遠の森',
    description: '森が最高に成長',
    icon: '🌲',
    category: 'forestGrowth',
    requirement: { type: 'forestLevel', value: 100 },
  },

  // スペシャル実績
  {
    id: 'special_first_card',
    name: '最初のカード',
    description: '初めてカードを生成',
    icon: '🎴',
    category: 'special',
    requirement: { type: 'special', value: 1 },
  },
];

/**
 * すべての称号定義
 */
export const ALL_TITLES: Title[] = [
  {
    id: 'title_starter',
    name: '駆け出し',
    description: '実績を5個解除',
    icon: '🌱',
    requirementType: 'achievementCount',
    requirementValue: 5,
  },
  {
    id: 'title_growing',
    name: '成長中',
    description: '実績を15個解除',
    icon: '🌿',
    requirementType: 'achievementCount',
    requirementValue: 15,
  },
  {
    id: 'title_master',
    name: 'マスター',
    description: '実績を25個解除',
    icon: '👑',
    requirementType: 'achievementCount',
    requirementValue: 25,
  },
  {
    id: 'title_legend',
    name: '伝説',
    description: 'すべての実績を解除',
    icon: '🌟',
    requirementType: 'achievementCount',
    requirementValue: ALL_ACHIEVEMENTS.length,
  },
];

/**
 * 実績を判定して解除
 */
export function checkAchievements(
  unlockedAchievements: Achievement[],
  streakDays: number,
  habitCount: number,
  cardLevel: number,
  forestLevel: number
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));

  for (const achievement of ALL_ACHIEVEMENTS) {
    // 既にロック済みをスキップ
    if (unlockedIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    if (achievement.requirement?.type === 'streak') {
      shouldUnlock = streakDays >= achievement.requirement.value;
    } else if (achievement.requirement?.type === 'habitCount') {
      shouldUnlock = habitCount >= achievement.requirement.value;
    } else if (achievement.requirement?.type === 'cardLevel') {
      shouldUnlock = cardLevel >= achievement.requirement.value;
    } else if (achievement.requirement?.type === 'forestLevel') {
      shouldUnlock = forestLevel >= achievement.requirement.value;
    }

    if (shouldUnlock) {
      newlyUnlocked.push({
        ...achievement,
        unlockedAt: new Date().toISOString(),
      });
      unlockedIds.add(achievement.id);
    }
  }

  return newlyUnlocked;
}

/**
 * 称号を判定
 */
export function checkTitles(
  unlockedTitles: Title[],
  achievementCount: number
): Title[] {
  const newlyUnlocked: Title[] = [];
  const unlockedIds = new Set(unlockedTitles.map((t) => t.id));

  for (const title of ALL_TITLES) {
    if (unlockedIds.has(title.id)) continue;

    let shouldUnlock = false;

    if (title.requirementType === 'achievementCount') {
      shouldUnlock = achievementCount >= title.requirementValue;
    }

    if (shouldUnlock) {
      newlyUnlocked.push({
        ...title,
        unlockedAt: new Date().toISOString(),
      });
      unlockedIds.add(title.id);
    }
  }

  return newlyUnlocked;
}

/**
 * ローカルストレージから実績状態を取得
 */
export function loadAchievementState(): AchievementState {
  try {
    const stored = localStorage.getItem('achievementState');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load achievement state:', error);
  }

  return {
    unlockedAchievements: [],
    equippedTitle: undefined,
    totalAchievements: ALL_ACHIEVEMENTS.length,
  };
}

/**
 * ローカルストレージに実績状態を保存
 */
export function saveAchievementState(state: AchievementState): void {
  try {
    localStorage.setItem('achievementState', JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save achievement state:', error);
  }
}
