'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseDiaryEntries } from '@/hooks/useSupabaseData';
import { DeckSelector } from '@/components/DeckSelector';
import { CardGrid } from '@/components/CardGrid';
import { CardModal } from '@/components/CardModal';
import { generateCard, DiaryCard } from '@/lib/card-generator';

function CardsContent() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedCard, setSelectedCard] = useState<DiaryCard | null>(null);

  // 現在のカード一覧を取得
  const { entries } = useSupabaseDiaryEntries(selectedMonth.year, selectedMonth.month);

  // カード生成
  const cards = useMemo(() => {
    return entries
      .map((entry) => generateCard(entry, true)) // ログインユーザーなので isOwner=true
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  // 利用可能な月リスト（過去6ヶ月 + 今月 + 今後3ヶ月）
  const months = useMemo(() => {
    const result: Array<{ year: number; month: number }> = [];
    const now = new Date();

    for (let i = -6; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      result.push({
        year: date.getFullYear(),
        month: date.getMonth(),
      });
    }

    return result.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, []);

  const monthName = new Date(selectedMonth.year, selectedMonth.month, 1).toLocaleDateString(
    'ja-JP',
    { year: 'numeric', month: 'long' }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎴 日記カード</h1>
          <p className="text-gray-600">毎日の日記をカードとして集めよう。1ヶ月でデッキ完成！</p>
        </header>

        {/* Deck Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">デッキを選択</h2>
          <DeckSelector
            months={months}
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
          />
        </div>

        {/* Deck Info */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{monthName} デッキ</h2>
          <p className="text-gray-600">
            {cards.length} / {new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate()}{' '}
            カード
          </p>
          {cards.length > 0 && (
            <div className="mt-3 flex gap-2">
              <div className="text-sm bg-blue-50 px-3 py-1 rounded">
                心: {cards.reduce((sum, c) => sum + c.stats.mind, 0) / cards.length || 0 | 0}/10
              </div>
              <div className="text-sm bg-red-50 px-3 py-1 rounded">
                身: {cards.reduce((sum, c) => sum + c.stats.body, 0) / cards.length || 0 | 0}/10
              </div>
              <div className="text-sm bg-green-50 px-3 py-1 rounded">
                習: {cards.reduce((sum, c) => sum + c.habitCount, 0)} / {cards.length}
              </div>
            </div>
          )}
        </div>

        {/* Card Grid */}
        <CardGrid cards={cards} onCardClick={setSelectedCard} />

        {/* Card Modal */}
        {selectedCard && (
          <CardModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}

        {/* Footer */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow text-center">
          <p className="text-sm text-gray-600">
            💡 毎日日記を保存して、カードを集めよう。<br />
            月ごとにデッキが完成します。
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CardsPage() {
  return (
    <AuthGuard>
      <CardsContent />
    </AuthGuard>
  );
}
