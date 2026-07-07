import { supabase } from './supabase';
import { DiaryEntry, Tasks } from './types';

export class SupabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export const getDiaryEntries = async (
  userId: string,
  year: number,
  month: number
): Promise<DiaryEntry[]> => {
  try {
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

    return (data || []).map((entry: any) => ({
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
    }));
  } catch (error) {
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError(`日記データ取得エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};

export const saveDiaryEntry = async (userId: string, entry: DiaryEntry): Promise<DiaryEntry> => {
  try {
    const diaryData = {
      user_id: userId,
      date: entry.date,
      text: entry.text,
      mood: entry.mood,
      energy: entry.energy,
      activity: entry.activity,
      work_time: entry.workTime,
      image_generated: entry.imageGenerated,
    };

    // 1. diary_entries を UPSERT
    const { data: diaryEntry, error: diaryError } = await supabase
      .from('diary_entries')
      .upsert(diaryData, {
        onConflict: 'user_id,date',
      })
      .select()
      .single();

    if (diaryError) throw new SupabaseError(`日記保存エラー: ${diaryError.message}`, diaryError.code);
    if (!diaryEntry) throw new SupabaseError('日記データが返されませんでした');

    // 2. habit_checks を UPSERT
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

    // 成功時に完全なデータを返す
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
    };
  } catch (error) {
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError(`日記保存失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};

export const deleteDiaryEntry = async (entryId: string): Promise<void> => {
  try {
    // habit_checks は自動削除（cascade）
    const { error } = await supabase.from('diary_entries').delete().eq('id', entryId);

    if (error) throw new SupabaseError(`日記削除エラー: ${error.message}`, error.code);
  } catch (error) {
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError(`日記削除失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};
