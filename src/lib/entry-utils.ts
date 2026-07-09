import { DiaryEntry, Tasks, ForestNoteJSON, CardJSON } from './types';

/**
 * Supabase エントリを DiaryEntry にマッピング
 * snake_case → camelCase 変換・型変換を一元化
 */
export function mapSupabaseEntryToDiaryEntry(row: Record<string, unknown>): DiaryEntry {
  const habits = extractHabitChecks(row.habit_checks as Array<Record<string, unknown>> | undefined);

  return {
    id: row.id as string,
    date: row.date as string,
    text: (row.text as string) || '',
    imagePath: row.image_path as string | null,
    mood: (row.mood as number) || 0,
    energy: (row.energy as number) || 0,
    activity: (row.activity as string) || '',
    workTime: (row.work_time as number) || 0,
    tasks: habits,
    imageGenerated: (row.image_generated as boolean) || false,
    createdAt: row.created_at as string | undefined,
    updatedAt: row.updated_at as string | undefined,
    // 7-item life log scores (0-100)
    mental: (row.mental as number) || 0,
    body: (row.body as number) || 0,
    work: (row.work as number) || 0,
    relationship: (row.relationship as number) || 0,
    money: (row.money as number) || 0,
    habit: (row.habit as number) || 0,
    dream: (row.dream as number) || 0,
    // 7-item life log text
    mentalText: row.mental_text as string | undefined,
    bodyText: row.body_text as string | undefined,
    workText: row.work_text as string | undefined,
    relationshipText: row.relationship_text as string | undefined,
    moneyText: row.money_text as string | undefined,
    habitText: row.habit_text as string | undefined,
    dreamText: row.dream_text as string | undefined,
    // Meta lists
    keywords: (row.keywords as string[]) || [],
    items: (row.items as string[]) || [],
    locations: (row.locations as string[]) || [],
    activities: (row.activities as string[]) || [],
    emotions: (row.emotions as string[]) || [],
    // Daily summary
    todayBest: row.today_best as string | undefined,
    lesson: row.lesson as string | undefined,
    tomorrow: row.tomorrow as string | undefined,
    aiComment: row.ai_comment as string | undefined,
    // Forest Note & Card data
    forestNoteJson: row.forest_note_json as ForestNoteJSON | undefined,
    imagePrompt: row.image_prompt as string | undefined,
    imageUrl: row.image_url as string | undefined,
    cardId: row.card_id as string | undefined,
    cardJson: row.card_json as CardJSON | undefined,
    cardImageUrl: row.card_image_url as string | undefined,
    // Generation flags
    forestGenerated: (row.forest_generated as boolean) || false,
    cardGenerated: (row.card_generated as boolean) || false,
  };
}

/**
 * DiaryEntry を Supabase エントリにマッピング
 * camelCase → snake_case 変換
 */
export function mapDiaryEntryToSupabase(entry: DiaryEntry): Record<string, unknown> {
  return {
    user_id: entry.id ? undefined : undefined, // INSERT時のみ必要（userId別途）
    date: entry.date,
    text: entry.text,
    image_path: entry.imagePath,
    mood: entry.mood,
    energy: entry.energy,
    activity: entry.activity,
    work_time: entry.workTime,
    image_generated: entry.imageGenerated,
    // 7-item scores
    mental: entry.mental,
    body: entry.body,
    work: entry.work,
    relationship: entry.relationship,
    money: entry.money,
    habit: entry.habit,
    dream: entry.dream,
    // 7-item text
    mental_text: entry.mentalText,
    body_text: entry.bodyText,
    work_text: entry.workText,
    relationship_text: entry.relationshipText,
    money_text: entry.moneyText,
    habit_text: entry.habitText,
    dream_text: entry.dreamText,
    // Meta lists
    keywords: entry.keywords || [],
    items: entry.items || [],
    locations: entry.locations || [],
    activities: entry.activities || [],
    emotions: entry.emotions || [],
    // Daily summary
    today_best: entry.todayBest,
    lesson: entry.lesson,
    tomorrow: entry.tomorrow,
    ai_comment: entry.aiComment,
    // Forest Note & Card data
    forest_note_json: entry.forestNoteJson,
    image_prompt: entry.imagePrompt,
    image_url: entry.imageUrl,
    card_id: entry.cardId,
    card_json: entry.cardJson,
    card_image_url: entry.cardImageUrl,
    // Generation flags
    forest_generated: entry.forestGenerated || false,
    card_generated: entry.cardGenerated || false,
  };
}

/**
 * 習慣チェック配列から Tasks オブジェクトを抽出
 */
export function extractHabitChecks(habitChecksArray: Array<Record<string, unknown>> | undefined): Tasks {
  if (!habitChecksArray || habitChecksArray.length === 0) {
    return {
      pushups: false,
      squats: false,
      plank: false,
      run: false,
      reading: false,
      ai_learning: false,
    };
  }

  const hc = habitChecksArray[0];
  return {
    pushups: (hc.pushups as boolean) || false,
    squats: (hc.squats as boolean) || false,
    plank: (hc.plank as boolean) || false,
    run: (hc.run as boolean) || false,
    reading: (hc.reading as boolean) || false,
    ai_learning: (hc.ai_learning as boolean) || false,
  };
}
