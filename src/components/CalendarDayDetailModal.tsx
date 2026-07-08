'use client';

import { DayDetailData, DayStats, calculateDayStats, getMoodColor, getEnergyColor } from '@/lib/calendar-detail';
import { DiaryCardComponent } from './DiaryCard';

interface CalendarDayDetailModalProps {
  dayData: DayDetailData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarDayDetailModal({
  dayData,
  isOpen,
  onClose,
}: CalendarDayDetailModalProps) {
  if (!isOpen || !dayData) return null;

  const stats = calculateDayStats(dayData);
  const dateObj = new Date(dayData.date + 'T00:00:00');
  const displayDate = dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold">📅 {displayDate}</h2>
              <p className="text-blue-100 text-sm mt-1">その日の全記録を確認します</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>

          {/* 森の成長状態 */}
          {stats.forestLevel > 0 && (
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm font-semibold mb-1">🌲 森の成長度</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white bg-opacity-30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-300"
                    style={{ width: `${Math.min(stats.forestLevel, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{stats.forestLevel}/100</span>
              </div>
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* 統計情報 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.habitCount}</div>
              <div className="text-xs text-gray-600">習慣達成</div>
            </div>
            <div className={`rounded-lg p-3 text-center border-2 ${getMoodColor(dayData.mood)}`}>
              <div className="text-2xl font-bold">{stats.moodEmoji}</div>
              <div className="text-xs text-gray-600">気分</div>
            </div>
            <div className={`rounded-lg p-3 text-center border-2 ${getEnergyColor(dayData.energy)}`}>
              <div className="text-2xl font-bold">{stats.energyEmoji}</div>
              <div className="text-xs text-gray-600">エネルギー</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dayData.consecutiveDays}
              </div>
              <div className="text-xs text-gray-600">連続日数</div>
            </div>
          </div>

          {/* 習慣チェック */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">⚡ 習慣チェック</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'pushups', label: '腕立て' },
                { key: 'squats', label: 'スクワット' },
                { key: 'plank', label: 'プランク' },
                { key: 'run', label: 'ラン' },
                { key: 'reading', label: '読書' },
                { key: 'ai_learning', label: 'AI学習' },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className={`rounded-lg p-2 text-sm text-center transition ${
                    dayData.habits[key as keyof typeof dayData.habits]
                      ? 'bg-green-100 text-green-800 font-semibold'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {dayData.habits[key as keyof typeof dayData.habits] ? '✅' : '⭕'} {label}
                </div>
              ))}
            </div>
          </div>

          {/* 作業時間 */}
          {dayData.workTime > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">⏱️ 作業時間</h3>
              <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
                <div className="text-lg font-bold text-orange-700">
                  {Math.floor(dayData.workTime / 60)}時間 {dayData.workTime % 60}分
                </div>
              </div>
            </div>
          )}

          {/* カード表示 */}
          {dayData.card && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">🎴 そのカード</h3>
              <div className="flex justify-center">
                <div className="w-48">
                  <DiaryCardComponent card={dayData.card} />
                </div>
              </div>
            </div>
          )}

          {/* 成長レポート */}
          {dayData.growthReport && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">
                {dayData.growthReport.emoji} {dayData.growthReport.title}
              </h3>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                {dayData.growthReport.messages.map((msg, i) => (
                  <p key={i} className="text-sm text-gray-700 mb-1 leading-relaxed">
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* AI アドバイス */}
          {dayData.aiAdvice && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">💭 AI アドバイス</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-200">
                  <div className="text-xs font-bold text-yellow-700 mb-2">🌅 今日へ</div>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {dayData.aiAdvice.today}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                  <div className="text-xs font-bold text-blue-700 mb-2">🌤️ 明日へ</div>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {dayData.aiAdvice.tomorrow}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-200">
                  <div className="text-xs font-bold text-purple-700 mb-2">🌈 今週へ</div>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {dayData.aiAdvice.thisWeek}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 日記テキスト */}
          {dayData.diary && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">📝 日記</h3>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {dayData.diary}
                </p>
              </div>
            </div>
          )}

          {/* データなし */}
          {!dayData.card &&
            !dayData.growthReport &&
            !dayData.aiAdvice &&
            !dayData.diary &&
            stats.habitCount === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🗓️</div>
                <p className="text-gray-600">この日にはまだ記録がありません</p>
              </div>
            )}
        </div>

        {/* フッター */}
        <div className="border-t bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
