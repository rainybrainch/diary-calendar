/**
 * 成長レポート生成エンジン
 * 保存直後にユーザーの成長を認識するコメントを生成
 * 寄り添う口調・2-3行で読みやすく
 */

import { PastDataContext } from './past-data-analyzer';

export interface GrowthReport {
  title: string; // タイトル（「今週の成長」など）
  messages: string[]; // 2-3 行のメッセージ配列
  emoji: string; // リアクション絵文字
  tone: 'encouraging' | 'celebrating' | 'supportive' | 'motivating';
}

/**
 * 過去データに基づいて成長レポートを生成
 */
export function generateGrowthReport(pastContext: PastDataContext): GrowthReport {
  // 最優先の観点から選ぶ（複数が当てはまる場合は優先度順）

  // 1. 長期連続記録の達成
  if (pastContext.consecutiveDays >= 21) {
    return generateStreakCelebration(pastContext.consecutiveDays);
  }

  // 2. 習慣の明らかな改善
  if (pastContext.habitTrend === 'improving' && pastContext.weekAverageHabits >= 3) {
    return generateHabitImprovement(pastContext);
  }

  // 3. 気分の改善（メンタルヘルス）
  if (pastContext.moodTrend === 'improving' && pastContext.moodAverage >= 3.5) {
    return generateMoodImprovement(pastContext);
  }

  // 4. 連続記録が続いている（7日以上）
  if (pastContext.isOnStreak && pastContext.consecutiveDays >= 7) {
    return generateStreakEncouragement(pastContext.consecutiveDays);
  }

  // 5. 森の成長
  if (pastContext.consistencyScore >= 60) {
    return generateForestGrowth(pastContext.consistencyScore);
  }

  // 6. エネルギーが安定している
  if (pastContext.energyTrend === 'stable' || pastContext.energyTrend === 'improving') {
    return generateEnergyStability(pastContext);
  }

  // 7. 落ち込み時のサポート
  if (pastContext.habitTrend === 'declining') {
    return generateSupportiveDeclining(pastContext);
  }

  // 8. 初期段階のサポート
  if (pastContext.recordedDays < 7) {
    return generateEarlyStageSupport();
  }

  // 9. デフォルト励まし
  return generateDefaultEncouragement();
}

/**
 * 長期連続記録の達成を祝う
 */
function generateStreakCelebration(days: number): GrowthReport {
  const messages = [
    `素晴らしい！${days}日も継続されています。`,
    `その継続力があれば、どんな目標も達成できます。`,
    `毎日の積み重ねが、確実にあなたを変えています。`,
  ];

  return {
    title: '🏆 継続の力',
    messages: messages.slice(0, 3),
    emoji: '🎉',
    tone: 'celebrating',
  };
}

/**
 * 習慣の改善を認める
 */
function generateHabitImprovement(context: PastDataContext): GrowthReport {
  const improvementPercent = Math.round((context.weekAverageHabits / 6) * 100);
  const habits = context.completedHabits.length > 0
    ? `${context.completedHabits.slice(0, 2).join('・')}など`
    : '習慣';

  const messages = [
    `先週より習慣が増えています。${habits}の達成が増えてますね。`,
    `その積み重ねが確実に習慣化してきています。`,
    `このペースを続けると、もっと大きな変化が起こります。`,
  ];

  return {
    title: '📈 習慣の向上',
    messages: messages.slice(0, 3),
    emoji: '📊',
    tone: 'encouraging',
  };
}

/**
 * 気分の改善を認める
 */
function generateMoodImprovement(context: PastDataContext): GrowthReport {
  const messages = [
    `ここ数日、気分が良くなってきているようですね。`,
    `その良い状態を保つことが、さらなる成長につながります。`,
    `あなたの工夫と努力が、確実に実を結んでいます。`,
  ];

  return {
    title: '😊 気分の向上',
    messages: messages.slice(0, 3),
    emoji: '🌈',
    tone: 'encouraging',
  };
}

/**
 * 連続記録を続けていることを励ます
 */
function generateStreakEncouragement(days: number): GrowthReport {
  const messages = [
    `${days}日連続で記録されています。`,
    `毎日続けることの難しさを知っているからこそ、その価値が分かります。`,
    `今のペースを大切にしてください。その先に大きな成長があります。`,
  ];

  return {
    title: '⭐ 継続中',
    messages: messages.slice(0, 3),
    emoji: '✨',
    tone: 'motivating',
  };
}

/**
 * 森の成長を喜ぶ
 */
function generateForestGrowth(consistencyScore: number): GrowthReport {
  const messages = [
    `あなたの森が、着実に育ってきています。`,
    `${Math.round(consistencyScore)}%の記録率が、その証です。`,
    `毎日の一歩が、大きな力になっています。`,
  ];

  return {
    title: '🌲 森の成長',
    messages: messages.slice(0, 3),
    emoji: '🌱',
    tone: 'encouraging',
  };
}

/**
 * エネルギーが安定していることを認める
 */
function generateEnergyStability(context: PastDataContext): GrowthReport {
  const messages = [
    `最近、エネルギーが安定してきているようですね。`,
    `その安定感が、日々の行動の質を高めています。`,
    `自分のペースを大切に、続けてください。`,
  ];

  return {
    title: '⚡ 安定',
    messages: messages.slice(0, 3),
    emoji: '💫',
    tone: 'supportive',
  };
}

/**
 * 落ち込み時の寄り添うサポート
 */
function generateSupportiveDeclining(context: PastDataContext): GrowthReport {
  const messages = [
    `最近、習慣が減ってしまっているようですね。`,
    `でも、こうして日記を書いているあなたは、確実に立ち向かっています。`,
    `無理のない範囲で、また一歩ずつ始めましょう。`,
  ];

  return {
    title: '💚 大切に',
    messages: messages.slice(0, 3),
    emoji: '🤝',
    tone: 'supportive',
  };
}

/**
 * 初期段階のサポート
 */
function generateEarlyStageSupport(): GrowthReport {
  const messages = [
    `記録を始めていただき、ありがとうございます。`,
    `最初の一歩が、最も大切です。`,
    `毎日のこの小さな行動が、大きな変化を生み出します。`,
  ];

  return {
    title: '🌱 始まり',
    messages: messages.slice(0, 3),
    emoji: '🌟',
    tone: 'encouraging',
  };
}

/**
 * デフォルト励まし
 */
function generateDefaultEncouragement(): GrowthReport {
  const messages = [
    `今日もお疲れさまでした。`,
    `毎日、こうして記録を続けるあなたは素晴らしいです。`,
    `その習慣が、確実にあなたを成長させています。`,
  ];

  return {
    title: '✨ お疲れさま',
    messages: messages.slice(0, 3),
    emoji: '🙏',
    tone: 'supportive',
  };
}
