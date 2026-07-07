'use client';

import { useState, useEffect, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { DiaryEntry } from '@/lib/types';
import { useSupabaseDiaryEntries } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';

interface CalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

interface DateInfo {
  date: string;
  hasRecord: boolean;
  habitCount: number;
  totalHabits: number;
  mood: number;
  energy: number;
}

export function Calendar({ onSelectDate, selectedDate }: CalendarProps) {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Supabase データ取得
  const { entries: supabaseEntries, loading: supabaseLoading, error: supabaseError } = useSupabaseDiaryEntries(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  // ローカルデータをフォールバック
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    // ログイン状態: Supabase データを使用
    if (user && supabaseEntries.length > 0) {
      setEntries(supabaseEntries);
    } else if (user) {
      // Supabase からデータ取得中またはエラー時は空
      setEntries([]);
    } else {
      // ログイン状態でない: ローカルデータを使用
      const data = storage.getData();
      setEntries(data.entries);
    }
  }, [user, supabaseEntries]);

  // 日付ごとの情報を計算
  const dateInfoMap = useMemo(() => {
    const map: Record<string, DateInfo> = {};
    entries.forEach((entry) => {
      const habitCount =
        (entry.tasks.pushups ? 1 : 0) +
        (entry.tasks.squats ? 1 : 0) +
        (entry.tasks.plank ? 1 : 0) +
        (entry.tasks.run ? 1 : 0) +
        (entry.tasks.reading ? 1 : 0) +
        (entry.tasks.ai_learning ? 1 : 0);

      map[entry.date] = {
        date: entry.date,
        hasRecord: true,
        habitCount,
        totalHabits: 6,
        mood: entry.mood || 0,
        energy: entry.energy || 0,
      };
    });
    return map;
  }, [entries]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days: (number | null)[] = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const monthYear = currentMonth.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit' });
  const monthName = currentMonth.toLocaleString('ja-JP', { month: 'long' });
  const year = currentMonth.getFullYear();

  // 記録有無の統計
  const recordStats = useMemo(() => {
    const total = daysInMonth;
    const withRecord = Object.keys(dateInfoMap).length;
    return { total, withRecord, percentage: Math.round((withRecord / total) * 100) };
  }, [dateInfoMap, daysInMonth]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {supabaseError && user && (
        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 text-sm rounded">
          ⚠️ {supabaseError}
        </div>
      )}

      {/* ヘッダー - 月選択 */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <button
          onClick={handlePrevMonth}
          className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm sm:text-base font-semibold"
        >
          ← 前月
        </button>
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{monthName}</h2>
          <p className="text-sm text-gray-500">{year}年</p>
        </div>
        <button
          onClick={handleNextMonth}
          className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm sm:text-base font-semibold"
        >
          次月 →
        </button>
      </div>

      {/* 月の統計 */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-600">この月の記録</div>
            <div className="text-2xl font-bold text-gray-800">{recordStats.withRecord}/{recordStats.total}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">達成度</div>
            <div className="text-2xl font-bold text-blue-600">{recordStats.percentage}%</div>
          </div>
        </div>
        {/* プログレスバー */}
        <div className="mt-2 w-full bg-gray-300 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${recordStats.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* 曜日ヘッダー */}
        {['日', '月', '火', '水', '木', '金', '土'].map((day, idx) => (
          <div
            key={day}
            className={`text-center font-bold py-2 text-xs sm:text-sm ${
              idx === 0 || idx === 6 ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}

        {/* カレンダー日付 */}
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dateInfo = dateInfoMap[dateStr];
          const isSelected = selectedDate === dateStr;
          const isToday =
            dateStr ===
            new Date().toISOString().split('T')[0];

          // ヒートマップの色を計算
          let bgColor = 'bg-white';
          if (dateInfo) {
            const habitRatio = dateInfo.habitCount / dateInfo.totalHabits;
            if (habitRatio === 1) bgColor = 'from-green-400 to-green-500';
            else if (habitRatio >= 0.67) bgColor = 'from-blue-300 to-blue-400';
            else if (habitRatio >= 0.34) bgColor = 'from-yellow-300 to-yellow-400';
            else bgColor = 'from-orange-300 to-orange-400';
          }

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className={`aspect-square p-1 sm:p-2 rounded-lg border-2 transition transform hover:scale-105 flex flex-col items-center justify-center text-xs ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-300 shadow-md'
                  : dateInfo
                    ? `border-gray-300 bg-gradient-to-br ${bgColor} text-white shadow`
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
              } ${isToday ? 'ring-2 ring-offset-1 ring-red-500' : ''}`}
            >
              <div className={`font-bold text-sm sm:text-base ${dateInfo ? 'text-white' : 'text-gray-800'}`}>
                {day}
              </div>

              {/* 習慣進捗インジケータ */}
              {dateInfo && (
                <div className="flex flex-col items-center gap-0.5 mt-0.5 w-full">
                  {/* 習慣達成度 */}
                  <div className="text-xs font-bold">{dateInfo.habitCount}/{dateInfo.totalHabits}</div>

                  {/* 気分・体力インジケータ */}
                  <div className="flex gap-0.5 justify-center">
                    {dateInfo.mood > 0 && (
                      <span className="text-xs" title={`気分: ${dateInfo.mood}`}>
                        {dateInfo.mood > 7 ? '😊' : dateInfo.mood > 4 ? '🙂' : '😐'}
                      </span>
                    )}
                    {dateInfo.energy > 0 && (
                      <span className="text-xs" title={`体力: ${dateInfo.energy}`}>
                        {dateInfo.energy > 7 ? '⚡' : '🔋'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ヒートマップ凡例 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs font-semibold text-gray-600 mb-2">習慣達成度</div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-green-500"></div>
            <span className="text-gray-600">達成6/6</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-300 to-blue-400"></div>
            <span className="text-gray-600">達成4～5/6</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-300 to-yellow-400"></div>
            <span className="text-gray-600">達成2～3/6</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-300 to-orange-400"></div>
            <span className="text-gray-600">達成1/6</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-white border-2 border-gray-300"></div>
            <span className="text-gray-600">未記録</span>
          </div>
        </div>
      </div>
    </div>
  );
}
