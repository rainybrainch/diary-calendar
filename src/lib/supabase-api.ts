import { supabase } from './supabase';
import { DiaryEntry, ForestNoteJSON, CardJSON } from './types';
import { mapSupabaseEntryToDiaryEntry, mapDiaryEntryToSupabase } from './entry-utils';

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

    return (data || []).map((entry: SupabaseEntry) =>
      mapSupabaseEntryToDiaryEntry(entry as unknown as Record<string, unknown>)
    );
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
      ...mapDiaryEntryToSupabase(entry),
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

    // Supabase の応答をマッピングして返す
    const result = mapSupabaseEntryToDiaryEntry({
      ...diaryEntry,
      habit_checks: [entry.tasks],
    });
    return result;
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
