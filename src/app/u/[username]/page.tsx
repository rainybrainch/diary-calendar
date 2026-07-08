'use client';

import { useEffect, useState, useMemo } from 'react';
import { PublicCardGrid } from '@/components/PublicCardGrid';
import { getPublicUserProfile, getPublicUserEntries, getPublicUserStats, PublicUser, UserStats } from '@/lib/public-profile-utils';
import { DiaryEntry } from '@/lib/types';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [entries, setEntries] = useState<Record<string, DiaryEntry[]>>({});
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // プロフィールと統計を取得
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await getPublicUserProfile(params.username);

        if (!profile) {
          setError('ユーザーが見つかりません');
          return;
        }

        setUser(profile);

        // 統計を取得
        const userStats = await getPublicUserStats(profile.id);
        setStats(userStats);

        // 現在月と過去3ヶ月のデータを取得
        const months = [
          { year: selectedMonth.year, month: selectedMonth.month },
          {
            year: selectedMonth.month > 0 ? selectedMonth.year : selectedMonth.year - 1,
            month: selectedMonth.month > 0 ? selectedMonth.month - 1 : 11,
          },
          {
            year: selectedMonth.month > 1 ? selectedMonth.year : selectedMonth.year - 1,
            month: selectedMonth.month > 1 ? selectedMonth.month - 2 : 11 + selectedMonth.month - 1,
          },
          {
            year: selectedMonth.month > 2 ? selectedMonth.year : selectedMonth.year - 1,
            month: selectedMonth.month > 2 ? selectedMonth.month - 3 : 11 + selectedMonth.month - 2,
          },
        ];

        const entriesMap: Record<string, DiaryEntry[]> = {};
        for (const month of months) {
          const monthEntries = await getPublicUserEntries(profile.id, month.year, month.month);
          const key = `${month.year}-${month.month}`;
          entriesMap[key] = monthEntries;
        }

        setEntries(entriesMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.username, selectedMonth]);

  const monthEntries = useMemo(() => {
    const key = `${selectedMonth.year}-${selectedMonth.month}`;
    return entries[key] || [];
  }, [entries, selectedMonth]);

  const monthName = new Date(selectedMonth.year, selectedMonth.month, 1).toLocaleDateString(
    'ja-JP',
    { year: 'numeric', month: 'long' }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-800 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user?.display_name || user?.username}</h1>
              <p className="text-gray-600">@{user?.username}</p>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
                <div className="text-xs text-gray-600">達成率</div>
              </div>
              <div className="bg-green-50 p-4 rounded text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedDays}</div>
                <div className="text-xs text-gray-600">完了日数</div>
              </div>
              <div className="bg-purple-50 p-4 rounded text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalDays}</div>
                <div className="text-xs text-gray-600">記録日数</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.averageMood}</div>
                <div className="text-xs text-gray-600">平均気分</div>
              </div>
            </div>
          )}
        </div>

        {/* Highlight Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🎴 ハイライト</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">最高気分の日</div>
              <div className="text-3xl font-bold">
                {monthEntries.length > 0
                  ? Math.max(...monthEntries.map((e) => e.mood || 0))
                  : '-'}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">合計習慣達成数</div>
              <div className="text-3xl font-bold">
                {monthEntries.reduce((sum, e) => {
                  const count =
                    (e.tasks.pushups ? 1 : 0) +
                    (e.tasks.squats ? 1 : 0) +
                    (e.tasks.plank ? 1 : 0) +
                    (e.tasks.run ? 1 : 0) +
                    (e.tasks.reading ? 1 : 0) +
                    (e.tasks.ai_learning ? 1 : 0);
                  return sum + count;
                }, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">📚 月別カード</h2>
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {[0, 1, 2, 3].map((offset) => {
              const date = new Date(selectedMonth.year, selectedMonth.month - offset, 1);
              const isSelected =
                date.getFullYear() === selectedMonth.year &&
                date.getMonth() === selectedMonth.month;

              return (
                <button
                  key={offset}
                  onClick={() =>
                    setSelectedMonth({ year: date.getFullYear(), month: date.getMonth() })
                  }
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })}
                </button>
              );
            })}
          </div>

          <PublicCardGrid entries={monthEntries} monthName={monthName} />
        </div>

        {/* Notice */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow text-center text-sm text-gray-600">
          <p>
            💡 このプロフィールは公開されています。<br />
            日記本文と画像は本人のみ閲覧可能です。
          </p>
        </div>
      </div>
    </div>
  );
}
