'use client';

export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { AchievementsPanel } from '@/components/AchievementsPanel';
import { useAchievements } from '@/hooks/useAchievements';
import Link from 'next/link';

function AchievementsContent() {
  const { state: achievementState } = useAchievements();
  const [activeTab, setActiveTab] = useState<'all' | 'stats'>('all');

  const unlockedCount = achievementState.unlockedAchievements.length;
  const totalCount = achievementState.totalAchievements;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 実績</h1>
          <p className="text-gray-600">継続と成長を見える化します</p>
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {unlockedCount}
              </div>
              <div className="text-gray-600">解除済み実績</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {totalCount}
              </div>
              <div className="text-gray-600">全実績</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {progressPercent}%
              </div>
              <div className="text-gray-600">達成度</div>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>進捗</span>
              <span>{unlockedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 称号表示 */}
        {achievementState.equippedTitle && (
          <div className="bg-gradient-to-r from-yellow-300 to-orange-400 rounded-2xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{achievementState.equippedTitle.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">
                  現在の称号：{achievementState.equippedTitle.name}
                </h2>
                <p className="text-yellow-100 mt-1">
                  {achievementState.equippedTitle.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* タブ */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              activeTab === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-50'
            }`}
          >
            🏅 すべての実績
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              activeTab === 'stats'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-50'
            }`}
          >
            📊 統計情報
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {activeTab === 'all' ? (
            <AchievementsPanel state={achievementState} compact={false} />
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📈 カテゴリ別統計
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { icon: '🔥', label: 'ストリーク', count: achievementState.unlockedAchievements.filter((a) => a.category === 'streak').length },
                    { icon: '⚡', label: '習慣', count: achievementState.unlockedAchievements.filter((a) => a.category === 'habits').length },
                    { icon: '💫', label: 'カード', count: achievementState.unlockedAchievements.filter((a) => a.category === 'cardEvolution').length },
                    { icon: '🌳', label: '森', count: achievementState.unlockedAchievements.filter((a) => a.category === 'forestGrowth').length },
                    { icon: '✨', label: 'スペシャル', count: achievementState.unlockedAchievements.filter((a) => a.category === 'special').length },
                  ].map((category) => (
                    <div
                      key={category.label}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border-2 border-blue-200"
                    >
                      <div className="text-4xl mb-2">{category.icon}</div>
                      <div className="font-bold text-gray-800">{category.label}</div>
                      <div className="text-2xl font-bold text-blue-600 mt-2">
                        {category.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  🎯 次の目標
                </h3>
                <div className="space-y-3">
                  {unlockedCount < totalCount ? (
                    <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                      <p className="text-gray-800">
                        次の実績まであと{totalCount - unlockedCount}個解除が必要です！
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        習慣達成・連続記録・カード育成・森の成長で新しい実績を解除できます
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                      <p className="text-green-800 font-bold">
                        🎉 すべての実績を解除しました！
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        素晴らしい成長を遂げました。これからも続けましょう！
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold transition">
              🏠 ホームへ
            </button>
          </Link>
          <Link href="/calendar">
            <button className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-bold transition">
              📅 カレンダー
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p>実績を読み込み中...</p>
            </div>
          </div>
        }
      >
        <AchievementsContent />
      </Suspense>
    </AuthGuard>
  );
}
