'use client';

import { DiaryCard } from '@/lib/card-generator';
import { DiaryCardComponent } from './DiaryCard';

interface CardGridProps {
  cards: DiaryCard[];
  onCardClick: (card: DiaryCard) => void;
}

export function CardGrid({ cards, onCardClick }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📭</div>
        <div className="text-gray-600">この月のカードはまだありません</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.date} onClick={() => onCardClick(card)}>
          <DiaryCardComponent card={card} />
        </div>
      ))}
    </div>
  );
}
