# ✨ Forest Note v1.0 機能一覧

**バージョン**: v1.0 (手動入力フル実装版)  
**リリース**: 2026-07-09  
**ステータス**: ✅ 本番対応可能

---

## 🎁 v1.0 で新しく追加された機能

### 📥 Forest Note JSON 入力フロー

| 機能 | 説明 | 実装場所 |
|------|------|---------|
| **JSON 入力フォーム** | Forest Note v1.0 JSON の手動入力 | `/input/paste` (JSON タブ) |
| **リアルタイムプレビュー** | 入力中に JSON をパース・検証・プレビュー表示 | paste/page.tsx |
| **JSON バリデーション** | version / date / scores（0-100）/ 必須項目チェック | forest-note-validator.ts |
| **エラー表示** | 詳細なエラーメッセージ（何が間違ったか明確に） | ユーザー入力フォーム |
| **保存**: `forestNoteJson` JSONB | Supabase diary_entries.forest_note_json に保存 | supabase-api.ts |
| **フラグ**: `forestGenerated` | true 設定で「生成済み」とマーク | DiaryEntry.forestGenerated |
| **localStorage バックアップ** | Demo Mode で JSON をシリアライズ保存 | Demo 環境 |

**入力スキーマ**: Forest Note v1.0 (仕様書 Chapter 2)
```json
{
  "version": "1.0",
  "date": "YYYY-MM-DD",
  "title": "タイトル",
  "theme": "テーマ",
  "summary": "サマリー",
  "scores": {
    "mental": 0-100,
    "body": 0-100,
    "work": 0-100,
    "relationship": 0-100,
    "money": 0-100,
    "habit": 0-100,
    "dream": 0-100
  },
  "mental": "メンタル説明",
  "body": "体力説明",
  ...
  "keywords": ["キーワード1", "キーワード2"],
  "items": ["アイテム1"],
  "locations": ["場所1"],
  "activities": ["活動1"],
  "emotions": ["感情1"],
  "today_best": "今日のベストモーメント",
  "lesson": "学んだこと",
  "tomorrow": "明日への目標",
  "ai_comment": "AI コメント"
}
```

---

### 🎴 Card JSON 入力フロー

| 機能 | 説明 | 実装場所 |
|------|------|---------|
| **JSON 入力フォーム** | Card JSON v1.0 の手動入力 | `/input/confirm` |
| **リアルタイムプレビュー** | 入力中に JSON をパース・検証・プレビュー表示 | confirm/page.tsx |
| **JSON バリデーション** | card_type / rarity / attribute / hp/atk/energy 範囲チェック | forest-note-validator.ts |
| **エラー表示** | 詳細なエラーメッセージ | ユーザー入力フォーム |
| **保存**: `cardJson` JSONB | Supabase diary_entries.card_json に保存 | supabase-api.ts |
| **フラグ**: `cardGenerated` | true 設定で「生成済み」とマーク | DiaryEntry.cardGenerated |
| **localStorage バックアップ** | Demo Mode で JSON をシリアライズ保存 | Demo 環境 |

**入力スキーマ**: Card JSON v1.0 (仕様書 Chapter 3)
```json
{
  "card_id": "card_001",
  "card_type": "Attack",
  "date": "YYYY-MM-DD",
  "title": "カードタイトル",
  "card_name": "カード名",
  "rarity": "N|R|SR|SSR|UR",
  "attribute": "Fire|Water|Wind|Earth|Light|Dark|Neutral",
  "hp": 0-999,
  "atk": 0-999,
  "energy": 0-10,
  "skill": {
    "name": "スキル名",
    "type": "スキルタイプ",
    "effect": "スキル効果説明"
  },
  "flavor_text": "フレーバーテキスト",
  "image_prompt": "画像生成プロンプト",
  "image_url": "画像URL",
  "forest_note": {
    "theme": "テーマ",
    "summary": "サマリー",
    "today_best": "ベストモーメント",
    "lesson": "学んだこと",
    "tomorrow": "明日への目標"
  }
}
```

---

### 📅 Calendar 表示機能（拡張）

| 機能 | 説明 | 実装場所 |
|------|------|---------|
| **🌲 forestGenerated インジケータ** | Forest Note JSON 保存済みを視覚化 | calendar/page.tsx |
| **🎴 cardGenerated インジケータ** | Card JSON 保存済みを視覚化 | calendar/page.tsx |
| **複数アイコン併記** | 両方あれば「🌲🎴」と表示 | getDayIndicator() |
| **凡例更新** | 新しいアイコンを凡例に追加 | calendar/page.tsx |

**Calendar 表示例**:
```
7月 2026
日 月 火 水 木 金 土
       1  2  3  4  5
    📝 🌲 🎴 🌲🎴📝
```

---

### 🔍 Diary Detail Modal 表示機能（拡張）

#### 🌲 Forest Note スコアセクション

| 項目 | 表示内容 | 仕様 |
|------|---------|------|
| **メンタル** | プログレスバー（紫）+ XX/100 | 🧠 |
| **体力** | プログレスバー（赤）+ XX/100 | 💪 |
| **仕事** | プログレスバー（青）+ XX/100 | 💼 |
| **人間関係** | プログレスバー（ピンク）+ XX/100 | 👥 |
| **お金** | プログレスバー（緑）+ XX/100 | 💰 |
| **習慣** | プログレスバー（黄）+ XX/100 | ⚡ |
| **夢** | プログレスバー（シアン）+ XX/100 | ✨ |
| **テーマ** | 「テーマ: 〇〇」と表示 | - |
| **サマリー** | テキスト本文表示 | - |

**表示例**:
```
🌲 Forest Note スコア

🧠 メンタル        75/100
████████████░░░░░░

💪 体力            65/100
██████████░░░░░░░░

(5項目省略)

テーマ: 充実感
充実した一日で、全体的にポジティブなエネルギーを感じた。
```

#### 🎴 Card JSON 情報セクション

| 項目 | 表示内容 | 仕様 |
|------|---------|------|
| **Card ID** | card_id テキスト | - |
| **Card Name** | card_name テキスト | - |
| **Type** | card_type（通常 "Attack"） | - |
| **Rarity** | rarity ラベル（N/R/SR/SSR/UR） | - |
| **Attribute** | attribute ラベル（Fire/Water等） | - |
| **HP** | hp ゲージ表示 | 最大 999 |
| **ATK** | atk ゲージ表示 | 最大 999 |
| **Energy** | energy ゲージ表示 | 最大 10 |
| **Skill Name** | skill.name テキスト | - |
| **Skill Type** | skill.type テキスト | - |
| **Skill Effect** | skill.effect テキスト（複数行対応） | - |
| **Flavor Text** | flavor_text イタリック表示 | - |

**表示例**:
```
🎴 Card JSON 情報

Card ID: card_001
Card Name: 朝日の戦士
Type: Attack
Rarity: SR | Attribute: Fire

[HP ゲージ] 100  [ATK ゲージ] 85  [Energy ゲージ] 8/10

Skill: 朝焼けの波動 (Fire)
全体に80のダメージ

"新しい朝が始まる"
```

---

### 🎴 Card Grid フィルタ・検索（拡張）

| 機能 | 説明 | 実装場所 |
|------|------|---------|
| **Card Name 検索** | テキスト入力でカード名で検索 | cards/page.tsx |
| **Attribute フィルタ** | Fire/Water/Wind/Earth/Light/Dark/Neutral から選択 | cards/page.tsx |
| **複合フィルタ** | Rarity + Attribute + Card Name 同時対応 | フィルタロジック |
| **フィルター解除** | 統合ボタンで全フィルタリセット | cards/page.tsx |

**フィルタUI例**:
```
🔍 カード名で検索... [入力フォーム]

📅 新しい順 ▼  🎨 属性: すべて ▼  ✕ フィルター解除
```

**検索・フィルタ組み合わせ例**:
- Card Name: "戦士" × Attribute: "Fire" → 火属性で名前に「戦士」を含むカード表示
- Rarity: "Legendary" × Attribute: "Water" → 水属性の伝説レアリティのみ
- 全条件組み合わせ可能（OR ではなく AND 条件）

---

## 📊 DB スキーマ（Phase 1）

### diary_entries テーブル拡張

| カラム | 型 | 説明 |
|--------|-----|------|
| `forest_note_json` | JSONB | Forest Note v1.0 JSON 本体 |
| `card_json` | JSONB | Card JSON v1.0 本体 |
| `forest_generated` | BOOLEAN | Forest Note 保存済みフラグ |
| `card_generated` | BOOLEAN | Card JSON 保存済みフラグ |
| `image_prompt` | TEXT | 画像生成プロンプト |
| `image_url` | TEXT | 生成画像 URL |
| `card_image_url` | TEXT | カード画像 URL |
| `mental` | SMALLINT | メンタルスコア（0-100） |
| `body` | SMALLINT | 体力スコア（0-100） |
| `work` | SMALLINT | 仕事スコア（0-100） |
| `relationship` | SMALLINT | 人間関係スコア（0-100） |
| `money` | SMALLINT | お金スコア（0-100） |
| `habit` | SMALLINT | 習慣スコア（0-100） |
| `dream` | SMALLINT | 夢スコア（0-100） |
| `mental_text` | TEXT | メンタル説明 |
| `body_text` | TEXT | 体力説明 |
| `work_text` | TEXT | 仕事説明 |
| `relationship_text` | TEXT | 人間関係説明 |
| `money_text` | TEXT | お金説明 |
| `habit_text` | TEXT | 習慣説明 |
| `dream_text` | TEXT | 夢説明 |
| `keywords` | TEXT[] | キーワード配列 |
| `items` | TEXT[] | アイテム配列 |
| `locations` | TEXT[] | 場所配列 |
| `activities` | TEXT[] | 活動配列 |
| `emotions` | TEXT[] | 感情配列 |
| `today_best` | TEXT | 今日のベストモーメント |
| `lesson` | TEXT | 学んだこと |
| `tomorrow` | TEXT | 明日への目標 |
| `ai_comment` | TEXT | AI コメント |

---

## ⚠️ v1.0 の制限事項・未実装

### 自動生成機能は未実装（手動入力のみ）

| 機能 | 現状 | 実装予定 |
|------|------|---------|
| **Forest Note JSON 自動生成** | ❌ 手動入力（JSON / テキスト） | Phase 5 (GPT① API) |
| **Card JSON 自動生成** | ❌ 手動入力（JSON） | Phase 6 (GPT② API) |
| **画像生成・ダウンロード** | ❌ image_prompt 保存のみ | Phase 7 (画像生成API) |
| **テキスト → JSON 自動変換** | ⚠️ 既存テキスト parser のみ | Phase 5 内で実装検討 |

### API 連携なし（デモモードで即動作）

- ❌ OpenAI API（テキスト生成）
- ❌ Google Gemini API
- ❌ Claude API
- ✅ Demo AI（固定ロジック・API キー不要）

### 画像機能（未実装）

- ❌ DALL-E 3 / Midjourney / Stable Diffusion との連携
- ❌ Canvas レンダリング
- ❌ カード画像の自動生成・表示
- ✅ image_prompt / card_image_url は DB に保存

### その他未実装

- ❌ プッシュ通知
- ❌ ダークモード（v1.4.0 予定）
- ❌ SNS 共有機能
- ❌ マルチユーザー・フレンド機能
- ❌ モバイルアプリ（React Native）

---

## 💾 保存・読み込み方式

### 保存先

**本番**: Supabase PostgreSQL
```
diary_entries テーブル:
  ├─ forest_note_json (JSONB)
  ├─ card_json (JSONB)
  ├─ forest_generated (BOOLEAN)
  ├─ card_generated (BOOLEAN)
  └─ その他スコア・テキストフィールド
```

**Demo Mode**: localStorage
```
diary_entries_demo (JSON Array):
  └─ 全フィールドをシリアライズ
```

### 読み込み処理

1. **初期化時**: DEMO_MODE 環境変数で判定
2. **読み込み**: Supabase OR localStorage から取得
3. **マッピング**: snake_case → camelCase 変換
4. **型安全**: TypeScript DiaryEntry インターフェースで型チェック

---

## ✅ v1.0 でテスト済み

- ✅ Forest Note JSON バリデーション（全必須項目・スコア 0-100 範囲）
- ✅ Card JSON バリデーション（rarity/attribute 列挙値・hp/atk/energy 範囲）
- ✅ Supabase JSONB 保存・取得
- ✅ localStorage シリアライズ・デシリアライズ
- ✅ Calendar 表示（複数インジケータ）
- ✅ Modal 表示（Forest Note・Card JSON セクション）
- ✅ Card Grid フィルタ・検索（複合条件）
- ✅ npm run build 成功（Error 0）
- ✅ TypeScript strict mode 完全対応

---

## 🚀 推奨される使用方法

### シナリオ 1: Cloud 使用（Supabase + 手動入力）

```bash
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

1. /input/paste で Forest Note JSON テキスト貼付け
2. /input/confirm で Card JSON テキスト貼付け
3. /calendar で検索・確認

### シナリオ 2: Demo Mode（オフライン・開発用）

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

1. localStorage 自動初期化
2. サンプルデータ自動生成
3. すべての機能が即座に動作

---

**最終更新**: 2026-07-09  
**ステータス**: ✅ v1.0 完成・本番対応可能
