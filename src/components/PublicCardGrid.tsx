'use client';

import { DiaryEntry } from '@/lib/types';
import { generateCard } from '@/lib/card-generator';
import { DiaryCardComponent } from './DiaryCard';

interface PublicCardGridProps {
  entries: DiaryEntry[];
  monthName: string;
}

export function PublicCardGrid({ entries, monthName }: PublicCardGridProps) {
  // 表面のみ表示（isOwner=false で裏面をロック）
  const cards = entries.map((entry) => generateCard(entry, false));

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📭</div>
        <div className="text-gray-600">{monthName} のカードはまだありません</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{monthName}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.date} className="opacity-100 hover:opacity-110 transition">
            <DiaryCardComponent card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}
