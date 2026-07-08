import { useEffect, useState } from 'react';
import {
  AchievementState,
  checkAchievements,
  checkTitles,
  loadAchievementState,
  saveAchievementState,
} from '@/lib/achievements';
import { storage } from '@/lib/storage';

/**
 * 実績システムの管理 hook
 */
export function useAchievements() {
  const [state, setState] = useState<AchievementState>({
    unlockedAchievements: [],
    totalAchievements: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [newlyUnlocked, setNewlyUnlocked] = useState<any[]>([]);

  // 初期化
  useEffect(() => {
    const achievementState = loadAchievementState();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(achievementState);
  }, []);

  // ユーザーデータから実績を判定
  useEffect(() => {
    const data = storage.getData();
    if (data.entries.length === 0) return;

    // 連続記録日数を計算
    let streakDays = 0;
    const today = new Date();
    for (let i = 0; i < data.entries.length; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entry = data.entries.find((e: any) => e.date === dateStr);

      if (entry) {
        const count =
          (entry.tasks?.pushups ? 1 : 0) +
          (entry.tasks?.squats ? 1 : 0) +
          (entry.tasks?.plank ? 1 : 0) +
          (entry.tasks?.run ? 1 : 0) +
          (entry.tasks?.reading ? 1 : 0) +
          (entry.tasks?.ai_learning ? 1 : 0);
        if (count > 0) {
          streakDays++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // 習慣達成数（累計）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const habitCount = data.entries.reduce((sum: number, entry: any) => {
      const count =
        (entry.tasks?.pushups ? 1 : 0) +
        (entry.tasks?.squats ? 1 : 0) +
        (entry.tasks?.plank ? 1 : 0) +
        (entry.tasks?.run ? 1 : 0) +
        (entry.tasks?.reading ? 1 : 0) +
        (entry.tasks?.ai_learning ? 1 : 0);
      return sum + count;
    }, 0);

    // カードレベル（最高）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cardLevel = data.entries.reduce((max: number, entry: any) => {
      return Math.max(max, entry.evolution?.level || 0);
    }, 0);

    // 森のレベル（最高）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const forestLevel = data.entries.reduce((max: number, entry: any) => {
      return Math.max(max, entry.forest_level || 0);
    }, 0);

    // 実績をチェック
    const newAchievements = checkAchievements(
      state.unlockedAchievements,
      streakDays,
      habitCount,
      cardLevel,
      forestLevel
    );

    if (newAchievements.length > 0) {
      // 新しく解除された実績がある
      const updated = [...state.unlockedAchievements, ...newAchievements];

      // 称号もチェック
      const newTitles = checkTitles(state.equippedTitle ? [state.equippedTitle] : [], updated.length);

      const newState: AchievementState = {
        unlockedAchievements: updated,
        equippedTitle: newTitles.length > 0 ? newTitles[0] : state.equippedTitle,
        totalAchievements: state.totalAchievements,
        newlyUnlocked: newAchievements,
      };

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(newState);
      setNewlyUnlocked(newAchievements);
      saveAchievementState(newState);

      // 2秒後に新規実績をクリア
      setTimeout(() => {
        setNewlyUnlocked([]);
      }, 2000);
    }
  }, [storage.getData()]);

  return {
    state,
    newlyUnlocked,
    clearNewlyUnlocked: () => setNewlyUnlocked([]),
  };
}
