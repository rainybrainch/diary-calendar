'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { DiaryEntry } from '@/lib/types';
import { useSupabaseDiaryEntries } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';

interface CalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
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

  const monthName = currentMonth.toLocaleString('ja-JP', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {supabaseError && user && (
        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 text-sm rounded">
          ⚠️ {supabaseError}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button onClick={handlePrevMonth} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          ← 前月
        </button>
        <h2 className="text-2xl font-bold">{monthName}</h2>
        <button onClick={handleNextMonth} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          次月 →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="text-center font-bold py-2 text-sm">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const entry = entries.find((e) => e.date === dateStr);
          const isSelected = selectedDate === dateStr;

          const taskCount = entry
            ? (entry.tasks.pushups ? 1 : 0) +
              (entry.tasks.squats ? 1 : 0) +
              (entry.tasks.plank ? 1 : 0) +
              (entry.tasks.run ? 1 : 0)
            : 0;

          const getBadge = (count: number) => {
            if (count === 0) return '';
            if (count === 1) return '○';
            if (count === 2) return '◎';
            if (count === 3) return '✅';
            return '👑';
          };

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className={`aspect-square p-2 rounded border-2 transition flex flex-col items-center justify-center text-xs ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="font-bold">{day}</div>
              <div className="flex gap-1 mt-0.5">
                {entry?.imageGenerated && <span>🎨</span>}
              </div>
              {taskCount > 0 && <div className="text-base mt-0.5">{getBadge(taskCount)}</div>}
              {entry && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {entry.mood > 0 && <span className="text-xs bg-yellow-100 px-0.5 rounded">😊</span>}
                  {entry.energy > 0 && <span className="text-xs bg-green-100 px-0.5 rounded">⚡</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
