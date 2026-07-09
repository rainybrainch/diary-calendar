'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { calculateForestState } from '@/lib/forest-calculator';
import { DiaryEntry } from '@/lib/types';
import { storage } from '@/lib/storage';

function ProfilePageComponent() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // RPGキャラクター職業ランダムアサイン
  const jobClasses = ['冒険者', '戦士', '魔法使い', '狩人', '錬金術師', '聖職者'];
  const characterClass = useMemo(
    () => jobClasses[Math.floor((user?.id?.charCodeAt(0) || 0) % jobClasses.length)],
    [user?.id]
  );
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

  // 統計情報を計算
  const stats = useMemo(() => {
    if (!entries.length) {
      return { totalDays: 0, longestStreak: 0, totalCards: entries.length, currentLevel: 0 };
    }

    // 最長連続日数を計算
    let longestStreak = 0;
    let currentStreak = 0;
    let sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (
        entryDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]
      ) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find((e) => e.date === today);
    const taskCount = todayEntry
      ? (todayEntry.tasks.pushups ? 1 : 0) +
        (todayEntry.tasks.squats ? 1 : 0) +
        (todayEntry.tasks.plank ? 1 : 0) +
        (todayEntry.tasks.run ? 1 : 0) +
        (todayEntry.tasks.reading ? 1 : 0) +
        (todayEntry.tasks.ai_learning ? 1 : 0)
      : 0;

    let continuousDays = 0;
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
        if (c > 0) continuousDays++;
        else break;
      } else break;
    }

    const forestState = calculateForestState(taskCount, continuousDays, entries.length);

    return {
      totalDays: entries.length,
      longestStreak,
      totalCards: entries.length,
      currentLevel: forestState.level,
    };
  }, [entries]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">👤</div>
          <p className="text-green-700 font-semibold">プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col pb-24">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-amber-900 to-amber-950 text-white shadow-lg py-6 px-4">
        <h1 className="forest-hero-title text-3xl md:text-4xl">⚔️ 冒険者ステータス</h1>
        <p className="forest-subtitle mt-2">あなたの成長の記録</p>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
        {/* キャラクターシート */}
        <section className="forest-panel p-8 mb-6 border-l-8 border-amber-700 shadow-xl">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="text-center">
              <div className="text-6xl mb-4">⚔️</div>
              <div className="text-sm text-gray-600 font-semibold">職業</div>
              <div className="text-2xl font-bold text-amber-800 mt-1">{characterClass}</div>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 font-semibold mb-1">冒険者ID</p>
              <p className="text-lg font-bold text-gray-800 break-all mb-4">{user?.email || 'ゲスト'}</p>
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-3 text-sm text-gray-700">
                ✨ あなたは勇敢な{characterClass}です。毎日の冒険を通じて、森と自分自身を成長させています。
              </div>
            </div>
          </div>
        </section>

        {/* 経験値・スキル */}
        <section className="grid md:grid-cols-2 gap-4 mb-6">
          {/* レベル・EXP */}
          <div className="forest-stat-box p-6 border-t-4 border-amber-600">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 font-semibold">冒険者レベル</p>
                <p className="text-3xl font-bold text-amber-700 mt-2">Lv {stats.currentLevel}</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>

          {/* 連続日数 */}
          <div className="forest-stat-box p-6 border-t-4 border-orange-600">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 font-semibold">連続冒険日数</p>
                <p className="text-3xl font-bold text-orange-700 mt-2">{stats.longestStreak}日</p>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
          </div>
        </section>

        {/* 統計情報 */}
        <section className="forest-panel p-6 mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>冒険記録
          </h2>
          <div className="space-y-4">
            {/* 総冒険日数 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-600">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">🗺️ 総冒険日数</span>
                <span className="text-2xl font-bold text-green-700">{stats.totalDays}日</span>
              </div>
            </div>

            {/* カード獲得数 */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border-l-4 border-rose-600">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">🎴 獲得カード</span>
                <span className="text-2xl font-bold text-rose-700">{stats.totalCards}枚</span>
              </div>
            </div>

            {/* 森レベル */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border-l-4 border-emerald-600">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">🌲 育てた森のレベル</span>
                <span className="text-2xl font-bold text-emerald-700">Lv {stats.currentLevel}</span>
              </div>
            </div>
          </div>
        </section>

        {/* スキルツリー（簡易版） */}
        <section className="forest-panel p-6 mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">✨</span>特性
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-3">
              <span className="text-2xl">🎖️</span>
              <div>
                <p className="font-semibold text-gray-800">連続の絆</p>
                <p className="text-xs text-gray-600">{stats.longestStreak}日以上の連続記録達成</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold text-gray-800">カード収集家</p>
                <p className="text-xs text-gray-600">{stats.totalCards}枚のカードを獲得</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-3">
              <span className="text-2xl">🌳</span>
              <div>
                <p className="font-semibold text-gray-800">育成マスター</p>
                <p className="text-xs text-gray-600">森をレベル {stats.currentLevel} まで育成</p>
              </div>
            </div>
          </div>
        </section>

        {/* ログアウト */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-b from-red-500 to-red-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all"
          >
            冒険を終える（ログアウト）
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfilePageComponent />
    </AuthGuard>
  );
}
