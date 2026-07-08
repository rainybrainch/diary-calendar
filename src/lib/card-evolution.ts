/**
 * カード進化システム
 * Lv・EXP・レアリティの計算と管理
 */

export type CardRarity = 1 | 2 | 3 | 4 | 5;

export interface CardEvolutionState {
  level: number; // 1-100
  exp: number; // 累積EXP
  nextLevelExp: number; // 次のレベルまでの必要EXP
  currentLevelExp: number; // 現在レベルでの獲得EXP
  rarity: CardRarity; // 1=Normal, 2=Rare, 3=Epic, 4=Legendary
  growthRate: number; // 成長率（0-100%）
  evolvedAt?: string; // 進化日時
  isNewEvolution?: boolean; // 今日進化したか
}

export interface CardEvolutionReward {
  title: string;
  message: string;
  emoji: string;
}

/**
 * EXP テーブル
 * Level → 次のレベルまでの必要EXP
 */
const EXP_TABLE: Record<number, number> = {
  1: 10, 2: 12, 3: 14, 4: 16, 5: 18,
  6: 20, 7: 23, 8: 26, 9: 29, 10: 32,
  11: 36, 12: 40, 13: 44, 14: 48, 15: 52,
  16: 57, 17: 62, 18: 67, 19: 72, 20: 80,
  25: 100, 30: 120, 40: 150, 50: 200,
  60: 250, 70: 300, 80: 350, 90: 400, 100: 500,
};

/**
 * EXP を計算（習慣・連続記録・気分・エネルギーから）
 */
export function calculateEXPGain(
  habitCount: number, // 今日の習慣達成数（0-6）
  consecutiveDays: number, // 連続記録日数
  mood: number, // 気分（1-5）
  energy: number // エネルギー（1-5）
): number {
  let exp = 0;

  // 習慣達成数（1 = 2-3 exp）
  exp += habitCount * 3;

  // 連続記録ボーナス
  if (consecutiveDays >= 30) exp += 20;
  else if (consecutiveDays >= 14) exp += 15;
  else if (consecutiveDays >= 7) exp += 10;
  else if (consecutiveDays >= 3) exp += 5;

  // 気分ボーナス（良い気分 = EXP増）
  if (mood >= 4) exp += 5;
  else if (mood >= 3) exp += 2;

  // エネルギーボーナス
  if (energy >= 4) exp += 5;
  else if (energy >= 3) exp += 2;

  // 最小値 1、最大値 50
  return Math.max(1, Math.min(exp, 50));
}

/**
 * 現在のレベルと EXP から次のレベルを計算
 */
export function getNextLevel(
  currentLevel: number,
  currentExp: number,
  gainExp: number
): { newLevel: number; newExp: number; evolved: boolean } {
  let level = currentLevel;
  let exp = currentExp + gainExp;
  let evolved = false;

  // レベルアップロジック
  while (level < 100) {
    const nextExpRequired = getExpRequiredForNextLevel(level);

    if (exp >= nextExpRequired) {
      exp -= nextExpRequired;
      level++;
      // レアリティが上がるレベルで進化判定
      if (isEvolutionLevel(level)) {
        evolved = true;
      }
    } else {
      break;
    }
  }

  return {
    newLevel: Math.min(level, 100),
    newExp: Math.min(exp, getExpRequiredForNextLevel(level)),
    evolved,
  };
}

/**
 * レベルに必要な EXP を取得
 */
function getExpRequiredForNextLevel(level: number): number {
  if (level >= 100) return 0;

  // テーブルから取得、ない場合は補間
  if (EXP_TABLE[level]) {
    return EXP_TABLE[level];
  }

  // 線形補間（不足分）
  const baseExp = EXP_TABLE[Math.floor(level / 5) * 5] || 50;
  const nextExp = EXP_TABLE[Math.floor(level / 5) * 5 + 5] || 100;
  const ratio = (level % 5) / 5;

  return Math.floor(baseExp + (nextExp - baseExp) * ratio);
}

/**
 * 進化判定レベル
 */
function isEvolutionLevel(level: number): boolean {
  return [10, 30, 60, 100].includes(level);
}

/**
 * レベルからレアリティを計算
 * Lv 1-9: Normal (1)
 * Lv 10-29: Rare (2)
 * Lv 30-59: Epic (3)
 * Lv 60-99: Legendary (4)
 * Lv 100: Mythic (5)
 */
export function calculateRarityFromLevel(level: number): CardRarity {
  if (level >= 100) return 5;
  if (level >= 60) return 4;
  if (level >= 30) return 3;
  if (level >= 10) return 2;
  return 1;
}

/**
 * カード進化状態を生成
 */
export function createCardEvolutionState(
  level: number = 1,
  exp: number = 0,
  lastRarity?: CardRarity
): CardEvolutionState {
  const rarity = calculateRarityFromLevel(level);
  const nextLevelExp = getExpRequiredForNextLevel(level);
  const evolved = lastRarity !== undefined && lastRarity < rarity;

  return {
    level: Math.min(level, 100),
    exp: Math.min(exp, nextLevelExp),
    nextLevelExp,
    currentLevelExp: exp,
    rarity,
    growthRate: level,
    evolvedAt: evolved ? new Date().toISOString() : undefined,
    isNewEvolution: evolved,
  };
}

/**
 * EXP を付与してカード進化状態を更新
 */
export function addExpToCard(
  currentState: CardEvolutionState,
  gainExp: number
): CardEvolutionState {
  const { newLevel, newExp, evolved } = getNextLevel(
    currentState.level,
    currentState.exp,
    gainExp
  );

  const nextLevelExp = getExpRequiredForNextLevel(newLevel);
  const newRarity = calculateRarityFromLevel(newLevel);

  return {
    level: newLevel,
    exp: newExp,
    nextLevelExp,
    currentLevelExp: newExp,
    rarity: newRarity,
    growthRate: newLevel,
    evolvedAt: evolved ? new Date().toISOString() : currentState.evolvedAt,
    isNewEvolution: evolved,
  };
}

/**
 * 進化時の報酬メッセージ
 */
export function getEvolutionReward(newRarity: CardRarity): CardEvolutionReward | null {
  const rewards: Record<CardRarity, CardEvolutionReward> = {
    1: { title: 'Normal', message: 'Normal カード', emoji: '⭐' },
    2: {
      title: '✨ Rare へ進化！',
      message: 'レアリティが上がり、カードが輝き始めました',
      emoji: '💫',
    },
    3: {
      title: '🌟 Epic へ進化！',
      message: 'カードの力が大きく増幅されました',
      emoji: '⚡',
    },
    4: {
      title: '👑 Legendary へ進化！',
      message: 'あなたの継続が伝説へ。素晴らしい成長です',
      emoji: '🎉',
    },
    5: {
      title: '✨ Mythic へ進化！',
      message: 'これは伝説を超えた境地。あなたの決意の結晶です',
      emoji: '🌈',
    },
  };

  if (newRarity === 1) return null; // Normal は進化メッセージなし

  return rewards[newRarity];
}

/**
 * レアリティ表示用の情報
 */
export function getRarityInfo(rarity: CardRarity): {
  name: string;
  color: string;
  emoji: string;
  description: string;
} {
  const rarities = {
    1: {
      name: 'Normal',
      color: 'gray',
      emoji: '⭐',
      description: '普通のカード',
    },
    2: {
      name: 'Rare',
      color: 'blue',
      emoji: '💫',
      description: 'レアなカード',
    },
    3: {
      name: 'Epic',
      color: 'purple',
      emoji: '⚡',
      description: 'エピックなカード',
    },
    4: {
      name: 'Legendary',
      color: 'yellow',
      emoji: '👑',
      description: '伝説のカード',
    },
    5: {
      name: 'Mythic',
      color: 'rainbow',
      emoji: '🌈',
      description: '神話級のカード',
    },
  };

  return rarities[rarity];
}
