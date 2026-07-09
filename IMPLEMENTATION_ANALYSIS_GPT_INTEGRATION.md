# 🎴 Forest Note GPT① / GPT② 統合 実装分析レポート

**報告日**: 2026-07-09  
**目的**: Forest Note JSON・Card JSON・画像 Prompt・生成カード画像の保存・表示機能の追加  
**方針**: 手動コピペ運用（AI 自動化は後回し）

---

## 📌 要件整理

### ユースケース

```
ユーザーが日記を記録
  ↓
AI 記憶機能で質問生成・回答入力
  ↓
confirm ページで記録確認
  ↓
【新機能】Forest Note JSON・Card JSON・画像 Prompt を手動で入力・保存
  ↓
生成カード画像を Supabase Storage または Base64 で保存
  ↓
Diary Card / Cards Grid で表示
```

### 保存対象データ

1. **Forest Note JSON** → Diary Entry に紐づけて保存
2. **Card JSON** → Card Evolution 情報として保存
3. **Image Prompt** → テキストフィールドで保存（DB に記録）
4. **Generated Image** → Supabase Storage 或いは Base64 で保存

---

## 📊 1. 現状 DB スキーマ分析

### Supabase `diary_entries` テーブル（現在）

```sql
id (uuid)
user_id (uuid)
date (date)
text (text)
image_path (text)
mood (integer 0-10)
energy (integer 0-10)
activity (text)
work_time (integer)
image_generated (boolean)
created_at (timestamp)
updated_at (timestamp)
```

### 関連テーブル `habit_checks`

```sql
id (uuid)
diary_entry_id (uuid)
pushups (boolean)
squats (boolean)
plank (boolean)
run (boolean)
reading (boolean)
ai_learning (boolean)
created_at (timestamp)
```

### 現在の型定義（src/lib/types.ts）

```typescript
interface DiaryEntry {
  id?: string;
  date: string;
  text: string;
  imagePath?: string | null;
  mood: number;
  energy: number;
  activity: string;
  workTime: number;
  tasks: Tasks;
  imageGenerated?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // 7項目ライフログ（将来用）
  mental?: string;
  body?: string;
  work?: string;
  relationship?: string;
  money?: string;
  habit?: string;
  dream?: string;
}
```

### ⚠️ 現在の問題点

1. **relation / money / dream フィールドが未実装**
   - types.ts には定義されているが、DB に未追加
   - UI 入力フォームがない（DetailModal に未実装）
   - card-generator.ts では固定値（5）で処理中

2. **Card JSON が保存されていない**
   - card-generator.ts で生成されているが、DB に保存されない
   - メモリ内でのみ存在（ページリロードで消失）

3. **Forest Note JSON が未実装**
   - AI Instructions に定義されているはずだが、アプリに組み込まれていない

4. **画像 Prompt が保存されていない**
   - AI 画像生成前の Prompt テキストが記録されていない

5. **生成カード画像が保存されていない**
   - 画像ファイル / URL が保存される仕組みがない

---

## 📂 2. 画面フロー分析

### 記録入力フロー（現在）

```
/input/paste
  ↓ (テキスト入力)
/input/quick (または ai-summary)
  ↓ (Quick Input 3ステップ or AI 質問)
/input/ai-questions
  ↓ (追加の AI 質問)
/input/ai-summary
  ↓ (AI 要約・タイトル・タグ生成)
/input/confirm
  ↓ (最終確認・保存)
/
  ↓ (ホーム画面に戻る)
```

### 記録詳細表示フロー

```
/ (ホーム)
  └─ /calendar (カレンダー)
     ↓
     日付選択
     ↓
     DetailModal
     ↓
     テキスト・気分・体力・習慣チェック編集・保存
```

### カード表示フロー

```
/ (ホーム)
  └─ /cards (カードデッキ)
     ↓
     CardGrid（すべてのカード表示）
     ↓
     CardModal（カード詳細・フリップ）
```

### 問題点

- **DetailModal に relation/money/dream 入力フォームがない**
- **confirm ページに「Forest Note JSON」「Card JSON」「画像 Prompt」の手動入力欄がない**
- **Cards Grid / DetailModal に画像表示欄がない**
- **Card JSON の永続化がない**（メモリのみ）

---

## 📋 3. 変更対象ファイル一覧

### A. DB スキーマ関連（Supabase Migration 必要）

| ファイル | 対象 | 変更内容 |
|---|---|---|
| `diary_entries` table | DB | 新カラム追加（card_json, forest_note_json, image_prompt, card_image_url） |
| `card_metadata` table | DB | 新テーブル作成（Card JSON 専用） |

### B. 型定義・インターフェース（フロントエンド）

| ファイル | 対象 | 変更内容 |
|---|---|---|
| `src/lib/types.ts` | Type | 新フィールド追加（forestNoteJson, cardJson, imagePrompt, cardImageUrl） |
| `src/lib/card-generator.ts` | Interface | DiaryCard に cardMetadata / imageUrl 追加 |

### C. DB API（データ取得・保存）

| ファイル | 対象 | 変更内容 |
|---|---|---|
| `src/lib/supabase-api.ts` | API | saveDiaryEntry に card_json / forest_note_json / image_prompt 保存機能 |

### D. UI コンポーネント（入力フォーム）

| ファイル | 対象 | 変更内容 |
|---|---|---|
| `src/components/DetailModal.tsx` | Form | relation / money / dream 入力フィールド追加 |
| `src/app/input/confirm/page.tsx` | Page | Forest Note JSON / Card JSON / 画像 Prompt の手動入力欄追加 |

### E. UI コンポーネント（表示）

| ファイル | 対象 | 変更内容 |
|---|---|---|
| `src/components/DiaryCard.tsx` | Card | relation / money / dream stats 表示 / 画像表示領域 |
| `src/app/cards/page.tsx` | Page | Card image thumbnail 表示 |
| `src/components/CardModal.tsx` | Modal | 詳細情報・画像・metadata 表示 |

### F. 新規ファイル

| ファイル | 目的 |
|---|---|
| `src/lib/forest-note-json-schema.ts` | Forest Note JSON スキーマ定義 |
| `src/lib/card-json-schema.ts` | Card JSON スキーマ定義 |
| `src/components/CardJsonInput.tsx` | JSON 入力フォーム（手動コピペ用） |
| `src/components/CardImageDisplay.tsx` | カード画像表示コンポーネント |

---

## 🗃️ 4. DB スキーマ変更案

### Option A: 既存 diary_entries に追加（推奨：シンプル）

```sql
-- diary_entries に新カラム追加
ALTER TABLE diary_entries ADD COLUMN (
  forest_note_json JSONB,            -- Forest Note JSON 全体
  card_json JSONB,                   -- Card JSON（メタデータ）
  image_prompt TEXT,                 -- 画像生成 Prompt
  card_image_url TEXT,               -- 生成カード画像 URL
  card_image_base64 TEXT              -- Base64 画像（代替）
);
```

**メリット**:
- シンプル・1 テーブルで統一
- マイグレーション最小限

**デメリット**:
- JSONB が増加（ストレージ）

### Option B: 新テーブル card_metadata を作成

```sql
-- 新テーブル
CREATE TABLE card_metadata (
  id UUID PRIMARY KEY,
  diary_entry_id UUID REFERENCES diary_entries(id),
  forest_note_json JSONB,
  card_json JSONB,
  image_prompt TEXT,
  card_image_url TEXT,
  card_image_base64 TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**メリット**:
- 関心の分離
- Card データの独立管理

**デメリット**:
- JOIN が増える
- マイグレーション複雑

### 推奨: Option A（シンプル）

既存 diary_entries に新カラムを追加。理由：
1. ユーザー 1 人あたりのエントリ数が少ない（日付ごと 1 個）
2. JSONB はインデックス可能（検索性能は保証）
3. クエリシンプル

---

## 📝 5. 型定義変更案

### types.ts 変更

```typescript
export interface DiaryEntry {
  id?: string;
  date: string;
  text: string;
  imagePath?: string | null;
  mood: number;
  energy: number;
  activity: string;
  workTime: number;
  tasks: Tasks;
  imageGenerated?: boolean;
  
  // 7項目ライフログ（TODO から実装に変更）
  mental?: number;      // 0-10 or string
  body?: number;        // 0-10 or string
  work?: number;        // 0-10 or string
  relation?: number;    // 0-10 or string ← NEW（固定値から動的に）
  money?: number;       // 0-10 or string ← NEW（固定値から動的に）
  habit?: number;       // ← 既に tasks.count で計算
  dream?: number;       // 0-10 or string ← NEW（固定値から動的に）
  
  // GPT 統合フィールド NEW
  forestNoteJson?: Record<string, any>;  // Forest Note JSON
  cardJson?: Record<string, any>;        // Card JSON（メタデータ）
  imagePrompt?: string;                  // 画像生成 Prompt
  cardImageUrl?: string;                 // 生成カード画像 URL
  cardImageBase64?: string;              // Base64 画像（代替）
  
  createdAt?: string;
  updatedAt?: string;
}

export interface ForestNoteJSON {
  version: string;
  date: string;
  title: string;
  summary: string;
  attributes: {
    mental: number;
    body: number;
    work: number;
    relation: number;
    money: number;
    habit: number;
    dream: number;
  };
  tags: string[];
  diary: string;
  // ... GPT spec に従う
}

export interface CardJSON {
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
  imageUrl?: string;
  // ... GPT spec に従う
}
```

---

## 🎨 6. UI 入力フォーム設計

### A. DetailModal に追加（relation/money/dream 入力）

```typescript
// 現在のフィールド
- text (textarea)
- mood (slider 0-10)
- energy (slider 0-10)
- activity (text)
- workTime (number)
- tasks (checkbox group)

// 追加するフィールド
+ relation (slider 0-10) ← 人間関係
+ money (slider 0-10) ← 経済状況
+ dream (slider 0-10) ← 夢・目標

// 既存の mental/body/work は？
// → 暫定的に mood/energy/workTime にマップ
```

### B. confirm ページに追加（手動 JSON 入力）

```
記録完了の準備

【カード情報】
┌─────────────────────┐
│ Forest Note JSON    │
│ (手動コピペ)        │
│ ┌─────────────────┐ │
│ │ { "version": ...} │
│ └─────────────────┘ │
└─────────────────────┘

┌─────────────────────┐
│ Card JSON           │
│ (手動コピペ)        │
│ ┌─────────────────┐ │
│ │ { "date": ...}  │ │
│ └─────────────────┘ │
└─────────────────────┘

┌─────────────────────┐
│ 画像生成 Prompt     │
│ (手動コピペ)        │
│ ┌─────────────────┐ │
│ │ A fantasy card..│ │
│ └─────────────────┘ │
└─────────────────────┘

┌─────────────────────┐
│ カード画像 URL / Base64│
│ (手動コピペ)        │
│ ┌─────────────────┐ │
│ │ https://...     │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 🖼️ 7. 画像保存方法の検討

### Option A: Supabase Storage（推奨）

```
bucket: diary-card-images/
path: {user_id}/{date}.png
```

**メリット**:
- CDN 配信で高速
- 永続化・管理容易
- 大容量対応

**デメリット**:
- ストレージコスト
- ファイルアップロード必須

**実装**:
```typescript
const imageFile = await fetch(imageUrl).then(r => r.blob());
await supabase.storage
  .from('diary-card-images')
  .upload(`${userId}/${date}.png`, imageFile);
```

### Option B: Base64 in DB（代替案）

```
card_image_base64: "data:image/png;base64,iVBORw0..."
```

**メリット**:
- ファイルアップロード不要
- シンプル（DB のみ）
- 手動コピペと相性良好

**デメリット**:
- DB 容量増加
- JSON 転送量増加

**推奨用途**:
- 手動運用時は Base64（シンプル）
- AI 自動化時は Storage（スケール）

### Option C: 外部 URL 参照（簡易版）

```
card_image_url: "https://example.com/card.png"
```

**メリット**:
- 保存最小限
- 外部画像生成サービス利用可（DALL-E など）

**デメリット**:
- リンク切れリスク
- 外部依存

### 推奨: Option B → Option A への段階的移行

**Phase 1（手動運用）**: Base64
- ユーザーが画像を生成 (GPT / DALL-E など)
- 画像を Base64 に変換
- コピペで入力

**Phase 2（AI 自動化）**: Storage
- AI が画像生成
- Supabase Storage に自動アップロード
- URL を保存

---

## 📐 8. カード表示・編集画面の設計

### DiaryCard.tsx の変更

```
現在の表示：
┌──────────────────┐
│ DIARY CARD       │
│ [DATE] Lv 3      │
│ ⭐ mind/body... │
│                  │
│ 属性: MIND       │
│ EXP: █░░░ 30/100 │
│ MIND: 8, BODY: 7 │
│ WORK: 5, HABIT: 4 │
│ Tags: tag1, tag2 │
└──────────────────┘

変更後：
┌──────────────────────┐
│ DIARY CARD           │
│ [DATE] Lv 3          │
│ ⭐ mind/body...     │
│                      │
│ 【カード画像】       │
│ ┌────────────────┐   │
│ │ [Generated IMG]│   │
│ └────────────────┘   │
│                      │
│ 属性: MIND           │
│ EXP: █░░░ 30/100     │
│ MIND: 8 BODY: 7     │
│ WORK: 5 RELATION: 6  │
│ MONEY: 4 DREAM: 7    │
│ HABIT: 4             │
│ Tags: tag1, tag2     │
└──────────────────────┘
```

### CardModal.tsx の変更

```
通常表示（裏）:
┌──────────────────────┐
│ 記録日: 2026-07-09   │
│ タイトル: 今日の成長 │
│ 属性: MIND ⭐⭐⭐ │
│ EXP: 150/200         │
│ RELATION: 6/10       │
│ MONEY: 4/10          │
│ DREAM: 7/10          │
│ タグ: #成長 #AI      │
└──────────────────────┘

本人表示（表）:
┌──────────────────────┐
│ 日記: 今日は朝早く...│
│ （フルテキスト）     │
│                      │
│ メタデータ:          │
│ - Prompt: A fantasy..│
│ - Card JSON: {...}   │
│ - Forest Note: {...} │
└──────────────────────┘
```

---

## 🚀 9. 実装手順（推奨順序）

### Phase 1: 型定義・DB準備（1-2h）

1. ✅ `src/lib/types.ts` に新フィールド追加
   - relation, money, dream（数値 0-10）
   - forestNoteJson, cardJson, imagePrompt, cardImageUrl, cardImageBase64

2. ✅ `src/lib/card-generator.ts` に ForestNoteJSON / CardJSON インターフェース定義

3. ✅ Supabase Migration（手動 / SQL）
   - diary_entries に新カラム 5 個追加
   - `ALTER TABLE diary_entries ADD COLUMN ...`

4. ✅ `src/lib/supabase-api.ts` を更新
   - saveDiaryEntry で新フィールドを保存
   - getDiaryEntries で新フィールドをフェッチ

### Phase 2: 入力フォーム追加（2-3h）

5. ✅ `src/components/DetailModal.tsx` 修正
   - relation / money / dream スライダー追加
   - UI レイアウト調整

6. ✅ `src/app/input/confirm/page.tsx` 修正
   - Forest Note JSON 手動入力欄（textarea）
   - Card JSON 手動入力欄（textarea）
   - Image Prompt 手動入力欄（textarea）
   - Card Image URL / Base64 手動入力欄（textarea / file upload）
   - JSON 検証（parse error 表示）

### Phase 3: 表示・編集機能（2-3h）

7. ✅ `src/components/DiaryCard.tsx` 修正
   - relation / money / dream stats を 7 項目表示
   - 条件付きで card_image_url / base64 を表示
   - 画像エラーハンドリング

8. ✅ `src/app/cards/page.tsx` 修正
   - Card Grid に画像 thumbnail 表示
   - 画像未設定時はプレースホルダ表示

9. ✅ 新コンポーネント `CardImageDisplay.tsx`
   - URL / Base64 の画像表示
   - エラーハンドリング

### Phase 4: テスト・レファイン（1-2h）

10. ✅ 手動テスト
    - JSON コピペ入力 → 保存 → 表示 確認
    - 画像表示確認（URL / Base64）
    - エラーケース確認

11. ✅ UI ツールチップ・ヘルプテキスト追加

---

## ⚙️ 10. 最小実装チェックリスト（MVP）

### DB & Type

- [ ] types.ts に relation/money/dream フィールド追加
- [ ] types.ts に forestNoteJson/cardJson/imagePrompt/cardImageUrl フィールド追加
- [ ] Supabase Migration: diary_entries に新カラム 5 個追加

### API

- [ ] supabase-api.ts の saveDiaryEntry で新フィールド保存
- [ ] supabase-api.ts の getDiaryEntries で新フィールドをマッピング

### UI - 入力

- [ ] DetailModal に relation/money/dream スライダー追加
- [ ] confirm ページに 4 つの textarea 追加（JSON/Prompt/URL 手動入力）
- [ ] JSON 形式エラー時のユーザーフィードバック

### UI - 表示

- [ ] DiaryCard に relation/money/dream stats を 7 項目表示
- [ ] DiaryCard に card_image_url / base64 画像を条件付き表示
- [ ] Cards Grid に画像 thumbnail 表示

### テスト

- [ ] 手動テスト: JSON 入力 → 保存 → 表示 フロー確認
- [ ] エラーハンドリング確認（無効 JSON・画像読み込みエラー）

---

## 📊 11. 工数見積もり

| タスク | 工数 | 難易度 |
|---|---|---|
| Phase 1: 型定義・DB 準備 | 1-2h | 低 |
| Phase 2: 入力フォーム | 2-3h | 中 |
| Phase 3: 表示機能 | 2-3h | 中 |
| Phase 4: テスト・レファイン | 1-2h | 低 |
| **合計** | **6-10h** | **中** |

**推奨スケジュール**: 1-2 日（4-8h/day）

---

## ⚠️ 12. リスク・注意点

### 既存機能への影響

❌ **高リスク**：
- Supabase Migration 失敗 → DB ダウン
- saveDiaryEntry の変更 → 既存データ破損

✅ **対策**:
- Migration は ALTER TABLE で非破壊（新カラム追加のみ）
- saveDiaryEntry は新フィールドを optional に（backward compatibility）
- 本番前に staging 環境でテスト

### ユーザー体験への影響

❌ **負荷増加**：
- JSON コピペが手動運用（複雑）
- 誤入力のリスク

✅ **対策**:
- JSON schema 検証・エラーメッセージ表示
- ツールチップ・使用例を画面に表示
- AI 自動化フェーズで解決予定

### 保存方法の選択

❌ **問題**：
- Base64 での DB 保存 → DB 容量増加（大容量画像は NG）
- 画像サイズ制限なし → パフォーマンス低下

✅ **対策**:
- 初期は小サイズ画像（< 500KB）に限定
- Phase 2 で Supabase Storage に移行
- 画像サイズ検証・圧縮

---

## 🎯 13. 実装後の確認項目

### 機能確認

- [ ] relation/money/dream 値が DB に保存される
- [ ] forestNoteJson/cardJson/imagePrompt が DB に保存される
- [ ] cardImageUrl / cardImageBase64 が表示される
- [ ] JSON 検証エラーが表示される
- [ ] 既存 diary entry の表示に影響しない（backward compatible）

### UX 確認

- [ ] 入力フォームは直感的か
- [ ] エラーメッセージは明確か
- [ ] ツールチップは十分か
- [ ] 画像表示は正しいか

### パフォーマンス確認

- [ ] ページロード時間に変化なし
- [ ] Base64 画像の転送量は許容範囲
- [ ] JSON parse エラーは graceful（ユーザーに影響なし）

---

## ✅ 実装前チェックリスト

- [ ] このレポートの内容を理解した
- [ ] DB Migration スクリプトを準備した（or Supabase UI で手動実行予定）
- [ ] 変更対象ファイル一覧を確認した
- [ ] リスク・対策を確認した
- [ ] 実装順序に同意した

**次のステップ**: 上記の 9 つの実装フェーズを順番に実施

---

**報告者**: Claude Code / RBAI Inc.  
**報告日**: 2026-07-09  
**対象プロジェクト**: Forest Note v1.4.0+  
**実装開始予定日**: 2026-07-10
