import { ForestNoteJSON, CardJSON } from './types';
import { validateForestNoteJsonPartial, validateCardJson } from './forest-note-validator';
import { createAIProvider, getDefaultAIConfig } from './ai';

/**
 * Forest Note 生成エラー
 */
export class ForestGeneratorError extends Error {
  constructor(
    message: string,
    public type: 'generation' | 'validation' | 'network',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ForestGeneratorError';
  }
}

/**
 * Forest Note JSON を生成（ユーザーテキスト → Forest Note v1.0 JSON）
 * @param userText ユーザーが入力したテキスト
 * @param date YYYY-MM-DD 形式の日付
 * @returns ForestNoteJSON（デフォルト値で補完済み）
 * @throws ForestGeneratorError
 */
export async function generateForestNoteJson(
  userText: string,
  date: string
): Promise<ForestNoteJSON> {
  if (!userText.trim()) {
    throw new ForestGeneratorError('テキストが入力されていません', 'validation');
  }

  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new ForestGeneratorError('日付形式が無効です（YYYY-MM-DD）', 'validation');
  }

  try {
    const aiConfig = getDefaultAIConfig();
    const aiProvider = createAIProvider(aiConfig);

    const prompt = `以下のユーザーテキストから、Forest Note v1.0 JSON を生成してください。

【入力テキスト】
${userText}

【生成要件】
1. version: "1.0" 固定
2. date: "${date}"
3. scores オブジェクト（7項目、各0-100）:
   - mental: メンタル状態スコア
   - body: 体力・身体的スコア
   - work: 仕事・作業スコア
   - relationship: 人間関係スコア
   - money: 金銭スコア
   - habit: 習慣達成スコア
   - dream: 夢・目標スコア
4. テキスト説明（各100字以内）:
   - mental, body, work, relationship, money, habit, dream
5. theme: テーマ（1行・20字以内）
6. summary: サマリー（2-3行・100字程度）
7. keywords: キーワード配列（3-5個）
8. items/locations/activities/emotions: 各配列（2-4個）
9. today_best: 今日のベストモーメント
10. lesson: 学んだこと
11. tomorrow: 明日への目標
12. ai_comment: AIコメント

【JSON フォーマット】
{
  "version": "1.0",
  "date": "${date}",
  "title": "...",
  "theme": "...",
  "summary": "...",
  "scores": {
    "mental": 50-100,
    "body": 50-100,
    "work": 50-100,
    "relationship": 50-100,
    "money": 50-100,
    "habit": 50-100,
    "dream": 50-100
  },
  "mental": "...",
  "body": "...",
  "work": "...",
  "relationship": "...",
  "money": "...",
  "habit": "...",
  "dream": "...",
  "keywords": [...],
  "items": [...],
  "locations": [...],
  "activities": [...],
  "emotions": [...],
  "today_best": "...",
  "lesson": "...",
  "tomorrow": "...",
  "ai_comment": "..."
}

JSONのみを返してください。説明文は不要です。`;

    const response = await callAIProvider(aiProvider, prompt);
    const json = JSON.parse(response);

    // 部分バリデーション（欠落フィールドにデフォルト値を設定）
    const validated = validateForestNoteJsonPartial(json);
    return validated;
  } catch (error) {
    if (error instanceof ForestGeneratorError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : '不明なエラー';

    if (errorMessage.includes('JSON')) {
      throw new ForestGeneratorError(
        'AI が無効な JSON を返しました。もう一度試すか、手動入力してください。',
        'generation',
        error as Error
      );
    }

    throw new ForestGeneratorError(
      'Forest Note 生成に失敗しました。API接続を確認してください。',
      'network',
      error as Error
    );
  }
}

/**
 * Card JSON を生成（Forest Note JSON → Card JSON v1.0）
 * 数値・属性の決定ロジックはここで実装
 * 将来: ルールベース生成へ差し替え可能
 * @param forestNote Forest Note JSON
 * @param date YYYY-MM-DD 形式の日付
 * @returns CardJSON（バリデーション済み）
 * @throws ForestGeneratorError
 */
export async function generateCardJson(
  forestNote: ForestNoteJSON,
  date: string
): Promise<CardJSON> {
  try {
    const aiConfig = getDefaultAIConfig();
    const aiProvider = createAIProvider(aiConfig);

    const prompt = `以下の Forest Note JSON から、Card JSON v1.0 を生成してください。

【入力: Forest Note JSON】
${JSON.stringify(forestNote, null, 2)}

【Card JSON v1.0 生成要件】
1. card_id: "gpt_" + YYYYMMDD + "_" + 3桁数字（例: "gpt_20260709_001"）
2. card_type: "Attack" 固定（v1.0はAttackのみ）
3. date: "${date}"
4. title: Forest Note の theme をそのまま使用
5. card_name: Forest Note の theme から、ゲームキャラクター風の名前を生成
6. rarity: scores の平均値から決定
   - 平均 < 40: "N"
   - 平均 40-59: "R"
   - 平均 60-74: "SR"
   - 平均 75-89: "SSR"
   - 平均 >= 90: "UR"
7. attribute: scores の最高値のキーから決定
   - mental → "Light"（知恵の光）
   - body → "Fire"（体力の炎）
   - work → "Earth"（仕事の大地）
   - relationship → "Water"（人間関係の水）
   - money → "Wind"（金銭の風）
   - habit → "Light"（習慣の光）
   - dream → "Dark"（夢の奥底）
8. hp: Math.round(scores.body * 999 / 100)（体力をHP化）
9. atk: Math.round(scores.work * 999 / 100)（仕事をATK化）
10. energy: Math.round(scores.mental / 10)（メンタルをエネルギー化、最大10）
11. skill.name: 生成テキスト（Forest Note のテーマから）
12. skill.type: attribute と同じ値
13. skill.effect: Forest Note の summary を短縮（100字以内）
14. flavor_text: Forest Note の ai_comment をそのまま使用
15. image_prompt: 【重要】イラストのみ・文字なし。attribute・theme・scoresから雰囲気をプロンプト生成
16. image_url: 空文字列（v1.5.0で画像生成時に値入力）
17. forest_note: 元の Forest Note JSON から最小限の参照フィールドのみ

【JSON フォーマット】
{
  "card_id": "gpt_...",
  "card_type": "Attack",
  "date": "${date}",
  "title": "...",
  "card_name": "...",
  "rarity": "N|R|SR|SSR|UR",
  "attribute": "Fire|Water|Wind|Earth|Light|Dark|Neutral",
  "hp": 0-999,
  "atk": 0-999,
  "energy": 0-10,
  "skill": {
    "name": "...",
    "type": "...",
    "effect": "..."
  },
  "flavor_text": "...",
  "image_prompt": "...",
  "image_url": "",
  "forest_note": {
    "theme": "...",
    "summary": "...",
    "today_best": "...",
    "lesson": "...",
    "tomorrow": "..."
  }
}

【image_prompt の重要ルール】
- 絶対に card_name・数字・テキストを含めない
- イラスト・背景・雰囲気・色合いのみを記述
- 例: "Warm sunrise light, serene landscape, soft orange glow, peaceful energy, no text"

JSONのみを返してください。説明文は不要です。`;

    const response = await callAIProvider(aiProvider, prompt);
    const json = JSON.parse(response);

    // 厳密なバリデーション（全必須項目チェック）
    const validated = validateCardJson(json);
    return validated;
  } catch (error) {
    if (error instanceof ForestGeneratorError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : '不明なエラー';

    if (errorMessage.includes('JSON')) {
      throw new ForestGeneratorError(
        'AI が無効な Card JSON を返しました。もう一度試すか、手動入力してください。',
        'generation',
        error as Error
      );
    }

    throw new ForestGeneratorError(
      'Card JSON 生成に失敗しました。API接続を確認してください。',
      'network',
      error as Error
    );
  }
}

/**
 * Image Prompt を生成（Forest Note JSON → イラスト用プロンプト）
 * 将来: より高度なプロンプト生成ロジックへ差し替え可能
 * @param forestNote Forest Note JSON
 * @returns image_prompt（イラスト生成用・文字なし）
 * @throws ForestGeneratorError
 */
export async function generateImagePrompt(forestNote: ForestNoteJSON): Promise<string> {
  try {
    const aiConfig = getDefaultAIConfig();
    const aiProvider = createAIProvider(aiConfig);

    const prompt = `以下の Forest Note データから、カード用イラストプロンプトを生成してください。

【入力】
- theme: ${forestNote.theme}
- summary: ${forestNote.summary}
- scores: ${JSON.stringify(forestNote.scores)}

【プロンプト生成要件】
【⚠️ 絶対ルール】
- 絶対に card_name・テキスト・数字を含めない
- テキスト要素をまったく入れない
- 雰囲気・色合い・イメージのみ

【スコアから雰囲気を決定】
- mental 高: 知恵の光・瞑想的・ミスティック
- body 高: 活力・炎・エネルギー
- work 高: 大地・安定・スケール感
- relationship 高: 人間・つながり・流動的
- money 高: 金色・光・豊かさ
- habit 高: 秩序・光・明確さ
- dream 高: 暗い・奥底・謎・可能性

【プロンプト例】
- "Serene mountain landscape with misty light, no text, peaceful energy, soft blue and gold tones"
- "Burning flames and dynamic energy, warm orange and red colors, powerful movement, no text"
- "Solid earth foundation with reaching trees, grounded and stable, green and brown natural colors"

テキストなし・イラストのみのプロンプトをテキストで返してください。（JSON不要、プレーンテキストのみ）`;

    const response = await callAIProvider(aiProvider, prompt);

    // プレーンテキストをそのまま返す
    const prompt_text = response.trim();

    if (!prompt_text) {
      throw new ForestGeneratorError(
        'Image prompt が空です',
        'generation'
      );
    }

    return prompt_text;
  } catch (error) {
    if (error instanceof ForestGeneratorError) {
      throw error;
    }

    throw new ForestGeneratorError(
      'Image prompt 生成に失敗しました。',
      'network',
      error as Error
    );
  }
}

/**
 * AI Provider 呼び出し（OpenAI失敗時は demo-ai にフォールバック）
 * @private
 */
async function callAIProvider(provider: ReturnType<typeof createAIProvider>, prompt: string): Promise<string> {
  try {
    // 現在のプロバイダーで試す
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_API_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    // OpenAI失敗時はフォールバック
    console.warn('OpenAI failed, using demo AI:', error);

    // Demo AI にフォールバック
    return generateDemoAIResponse(prompt);
  }
}

/**
 * Demo AI レスポンス生成（フォールバック用）
 * @private
 */
function generateDemoAIResponse(prompt: string): string {
  // プロンプトの内容に応じて demo レスポンスを生成
  if (prompt.includes('Forest Note JSON')) {
    // Forest Note JSON を生成
    return JSON.stringify({
      version: '1.0',
      date: new Date().toISOString().split('T')[0],
      title: '一日の記録',
      theme: 'バランスの取れた日',
      summary: 'いろいろあった一日でしたが、全体的に良い体験ができました。',
      scores: {
        mental: 70,
        body: 65,
        work: 75,
        relationship: 70,
        money: 60,
        habit: 80,
        dream: 65,
      },
      mental: 'いつもより前向きに過ごせました。',
      body: '適度に運動できました。',
      work: '生産的な作業ができました。',
      relationship: '大切な人と過ごす時間がありました。',
      money: '計画的な支出ができました。',
      habit: '習慣を守ることができました。',
      dream: '夢に向かって進めました。',
      keywords: ['成長', '充実', 'バランス'],
      items: ['手帳', 'コーヒー'],
      locations: ['家', 'オフィス'],
      activities: ['読書', 'ウォーキング'],
      emotions: ['満足', '感謝'],
      today_best: '朝日を見ながらの散歩',
      lesson: 'バランスが大切',
      tomorrow: 'さらに集中する',
      ai_comment: 'バランスの取れた素晴らしい一日ですね。',
    });
  } else if (prompt.includes('Card JSON')) {
    // Card JSON を生成
    return JSON.stringify({
      card_id: 'gpt_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '_001',
      card_type: 'Attack',
      date: new Date().toISOString().split('T')[0],
      title: 'バランスの日',
      card_name: '調和の戦士',
      rarity: 'SR',
      attribute: 'Light',
      hp: 700,
      atk: 750,
      energy: 7,
      skill: {
        name: '調和の光',
        type: 'Light',
        effect: 'すべての味方に力を与える',
      },
      flavor_text: 'バランスの取れた素晴らしい一日ですね。',
      image_prompt: 'Balanced harmony scene, soft golden light, peaceful colors, serene landscape, no text or numbers',
      image_url: '',
      forest_note: {
        theme: 'バランスの取れた日',
        summary: 'いろいろあった一日でしたが、全体的に良い体験ができました。',
        today_best: '朝日を見ながらの散歩',
        lesson: 'バランスが大切',
        tomorrow: 'さらに集中する',
      },
    });
  } else if (prompt.includes('Image Prompt')) {
    // Image Prompt を生成
    return 'Balanced harmony scene, soft golden light, peaceful atmosphere, serene landscape with natural colors, no text or numbers visible';
  }

  return '{}';
}
