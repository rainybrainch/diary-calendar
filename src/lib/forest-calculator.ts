/**
 * 森システム計算エンジン
 * 習慣達成数・連続記録・カード数から森の成長状態を計算
 */

export interface ForestState {
  level: number; // 総合成長レベル (0-100)
  trees: number; // 木の本数
  grass: boolean; // 草が表示される
  flowers: boolean; // 花が表示される
  animals: AnimalType[]; // 動物の種類
  season: SeasonType; // 季節
  skyColor: string; // 空の色
  score: number; // 内部スコア
}

export type AnimalType = 'butterfly' | 'bird' | 'rabbit' | 'deer' | 'fox';
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * 習慣達成数・連続記録・カード数から森の状態を計算
 */
export function calculateForestState(
  habitCount: number, // 今日の習慣達成数 (0-6)
  consecutiveDays: number, // 連続記録日数
  totalCards: number // 総カード数
): ForestState {
  // スコア計算（経験値的）
  const habitScore = habitCount * 15; // 1習慣 = 15点
  const consecutiveScore = Math.floor(consecutiveDays / 7) * 20; // 7日 = 20点
  const cardScore = Math.min(totalCards * 5, 100); // カード数の上限あり
  const totalScore = habitScore + consecutiveScore + cardScore;

  // 正規化（0-100）
  const level = Math.min(Math.floor(totalScore / 5), 100);

  // 成長ステージに応じた要素の出現
  return {
    level,
    trees: calculateTrees(level),
    grass: level >= 10,
    flowers: level >= 30,
    animals: calculateAnimals(level),
    season: calculateSeason(level),
    skyColor: calculateSkyColor(level),
    score: totalScore,
  };
}

/**
 * レベルに応じた木の本数を計算
 * Level 0-15: 1 本
 * Level 16-40: 2 本
 * Level 41+: 3 本
 */
function calculateTrees(level: number): number {
  if (level < 16) return 1;
  if (level < 41) return 2;
  return 3;
}

/**
 * レベルに応じた動物を計算
 * Level 0-30: なし
 * Level 31-50: 蝶・鳥（軽い）
 * Level 51-70: 蝶・鳥・ウサギ
 * Level 71-85: 蝶・鳥・ウサギ・シカ
 * Level 86+: 蝶・鳥・ウサギ・シカ・キツネ（全種）
 */
function calculateAnimals(level: number): AnimalType[] {
  const animals: AnimalType[] = [];

  if (level >= 31) animals.push('butterfly');
  if (level >= 35) animals.push('bird');
  if (level >= 51) animals.push('rabbit');
  if (level >= 71) animals.push('deer');
  if (level >= 86) animals.push('fox');

  return animals;
}

/**
 * レベルに応じた季節を計算
 * Level 0-40: 春
 * Level 41-60: 夏
 * Level 61-80: 秋
 * Level 81+: 冬
 */
function calculateSeason(level: number): SeasonType {
  if (level < 41) return 'spring';
  if (level < 61) return 'summer';
  if (level < 81) return 'autumn';
  return 'winter';
}

/**
 * 季節に応じた空の色を計算
 */
function calculateSkyColor(level: number): string {
  const season = calculateSeason(level);

  const colors: Record<SeasonType, string> = {
    spring: '#E0F6FF', // 薄い青・春の空
    summer: '#87CEEB', // 明るい青・夏の空
    autumn: '#FFE4B5', // オレンジ・秋の空
    winter: '#D3D3D3', // グレー・冬の空
  };

  return colors[season];
}

/**
 * 季節の説明テキスト
 */
export function getSeasonLabel(season: SeasonType): string {
  const labels: Record<SeasonType, string> = {
    spring: '春🌸',
    summer: '夏☀️',
    autumn: '秋🍁',
    winter: '冬❄️',
  };
  return labels[season];
}

/**
 * 動物の説明テキストと絵文字
 */
export function getAnimalEmoji(animal: AnimalType): string {
  const emojis: Record<AnimalType, string> = {
    butterfly: '🦋',
    bird: '🐦',
    rabbit: '🐰',
    deer: '🦌',
    fox: '🦊',
  };
  return emojis[animal];
}

/**
 * 森の成長度を表示用パーセンテージに変換
 */
export function getForestProgress(level: number): string {
  return `${Math.floor((level / 100) * 100)}%`;
}
