'use client';

import { CardJSON } from '@/lib/types';

interface CardDisplayProps {
  cardJson: CardJSON;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Card Display Template
 * 背景にカードイラスト、上に Card JSON 情報を重ねて表示
 * 画像生成AIには イラストのみ生成させ、文字・UIはこのコンポーネントで追加
 */
export function CardDisplay({
  cardJson,
  imageUrl,
  size = 'md',
  className = '',
}: CardDisplayProps) {
  // サイズ別の寸法
  const sizes = {
    sm: { width: 'w-40', height: 'h-56', padding: 'p-2', textSm: 'text-xs', textBase: 'text-sm', textLg: 'text-base' },
    md: { width: 'w-56', height: 'h-80', padding: 'p-3', textSm: 'text-sm', textBase: 'text-base', textLg: 'text-lg' },
    lg: { width: 'w-72', height: 'h-96', padding: 'p-4', textSm: 'text-base', textBase: 'text-lg', textLg: 'text-2xl' },
  };

  const sizeClasses = sizes[size];

  // レアリティ別色
  const rarityColors: Record<string, string> = {
    N: 'from-gray-400 to-gray-500',
    R: 'from-blue-400 to-blue-500',
    SR: 'from-purple-400 to-purple-500',
    SSR: 'from-yellow-400 to-yellow-500',
    UR: 'from-red-500 to-orange-500',
  };

  const attributeEmojis: Record<string, string> = {
    Fire: '🔥',
    Water: '💧',
    Wind: '💨',
    Earth: '🌍',
    Light: '✨',
    Dark: '🌙',
    Neutral: '⚪',
  };

  const rarityColor = rarityColors[cardJson.rarity] || 'from-gray-400 to-gray-500';
  const attributeEmoji = attributeEmojis[cardJson.attribute] || '❓';

  // Attack/Support/Power判定
  const isAttackCard = cardJson.card_type === 'Attack';
  const showStats = isAttackCard;

  return (
    <div
      className={`relative ${sizeClasses.width} ${sizeClasses.height} rounded-lg overflow-hidden shadow-lg bg-gray-900 ${className}`}
    >
      {/* 背景画像 */}
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${imageUrl}')`,
          }}
        />
      )}

      {/* 背景グラデーション（半透明） */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-60" />

      {/* コンテンツ層 */}
      <div className={`relative h-full flex flex-col justify-between ${sizeClasses.padding}`}>
        {/* ⬆️ 上部：Card Name & ID */}
        <div className="space-y-1">
          {/* Card ID（右上） */}
          <div className="flex justify-between items-start">
            <div>
              {/* Card Name */}
              <h2
                className={`font-bold text-white drop-shadow-lg ${sizeClasses.textLg} leading-tight`}
              >
                {cardJson.card_name}
              </h2>
              {/* Date */}
              <p className={`text-gray-300 drop-shadow ${sizeClasses.textSm}`}>
                {cardJson.date}
              </p>
            </div>
            {/* Card ID Badge */}
            <div className="bg-black bg-opacity-70 rounded px-2 py-1">
              <p className={`text-yellow-300 font-mono font-bold drop-shadow ${sizeClasses.textSm}`}>
                {cardJson.card_id}
              </p>
            </div>
          </div>
        </div>

        {/* 🔶 中央：Rarity・Attribute */}
        <div className="flex gap-2 justify-between">
          {/* Rarity Badge */}
          <div className={`bg-gradient-to-r ${rarityColor} rounded-full px-3 py-1 shadow-lg`}>
            <p className={`text-white font-bold drop-shadow ${sizeClasses.textBase}`}>
              {cardJson.rarity}
            </p>
          </div>

          {/* Attribute Badge */}
          <div className="bg-black bg-opacity-70 rounded-full px-3 py-1">
            <p className={`${sizeClasses.textLg}`}>{attributeEmoji}</p>
            <p className={`text-white font-semibold drop-shadow ${sizeClasses.textSm}`}>
              {cardJson.attribute}
            </p>
          </div>
        </div>

        {/* ⬇️ 下部：Stats & Skill & Flavor */}
        <div className="space-y-1.5">
          {/* Stats Row（HP・ATK・Energy） */}
          {showStats && (
            <div className="flex gap-2 justify-between bg-black bg-opacity-70 rounded p-2">
              {/* HP */}
              <div className="flex-1 text-center">
                <p className={`text-red-400 font-bold drop-shadow ${sizeClasses.textBase}`}>
                  HP
                </p>
                <p className={`text-red-300 font-bold drop-shadow ${sizeClasses.textLg}`}>
                  {cardJson.hp}
                </p>
              </div>

              {/* ATK */}
              <div className="flex-1 text-center">
                <p className={`text-orange-400 font-bold drop-shadow ${sizeClasses.textBase}`}>
                  ATK
                </p>
                <p className={`text-orange-300 font-bold drop-shadow ${sizeClasses.textLg}`}>
                  {cardJson.atk}
                </p>
              </div>

              {/* Energy */}
              <div className="flex-1 text-center">
                <p className={`text-blue-400 font-bold drop-shadow ${sizeClasses.textBase}`}>
                  EN
                </p>
                <p className={`text-blue-300 font-bold drop-shadow ${sizeClasses.textLg}`}>
                  {cardJson.energy}
                </p>
              </div>
            </div>
          )}

          {/* Skill */}
          <div className="bg-black bg-opacity-70 rounded p-2">
            <p className={`text-purple-300 font-bold drop-shadow ${sizeClasses.textSm}`}>
              {cardJson.skill.name}
            </p>
            <p className={`text-gray-200 drop-shadow leading-tight ${sizeClasses.textSm}`}>
              {cardJson.skill.effect}
            </p>
          </div>

          {/* Flavor Text */}
          <p className={`text-gray-300 italic drop-shadow text-center ${sizeClasses.textSm}`}>
            "{cardJson.flavor_text}"
          </p>
        </div>
      </div>

      {/* Card Type Label（右下） */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 rounded-full px-2 py-1">
        <p className={`text-cyan-300 font-bold drop-shadow ${sizeClasses.textSm}`}>
          {cardJson.card_type}
        </p>
      </div>
    </div>
  );
}
