# 🏆 実績システム仕様書

## 概要
ユーザーの継続と成長を可視化する実績システム。25個のバッジと4段階の称号を組み合わせて、達成感を最大化します。

---

## バッジシステム（25個）

### 🔥 ストリーク実績（5個）

| ID | 名前 | 条件 | アイコン | 説明 |
|---|------|------|--------|------|
| `streak_3` | 3日連続 | 連続3日 | 🔥 | 習慣の始まり |
| `streak_7` | 1週間 | 連続7日 | 🔥🔥 | 習慣の定着化 |
| `streak_14` | 2週間 | 連続14日 | 🔥🔥🔥 | 安定期到達 |
| `streak_30` | 1ヶ月 | 連続30日 | 🔥🔥🔥🔥 | 大きなマイルストーン |
| `streak_100` | 100日の伝説 | 連続100日 | 👑 | 終極目標 |

### ⚡ 習慣達成実績（3個）

| ID | 名前 | 条件 | アイコン |
|---|------|------|--------|
| `habits_10` | 習慣マスター | 10回達成 | ⚡ |
| `habits_50` | 習慣の達人 | 50回達成 | ⚡⚡ |
| `habits_100` | 習慣の王 | 100回達成 | ⚡⚡⚡ |

### 💫 カード進化実績（4個）

| ID | 名前 | 条件 | アイコン | レアリティ |
|---|------|------|--------|---------|
| `card_rare` | Rare カード | Lv 10 | 💫 | Rare |
| `card_epic` | Epic カード | Lv 30 | ⚡ | Epic |
| `card_legendary` | Legendary | Lv 60 | 👑 | Legendary |
| `card_mythic` | Mythic カード | Lv 100 | 🌈 | Mythic |

### 🌳 森の成長実績（4個）

| ID | 名前 | 条件 | アイコン |
|---|------|------|--------|
| `forest_growing` | 森が育ち始めた | Lv 10 | 🌱 |
| `forest_flourish` | 森が繁茂した | Lv 30 | 🌿 |
| `forest_magnificent` | 壮大な森 | Lv 60 | 🌳 |
| `forest_eternal` | 永遠の森 | Lv 100 | 🌲 |

### ✨ スペシャル実績（1個）

| ID | 名前 | 条件 |
|---|------|------|
| `special_first_card` | 最初のカード | 初回カード生成 |

---

## 称号システム（4段階）

| 段階 | 称号 | 必要数 | アイコン | 説明 |
|---|----|-------|--------|------|
| 1 | 駆け出し | 実績5個 | 🌱 | 最初の成長 |
| 2 | 成長中 | 実績15個 | 🌿 | 確かな歩み |
| 3 | マスター | 実績25個 | 👑 | 達成者 |
| 4 | 伝説 | 全25個 | 🌟 | 完全制覇 |

---

## 解除ロジック

### 判定タイミング
- **毎回の日記保存時**
- **ホーム画面読み込み時**
- **useAchievements hook で定期実行**

### 判定対象
```typescript
checkAchievements(
  previousAchievements,  // 既に解除済みの実績
  streakDays,            // 連続記録日数
  habitCount,            // 習慣達成数（累計）
  cardLevel,             // カード最高レベル
  forestLevel            // 森の最高レベル
)
```

### 解除フロー
1. すべてのバッジを判定
2. 未解除のバッジから条件に合致するものを抽出
3. localStorage に追加
4. 称号も再判定
5. AchievementUnlockedAnimation トリガー

---

## UI/UX

### 解除演出
```
┌─────────────────────────────┐
│     🏆  実績解除！            │  ← バウンスイン
│                              │
│    【大きなアイコン】         │  ← パルス効果
│    実績名                    │
│    説明文（1-2行）           │
│                              │
│  ● ● ● ○ ○              │  ← プログレス
│                              │
│  ✨ ✨ ✨                 │  ← パーティクル
└─────────────────────────────┘
```

**表示時間**: 各実績 2.5秒  
**複数解除時**: 順次表示（例: 3個なら 7.5秒）

### ホーム画面（コンパクト）
- 最新3個の実績アイコン
- 装備中の称号
- 進捗率（5/25等）

### 専用ページ（フル）
- すべてのバッジ表示（解除済み:緑背景、未解除:グレー）
- カテゴリ別集計
- 進捗バー
- 次の目標表示
- 統計情報

---

## データ構造

```typescript
interface Achievement {
  id: string;           // 一意のID
  name: string;         // 「3日連続」等
  description: string;  // 説明文
  icon: string;         // 絵文字
  category: BadgeCategory;  // streak|habits|cardEvolution|forestGrowth|special
  unlockedAt?: string;  // ISO timestamp
  requirement?: {
    type: string;
    value: number;
  };
}

interface AchievementState {
  unlockedAchievements: Achievement[];  // 解除済み
  equippedTitle?: Title;                // 現在の称号
  totalAchievements: number;            // 全数（25）
  newlyUnlocked?: Achievement[];        // 新規（表示用）
}
```

---

## データ永続化

### localStorage
```javascript
localStorage.setItem('achievementState', JSON.stringify({
  unlockedAchievements: [...],
  equippedTitle: {...},
  totalAchievements: 25
}));
```

### 同期
- Demo Mode: localStorage のみ
- 本番 Mode: Supabase `user_achievements` テーブル

---

## 実装ファイル

| ファイル | 内容 |
|---------|------|
| `src/lib/achievements.ts` | 定義・判定ロジック |
| `src/hooks/useAchievements.ts` | 管理 hook |
| `src/components/AchievementUnlockedAnimation.tsx` | 解除演出 |
| `src/components/AchievementsPanel.tsx` | 表示パネル |
| `src/app/achievements/page.tsx` | 専用ページ |

---

**Version**: v1.3.0  
**Last Updated**: 2026年7月8日
