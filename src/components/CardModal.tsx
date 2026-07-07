'use client';

import { useState } from 'react';
import { DiaryCard } from '@/lib/card-generator';
import { CardFlip } from './CardFlip';
import { getAttributeColor, getAttributeEmoji, getRarityEmoji } from '@/lib/card-generator';

interface CardModalProps {
  card: DiaryCard;
  onClose: () => void;
}

export function CardModal({ card, onClose }: CardModalProps) {
  const attributeColor = getAttributeColor(card.attribute);
  const attributeEmoji = getAttributeEmoji(card.attribute);
  const rarityEmoji = getRarityEmoji(card.rarity);

  const cardFront = (
    <div
      className={`w-full h-full rounded-2xl shadow-2xl p-8 bg-gradient-to-br ${attributeColor} text-white flex flex-col relative overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 text-8xl">{attributeEmoji}</div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-sm font-bold opacity-80">DIARY CARD</div>
            <div className="text-4xl font-bold">{card.title}</div>
          </div>
          <div className="text-3xl">{rarityEmoji}</div>
        </div>

        <div className="text-xl font-bold mb-4">
          {attributeEmoji} {card.attribute.toUpperCase()}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.entries(card.stats).map(([key, value]) => (
            <div key={key} className="bg-black bg-opacity-20 rounded-lg p-3">
              <div className="opacity-80 text-sm">
                {['🧠', '💪', '💼', '🤝', '💰', '⚡', '🌟'][
                  ['mind', 'body', 'work', 'relation', 'money', 'habit', 'dream'].indexOf(key)
                ]}{' '}
                {key.toUpperCase()}
              </div>
              <div className="text-3xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-black bg-opacity-20 rounded-lg p-4 mb-4">
          <div className="text-lg font-bold mb-2">スキル</div>
          <div className="text-lg">
            {card.habitCount > 0 ? `習慣達成 × ${card.habitCount}` : 'スキルなし'}
          </div>
        </div>

        <div className="text-center opacity-70">
          {card.date}
        </div>
      </div>
    </div>
  );

  const cardBack = (
    <div className="w-full h-full rounded-2xl shadow-2xl p-8 bg-gradient-to-br from-slate-50 to-slate-100 text-gray-800 flex flex-col">
      <div className="text-2xl font-bold mb-4">📖 日記</div>

      {card.isOwner && card.diary ? (
        <>
          <div className="text-base leading-relaxed mb-6 flex-1 overflow-y-auto">
            {card.diary}
          </div>

          <div className="border-t border-gray-300 pt-4 mb-4">
            <div className="text-lg font-bold mb-2">⚡ 習慣チェック</div>
            <div className="text-lg">
              {card.habitCount > 0 ? `達成数: ${card.habitCount}` : 'なし'}
            </div>
          </div>

          <div className="text-center opacity-50">
            {card.date}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-center">
          <div className="text-xl">
            <div className="mb-4 text-5xl">🔒</div>
            <div>この日記は本人のみ閲覧可能です</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-96">
        <CardFlip front={cardFront} back={cardBack} disabled={!card.isOwner} />
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl font-bold hover:opacity-80"
      >
        ✕
      </button>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm opacity-70">
        クリックまたはタップでフリップ
      </div>
    </div>
  );
}
