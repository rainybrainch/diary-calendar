'use client';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 ランキング</h1>
          <p className="text-gray-600">毎日習慣を続けて、ランキングを目指そう！</p>
        </header>

        {/* Tabs */}
        <RankingTabs selectedPeriod={selectedPeriod} onSelect={setSelectedPeriod} />

        {/* Ranking List */}
        <div className="space-y-3">
          {rankings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-600">ランキングデータがありません</p>
            </div>
          ) : (
            rankings.map((u, index) => (
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
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow text-center">
          <p className="text-sm text-gray-600">
            💡 毎日習慣を続けることで、ランキングが上がります。<br />
            自分のペースで続けることが大切です。
          </p>
        </div>
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
