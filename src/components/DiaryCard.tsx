'use client';

import { DiaryCard, getAttributeColor, getAttributeEmoji, getRarityEmoji } from '@/lib/card-generator';
import { CardFlip } from './CardFlip';

interface DiaryCardProps {
  card: DiaryCard;
  onClick?: () => void;
}

export function DiaryCardComponent({ card, onClick }: DiaryCardProps) {
  const attributeColor = getAttributeColor(card.attribute);
  const attributeEmoji = getAttributeEmoji(card.attribute);
  const rarityEmoji = getRarityEmoji(card.rarity);

  const cardFront = (
    <div
      className={`w-full h-full rounded-lg shadow-lg p-4 bg-gradient-to-br ${attributeColor} text-white flex flex-col relative overflow-hidden`}
    >
      {/* ポケモンカード風背景パターン */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-2 text-4xl">{attributeEmoji}</div>
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col h-full">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-xs font-bold opacity-80">DIARY CARD</div>
            <div className="text-lg font-bold">{card.title}</div>
          </div>
          <div className="text-lg">{rarityEmoji}</div>
        </div>

        {/* 属性 */}
        <div className="text-sm font-bold mb-2">
          {attributeEmoji} {card.attribute.toUpperCase()}
        </div>

        {/* ステータス */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-black bg-opacity-20 rounded p-1">
            <div className="opacity-80">🧠 MIND</div>
            <div className="text-lg font-bold">{card.stats.mind}</div>
          </div>
          <div className="bg-black bg-opacity-20 rounded p-1">
            <div className="opacity-80">💪 BODY</div>
            <div className="text-lg font-bold">{card.stats.body}</div>
          </div>
          <div className="bg-black bg-opacity-20 rounded p-1">
            <div className="opacity-80">💼 WORK</div>
            <div className="text-lg font-bold">{card.stats.work}</div>
          </div>
          <div className="bg-black bg-opacity-20 rounded p-1">
            <div className="opacity-80">⚡ HABIT</div>
            <div className="text-lg font-bold">{card.habitCount}</div>
          </div>
        </div>

        {/* スキル / タグ */}
        <div className="flex-1 bg-black bg-opacity-20 rounded p-2 mb-2">
          {card.tags && card.tags.length > 0 ? (
            <>
              <div className="text-xs font-bold mb-1">#タグ</div>
              <div className="flex flex-wrap gap-1">
                {card.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="bg-black bg-opacity-30 rounded px-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs font-bold">スキル</div>
              <div className="text-sm line-clamp-3">
                {card.habitCount > 0 ? `習慣達成 × ${card.habitCount}` : 'スキルなし'}
              </div>
            </>
          )}
        </div>

        {/* フッター */}
        <div className="text-center text-xs opacity-70">
          {card.date}
        </div>
      </div>
    </div>
  );

  const cardBack = (
    <div className="w-full h-full rounded-lg shadow-lg p-4 bg-gradient-to-br from-slate-100 to-slate-200 text-gray-800 flex flex-col">
      <div className="text-xs font-bold mb-2">📖 日記</div>

      {card.isOwner && card.diary ? (
        <>
          <div className="text-xs line-clamp-6 mb-3 leading-relaxed">{card.diary}</div>

          <div className="border-t border-gray-300 pt-2 mb-2">
            <div className="text-xs font-bold">⚡ 習慣チェック</div>
            <div className="text-xs">
              {card.habitCount > 0 ? `達成数: ${card.habitCount}` : 'なし'}
            </div>
          </div>

          <div className="text-center text-xs opacity-50 mt-auto">
            {card.date}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-center">
          <div className="text-sm opacity-50">
            <div className="mb-2">🔒</div>
            <div>この日記は本人のみ閲覧可能です</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      onClick={onClick}
      className="w-48 h-72 cursor-pointer transform transition-transform hover:scale-105"
    >
      <CardFlip front={cardFront} back={cardBack} disabled={!card.isOwner} />
    </div>
  );
}
