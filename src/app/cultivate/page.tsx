'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/AuthGuard';
import { ForestDisplay } from '@/components/ForestDisplay';
import { calculateForestState, getAnimalEmoji, getSeasonLabel } from '@/lib/forest-calculator';
import { DiaryEntry } from '@/lib/types';
import { storage } from '@/lib/storage';
import Link from 'next/link';

function CultivatePageComponent() {
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
  const { forestState, taskCount, continuousDays, totalAnimalsUnlocked, nextLevelEXP } = useMemo(() => {
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
    const nextLevel = Math.ceil((state.level + 1) / 20) * 20;
    return {
      forestState: state,
      taskCount: count,
      continuousDays: days,
      totalAnimalsUnlocked: state.animals.length,
      nextLevelEXP: Math.max(nextLevel - state.level, 1),
    };
  }, [entries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🌳</div>
          <p className="text-green-700 font-semibold">森を育成中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col pb-24">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-green-900 to-emerald-900 text-white shadow-lg py-6 px-4">
        <h1 className="forest-hero-title text-3xl md:text-4xl">🌳 森を育成する</h1>
        <p className="forest-subtitle mt-2">毎日の冒険が森を成長させます</p>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col px-4 py-6 max-w-4xl mx-auto w-full">
        {/* クイックステータス */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="forest-stat-box text-center">
            <div className="text-sm text-gray-600 font-semibold">森のレベル</div>
            <div className="text-3xl font-bold text-green-600 mt-2 animate-glow-pulse">{forestState.level}</div>
            <div className="text-xs text-gray-500 mt-1">次: +{nextLevelEXP}</div>
          </div>

          <div className="forest-stat-box text-center">
            <div className="text-sm text-gray-600 font-semibold">樹木数</div>
            <div className="text-3xl font-bold text-amber-600 mt-2">{forestState.trees}</div>
            <div className="text-xs text-gray-500 mt-1">本</div>
          </div>

          <div className="forest-stat-box text-center">
            <div className="text-sm text-gray-600 font-semibold">季節</div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">{getSeasonLabel(forestState.season)}</div>
          </div>

          <div className="forest-stat-box text-center">
            <div className="text-sm text-gray-600 font-semibold">動物</div>
            <div className="text-3xl font-bold text-rose-600 mt-2">{totalAnimalsUnlocked}</div>
            <div className="text-xs text-gray-500 mt-1">種類</div>
          </div>
        </section>

        {/* 森ビジュアル */}
        <section className="mb-8">
          <ForestDisplay forestState={forestState} />
        </section>

        {/* 育成スキル・メニュー */}
        <section className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 冒険ボタン */}
          <div className="forest-panel p-6 shadow-xl">
            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚔️</span>冒険ログを記録
            </h3>
            <p className="text-sm text-gray-700 mb-4">今日の冒険を記録して、森を成長させましょう</p>
            <Link href="/adventure">
              <button className="forest-btn-primary w-full py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
                冒険ログを入力
              </button>
            </Link>
          </div>

          {/* 図鑑ボタン */}
          <div className="forest-panel p-6 shadow-xl">
            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📚</span>獲得カード
            </h3>
            <p className="text-sm text-gray-700 mb-4">これまでに出現した、冒険で得たカード</p>
            <Link href="/cards">
              <button className="forest-btn-secondary w-full py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
                図鑑を見る
              </button>
            </Link>
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
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200 flex flex-col items-center justify-center min-w-24"
                >
                  <div className="text-3xl mb-2">{getAnimalEmoji(animal)}</div>
                  <div className="text-xs font-semibold text-green-700 capitalize text-center">{animal}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 育成統計 */}
        <section className="forest-panel p-6">
          <h2 className="text-lg font-bold text-green-800 mb-4">📊 育成統計</h2>
          <div className="space-y-4">
            {/* 連続記録 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-l-4 border-amber-500">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">🔥 連続記録日数</span>
                <span className="text-2xl font-bold text-amber-600">{continuousDays}日</span>
              </div>
            </div>

            {/* 本日の習慣 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">✨ 本日の習慣達成</span>
                <span className="text-2xl font-bold text-green-600">{taskCount}/6</span>
              </div>
            </div>

            {/* カード数 */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border-l-4 border-rose-500">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">🎴 獲得カード</span>
                <span className="text-2xl font-bold text-rose-600">{entries.length}枚</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function CultivatePage() {
  return (
    <AuthGuard>
      <CultivatePageComponent />
    </AuthGuard>
  );
}
