'use client';

import { DiaryCard } from '@/lib/card-generator';
import { DiaryEntry } from '@/lib/types';
import { DiaryCardComponent } from './DiaryCard';
import { CardDisplay } from './CardDisplay';

interface CardGridProps {
  cards: DiaryCard[];
  onCardClick: (card: DiaryCard) => void;
  entries?: DiaryEntry[];
}

export function CardGrid({ cards, onCardClick, entries = [] }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📭</div>
        <div className="text-gray-600">この月のカードはまだありません</div>
      </div>
    );
  }

  // 日付をキーにして entries をマップ化
  const entriesMap = new Map(entries.map((e) => [e.date, e]));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        // 対応する entry を取得
        const entry = entriesMap.get(card.date);
        const hasCardJson = entry?.cardJson;
        const imageUrl = entry?.cardImageUrl;

        return (
          <div
            key={card.date}
            onClick={() => onCardClick(card)}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            {/* Card JSON とイラスト URL がある場合は CardDisplay を使用 */}
            {hasCardJson && (
              <CardDisplay cardJson={hasCardJson} imageUrl={imageUrl} size="md" />
            )}

            {/* Card JSON がない場合は既存の DiaryCard を表示 */}
            {!hasCardJson && <DiaryCardComponent card={card} />}
          </div>
        );
      })}
    </div>
  );
}
