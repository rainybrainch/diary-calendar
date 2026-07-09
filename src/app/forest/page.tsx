'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/AuthGuard';
import { ForestDisplay } from '@/components/ForestDisplay';
import { calculateForestState, getAnimalEmoji, getSeasonLabel } from '@/lib/forest-calculator';
import { DiaryEntry } from '@/lib/types';
import { storage } from '@/lib/storage';

function ForestPageComponent() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const data = storage.getData();
      setEntries(data.entries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 森の成長情報を計算
  const { forestState, taskCount, continuousDays, totalAnimalsUnlocked } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
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
        if (c > 0) days++;
        else break;
      } else break;
    }

    const state = calculateForestState(count, days, entries.length);
    return {
      forestState: state,
      taskCount: count,
      continuousDays: days,
      totalAnimalsUnlocked: state.animals.length,
    };
  }, [entries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🌲</div>
          <p className="text-green-700 font-semibold">森を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col pb-24">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-green-900 to-emerald-900 text-white shadow-lg py-6 px-4">
        <h1 className="forest-hero-title text-3xl md:text-4xl">🌲 あなたの森</h1>
        <p className="forest-subtitle mt-2">毎日の習慣で育ちます</p>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col px-4 py-6 max-w-4xl mx-auto w-full">
        {/* 森ビジュアル（メイン） */}
        <section className="mb-8">
          <ForestDisplay forestState={forestState} />
        </section>

        {/* 詳細ステータス */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* レベル */}
          <div className="forest-stat-box">
            <div className="text-sm text-gray-600 font-semibold">森のレベル</div>
            <div className="text-3xl font-bold text-green-600 mt-2">Lv {forestState.level}</div>
            <div className="text-xs text-gray-500 mt-1">{forestState.level}/100</div>
          </div>

          {/* 季節 */}
          <div className="forest-stat-box">
            <div className="text-sm text-gray-600 font-semibold">現在の季節</div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">{getSeasonLabel(forestState.season)}</div>
            <div className="text-xs text-gray-500 mt-1">Lv {forestState.level}</div>
          </div>

          {/* 木の本数 */}
          <div className="forest-stat-box">
            <div className="text-sm text-gray-600 font-semibold">樹木数</div>
            <div className="text-3xl font-bold text-amber-600 mt-2">{forestState.trees}</div>
            <div className="text-xs text-gray-500 mt-1">本</div>
          </div>

          {/* 出現した動物 */}
          <div className="forest-stat-box">
            <div className="text-sm text-gray-600 font-semibold">出現した動物</div>
            <div className="text-3xl font-bold text-rose-600 mt-2">{totalAnimalsUnlocked}</div>
            <div className="text-xs text-gray-500 mt-1">種類</div>
          </div>
        </section>

        {/* 動物図鑑 */}
        {forestState.animals.length > 0 && (
          <section className="forest-panel p-6 mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-4">🦋 動物図鑑</h2>
            <div className="flex flex-wrap gap-4">
              {forestState.animals.map((animal) => (
                <div
                  key={animal}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200 flex flex-col items-center justify-center min-w-20"
                >
                  <div className="text-3xl mb-2">{getAnimalEmoji(animal)}</div>
                  <div className="text-xs font-semibold text-green-700 capitalize text-center">{animal}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 今日の成長情報 */}
        <section className="forest-panel p-6">
          <h2 className="text-lg font-bold text-green-800 mb-4">📊 今日の成長</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">習慣達成数</span>
              <span className="font-bold text-emerald-600">{taskCount}/6</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">連続記録日数</span>
              <span className="font-bold text-amber-600">{continuousDays}日</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">総カード枚数</span>
              <span className="font-bold text-rose-600">{entries.length}枚</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ForestPage() {
  return (
    <AuthGuard>
      <ForestPageComponent />
    </AuthGuard>
  );
}
