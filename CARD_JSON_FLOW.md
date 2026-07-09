# Card JSON フロー統一化ガイド

**バージョン**: v1.0.2+  
**作成日**: 2026-07-09  
**ステータス**: ✅ 両バージョン完全対応

---

## 🎯 目標

Forest Note アプリで以下の2つの Card JSON 生成フローを並行運用：

1. **GPT単体版**: 試作・研究用（外部）
2. **アプリ内版**: 本番・運用用（内部・Phase 5以降）

両者を **同じ Card JSON v1.0 スキーマ** で統一し、アプリ側の表示・保存・検証ロジックを共有。

---

## 📊 Card JSON v1.0 スキーマ

```typescript
interface CardJSON {
  // 識別子
  card_id: string              // 例: "card_001", "gpt_20260709_001"
  
  // カード属性
  card_type: string            // "Attack" (v1.0は Attack のみ)
  date: string                 // YYYY-MM-DD
  title: string                // カードタイトル
  card_name: string            // カード名（表示用）
  
  // ゲーム属性
  rarity: string               // "N" | "R" | "SR" | "SSR" | "UR"
  attribute: string            // "Fire" | "Water" | "Wind" | "Earth" | "Light" | "Dark" | "Neutral"
  
  // ステータス
  hp: number                   // 0-999
  atk: number                  // 0-999
  energy: number               // 0-10
  
  // スキル・テキスト
  skill: {
    name: string               // スキル名
    type: string               // スキルタイプ
    effect: string             // 効果説明
  }
  flavor_text: string          // カード味説明文
  
  // 画像・参照
  image_prompt: string         // 【重要】イラストのみ・文字なし
  image_url: string            // カード画像URL（v1.5.0で実装）
  
  // 参照
  forest_note: {
    theme: string              // テーマ
    summary: string            // サマリー
    today_best: string         // 今日のベスト
    lesson: string             // 学んだこと
    tomorrow: string           // 明日への目標
  }
}
```

### 重要ルール

1. **image_prompt に文字を含めない**
   - イラスト・背景・雰囲気のみ記述
   - カード名・数字・テキストは含めない
   - React の CardDisplay.tsx で文字は描画

2. **スキーマの不変性**
   - v1.0 のフィールド順序・名前は変更しない
   - 新しいフィールドは追加しない（互換性維持）
   - 既存フィールドの削除も禁止

3. **enum値の固定**
   - rarity: N/R/SR/SSR/UR のみ
   - attribute: 7種類のみ
   - card_type: Attack のみ（v1.0）

---

## 🔄 フロー 1: GPT単体版（試作用）

### 概要

```
GPT単体（外部・研究用）で Card JSON を生成
    ↓
JSON をテキストとしてコピー
    ↓
アプリの confirm/page.tsx に貼り付け
    ↓
validateCardJson() で検証
    ↓
保存・表示
```

### 入力地点

**ファイル**: `src/app/input/confirm/page.tsx`

```typescript
// Card JSON 入力エリア（L450-）
const [cardJsonInput, setCardJsonInput] = useState('');
const [cardJsonPreview, setCardJsonPreview] = useState<CardJSON | null>(null);

// パース・プレビュー
const parseAndPreviewCardJson = (inputJson: string) => {
  try {
    const parsed = JSON.parse(inputJson);
    const validated = validateCardJson(parsed);  // ← 検証
    setCardJsonPreview(validated);
  } catch (err) {
    setCardJsonError(err.message);
  }
};

// 保存
const handleSaveCardJson = async () => {
  if (cardJsonPreview) {
    await saveDiaryEntry(user.id, {
      ...entry,
      cardJson: cardJsonPreview,        // ← Card JSON 保存
      cardGenerated: true,              // ← 生成済みフラグ
    });
  }
};
```

### 検証ロジック

**ファイル**: `src/lib/forest-note-validator.ts`

```typescript
export function validateCardJson(json: unknown): CardJSON {
  // 必須項目チェック（14項目）
  const requiredFields = [
    'card_id', 'card_type', 'date', 'title', 'card_name',
    'rarity', 'attribute', 'hp', 'atk', 'energy',
    'skill', 'flavor_text', 'image_prompt', 'image_url', 'forest_note'
  ];

  // card_type === "Attack" チェック
  // rarity ∈ {N, R, SR, SSR, UR}
  // attribute ∈ {Fire, Water, Wind, ...}
  // hp ∈ [0, 999], atk ∈ [0, 999], energy ∈ [0, 10]
  // skill: name/type/effect すべて string
  // forest_note: theme/summary/today_best/lesson/tomorrow すべて必須
  
  return json as CardJSON;  // 検証通過
}
```

### 保存ロジック

**ファイル**: `src/lib/entry-utils.ts` / `src/lib/supabase-api.ts`

```typescript
// Supabase PostgreSQL へ
diary_entries.card_json (JSONB) に保存
diary_entries.card_generated (BOOLEAN) = true に設定

// localStorage バックアップ
demo_mode: diary_entries_demo (JSON Array) に含める
```

### 表示ロジック

**ファイル**: `src/components/CardDisplay.tsx`

```typescript
<CardDisplay 
  cardJson={cardJsonData}        // Card JSON
  imageUrl={imageUrl}            // イラスト画像 URL
  size="md"                       // sm/md/lg
/>
```

出力:
- 背景にカード画像
- 上に Card JSON の情報を重ねて表示
- card_name, rarity, attribute, HP, ATK, Energy, Skill, Flavor Text

---

## 🔄 フロー 2: アプリ内版（本番運用・Phase 5+）

### 概要

```
ユーザーがテキストを入力
    ↓
【新】Forest Note JSON 自動生成（GPT）
【新】Card JSON 自動生成（GPT）
    ↓
confirm/page.tsx で確認・編集
    ↓
validateCardJson() で検証（共有）
    ↓
保存・表示（共有）
```

### 生成地点（Phase 5実装予定）

**ファイル**: `src/lib/forest-generator.ts`（新規）

```typescript
export async function generateCardJson(
  forestNote: ForestNoteJSON,
  date: string
): Promise<CardJSON> {
  const aiProvider = createAIProvider(getDefaultAIConfig());
  
  const prompt = `
    Forest Note JSON から Card JSON v1.0 を生成してください。
    
    Input: ${JSON.stringify(forestNote)}
    
    Output: 以下の形式で JSON を返してください。
    {
      "card_id": "auto_20260709_001",
      "card_type": "Attack",
      "date": "${date}",
      ...
    }
  `;
  
  const response = await aiProvider.generateCardJson(forestNote);
  
  // 検証（共有ロジック）
  return validateCardJson(response);  // ← フロー1と同じ検証
}
```

### 検証・保存・表示

フロー1と **100%同じ** ロジックを使用:
- `validateCardJson()` - 同じ検証
- `saveDiaryEntry()` - 同じ保存
- `CardDisplay.tsx` - 同じ表示

---

## 📊 共有ロジック（両フロー統一）

### 検証

```
検証関数: validateCardJson()
場所: src/lib/forest-note-validator.ts
対象: CardJSON
出力: CardJSON | throws Error
```

### 保存

```
保存関数: saveDiaryEntry()
場所: src/lib/supabase-api.ts
対象: DiaryEntry { cardJson, cardGenerated }
出力: void
```

### マッピング

```
マッピング関数:
  mapDiaryEntryToSupabase() - DiaryEntry → DB
  mapSupabaseEntryToDiaryEntry() - DB → DiaryEntry
場所: src/lib/entry-utils.ts
対象: card_json ↔ cardJson
```

### 表示

```
表示コンポーネント: CardDisplay
場所: src/components/CardDisplay.tsx
入力: CardJSON + imageUrl
出力: React Component
```

使用場所:
- Card Grid (`src/components/CardGrid.tsx`)
- Diary Detail Modal (`src/components/CalendarDayDetailModal.tsx`)

---

## 🔮 将来の改善フロー

### シナリオ: GPT版で「より良いカード構造」を発見

```
【外部】GPT版で試作
    ↓
「この skill 生成ロジックが良い」と判明
    ↓
【アプリ側対応】
forest-generator.ts の生成プロンプトを更新
    ↓
Card JSON スキーマは変更なし ✅
    ↓
既存の cardJson は互換性維持 ✅
    ↓
新しく生成される cardJson はさらに高品質に
```

**ポイント**: Card JSON v1.0 スキーマは **不変** 。生成ロジックだけ改善。

---

## ✅ チェックリスト

### フロー1: GPT版貼り付け
- [ ] Card JSON テキスト入力可能
- [ ] validateCardJson() で検証
- [ ] DB に保存できる
- [ ] CardDisplay で表示できる
- [ ] 既存カード表示を破壊しない

### フロー2: アプリ内自動生成（Phase 5+）
- [ ] Forest Note JSON から生成可能
- [ ] 同じ validateCardJson() で検証
- [ ] 同じ保存・表示ロジック使用
- [ ] Card Grid と Modal で表示可能

### 互換性
- [ ] 古い cardJson （フロー1から生成）も表示可能
- [ ] 新しい cardJson （フロー2から生成）も表示可能
- [ ] スキーマ変更なし

---

## 📚 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/lib/types.ts` | CardJSON スキーマ定義 |
| `src/lib/forest-note-validator.ts` | validateCardJson() |
| `src/lib/entry-utils.ts` | マッピング関数 |
| `src/lib/supabase-api.ts` | DB 保存・読み込み |
| `src/components/CardDisplay.tsx` | 表示テンプレート |
| `src/components/CardGrid.tsx` | Grid 表示 |
| `src/components/CalendarDayDetailModal.tsx` | Modal 表示 |
| `src/app/input/confirm/page.tsx` | 入力・保存（手動） |
| `src/lib/forest-generator.ts` | 自動生成（Phase 5+） |

---

**Version**: v1.0.2  
**Last Updated**: 2026-07-09  
**Status**: ✅ 両バージョン完全対応
