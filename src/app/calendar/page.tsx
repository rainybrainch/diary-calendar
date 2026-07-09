'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseDiaryEntries } from '@/hooks/useSupabaseData';
import { CalendarDayDetailModal } from '@/components/CalendarDayDetailModal';
import { generateCard } from '@/lib/card-generator';
import { getDayDetailData, DayDetailData } from '@/lib/calendar-detail';
import { storage } from '@/lib/storage';
import { DiaryEntry } from '@/lib/types';
import { DiaryCard, GenerateCardInput } from '@/lib/card-generator';

function CalendarContent() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayDetailData | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [cards, setCards] = useState<DiaryCard[]>([]);

  // Supabase からデータ取得
  const { entries: supabaseEntries } = useSupabaseDiaryEntries(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  useEffect(() => {
    // localStorage からデータ取得
    if (!user) {
      const data = storage.getData();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries(data.entries);

      // カードを生成
      const generatedCards = data.entries.map((entry: DiaryEntry) => generateCard(entry, true));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCards(generatedCards);
    }
  }, [user]);

  useEffect(() => {
    // Supabase のデータがある場合は使用
    if (supabaseEntries.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries(supabaseEntries);

      // カードを生成
      const generatedCards = supabaseEntries.map((entry: DiaryEntry) => generateCard(entry, true));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCards(generatedCards);
    }
  }, [supabaseEntries]);

  const handleDayClick = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dateStr = String(day).padStart(2, '0');
    const date = `${year}-${month}-${dateStr}`;

    const dayData = getDayDetailData(date, entries, cards);
    setSelectedDay(dayData);
    setShowDetail(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // カレンダーグリッド用の配列
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // その月のエントリをマップ化
  const entriesMap = new Map(entries.map((e: DiaryEntry) => [e.date, e]));

  // その月のカードをマップ化
  const cardsMap = new Map(cards.map((c: DiaryCard) => [c.date, c]));

  const getDayIndicator = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = entriesMap.get(dateStr);
    const card = cardsMap.get(dateStr);

    const indicators: string[] = [];
    if (entry?.cardGenerated) indicators.push('🎴');
    if (entry?.forestGenerated) indicators.push('🌲');
    if (card && !entry?.cardGenerated) indicators.push('🎴');
    if (entry && indicators.length === 0) indicators.push('📝');

    return indicators.join('');
  };

  const getDayColor = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = entriesMap.get(dateStr);

    if (!entry) return 'bg-white';
    if (entry.mood >= 4) return 'bg-green-50';
    if (entry.mood >= 3) return 'bg-yellow-50';
    if (entry.mood >= 2) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📅 カレンダー</h1>
          <p className="text-gray-600">日付をクリックして、その日の記録を確認します</p>
        </div>

        {/* カレンダー */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* 月選択 */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                ◀
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  {year}年 {month + 1}月
                </h2>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                ▶
              </button>
            </div>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 bg-gray-100">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div
                key={day}
                className="p-4 text-center font-bold text-gray-700 text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-1 p-4">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => day && handleDayClick(day)}
                className={`aspect-square rounded-lg border-2 transition cursor-pointer ${
                  day
                    ? `${getDayColor(day)} border-gray-200 hover:border-blue-400 hover:shadow-md`
                    : 'bg-gray-50 border-transparent'
                } flex flex-col items-center justify-center p-1`}
              >
                {day && (
                  <>
                    <div className="font-bold text-lg text-gray-800">{day}</div>
                    <div className="text-lg mt-1">{getDayIndicator(day)}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 凡例 */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-4">📖 凡例</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎴</span>
              <span className="text-sm text-gray-700">Card JSON</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌲</span>
              <span className="text-sm text-gray-700">Forest Note</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <span className="text-sm text-gray-700">日記記録</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-50 rounded border-2 border-green-400"></div>
              <span className="text-sm text-gray-700">気分: 良好</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-4">
            💡 日付をクリックすると Forest Note スコア（7項目）や Card 情報が表示されます
          </p>
        </div>

        {/* ナビゲーション */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold transition">
              🏠 ホームへ
            </button>
          </Link>
          <Link href="/cards">
            <button className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold transition">
              🎴 カード一覧
            </button>
          </Link>
          <Link href="/input">
            <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold transition">
              ✏️ 日記を書く
            </button>
          </Link>
        </div>
      </div>

      {/* 詳細モーダル */}
      <CalendarDayDetailModal
        dayData={selectedDay}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p>カレンダーを読み込み中...</p>
            </div>
          </div>
        }
      >
        <CalendarContent />
      </Suspense>
    </AuthGuard>
  );
}
