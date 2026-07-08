/**
 * AI アドバイス生成エンジン
 * 過去データ・成長・カード・森の状態をもとに
 * 寄り添う口調での「今日・明日・今週」のアドバイスを生成
 */

import { PastDataContext } from './past-data-analyzer';
import { CardEvolutionState } from './card-evolution';
import { ForestState } from './forest-calculator';

export interface AIAdvice {
  today: string; // 今日へのアドバイス（2-3行）
  tomorrow: string; // 明日へのアドバイス（2-3行）
  thisWeek: string; // 今週へのアドバイス（2-3行）
}

/**
 * AI アドバイスを生成
 * 全情報を統合して個人化されたアドバイスを返す
 */
export function generateAIAdvice(
  pastContext: PastDataContext,
  cardEvolution?: CardEvolutionState,
  forestState?: ForestState
): AIAdvice {
  // 状況分析
  const situation = analyzeSituation(pastContext, cardEvolution, forestState);

  // 3軸のアドバイスを生成
  const today = generateTodayAdvice(pastContext, situation);
  const tomorrow = generateTomorrowAdvice(pastContext, situation);
  const thisWeek = generateThisWeekAdvice(pastContext, situation);

  return {
    today,
    tomorrow,
    thisWeek,
  };
}

interface Situation {
  isHighMomentum: boolean; // 好調期か
  isSuffering: boolean; // 苦しい時期か
  needsRest: boolean; // 休息が必要か
  hasStreak: boolean; // 連続記録中か
  cardIsClose: boolean; // カード進化が近いか
  forestGrowing: boolean; // 森が育ちつつあるか
  habitPattern: 'consistent' | 'irregular' | 'recovering';
}

/**
 * 現在の状況を分析
 */
function analyzeSituation(
  pastContext: PastDataContext,
  cardEvolution?: CardEvolutionState,
  forestState?: ForestState
): Situation {
  const isHighMomentum =
    pastContext.habitTrend === 'improving' &&
    pastContext.moodTrend === 'improving';

  const isSuffering =
    pastContext.habitTrend === 'declining' &&
    pastContext.moodTrend === 'declining';

  const needsRest =
    pastContext.energyTrend === 'declining' ||
    pastContext.sleepPattern === 'lacking';

  const hasStreak = pastContext.isOnStreak && pastContext.consecutiveDays >= 7;

  const cardIsClose =
    cardEvolution ? cardEvolution.nextLevelExp - cardEvolution.exp <= 20 : false;

  const forestGrowing = forestState ? forestState.level >= 30 : false;

  const habitPattern =
    pastContext.habitTrend === 'improving'
      ? 'consistent'
      : pastContext.habitTrend === 'declining'
        ? 'recovering'
        : 'irregular';

  return {
    isHighMomentum,
    isSuffering,
    needsRest,
    hasStreak,
    cardIsClose,
    forestGrowing,
    habitPattern,
  };
}

/**
 * 今日へのアドバイス
 */
function generateTodayAdvice(pastContext: PastDataContext, situation: Situation): string {
  if (situation.isSuffering) {
    return `今日は無理をしないでください。
小さな一歩でいいんです。
それがあなたを前に進める力になります。`;
  }

  if (situation.needsRest) {
    return `からだが疲れているようですね。
今日は無理なく、心地よい速度で過ごしてください。
休むことも成長の一部です。`;
  }

  if (situation.cardIsClose) {
    return `カード進化があともう少し！
今日のあと一頑張りで、新しいレアリティに到達できます。
楽しみながら進みましょう。`;
  }

  if (situation.isHighMomentum) {
    return `好調が続いていますね。
その流れを大切にしながら、今日も無理なく続けてください。
毎日の積み重ねがあなたを変えています。`;
  }

  return `今日もお疲れさまでした。
どんな一日だったにせよ、あなたの努力は確実に積み重なっています。
明日も一緒に進みましょう。`;
}

/**
 * 明日へのアドバイス
 */
function generateTomorrowAdvice(pastContext: PastDataContext, situation: Situation): string {
  if (situation.isSuffering) {
    return `明日は、今できる小さなことから始めてください。
完璧を目指さなくていい。
その小さな行動が、新しい流れを作ります。`;
  }

  if (situation.hasStreak) {
    return `明日で連続記録がさらに延びます。
その継続の力を信じて。
無理なく、でも確実に、一日を積み重ねましょう。`;
  }

  if (situation.habitPattern === 'recovering') {
    return `明日から、少しずつ習慣を取り戻してください。
1つか2つの習慣からでいい。
焦らず、自分のペースを大切にしてください。`;
  }

  if (situation.isHighMomentum) {
    return `明日も同じペースで大丈夫。
今のあなたなら、できます。
その調子で、続けてください。`;
  }

  return `明日も、今日のあなたを応援しています。
どんな結果になっても、挑戦する姿勢が大切です。
明日もお待ちしています。`;
}

/**
 * 今週へのアドバイス
 */
function generateThisWeekAdvice(pastContext: PastDataContext, situation: Situation): string {
  if (situation.forestGrowing) {
    return `今週は、あなたの森が大きく育つ週になりそうです。
その成長の過程を楽しんでください。
毎日を積み重ねることで、自分の世界が広がっていきます。`;
  }

  if (situation.isHighMomentum) {
    return `この流れを大切にしてください。
好調なときだからこそ、無理なく続けることが大事です。
今週も、毎日の積み重ねを信じましょう。`;
  }

  if (situation.isSuffering) {
    return `今週は、自分に優しくしてください。
落ち込んでいても、ここまで来たあなたは強いです。
小さな変化を大切にして、週を終えましょう。`;
  }

  if (pastContext.recordedDays >= 12) {
    return `今週で2週間の記録が完成します。
その継続を自分で褒めてあげてください。
毎日の力を感じながら、週を過ごしてください。`;
  }

  return `今週も、あなたのペースを大切にしてください。
結果ではなく、続けること。
その姿勢が、本当の強さになります。`;
}
