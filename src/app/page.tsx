'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/Calendar';
import { DetailModal } from '@/components/DetailModal';
import { DiaryGraph } from '@/components/DiaryGraph';
import { HomeHero } from '@/components/HomeHero';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseDiaryEntries } from '@/hooks/useSupabaseData';
import { storage } from '@/lib/storage';
import { DiaryEntry } from '@/lib/types';
import Link from 'next/link';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [showGraph, setShowGraph] = useState(false);

  // Supabase データ取得
  const now = new Date();
  const { entries: supabaseEntries } = useSupabaseDiaryEntries(
    now.getFullYear(),
    now.getMonth()
  );

  useEffect(() => {
    // ログイン状態: Supabase データを使用
    if (user && supabaseEntries.length > 0) {
      setEntries(supabaseEntries);
    } else if (user) {
      setEntries([]);
    } else {
      // ログイン状態でない: ローカルデータを使用
      const data = storage.getData();
      setEntries(data.entries);
    }
  }, [user, supabaseEntries]);

  const handleSave = (entry: DiaryEntry) => {
    const data = storage.getData();
    const existingIndex = data.entries.findIndex((e) => e.date === entry.date);
    if (existingIndex >= 0) {
      data.entries[existingIndex] = entry;
    } else {
      data.entries.push(entry);
    }
    setEntries(data.entries);
  };

  const handleExport = () => {
    const json = storage.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📔 日記カレンダー</h1>
            <p className="text-gray-600">毎日の日記を写真とテキストで記録。気分、体力、作業時間を可視化します。</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ログアウト
            </button>
          </div>
        </header>

        {/* Home Stats */}
        {!showGraph && (
          <>
            {useMemo(() => {
              const today = new Date().toISOString().split('T')[0];
              const todayEntry = entries.find((e) => e.date === today);

              const taskCount = todayEntry
                ? (todayEntry.tasks.pushups ? 1 : 0) +
                  (todayEntry.tasks.squats ? 1 : 0) +
                  (todayEntry.tasks.plank ? 1 : 0) +
                  (todayEntry.tasks.run ? 1 : 0) +
                  (todayEntry.tasks.reading ? 1 : 0) +
                  (todayEntry.tasks.ai_learning ? 1 : 0)
                : 0;

              // 連続達成日数計算
              let continuousDays = 0;
              for (let i = 0; i < entries.length; i++) {
                const checkDate = new Date();
                checkDate.setDate(checkDate.getDate() - i);
                const dateStr = checkDate.toISOString().split('T')[0];
                const entry = entries.find((e) => e.date === dateStr);

                if (entry) {
                  const count =
                    (entry.tasks.pushups ? 1 : 0) +
                    (entry.tasks.squats ? 1 : 0) +
                    (entry.tasks.plank ? 1 : 0) +
                    (entry.tasks.run ? 1 : 0) +
                    (entry.tasks.reading ? 1 : 0) +
                    (entry.tasks.ai_learning ? 1 : 0);
                  if (count > 0) {
                    continuousDays++;
                  } else {
                    break;
                  }
                } else {
                  break;
                }
              }

              return (
                <HomeHero
                  continuousDays={continuousDays}
                  todayTaskCount={taskCount}
                  totalTasks={6}
                  todayMood={todayEntry?.mood || 0}
                />
              );
            }, [entries])}
          </>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setShowGraph(!showGraph)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showGraph ? 'ホームを表示' : 'グラフを表示'}
          </button>
          <Link
            href="/cards"
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 inline-block"
          >
            🎴 カードを見る
          </Link>
          <Link
            href="/ranking"
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 inline-block"
          >
            🏆 ランキング
          </Link>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            データをエクスポート
          </button>
        </div>

        {showGraph ? (
          <DiaryGraph entries={entries} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar onSelectDate={setSelectedDate} selectedDate={selectedDate} />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">最近の記録</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {entries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((entry) => (
                      <button
                        key={entry.date}
                        onClick={() => setSelectedDate(entry.date)}
                        className="w-full text-left p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                      >
                        <div className="font-bold text-sm">{entry.date}</div>
                        <div className="text-xs text-gray-600 truncate">{entry.text || '（本文なし）'}</div>
                        <div className="flex gap-2 mt-1 text-xs">
                          {entry.mood > 0 && <span>😊 {entry.mood}</span>}
                          {entry.energy > 0 && <span>⚡ {entry.energy}</span>}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-2">💡 ヒント</h3>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>• カレンダーの日付をクリックして日記を追加</li>
                  <li>• 画像をアップロードしてA4日記を保存</li>
                  <li>• 気分と体力を数値で記録</li>
                  <li>• グラフで推移を確認</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <DetailModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
