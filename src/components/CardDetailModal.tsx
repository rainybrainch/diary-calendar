'use client';

import { CardJSON, DiaryEntry } from '@/lib/types';
import Link from 'next/link';

interface CardDetailModalProps {
  card: CardJSON;
  entry?: DiaryEntry;
  onClose: () => void;
}

export function CardDetailModal({ card, entry, onClose }: CardDetailModalProps) {
  // レアリティ色
  const rarityColors: Record<string, { bg: string; border: string; glow: string }> = {
    N: { bg: 'from-gray-300 to-gray-400', border: 'border-gray-500', glow: 'from-gray-400/30' },
    R: { bg: 'from-blue-400 to-blue-500', border: 'border-blue-600', glow: 'from-blue-400/30' },
    SR: { bg: 'from-purple-400 to-purple-500', border: 'border-purple-600', glow: 'from-purple-400/30' },
    SSR: { bg: 'from-yellow-300 to-yellow-400', border: 'border-yellow-600', glow: 'from-yellow-300/30' },
    UR: { bg: 'from-red-400 to-orange-500', border: 'border-red-600', glow: 'from-red-400/30' },
  };

  const rarity = (card.rarity as keyof typeof rarityColors) || 'N';
  const colors = rarityColors[rarity];

  // 属性絵文字
  const attributeEmoji: Record<string, string> = {
    Fire: '🔥',
    Water: '💧',
    Wind: '💨',
    Earth: '🌍',
    Light: '✨',
    Dark: '🌙',
    Neutral: '⚪',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* 背景グロー演出 */}
      <div
        className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${colors.glow} blur-3xl opacity-50`}
      ></div>

      {/* モーダルコンテナ */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* クローズボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
        >
          ✕
        </button>

        {/* カードビジュアルセクション */}
        <div className={`bg-gradient-to-b ${colors.bg} p-8 relative overflow-hidden`}>
          {/* 背景装飾 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          {/* コンテンツ */}
          <div className="relative z-10 space-y-6">
            {/* カード画像 */}
            <div className="flex justify-center">
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.card_name}
                  className="w-full max-w-sm rounded-xl shadow-lg border-4 border-white"
                />
              ) : (
                <div className="w-full max-w-sm aspect-square bg-white/20 rounded-xl border-4 border-white flex items-center justify-center text-white text-6xl">
                  🎴
                </div>
              )}
            </div>

            {/* カード基本情報 */}
            <div className="text-center text-white drop-shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl">{attributeEmoji[card.attribute] || '⚪'}</span>
                <h2 className="text-3xl font-bold">{card.card_name}</h2>
              </div>
              <p className="text-sm opacity-90">{card.title}</p>
            </div>
          </div>
        </div>

        {/* カード詳細情報セクション */}
        <div className="p-8 space-y-6">
          {/* レアリティ・属性 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-1">レアリティ</p>
              <div className={`text-2xl font-bold bg-gradient-to-b ${colors.bg} text-transparent bg-clip-text`}>
                {rarity}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-1">属性</p>
              <p className="text-2xl">{attributeEmoji[card.attribute] || '⚪'}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-1">誕生日</p>
              <p className="text-sm font-bold text-gray-800">{card.date}</p>
            </div>
          </div>

          {/* ステータス */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-4">⚔️ ステータス</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 mb-2">HP</p>
                <div className="text-3xl font-bold text-red-600">{card.hp}</div>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min((card.hp / 999) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 mb-2">ATK</p>
                <div className="text-3xl font-bold text-orange-600">{card.atk}</div>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min((card.atk / 999) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 mb-2">Energy</p>
                <div className="text-3xl font-bold text-blue-600">{card.energy}/10</div>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${(card.energy / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* スキル */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
            <h3 className="text-lg font-bold text-purple-800 mb-2">✨ スキル</h3>
            <p className="font-bold text-purple-900 mb-1">{card.skill.name}</p>
            <p className="text-sm text-gray-700 mb-3">{card.skill.effect}</p>
            <div className="inline-block bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
              属性: {card.skill.type}
            </div>
          </div>

          {/* 説明文（Flavor Text） */}
          <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
            <p className="text-sm italic text-gray-700 leading-relaxed">
              "{card.flavor_text}"
            </p>
          </div>

          {/* 元の日記エントリへのリンク */}
          {entry && (
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-3">📖 このカードが生まれた冒険</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">日付:</span> {entry.date}
                </p>
                {entry.mentalText && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">その時の気持ち:</span> {entry.mentalText}
                  </p>
                )}
              </div>
              <Link href={`/calendar?date=${entry.date}`}>
                <button className="w-full bg-gradient-to-b from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all">
                  その日の記録を見る
                </button>
              </Link>
            </div>
          )}

          {/* Card ID */}
          <div className="text-center text-xs text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-200">
            Card ID: <span className="font-mono">{card.card_id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
