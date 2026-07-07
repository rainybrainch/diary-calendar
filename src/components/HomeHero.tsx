'use client';

import Link from 'next/link';

interface HomeHeroProps {
  continuousDays: number;
  todayTaskCount: number;
  totalTasks: number;
  todayMood: number;
}

export function HomeHero({
  continuousDays,
  todayTaskCount,
  totalTasks,
  todayMood,
}: HomeHeroProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">🌅 おはようございます</h1>
        <p className="text-sm sm:text-base opacity-90">今日の記録を始めましょう</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {/* Streak */}
        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-bold">{continuousDays}</div>
          <div className="text-xs opacity-80">日連続</div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-1">
            {todayTaskCount === 0
              ? '🤍'
              : todayTaskCount === 1
              ? '○'
              : todayTaskCount === 2
              ? '◎'
              : todayTaskCount === 3
              ? '✅'
              : '👑'}
          </div>
          <div className="text-2xl font-bold">
            {todayTaskCount}/{totalTasks}
          </div>
          <div className="text-xs opacity-80">達成</div>
        </div>

        {/* Mood */}
        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-1">
            {todayMood === 0
              ? '😐'
              : todayMood < 4
              ? '😢'
              : todayMood < 7
              ? '🙂'
              : '😊'}
          </div>
          <div className="text-2xl font-bold">{todayMood}</div>
          <div className="text-xs opacity-80">気分</div>
        </div>
      </div>

      {/* CTA Button */}
      <Link href="/input/paste">
        <button className="w-full bg-white text-blue-600 font-bold py-4 rounded-lg hover:bg-gray-100 transition text-lg">
          ✍️ 今日を記録する
        </button>
      </Link>
    </div>
  );
}
