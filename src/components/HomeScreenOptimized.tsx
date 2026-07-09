'use client';

import { useMemo, memo } from 'react';
import { User } from '@supabase/supabase-js';
import { ForestDisplay } from '@/components/ForestDisplay';
import { AchievementUnlockedAnimation } from '@/components/AchievementUnlockedAnimation';
import { DiaryEntry } from '@/lib/types';
import { calculateForestState } from '@/lib/forest-calculator';
import { AchievementState, Achievement } from '@/lib/achievements';
import Link from 'next/link';

interface HomeScreenOptimizedProps {
  entries: DiaryEntry[];
  achievementState: AchievementState;
  newlyUnlocked: Achievement[];
  user?: User;
}

function HomeScreenOptimizedComponent({
  entries,
  achievementState,
  newlyUnlocked,
  user,
}: HomeScreenOptimizedProps) {
  // 今日のデータ
  const today = new Date().toISOString().split('T')[0];

  // 連続日数と習慣達成数をメモ化
  const { taskCount, continuousDays } = useMemo(() => {
    const todayEntry = entries.find((e) => e.date === today);
    const count = todayEntry
      ? (todayEntry.tasks.pushups ? 1 : 0) +
        (todayEntry.tasks.squats ? 1 : 0) +
        (todayEntry.tasks.plank ? 1 : 0) +
        (todayEntry.tasks.run ? 1 : 0) +
        (todayEntry.tasks.reading ? 1 : 0) +
        (todayEntry.tasks.ai_learning ? 1 : 0)
      : 0;

    let days = 0;
    for (let i = 0; i < entries.length; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const entry = entries.find((e) => e.date === dateStr);

      if (entry) {
        const c =
          (entry.tasks.pushups ? 1 : 0) +
          (entry.tasks.squats ? 1 : 0) +
          (entry.tasks.plank ? 1 : 0) +
          (entry.tasks.run ? 1 : 0) +
          (entry.tasks.reading ? 1 : 0) +
          (entry.tasks.ai_learning ? 1 : 0);
        if (c > 0) {
          days++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return { taskCount: count, continuousDays: days };
  }, [entries, today]);

  // 森の成長
  const forestState = useMemo(
    () => calculateForestState(taskCount, continuousDays, entries.length),
    [taskCount, continuousDays, entries.length]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col pb-32">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-green-900 to-emerald-900 text-white shadow-lg py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="forest-hero-title text-2xl md:text-3xl">🌲 あなたの森</h1>
          </div>
          <div className="text-right">
            <div
              className="text-sm font-bold text-yellow-300"
              role="status"
              aria-live="polite"
              aria-label={`連続 ${continuousDays} 日達成中`}
            >
              🔥 {continuousDays}日連続
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col px-4 max-w-2xl mx-auto w-full py-6">
        {/* 森ビジュアル（メイン・大きく） */}
        <section className="mb-8">
          <ForestDisplay forestState={forestState} />
        </section>

        {/* 今日のステータス（簡潔） */}
        <section className="grid grid-cols-3 gap-3 mb-6">
          <div className="forest-stat-box text-center">
            <div className="text-xs text-gray-600 font-semibold">Lv</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{forestState.level}</div>
          </div>
          <div className="forest-stat-box text-center">
            <div className="text-xs text-gray-600 font-semibold">習慣</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{taskCount}/6</div>
          </div>
          <div className="forest-stat-box text-center">
            <div className="text-xs text-gray-600 font-semibold">カード</div>
            <div className="text-2xl font-bold text-rose-600 mt-1">{entries.length}</div>
          </div>
        </section>

        {/* クイックアクション */}
        <section className="space-y-3">
          {/* 冒険ログCTA */}
          <Link href="/adventure">
            <button className="w-full bg-gradient-to-b from-amber-600 to-amber-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:from-amber-700 hover:to-amber-800 transition-all transform hover:scale-105 flex items-center justify-center gap-3">
              <span className="text-2xl">⚔️</span>
              <span>冒険ログを記録</span>
            </button>
          </Link>

          {/* 育成画面 */}
          <Link href="/cultivate">
            <button className="w-full bg-gradient-to-b from-green-600 to-emerald-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-800 transition-all transform hover:scale-105 flex items-center justify-center gap-3">
              <span className="text-2xl">🌳</span>
              <span>森を育成する</span>
            </button>
          </Link>

          {/* 図鑑 */}
          <Link href="/cards">
            <button className="w-full bg-gradient-to-b from-purple-600 to-indigo-700 text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              <span className="text-xl">📚</span>
              <span>カード図鑑</span>
            </button>
          </Link>
        </section>
      </main>

      {/* 実績解除アニメーション */}
      <AchievementUnlockedAnimation achievements={newlyUnlocked} />
    </div>
  );
}

export const HomeScreenOptimized = memo(HomeScreenOptimizedComponent);
