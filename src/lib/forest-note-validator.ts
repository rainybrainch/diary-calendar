import { ForestNoteJSON, CardJSON } from './types';

/**
 * Forest Note JSON バリデーション（仕様書 Chapter2 準拠）
 * @throws Error if validation fails
 */
export function validateForestNoteJson(json: unknown): ForestNoteJSON {
  if (!json || typeof json !== 'object') {
    throw new Error('JSON形式が正しくありません');
  }

  const obj = json as Record<string, unknown>;

  // 必須項目チェック
  const requiredFields = [
    'version',
    'date',
    'title',
    'theme',
    'summary',
    'scores',
    'mental',
    'body',
    'work',
    'relationship',
    'money',
    'habit',
    'dream',
    'keywords',
    'items',
    'locations',
    'activities',
    'emotions',
    'today_best',
    'lesson',
    'tomorrow',
    'ai_comment',
  ];

  const missingFields = requiredFields.filter(field => !(field in obj));
  if (missingFields.length > 0) {
    throw new Error(`必須項目が不足しています: ${missingFields.join(', ')}`);
  }

  // version チェック
  if (obj.version !== '1.0') {
    throw new Error('version は "1.0" である必要があります');
  }

  // date 形式チェック（YYYY-MM-DD）
  if (typeof obj.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(obj.date)) {
    throw new Error('dateはYYYY-MM-DD形式で入力してください');
  }

  // scores オブジェクトチェック
  const scores = obj.scores as Record<string, unknown>;
  const scoreFields = ['mental', 'body', 'work', 'relationship', 'money', 'habit', 'dream'];

  for (const field of scoreFields) {
    if (!(field in scores)) {
      throw new Error(`scores.${field}が不足しています`);
    }

    const value = scores[field];
    if (typeof value !== 'number') {
      throw new Error(`scores.${field}は数値である必要があります`);
    }

    if (value < 0 || value > 100) {
      throw new Error('スコアは0〜100で入力してください');
    }
  }

  // 文字列フィールドチェック
  const stringFields = ['title', 'theme', 'summary', 'mental', 'body', 'work', 'relationship', 'money', 'habit', 'dream', 'today_best', 'lesson', 'tomorrow', 'ai_comment'];
  for (const field of stringFields) {
    if (typeof obj[field] !== 'string') {
      throw new Error(`${field}は文字列である必要があります`);
    }
  }

  // 配列フィールドチェック
  const arrayFields = ['keywords', 'items', 'locations', 'activities', 'emotions'];
  for (const field of arrayFields) {
    if (!Array.isArray(obj[field])) {
      throw new Error(`${field}は配列である必要があります`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj as any as ForestNoteJSON;
}

/**
 * Card JSON バリデーション（仕様書 Chapter3 準拠）
 * @throws Error if validation fails
 */
export function validateCardJson(json: unknown): CardJSON {
  if (!json || typeof json !== 'object') {
    throw new Error('Card JSON形式が正しくありません');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = json as any;

  // 必須項目チェック
  const requiredFields = [
    'card_id',
    'card_type',
    'date',
    'title',
    'card_name',
    'rarity',
    'attribute',
    'hp',
    'atk',
    'energy',
    'skill',
    'flavor_text',
    'image_prompt',
    'image_url',
    'forest_note',
  ];

  const missingFields = requiredFields.filter(field => !(field in obj));
  if (missingFields.length > 0) {
    throw new Error(`必須項目が不足しています: ${missingFields.join(', ')}`);
  }

  // card_type チェック（Version 1.0 は Attack のみ）
  if (obj.card_type !== 'Attack') {
    throw new Error('Version 1.0ではAttackカードのみ対応しています');
  }

  // rarity チェック
  const validRarities = ['N', 'R', 'SR', 'SSR', 'UR'];
  if (!validRarities.includes(obj.rarity as string)) {
    throw new Error('未対応のレアリティです');
  }

  // attribute チェック
  const validAttributes = ['Fire', 'Water', 'Wind', 'Earth', 'Light', 'Dark', 'Neutral'];
  if (!validAttributes.includes(obj.attribute as string)) {
    throw new Error('未対応の属性です');
  }

  // 数値フィールドチェック
  const numericFields = { hp: [0, 999], atk: [0, 999], energy: [0, 10] };
  for (const [field, [min, max]] of Object.entries(numericFields)) {
    const value = obj[field];
    if (typeof value !== 'number') {
      throw new Error(`${field}は数値である必要があります`);
    }
    if (value < min || value > max) {
      throw new Error(`${field}は${min}〜${max}の範囲で入力してください`);
    }
  }

  // skill オブジェクトチェック
  const skill = obj.skill as Record<string, unknown>;
  const skillFields = ['name', 'type', 'effect'];
  for (const field of skillFields) {
    if (!(field in skill)) {
      throw new Error(`skill.${field}が不足しています`);
    }
    if (typeof skill[field] !== 'string') {
      throw new Error(`skill.${field}は文字列である必要があります`);
    }
  }

  // forest_note オブジェクトチェック
  const forestNote = obj.forest_note as Record<string, unknown>;
  const forestNoteFields = ['theme', 'summary', 'today_best', 'lesson', 'tomorrow'];
  for (const field of forestNoteFields) {
    if (!(field in forestNote)) {
      throw new Error(`forest_note.${field}が不足しています`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj as any as CardJSON;
}
