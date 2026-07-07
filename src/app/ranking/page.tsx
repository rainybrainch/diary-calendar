'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { RankingTabs } from '@/components/RankingTabs';
import { RankingCard } from '@/components/RankingCard';
import {
  calculateDailyScore,
  calculateWeeklyScore,
  calculateMonthlyScore,
  calculateContinuousDays,
} from '@/lib/ranking-utils';
import { supabase } from '@/lib/supabase';

function RankingContent() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'continuous'>(
    'month'
  );
  const [users, setUsers] = useState<any[]>([]);
  const [entries, setEntries] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  // ユーザーと日記データを取得
  useMemo(() => {
    const fetchRankingData = async () => {
      try {
        setLoading(true);

        // 全ユーザー取得
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, username, display_name');

        if (usersError) throw usersError;

        // 各ユーザーの日記データ取得
        const entriesMap: Record<string, any[]> = {};
        const rankingData = [];

        for (const u of usersData || []) {
          const { data: diaryData, error: diaryError } = await supabase
            .from('diary_entries')
            .select('*, habit_checks(*)')
            .eq('user_id', u.id)
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

          if (diaryError) throw diaryError;

          entriesMap[u.id] = diaryData || [];

          rankingData.push({
            userId: u.id,
            username: u.username,
            displayName: u.display_name || u.username,
            entries: diaryData || [],
          });
        }

        setEntries(entriesMap);
        setUsers(rankingData);
      } catch (error) {
        console.error('Failed to fetch ranking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, []);

  // ランキング計算
  const rankings = useMemo(() => {
    const scores = users.map((u) => {
      let score = 0;
      if (selectedPeriod === 'today') {
        score = calculateDailyScore(u.entries);
      } else if (selectedPeriod === 'week') {
        score = calculateWeeklyScore(u.entries);
      } else if (selectedPeriod === 'month') {
        score = calculateMonthlyScore(u.entries);
      } else if (selectedPeriod === 'continuous') {
        score = calculateContinuousDays(u.entries);
      }

      return {
        ...u,
        score,
        continuousDays: calculateContinuousDays(u.entries),
      };
    });

    return scores.sort((a, b) => b.score - a.score);
  }, [users, selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">ランキングを読み込み中...</p>
        </div>
      </div>
    );
  }

  // 現在のユーザーの順位を計算
  const userRank = rankings.findIndex((u) => u.userId === user?.id);
  const userRankData = userRank >= 0 ? rankings[userRank] : null;
  const topThree = rankings.slice(0, 3);

  // 表彰台用のメダル配列
  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = [
    'from-yellow-400 to-yellow-500',
    'from-gray-300 to-gray-400',
    'from-orange-300 to-orange-400',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-28">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">🏆 ランキング</h1>
          <p className="text-sm sm:text-base text-gray-600">毎日習慣を続けて、上位を目指そう！</p>
        </header>

        {/* Tabs */}
        <RankingTabs selectedPeriod={selectedPeriod} onSelect={setSelectedPeriod} />

        {rankings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600">ランキングデータがありません</p>
          </div>
        ) : (
          <>
            {/* 表彰台 - Top 3 */}
            <div className="mb-12">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">🎖️ 表彰台</h2>
              <div className="relative h-64 flex items-flex-end justify-center gap-2">
                {/* 2位 */}
                {topThree[1] && (
                  <div className="flex flex-col items-center flex-1">
                    <div className={`bg-gradient-to-br ${podiumColors[1]} rounded-lg p-4 w-full text-center text-white shadow-lg mb-2 order-first`}>
                      <div className="text-3xl mb-2">{medals[1]}</div>
                      <div className="font-bold text-sm truncate">{topThree[1].displayName}</div>
                      <div className="text-lg font-bold">{topThree[1].score}</div>
                    </div>
                    <div className={`bg-gradient-to-b ${podiumColors[1]} w-full rounded-t-lg h-32 flex items-end justify-center pb-4`}>
                      <span className="text-4xl font-bold text-white opacity-30">2</span>
                    </div>
                  </div>
                )}

                {/* 1位 */}
                {topThree[0] && (
                  <div className="flex flex-col items-center flex-1">
                    <div className={`bg-gradient-to-br ${podiumColors[0]} rounded-lg p-4 w-full text-center text-gray-900 shadow-lg mb-2`}>
                      <div className="text-4xl mb-2">{medals[0]}</div>
                      <div className="font-bold text-sm truncate">{topThree[0].displayName}</div>
                      <div className="text-2xl font-bold">{topThree[0].score}</div>
                    </div>
                    <div className={`bg-gradient-to-b ${podiumColors[0]} w-full rounded-t-lg h-48 flex items-end justify-center pb-4`}>
                      <span className="text-5xl font-bold text-gray-900 opacity-30">1</span>
                    </div>
                  </div>
                )}

                {/* 3位 */}
                {topThree[2] && (
                  <div className="flex flex-col items-center flex-1">
                    <div className={`bg-gradient-to-br ${podiumColors[2]} rounded-lg p-4 w-full text-center text-white shadow-lg mb-2 order-last`}>
                      <div className="text-3xl mb-2">{medals[2]}</div>
                      <div className="font-bold text-sm truncate">{topThree[2].displayName}</div>
                      <div className="text-lg font-bold">{topThree[2].score}</div>
                    </div>
                    <div className={`bg-gradient-to-b ${podiumColors[2]} w-full rounded-t-lg h-20 flex items-end justify-center pb-4`}>
                      <span className="text-3xl font-bold text-white opacity-30">3</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 自分の順位 - 固定表示 */}
            {userRankData && userRank >= 3 && (
              <div className="mb-8 sticky top-24 bg-blue-500 text-white rounded-lg p-4 shadow-lg z-40">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm opacity-90">あなたの順位</div>
                    <div className="text-3xl font-bold">{userRank + 1} 位</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">スコア</div>
                    <div className="text-2xl font-bold">{userRankData.score}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">連続</div>
                    <div className="text-2xl font-bold">{userRankData.continuousDays}日</div>
                  </div>
                </div>
              </div>
            )}

            {/* 全体ランキング */}
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">📊 全ランキング</h2>
              <div className="space-y-2">
                {rankings.map((u, index) => (
                  <RankingCard
                    key={u.userId}
                    rank={index + 1}
                    username={u.username}
                    displayName={u.displayName}
                    score={u.score}
                    continuousDays={u.continuousDays}
                    isCurrentUser={u.userId === user?.id}
                    periodType={selectedPeriod}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow text-center">
              <p className="text-sm text-gray-600">
                💡 毎日の記録が大事。自分のペースで続けることが最優先です。
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RankingPage() {
  return (
    <AuthGuard>
      <RankingContent />
    </AuthGuard>
  );
}
