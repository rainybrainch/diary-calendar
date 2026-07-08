# 🤖 Forest Note AI 機能ガイド

Forest Note v1.2.0 の AI 統合機能について、詳しく説明します。

---

## 📖 目次

1. [AI 機能の概要](#ai-機能の概要)
2. [質問チャットの使い方](#質問チャットの使い方)
3. [要約生成の使い方](#要約生成の使い方)
4. [AI カード統合](#ai-カード統合)
5. [Demo AI と Production AI](#demo-ai-と-production-ai)
6. [環境変数の設定](#環境変数の設定)

---

## AI 機能の概要

### 目的

ユーザーがテキストを書くだけで、AI が以下を自動化：
- 質問を通じた深掘り（思考の整理）
- タイトル・要約・タグの自動生成
- カード情報の自動入力（編集可能）

### 実現されるメリット

| 段階 | メリット |
|------|---------|
| **入力後** | Forest Note 形式のテキスト完成 |
| **質問チャット** | 回答を通じて思考が整理される |
| **要約生成** | AI がタイトル・タグを提案 |
| **カード作成** | すべての情報が自動反映される |

---

## 質問チャットの使い方

### 基本フロー

```
1️⃣ /input/paste でテキスト入力
   ↓
2️⃣ プレビューが成功したら「💭 AI 質問チャット」ボタンクリック
   ↓
3️⃣ /input/ai-questions で 5 つの質問に答える
   ↓
4️⃣ 必要に応じてフォローアップ質問に答える（最大3回）
   ↓
5️⃣「要約を見る」で /input/ai-summary へ
```

### 5 つの質問

1. **気分スコア** (1-5 段階)
   - 朝の気分をスコアリング
   - カード統計の「MIND」に反映

2. **最も印象的だった出来事** (テキスト)
   - 日中で最も記憶に残ったこと
   - 要約生成の素材になる

3. **学びや気づき** (テキスト)
   - その日得た学習・洞察
   - 要約・タグ生成の重要な情報源

4. **体調スコア** (1-5 段階)
   - からだの調子を評価
   - カード統計の「BODY」に反映

5. **明日への目標** (テキスト)
   - 翌日に向けた目標・宣言
   - AI がタグ候補を提案

### フォローアップ質問

質問に答えた後、AI が自動的に追加質問を提案：

```
フォローアップ1: 「その時のお気持ちをもう少し詳しく教えていただけますか？」
フォローアップ2: 「それが自分にどのような影響をもたらしそうですか？」
フォローアップ3: 「そのために明日できることは何ですか？」
```

**スキップ可能**: 不要な場合は「要約を見る」で即座に次へ。

### 進捗表示

- **プログレスバー** - 現在地 / 全体を視覚化
- **質問カウント** - 「現在 2/5」のように表示
- **戻るボタン** - 前の質問に戻る可能

---

## 要約生成の使い方

### 画面構成

```
[✨ タイトル]
 ↓ 編集可（テキスト入力）
 
[📝 要約]
 ↓ 編集可（テキストエリア）
 
[🎨 属性] [😊 気分] [⚡ エネルギー]
 ↓ 選択・スライダー操作
 
[🏷️ タグ]
 ↓ 追加・削除可能（最大8個）
 
[📸 カードを確認]
 ↓ 確認ページへ
```

### 各フィールドの編集方法

#### タイトル（編集可）
- AI の提案: 「07 (月) - 今日の成長」のような形式
- 手動編集: 「✏️ 編集」ボタンで変更可
- タイトルの使用範囲: カード表面に反映

#### 要約（編集可）
- AI の提案: 質問の回答から自動生成
- 編集: テキストエリアに直入力可
- 文字数制限: なし（カード背面に表示）

#### 属性（7種類から選択）
```
🧠 mind    (メンタル・思考・感情)
💪 body    (体力・健康・体調)
💼 work    (仕事・成果・活動)
👥 relation (人間関係・繋がり)
💰 money   (経済・支出・収入)
🎯 habit   (習慣・継続・成長)
🌟 dream   (夢・目標・ビジョン)
```
- **選択方法**: ボタンをタップで選択
- **カードへの反映**: 属性の色がカードの背景グラデーションに反映

#### 気分・エネルギー（1-5 段階）
- **気分** - 朝の気分質問のスコア（または再設定可）
- **エネルギー** - 体調質問のスコア（または再設定可）
- **カードへの反映**: カード統計値に反映

#### タグ（3～8個）
```
タグ例: ["日常", "学び", "成長", "感動", "つながり"]
```

**操作**:
- **追加**: 入力欄に入力 → 「+」ボタンまたは Enter キー
- **削除**: タグ上の「✕」ボタンをクリック
- **制限**: 最大 8 個（超過時は「+」が無効化）
- **編集**: 削除 → 再追加で実質編集可

---

## AI カード統合

### 自動反映される情報

```
┌─────────────────────────────────┐
│  🎴 DIARY CARD                  │
├─────────────────────────────────┤
│  AI タイトル              ⭐⭐ │  ← AI が生成
│  🧠 MIND                        │  ← AI 属性
├─────────────────────────────────┤
│  統計:                          │
│  🧠 MIND: 4    (← AI 気分)      │
│  💪 BODY: 3    (← AI エネルギー)│
│  💼 WORK: 2                     │
│  ⚡ HABIT: 2                     │
├─────────────────────────────────┤
│  #タグ #学び #成長 #感動         │  ← AI タグ
└─────────────────────────────────┘
```

### カード裏面（本人のみ閲覧可）

```
┌─────────────────────────────────┐
│  📖 日記                        │
├─────────────────────────────────┤
│  AI 要約テキスト...            │
│  （複数行・行クリップ表示）      │
│                                 │
│  ⚡ 習慣チェック                │
│  達成数: 2                      │
│                                 │
│                      2026-07-08 │
└─────────────────────────────────┘
```

### カスタマイズの自由度

- ✅ タイトルは編集可（カードに反映）
- ✅ 要約は編集可（カード背面に反映）
- ✅ タグは追加・削除可（カードに反映）
- ✅ 属性は変更可（カード色・デザインに反映）
- ✅ 気分・エネルギーは再設定可（統計に反映）

**確定タイミング**: 「📸 カードを確認」ボタンで確定

---

## Demo AI と Production AI

### Demo AI （デフォルト）

**特性**:
- ✅ API キー不要
- ✅ 固定ロジックで動作
- ✅ 遅延なし（即座）
- ✅ 本番環境でそのまま使用可

**質問の生成**:
```typescript
const predefinedQuestions: AIQuestion[] = [
  { id: 'q1', question: '今日の朝、気分はいかがでしたか？', type: 'rating' },
  { id: 'q2', question: '最も印象的だった出来事は何ですか？', type: 'text' },
  // ...
];
```

**要約の生成**:
```typescript
// 単純なテンプレートマッチング
return `今日は${answer1}という出来事がありました。${answer2}その経験から${answer3}を得ることができました。`;
```

**タイトルの生成**:
```typescript
// ランダムキーワード + 日付
const keywords = ['気づき', '成長', 'チャレンジ', ...];
return `${date} - 今日の${keywords[random]}`;
```

**タグの生成**:
```typescript
// ランダムに3～5個選択
const allTags = ['日常', '学び', '成長', ...];
return shuffle(allTags).slice(0, Math.random(3, 5));
```

### Production AI （v1.3.0 予定）

**OpenAI**:
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: "あなたは思慮深い日記カウンセラーです。" },
    { role: "user", content: userText }
  ],
});
```

**Google Gemini**:
```typescript
const response = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: userText }] }],
});
```

### 共通インターフェース

```typescript
interface AIProvider {
  generateQuestions(context): Promise<AIQuestion[]>;
  generateFollowUpQuestion(context, lastAnswer): Promise<AIQuestion | null>;
  generateSummary(context): Promise<string>;
  generateTitle(context): Promise<string>;
  generateTags(context): Promise<string[]>;
  generateAll(context): Promise<AIGeneratedContent>;
  isHealthy(): Promise<boolean>;
}
```

**切り替え**:
```typescript
// Demo AI
const provider = createAIProvider({ provider: 'demo' });

// OpenAI (v1.3.0)
const provider = createAIProvider({ 
  provider: 'openai', 
  apiKey: process.env.OPENAI_API_KEY 
});
```

---

## 環境変数の設定

### .env.local（ローカル開発）

```bash
# App 設定
NEXT_PUBLIC_DEMO_MODE=true

# Supabase（本番のみ）
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder

# AI 設定
NEXT_PUBLIC_AI_PROVIDER=demo
# NEXT_PUBLIC_AI_API_KEY=sk-...（不要・Demo AI使用時）
```

### 本番環境（Vercel）

Vercel ダッシュボード → Settings → Environment Variables

```
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_AI_PROVIDER=demo
```

### v1.3.0 以降（OpenAI/Gemini設定）

**OpenAI**:
```bash
NEXT_PUBLIC_AI_PROVIDER=openai
NEXT_PUBLIC_AI_MODEL=gpt-3.5-turbo
NEXT_PUBLIC_AI_API_KEY=sk-proj-xxxxx  # OpenAI API キー
```

**Gemini**:
```bash
NEXT_PUBLIC_AI_PROVIDER=gemini
NEXT_PUBLIC_AI_MODEL=gemini-pro
NEXT_PUBLIC_AI_API_KEY=AIzaSyxxx     # Google API キー
```

---

## トラブルシューティング

### 「質問を読み込めません」

**原因**: Demo AI プロバイダーの初期化失敗

**解決**:
1. ブラウザのコンソールを開く（F12）
2. エラーメッセージを確認
3. ページをリロード

### 要約が同じ内容ばかり

**原因**: Demo AI のテンプレートが固定

**対応**: v1.3.0 で OpenAI/Gemini に統合で解決

### タグが 8 個より多く追加できない

**仕様**: インターフェース設計で最大 8 個と制限

**変更方法**: `src/hooks/useAISummary.ts` の `addTag()` を修正

```typescript
const addTag = useCallback((tag: string) => {
  setState((prev) => {
    if (prev.tags.length >= 8) {  // ← この数値を変更
      return prev;
    }
    // ...
  });
}, []);
```

---

## 今後の予定

### v1.3.0（2026年9月予定）
- ✅ OpenAI API 統合（gpt-3.5-turbo）
- ✅ Google Gemini API 統合
- ✅ API キー安全管理（Vercel Secrets）
- ✅ ストリーミング応答対応
- ✅ レート制限・リトライ

### v1.4.0（2026年10月予定）
- ✅ 質問カスタマイズ機能
- ✅ AI 習慣分析（達成パターン）
- ✅ 自動タグ学習（過去タグから提案）

---

**Last Updated**: 2026-07-08  
**Version**: v1.2.0  
**Status**: Demo AI 実装・本番対応可能
