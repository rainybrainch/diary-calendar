'use client';

import { useMemo, memo } from 'react';
import { User } from '@supabase/supabase-js';
import { ForestDisplay } from '@/components/ForestDisplay';
import { AchievementsPanel } from '@/components/AchievementsPanel';
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

  const todayEntry = entries.find((e) => e.date === today);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col pb-24">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-green-900 to-emerald-900 text-white shadow-lg py-6 px-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="forest-hero-title text-3xl md:text-4xl">🌲 Forest Note</h1>
            <p className="forest-subtitle mt-2">毎朝3分の成長記録</p>
          </div>
          <div className="text-right hidden sm:block">
            {user && <p className="text-xs text-green-100">{user.email}</p>}
            <div
              className="text-sm font-bold text-yellow-300 mt-1"
              role="status"
              aria-live="polite"
              aria-label={`連続 ${continuousDays} 日達成中`}
            >
              連続 {continuousDays} 日 🔥
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col px-4 max-w-4xl mx-auto w-full py-6">
        {/* EXPプレビュー（上部ミニサマリー） */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="forest-stat-box">
            <div className="text-xs text-gray-600 font-semibold">森レベル</div>
            <div className="text-2xl font-bold text-green-600 mt-1">Lv {forestState.level}</div>
          </div>
          <div className="forest-stat-box">
            <div className="text-xs text-gray-600 font-semibold">今日の習慣</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{taskCount}/6</div>
          </div>
          <div className="forest-stat-box hidden md:block">
            <div className="text-xs text-gray-600 font-semibold">総カード枚数</div>
            <div className="text-2xl font-bold text-rose-600 mt-1">{entries.length}</div>
          </div>
        </section>

        {/* 森の成長（メイン） */}
        <section className="mb-6">
          <ForestDisplay forestState={forestState} />
        </section>

        {/* 実績パネル（コンパクト） */}
        {achievementState && (
          <section className="mb-6">
            <AchievementsPanel state={achievementState} compact={true} />
          </section>
        )}

        {/* 今日の記録CTA */}
        {todayEntry === undefined && (
          <section className="mb-6">
            <Link href="/input/paste">
              <button
                className="w-full bg-gradient-to-b from-green-500 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                aria-label="今日の記録を入力する"
              >
                <span className="text-2xl animate-glow-pulse">✨</span>
                <span>今日の記録を始める</span>
              </button>
            </Link>
          </section>
        )}

        {/* 今日の成長概要 */}
        {todayEntry && (
          <section className="forest-panel p-6">
            <h2 className="text-lg font-bold text-green-800 mb-4">📝 今日の記録済み</h2>
            <div className="flex items-center gap-4">
              <div className="text-3xl">✅</div>
              <div>
                <p className="text-sm text-gray-600">習慣達成: {taskCount}/6</p>
                <p className="text-xs text-gray-500 mt-1">本日分を記録しました</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 実績解除アニメーション */}
      <AchievementUnlockedAnimation achievements={newlyUnlocked} />
    </div>
  );
}

export const HomeScreenOptimized = memo(HomeScreenOptimizedComponent);
