'use client';

import { useState, useEffect, useMemo } from 'react';
import { ForestDisplay } from '@/components/ForestDisplay';
import { AchievementsPanel } from '@/components/AchievementsPanel';
import { AchievementUnlockedAnimation } from '@/components/AchievementUnlockedAnimation';
import { DiaryEntry } from '@/lib/types';
import { calculateForestState } from '@/lib/forest-calculator';
import Link from 'next/link';

interface HomeScreenOptimizedProps {
  entries: DiaryEntry[];
  achievementState: any;
  newlyUnlocked: any[];
  user?: any;
}

const HABITS = [
  { id: 'pushups', label: 'プッシュアップ', emoji: '💪' },
  { id: 'squats', label: 'スクワット', emoji: '🦵' },
  { id: 'plank', label: 'プランク', emoji: '🏋️' },
  { id: 'run', label: 'ラン', emoji: '🏃' },
  { id: 'reading', label: '読書', emoji: '📚' },
  { id: 'ai_learning', label: 'AI学習', emoji: '🤖' },
] as const;

export function HomeScreenOptimized({
  entries,
  achievementState,
  newlyUnlocked,
  user,
}: HomeScreenOptimizedProps) {
  // 今日のデータ
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find((e) => e.date === today);

  // 習慣達成数
  const taskCount = todayEntry
    ? (todayEntry.tasks.pushups ? 1 : 0) +
      (todayEntry.tasks.squats ? 1 : 0) +
      (todayEntry.tasks.plank ? 1 : 0) +
      (todayEntry.tasks.run ? 1 : 0) +
      (todayEntry.tasks.reading ? 1 : 0) +
      (todayEntry.tasks.ai_learning ? 1 : 0)
    : 0;

  // 連続記録日数
  let continuousDays = 0;
  for (let i = 0; i < entries.length; i++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const entry = entries.find((e) => e.date === dateStr);

    if (entry) {
      const count =
        (entry.tasks.pushups ? 1 : 0) +
        (entry.tasks.squats ? 1 : 0) +
        (entry.tasks.plank ? 1 : 0) +
        (entry.tasks.run ? 1 : 0) +
        (entry.tasks.reading ? 1 : 0) +
        (entry.tasks.ai_learning ? 1 : 0);
      if (count > 0) {
        continuousDays++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // 森の成長
  const forestState = calculateForestState(taskCount, continuousDays, entries.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* トップバー（最小化） */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🌲 Forest Note</h1>
          <p className="text-xs text-gray-500 mt-0.5">毎朝3分の成長記録</p>
        </div>
        <div className="text-right">
          {user && <p className="text-xs text-gray-600">{user.email}</p>}
          <div className="text-sm font-bold text-indigo-600 mt-1">
            連続 {continuousDays} 日
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* 森の成長（大きく表示） */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-md">
            <ForestDisplay forestState={forestState} />
          </div>
        </div>

        {/* 実績パネル（コンパクト） */}
        {achievementState && (
          <div className="px-4 pb-4">
            <AchievementsPanel state={achievementState} compact={true} />
          </div>
        )}

        {/* 今日の習慣チェック（最小） */}
        {todayEntry === undefined && (
          <div className="px-4 pb-4">
            <div className="bg-blue-50 rounded-lg border-2 border-blue-300 p-4 text-center">
              <p className="text-sm font-bold text-blue-800 mb-2">
                📝 まだ今日の記録がありません
              </p>
              <p className="text-xs text-blue-700 mb-3">
                下の「記録する」ボタンから3分で完了できます
              </p>
            </div>
          </div>
        )}
      </div>

      {/* フローティングアクションボタン（下部固定） */}
      <div className="flex-shrink-0 bg-white shadow-2xl border-t-2 border-gray-200 px-4 py-3 grid grid-cols-3 gap-2">
        <Link href="/">
          <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-sm transition">
            🏠 ホーム
          </button>
        </Link>
        <Link href="/input/paste">
          <button className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-sm transition shadow-lg transform hover:scale-105">
            ✏️ 記録する
          </button>
        </Link>
        <Link href="/calendar">
          <button className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-bold text-sm transition">
            📅 確認
          </button>
        </Link>
      </div>

      {/* 実績解除アニメーション */}
      <AchievementUnlockedAnimation achievements={newlyUnlocked} />
    </div>
  );
}
