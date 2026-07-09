import { supabase } from './supabase';
import { DiaryEntry, ForestNoteJSON, CardJSON } from './types';

interface SupabaseEntry {
  id: string;
  date: string;
  text: string;
  image_path: string | null;
  mood: number;
  energy: number;
  activity: string;
  work_time: number;
  image_generated?: boolean;
  created_at?: string;
  updated_at?: string;
  habit_checks?: Array<{ [key: string]: boolean }>;
  // 7-item life log scores
  mental?: number;
  body?: number;
  work?: number;
  relationship?: number;
  money?: number;
  habit?: number;
  dream?: number;
  // 7-item life log text
  mental_text?: string;
  body_text?: string;
  work_text?: string;
  relationship_text?: string;
  money_text?: string;
  habit_text?: string;
  dream_text?: string;
  // Meta lists
  keywords?: string[];
  items?: string[];
  locations?: string[];
  activities?: string[];
  emotions?: string[];
  // Daily summary
  today_best?: string;
  lesson?: string;
  tomorrow?: string;
  ai_comment?: string;
  // Forest Note & Card data
  forest_note_json?: ForestNoteJSON;
  image_prompt?: string;
  image_url?: string;
  card_id?: string;
  card_json?: CardJSON;
  card_image_url?: string;
  // Generation flags
  forest_generated?: boolean;
  card_generated?: boolean;
}

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const STORAGE_KEY = 'diary_entries_demo';

export class SupabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

const getStoredEntries = (): DiaryEntry[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveStoredEntries = (entries: DiaryEntry[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getDiaryEntries = async (
  userId: string,
  year: number,
  month: number
): Promise<DiaryEntry[]> => {
  try {
    if (DEMO_MODE) {
      const allEntries = getStoredEntries();
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = new Date(year, month + 1, 0);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

      return allEntries.filter(e => e.date >= startDate && e.date <= endDateStr).sort((a, b) => a.date.localeCompare(b.date));
    }

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = new Date(year, month + 1, 0);
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('diary_entries')
      .select('*, habit_checks(*)')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    if (error) throw new SupabaseError(error.message, error.code);

    return (data || []).map((entry: SupabaseEntry) => ({
      id: entry.id,
      date: entry.date,
      text: entry.text || '',
      imagePath: entry.image_path,
      mood: entry.mood || 0,
      energy: entry.energy || 0,
      activity: entry.activity || '',
      workTime: entry.work_time || 0,
      tasks: entry.habit_checks?.[0]
        ? {
            pushups: entry.habit_checks[0].pushups || false,
            squats: entry.habit_checks[0].squats || false,
            plank: entry.habit_checks[0].plank || false,
            run: entry.habit_checks[0].run || false,
            reading: entry.habit_checks[0].reading || false,
            ai_learning: entry.habit_checks[0].ai_learning || false,
          }
        : { pushups: false, squats: false, plank: false, run: false, reading: false, ai_learning: false },
      imageGenerated: entry.image_generated || false,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
      // 7-item life log scores
      mental: entry.mental,
      body: entry.body,
      work: entry.work,
      relationship: entry.relationship,
      money: entry.money,
      habit: entry.habit,
      dream: entry.dream,
      // 7-item life log text
      mentalText: entry.mental_text,
      bodyText: entry.body_text,
      workText: entry.work_text,
      relationshipText: entry.relationship_text,
      moneyText: entry.money_text,
      habitText: entry.habit_text,
      dreamText: entry.dream_text,
      // Meta lists
      keywords: entry.keywords || [],
      items: entry.items || [],
      locations: entry.locations || [],
      activities: entry.activities || [],
      emotions: entry.emotions || [],
      // Daily summary
      todayBest: entry.today_best,
      lesson: entry.lesson,
      tomorrow: entry.tomorrow,
      aiComment: entry.ai_comment,
      // Forest Note & Card data
      forestNoteJson: entry.forest_note_json,
      imagePrompt: entry.image_prompt,
      imageUrl: entry.image_url,
      cardId: entry.card_id,
      cardJson: entry.card_json,
      cardImageUrl: entry.card_image_url,
      // Generation flags
      forestGenerated: entry.forest_generated || false,
      cardGenerated: entry.card_generated || false,
    }));
  } catch (error) {
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError(`日記データ取得エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};

export const saveDiaryEntry = async (userId: string, entry: DiaryEntry): Promise<DiaryEntry> => {
  try {
    if (DEMO_MODE) {
      const allEntries = getStoredEntries();
      const existingIndex = allEntries.findIndex(e => e.date === entry.date);
      const now = new Date().toISOString();

      const entryWithMeta: DiaryEntry = {
        ...entry,
        id: entry.id || `demo-${Date.now()}`,
        createdAt: entry.createdAt || now,
        updatedAt: now,
      };

      if (existingIndex >= 0) {
        allEntries[existingIndex] = entryWithMeta;
      } else {
        allEntries.push(entryWithMeta);
      }

      saveStoredEntries(allEntries);
      return entryWithMeta;
    }

    const diaryData = {
      user_id: userId,
      date: entry.date,
      text: entry.text,
      mood: entry.mood,
      energy: entry.energy,
      activity: entry.activity,
      work_time: entry.workTime,
      image_generated: entry.imageGenerated,
      // 7-item life log scores
      mental: entry.mental,
      body: entry.body,
      work: entry.work,
      relationship: entry.relationship,
      money: entry.money,
      habit: entry.habit,
      dream: entry.dream,
      // 7-item life log text
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

    const { data: diaryEntry, error: diaryError } = await supabase
      .from('diary_entries')
      .upsert(diaryData, {
        onConflict: 'user_id,date',
      })
      .select()
      .single();

    if (diaryError) throw new SupabaseError(`日記保存エラー: ${diaryError.message}`, diaryError.code);
    if (!diaryEntry) throw new SupabaseError('日記データが返されませんでした');

    const habitData = {
      diary_entry_id: diaryEntry.id,
      pushups: entry.tasks.pushups || false,
      squats: entry.tasks.squats || false,
      plank: entry.tasks.plank || false,
      run: entry.tasks.run || false,
      reading: entry.tasks.reading || false,
      ai_learning: entry.tasks.ai_learning || false,
    };

    const { error: habitError } = await supabase
      .from('habit_checks')
      .upsert(habitData, {
        onConflict: 'diary_entry_id',
      })
      .select()
      .single();

    if (habitError) throw new SupabaseError(`習慣チェック保存エラー: ${habitError.message}`, habitError.code);

    return {
      id: diaryEntry.id,
      date: diaryEntry.date,
      text: diaryEntry.text,
      imagePath: diaryEntry.image_path,
      mood: diaryEntry.mood,
      energy: diaryEntry.energy,
      activity: diaryEntry.activity,
      workTime: diaryEntry.work_time,
      tasks: entry.tasks,
      imageGenerated: diaryEntry.image_generated,
      createdAt: diaryEntry.created_at,
      updatedAt: diaryEntry.updated_at,
      // 7-item life log scores
      mental: entry.mental,
      body: entry.body,
      work: entry.work,
      relationship: entry.relationship,
      money: entry.money,
      habit: entry.habit,
      dream: entry.dream,
      // 7-item life log text
      mentalText: entry.mentalText,
      bodyText: entry.bodyText,
      workText: entry.workText,
      relationshipText: entry.relationshipText,
      moneyText: entry.moneyText,
      habitText: entry.habitText,
      dreamText: entry.dreamText,
      // Meta lists
      keywords: entry.keywords || [],
      items: entry.items || [],
      locations: entry.locations || [],
      activities: entry.activities || [],
      emotions: entry.emotions || [],
      // Daily summary
      todayBest: entry.todayBest,
      lesson: entry.lesson,
      tomorrow: entry.tomorrow,
      aiComment: entry.aiComment,
      // Forest Note & Card data
      forestNoteJson: entry.forestNoteJson,
      imagePrompt: entry.imagePrompt,
      imageUrl: entry.imageUrl,
      cardId: entry.cardId,
      cardJson: entry.cardJson,
      cardImageUrl: entry.cardImageUrl,
      // Generation flags
      forestGenerated: entry.forestGenerated || false,
      cardGenerated: entry.cardGenerated || false,
    };
  } catch (error) {
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError(`日記保存失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};

export const deleteDiaryEntry = async (entryId: string): Promise<void> => {
  try {
    if (DEMO_MODE) {
      const allEntries = getStoredEntries();
      const filtered = allEntries.filter(e => e.id !== entryId);
      saveStoredEntries(filtered);
      return;
    }

    const { error } = await supabase.from('diary_entries').delete().eq('id', entryId);

    if (error) throw new SupabaseError(`日記削除エラー: ${error.message}`, error.code);
  } catch (error) {
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError(`日記削除失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};
