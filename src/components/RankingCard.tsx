'use client';

import Link from 'next/link';
import { getRankEmoji } from '@/lib/ranking-utils';

interface RankingCardProps {
  rank: number;
  username: string;
  displayName: string;
  score: number;
  continuousDays: number;
  isCurrentUser: boolean;
  periodType: 'today' | 'week' | 'month' | 'continuous';
}

export function RankingCard({
  rank,
  username,
  displayName,
  score,
  continuousDays,
  isCurrentUser,
  periodType,
}: RankingCardProps) {
  const rankEmoji = getRankEmoji(rank);
  const bgColor = isCurrentUser ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200';

  const scoreDisplay =
    periodType === 'continuous' ? continuousDays : score;

  return (
    <Link href={`/u/${username}`}>
      <div
        className={`p-4 rounded-lg border-2 ${bgColor} hover:shadow-lg transition cursor-pointer`}
      >
        <div className="flex items-center justify-between">
          {/* Rank & Name */}
          <div className="flex items-center gap-3 flex-1">
            <div className="text-3xl font-bold w-12 text-center">
              {typeof rankEmoji === 'string' && rankEmoji.length > 1 ? rankEmoji : rankEmoji}
            </div>
            <div>
              <div className="font-bold text-lg">{displayName}</div>
              <div className="text-xs text-gray-500">@{username}</div>
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{scoreDisplay}</div>
            <div className="text-xs text-gray-500">
              {periodType === 'continuous' ? '日連続' : 'ポイント'}
            </div>
          </div>
        </div>

        {/* Badge */}
        {isCurrentUser && (
          <div className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            👤 あなた
          </div>
        )}
      </div>
    </Link>
  );
}
