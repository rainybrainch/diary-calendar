import { supabase } from './supabase';

export async function getPublicUserProfile(username: string) {
  // profiles_public view から取得（RLS で安全）
  const { data: user, error: userError } = await supabase
    .from('profiles_public')
    .select('id, username, display_name, created_at')
    .eq('username', username)
    .single();

  if (userError || !user) {
    return null;
  }

  return user;
}

export async function getPublicUserEntries(userId: string, year: number, month: number) {
  // 表面情報のみ取得（日記本文は除外）
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = new Date(year, month + 1, 0);
  const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  const { data: entries, error } = await supabase
    .from('diary_entries')
    .select('id, date, mood, energy, work_time, image_generated, habit_checks(*)')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDateStr)
    .order('date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch public entries: ${error.message}`);
  }

  return (entries || []).map((entry: any) => ({
    id: entry.id,
    date: entry.date,
    text: entry.text || '',
    activity: entry.activity || '',
    mood: entry.mood || 0,
    energy: entry.energy || 0,
    workTime: entry.work_time || 0,
    imageGenerated: entry.image_generated || false,
    tasks: entry.habit_checks?.[0]
      ? {
          pushups: entry.habit_checks[0].pushups || false,
          squats: entry.habit_checks[0].squats || false,
          plank: entry.habit_checks[0].plank || false,
          run: entry.habit_checks[0].run || false,
          reading: entry.habit_checks[0].reading || false,
          ai_learning: entry.habit_checks[0].ai_learning || false,
        }
      : {
          pushups: false,
          squats: false,
          plank: false,
          run: false,
          reading: false,
          ai_learning: false,
        },
  }));
}

export async function getPublicUserStats(userId: string) {
  // 過去30日間の統計
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: entries, error } = await supabase
    .from('diary_entries')
    .select('mood, energy, work_time, habit_checks(*)')
    .eq('user_id', userId)
    .gte('date', startDate);

  if (error) {
    throw new Error(`Failed to fetch user stats: ${error.message}`);
  }

  const totalDays = entries?.length || 0;
  const completedDays =
    entries?.filter((e: any) => {
      const habitCount =
        (e.habit_checks?.[0]?.pushups ? 1 : 0) +
        (e.habit_checks?.[0]?.squats ? 1 : 0) +
        (e.habit_checks?.[0]?.plank ? 1 : 0) +
        (e.habit_checks?.[0]?.run ? 1 : 0) +
        (e.habit_checks?.[0]?.reading ? 1 : 0) +
        (e.habit_checks?.[0]?.ai_learning ? 1 : 0);
      return habitCount > 0;
    }).length || 0;

  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const avgMood = entries?.length
    ? Math.round(entries.reduce((sum: number, e: any) => sum + (e.mood || 0), 0) / entries.length)
    : 0;

  return {
    totalDays,
    completedDays,
    completionRate,
    averageMood: avgMood,
  };
}
