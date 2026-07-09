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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col pb-24">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-green-900 to-emerald-900 text-white shadow-lg py-6 px-4">
        <h1 className="forest-hero-title text-3xl md:text-4xl">👤 プロフィール</h1>
        <p className="forest-subtitle mt-2">あなたの成長を追跡</p>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
        {/* ユーザー情報 */}
        <section className="forest-panel p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">👤</div>
            <div>
              <p className="text-sm text-gray-600">メールアドレス</p>
              <p className="text-lg font-bold text-gray-800 break-all">{user?.email || 'ゲスト'}</p>
            </div>
          </div>
        </section>

        {/* 統計情報 */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-green-800 mb-4">📈 統計情報</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 総記録日数 */}
            <div className="forest-stat-box">
              <div className="text-sm text-gray-600 font-semibold">総記録日数</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.totalDays}</div>
              <div className="text-xs text-gray-500 mt-1">日間</div>
            </div>

            {/* 最長連続日数 */}
            <div className="forest-stat-box">
              <div className="text-sm text-gray-600 font-semibold">最長連続</div>
              <div className="text-3xl font-bold text-amber-600 mt-2">{stats.longestStreak}</div>
              <div className="text-xs text-gray-500 mt-1">日</div>
            </div>

            {/* カード枚数 */}
            <div className="forest-stat-box">
              <div className="text-sm text-gray-600 font-semibold">カード枚数</div>
              <div className="text-3xl font-bold text-rose-600 mt-2">{stats.totalCards}</div>
              <div className="text-xs text-gray-500 mt-1">枚</div>
            </div>

            {/* 森レベル */}
            <div className="forest-stat-box">
              <div className="text-sm text-gray-600 font-semibold">森レベル</div>
              <div className="text-3xl font-bold text-indigo-600 mt-2">Lv {stats.currentLevel}</div>
              <div className="text-xs text-gray-500 mt-1">/100</div>
            </div>
          </div>
        </section>

        {/* アカウント設定 */}
        <section className="forest-panel p-6 mb-6">
          <h2 className="text-lg font-bold text-green-800 mb-4">⚙️ 設定</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              🔐 プライベートモード: <span className="font-semibold">有効</span>
            </p>
            <p className="text-sm text-gray-600">
              📱 デバイス: <span className="font-semibold">Web App</span>
            </p>
          </div>
        </section>

        {/* ログアウトボタン */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="forest-btn-danger w-full py-3 text-lg font-bold rounded-lg"
          >
            ログアウト
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
