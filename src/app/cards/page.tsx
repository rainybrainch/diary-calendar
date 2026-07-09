'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseDiaryEntries } from '@/hooks/useSupabaseData';
import { DeckSelector } from '@/components/DeckSelector';
import { CardGrid } from '@/components/CardGrid';
import { CardModal } from '@/components/CardModal';
import { generateCard, DiaryCard, getRarityName } from '@/lib/card-generator';

function CardsContent() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedCard, setSelectedCard] = useState<DiaryCard | null>(null);
  const [filterRarity, setFilterRarity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rarity'>('date');
  const [searchCardName, setSearchCardName] = useState('');
  const [filterAttribute, setFilterAttribute] = useState<string | null>(null);

  // 現在のカード一覧を取得
  const { entries } = useSupabaseDiaryEntries(selectedMonth.year, selectedMonth.month);

  // カード生成
  const allCards = useMemo(() => {
    return entries.map((entry) => generateCard(entry, true));
  }, [entries]);

  // フィルター・ソート適用
  const cards = useMemo(() => {
    let filtered = allCards;

    // Rarity フィルタ
    if (filterRarity) {
      const rarityMap: Record<string, number> = {
        common: 1,
        rare: 2,
        epic: 3,
        legendary: 4,
      };
      const rarityNum = rarityMap[filterRarity] || 0;
      filtered = filtered.filter((c) => c.rarity === rarityNum);
    }

    // Attribute フィルタ（cardJson がある場合のみ）
    if (filterAttribute) {
      filtered = filtered.filter((c) => {
        const entry = entries.find((e) => e.date === c.date);
        return entry?.cardJson?.attribute === filterAttribute;
      });
    }

    // Card Name 検索（cardJson がある場合のみ）
    if (searchCardName.trim()) {
      const searchLower = searchCardName.toLowerCase();
      filtered = filtered.filter((c) => {
        const entry = entries.find((e) => e.date === c.date);
        const cardName = entry?.cardJson?.card_name || '';
        return cardName.toLowerCase().includes(searchLower);
      });
    }

    // ソート
    if (sortBy === 'date') {
      return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      return filtered.sort((a, b) => b.rarity - a.rarity);
    }
  }, [allCards, filterRarity, filterAttribute, searchCardName, sortBy, entries]);

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

  const maxDays = new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
  const rarityCount = {
    common: allCards.filter((c) => c.rarity === 1).length,
    rare: allCards.filter((c) => c.rarity === 2).length,
    epic: allCards.filter((c) => c.rarity === 3).length,
    legendary: allCards.filter((c) => c.rarity >= 4).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-28">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">🎴 カード図鑑</h1>
          <p className="text-sm sm:text-base text-gray-600">毎日の記録がカードに。レアリティを目指そう！</p>
        </header>

        {/* Deck Selector */}
        <div className="mb-8">
          <h2 className="text-sm sm:text-lg font-bold text-gray-700 mb-3">デッキを選択</h2>
          <DeckSelector
            months={months}
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
          />
        </div>

        {/* Deck Stats - デッキ進捗 */}
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{monthName} デッキ</h2>
              <p className="text-sm text-gray-600 mt-1">
                {cards.length} / {maxDays} カード ({Math.round((cards.length / maxDays) * 100)}%)
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(cards.length / maxDays) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Rarity Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { rarity: 'legendary', icon: '⭐', color: 'from-yellow-400 to-yellow-500' },
              { rarity: 'epic', icon: '🟪', color: 'from-purple-400 to-purple-500' },
              { rarity: 'rare', icon: '🟦', color: 'from-blue-400 to-blue-500' },
              { rarity: 'common', icon: '⬜', color: 'from-gray-300 to-gray-400' },
            ].map((r) => (
              <div
                key={r.rarity}
                className={`p-3 rounded-lg bg-gradient-to-br ${r.color} text-white text-center cursor-pointer transition transform hover:scale-105 ${
                  filterRarity === r.rarity ? 'ring-2 ring-offset-2 ring-gray-600' : ''
                }`}
                onClick={() => setFilterRarity(filterRarity === r.rarity ? null : r.rarity)}
              >
                <div className="text-xl">{r.icon}</div>
                <div className="text-xs font-bold mt-1">
                  {rarityCount[r.rarity as keyof typeof rarityCount]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mb-6 space-y-3">
          {/* Card Name Search */}
          <div>
            <input
              type="text"
              placeholder="🔍 カード名で検索..."
              value={searchCardName}
              onChange={(e) => setSearchCardName(e.target.value)}
              className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sort & Attribute Filter */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rarity')}
              className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="date">📅 新しい順</option>
              <option value="rarity">⭐ レアリティ順</option>
            </select>

            {/* Attribute Filter */}
            <select
              value={filterAttribute || ''}
              onChange={(e) => setFilterAttribute(e.target.value || null)}
              className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="">🎨 属性: すべて</option>
              <option value="Fire">🔥 Fire</option>
              <option value="Water">💧 Water</option>
              <option value="Wind">💨 Wind</option>
              <option value="Earth">🌍 Earth</option>
              <option value="Light">✨ Light</option>
              <option value="Dark">🌙 Dark</option>
              <option value="Neutral">⚪ Neutral</option>
            </select>

            {/* Clear Filters Button */}
            {(filterRarity || filterAttribute || searchCardName) && (
              <button
                onClick={() => {
                  setFilterRarity(null);
                  setFilterAttribute(null);
                  setSearchCardName('');
                }}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
              >
                ✕ フィルター解除
              </button>
            )}
          </div>
        </div>

        {/* Card Grid */}
        <CardGrid cards={cards} onCardClick={setSelectedCard} entries={entries} />

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
