'use client';

import { Achievement, ALL_ACHIEVEMENTS, ALL_TITLES, AchievementState } from '@/lib/achievements';

interface AchievementsPanelProps {
  state: AchievementState;
  compact?: boolean; // コンパクト表示（ホーム用）
}

export function AchievementsPanel({ state, compact = false }: AchievementsPanelProps) {
  const unlockedIds = new Set(state.unlockedAchievements.map((a) => a.id));

  if (compact) {
    // コンパクト表示：最新の実績3個を表示
    const recentUnlocked = state.unlockedAchievements
      .filter((a) => a.unlockedAt)
      .sort(
        (a, b) =>
          new Date(b.unlockedAt || '').getTime() - new Date(a.unlockedAt || '').getTime()
      )
      .slice(0, 3);

    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">🏆 実績</h3>
          <span className="text-sm font-bold text-purple-600">
            {state.unlockedAchievements.length} / {state.totalAchievements}
          </span>
        </div>

        {/* 称号表示 */}
        {state.equippedTitle && (
          <div className="bg-yellow-100 rounded-lg p-2 mb-3 border-2 border-yellow-300">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{state.equippedTitle.icon}</span>
              <div>
                <div className="font-bold text-gray-800 text-sm">
                  {state.equippedTitle.name}
                </div>
                <div className="text-xs text-gray-600">
                  {state.equippedTitle.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 最新実績 */}
        <div className="flex gap-2">
          {recentUnlocked.map((achievement) => (
            <div
              key={achievement.id}
              className="text-3xl hover:scale-110 transition cursor-pointer"
              title={achievement.name}
            >
              {achievement.icon}
            </div>
          ))}
          {recentUnlocked.length === 0 && (
            <p className="text-xs text-gray-500">実績を解除しよう！</p>
          )}
        </div>
      </div>
    );
  }

  // フル表示：すべての実績カテゴリ
  const categories: Array<{
    label: string;
    achievements: Achievement[];
  }> = [
    {
      label: '🔥 ストリーク',
      achievements: ALL_ACHIEVEMENTS.filter((a) => a.category === 'streak'),
    },
    {
      label: '⚡ 習慣',
      achievements: ALL_ACHIEVEMENTS.filter((a) => a.category === 'habits'),
    },
    {
      label: '💫 カード進化',
      achievements: ALL_ACHIEVEMENTS.filter((a) => a.category === 'cardEvolution'),
    },
    {
      label: '🌳 森の成長',
      achievements: ALL_ACHIEVEMENTS.filter((a) => a.category === 'forestGrowth'),
    },
    {
      label: '✨ スペシャル',
      achievements: ALL_ACHIEVEMENTS.filter((a) => a.category === 'special'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 称号 */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-lg">👑 称号</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {ALL_TITLES.map((title) => {
            const isUnlocked = state.unlockedAchievements.length >= title.requirementValue;
            return (
              <div
                key={title.id}
                className={`rounded-lg p-3 border-2 transition ${
                  isUnlocked
                    ? 'bg-yellow-50 border-yellow-400 shadow-md'
                    : 'bg-gray-50 border-gray-300 opacity-60'
                }`}
              >
                <div className="text-3xl text-center mb-2">{title.icon}</div>
                <div className="font-bold text-gray-800 text-center text-sm">
                  {title.name}
                </div>
                <div className="text-xs text-gray-600 text-center">
                  {title.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 実績カテゴリ */}
      {categories.map((category) => (
        <div key={category.label}>
          <h3 className="font-bold text-gray-800 mb-3 text-lg">{category.label}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {category.achievements.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`rounded-lg p-3 border-2 transition text-center ${
                    isUnlocked
                      ? 'bg-green-50 border-green-400 shadow-md'
                      : 'bg-gray-50 border-gray-300 opacity-60 grayscale'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="font-bold text-gray-800 text-sm mb-1">
                    {achievement.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {achievement.description}
                  </div>
                  {isUnlocked && (
                    <div className="text-xs text-green-600 font-bold mt-2">
                      ✓ 解除済み
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
