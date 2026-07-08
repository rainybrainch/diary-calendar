# 💭 AI 記憶システム仕様書

## 概要
過去14日間のユーザーデータを自動分析し、習慣・気分・エネルギー・睡眠パターンを検知。これに基づいて個人化された質問・成長レポート・AIアドバイスを動的に生成します。

---

## 過去データ分析（14日ウィンドウ）

### 抽出情報

| 項目 | 計算方法 | 用途 |
|-----|---------|------|
| **昨日の習慣** | 前日のチェック数 | 質問内容の個人化 |
| **週平均習慣** | 過去7日の平均 | トレンド判定 |
| **習慣トレンド** | 過去7日 vs 7-14日前 | improving/declining/stable |
| **完了習慣リスト** | 各習慣の達成率 | 質問での具体的言及 |
| **気分トレンド** | 過去7日の平均vs前7日 | 気分状態の判定 |
| **気分平均** | 過去14日の平均 | ベースライン |
| **エネルギートレンド** | 過去7日vs前7日 | エネルギー状態判定 |
| **睡眠パターン** | 気分・エネルギー低下から推定 | 休息アドバイス |
| **連続記録日数** | カレンダーから逆算 | ストリークボーナス |
| **一貫性スコア** | 習慣達成数の分散 | 継続度評価 |
| **記録済み日数** | 総記録エントリ数 | 初期段階判定 |

---

## 動的質問生成（AI 記憶連携）

### 質問パターン選定ロジック

#### **Q1: 気分質問**
```
IF 昨日の習慣 >= 4
  → 「昨日は{習慣数}個達成しました。今日の気分は？」
ELSE IF 昨日の習慣 == 0 AND 習慣トレンド == declining
  → 「昨日は習慣ができませんでしたね。今日はどうしたいですか？」
ELSE
  → 「今日の朝、気分はいかがでしたか？」
```

#### **Q2: 出来事質問**
```
IF 習慣トレンド == improving
  → 「先週より習慣が増えています。今日の良い出来事は？」
ELSE IF 習慣トレンド == declining
  → 「先週より習慣が減ってますね。今日の良いことは？」
ELSE
  → 「今日、最も印象的だった出来事は？」
```

#### **Q3: 学び質問**
```
IF 気分トレンド == declining AND エネルギートレンド == declining
  → 「ここ数日気分が低下しているようです。今日の学びは？」
ELSE
  → 「今日の学びや気づきは？」
```

#### **Q4: エネルギー質問**
```
IF 睡眠パターン == lacking
  → 「睡眠が不足ぎみのようです。からだの調子は？」
ELSE
  → 「からだの調子はどうでしたか？」
```

#### **Q5: 目標質問**
```
IF 連続記録日数 >= 7
  → 「連続{日数}日。明日の目標は？」
ELSE IF 習慣トレンド == declining
  → 「明日から再開するには、小さな目標が大事です」
ELSE
  → 「明日への目標は？」
```

---

## 成長レポート（9パターン）

### 判定ロジック

```
IF 習慣トレンド == declining AND 気分トレンド == declining
  → テンプレート: 「苦しい時期へのサポート」
  
ELSE IF エネルギートレンド == declining OR 睡眠パターン == lacking
  → テンプレート: 「休息が必要」
  
ELSE IF カード進化が近い（EXP 残り20以下）
  → テンプレート: 「進化間近」
  
ELSE IF 習慣トレンド == improving AND 気分トレンド == improving
  → テンプレート: 「好調が続く」
  
ELSE IF 連続記録 >= 21
  → テンプレート: 「長期連続達成」
  
ELSE IF 習慣達成 >= 10
  → テンプレート: 「習慣改善」
  
ELSE IF 気分トレンド == improving
  → テンプレート: 「気分改善」
  
ELSE IF 連続記録 >= 7
  → テンプレート: 「活動中」
  
ELSE
  → テンプレート: 「デフォルト励まし」
```

---

## AI アドバイス（3軸）

### 「今日へ」のアドバイス判定
```
IF 苦しい時期
  → 「小さな一歩でいい」

ELSE IF 疲れている
  → 「心地よい速度で」

ELSE IF 進化が近い
  → 「あと一頑張り」

ELSE IF 好調
  → 「流れを大切に」

ELSE
  → 「努力は積み重なる」
```

### 「明日へ」のアドバイス判定
```
IF 苦しい時期
  → 「小さなことから」

ELSE IF 連続7日以上
  → 「継続の力を信じる」

ELSE IF 習慣回復中
  → 「焦らずペースを」

ELSE IF 好調
  → 「同じペースで大丈夫」

ELSE
  → 「挑戦する姿勢が大切」
```

### 「今週へ」のアドバイス判定
```
IF 森が成長中
  → 「成長の過程を楽しむ」

ELSE IF 好調
  → 「この流れを大切に」

ELSE IF 苦しい時期
  → 「自分に優しく」

ELSE IF 14日以上の記録
  → 「2週間が完成」

ELSE
  → 「ペースを大切に」
```

---

## データ構造

```typescript
interface PastDataContext {
  // 習慣
  yesterdayHabits: number;
  weekAverageHabits: number;
  habitTrend: 'improving' | 'declining' | 'stable';
  completedHabits: string[];  // 達成した習慣名
  missingHabits: string[];    // 未達の習慣名

  // 気分・エネルギー
  yesterdayMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  moodAverage: number;
  yesterdayEnergy: number;
  energyTrend: 'improving' | 'declining' | 'stable';
  energyAverage: number;

  // 連続記録
  consecutiveDays: number;
  isOnStreak: boolean;
  longestStreak: number;

  // その他
  cardsThisWeek: number;
  cardTrend: 'improving' | 'stable' | 'low';
  recordedDays: number;
  consistencyScore: number;  // 0-100
  sleepPattern: 'good' | 'irregular' | 'lacking';
}
```

---

## 実装ファイル

| ファイル | 内容 |
|---------|------|
| `src/lib/past-data-analyzer.ts` | 過去14日分析 |
| `src/lib/ai-advice-generator.ts` | アドバイス生成 |
| `src/lib/growth-report-generator.ts` | レポート生成 |
| `src/lib/ai/context-aware-demo-ai.ts` | AIプロバイダー実装 |
| `src/hooks/useAIQuestions.ts` | 質問生成hook |

---

## パフォーマンス考慮

- **計算タイミング**: 日記保存時のみ（リアルタイムではない）
- **キャッシング**: PastDataContext を sessionStorage に保存
- **更新頻度**: 日付が変わるたびにリセット

---

## 個人化のレベル

### Level 1: 習慣ベース（即導入）
- 前日の習慣数から質問内容を変更

### Level 2: トレンド検知（現在実装）
- 7日トレンド vs 7-14日前トレンドを比較
- 改善・悪化・安定を判定

### Level 3: パターン認識（v1.4.0以降）
- 曜日パターン認識（「月曜は疲れやすい」等）
- 習慣間の相関分析（「早寝 → 朝の気分」等）

### Level 4: 予測（v1.4.0以降）
- 明日の気分・エネルギーを予測
- 習慣達成確度の予測

---

**Version**: v1.3.0  
**Last Updated**: 2026年7月8日
