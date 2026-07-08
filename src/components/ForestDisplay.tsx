'use client';

import { ForestState, getAnimalEmoji, getSeasonLabel } from '@/lib/forest-calculator';

interface ForestDisplayProps {
  forestState: ForestState;
}

export function ForestDisplay({ forestState }: ForestDisplayProps) {
  const { level, trees, grass, flowers, animals, season, skyColor } = forestState;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 overflow-hidden">
      {/* タイトル */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🌲 あなたの森</h2>
          <p className="text-xs text-gray-500">毎日の習慣で森が育ちます</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-green-600">
            Lv {level}
          </div>
          <div className="text-xs text-gray-500">{getSeasonLabel(season)}</div>
        </div>
      </div>

      {/* 森の描画エリア */}
      <div className="bg-gradient-to-b rounded-lg p-4 mb-4 flex items-center justify-center min-h-64" style={{
        backgroundColor: skyColor,
      }}>
        <svg
          viewBox="0 0 400 300"
          className="w-full max-w-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 地面 */}
          <rect x="0" y="220" width="400" height="80" fill="#8B7355" opacity="0.8" rx="10" />

          {/* 草 */}
          {grass && (
            <>
              <ellipse cx="80" cy="220" rx="20" ry="8" fill="#90EE90" opacity="0.7" />
              <ellipse cx="150" cy="220" rx="18" ry="7" fill="#9ACD32" opacity="0.7" />
              <ellipse cx="280" cy="220" rx="22" ry="8" fill="#90EE90" opacity="0.7" />
              <ellipse cx="350" cy="220" rx="20" ry="7" fill="#9ACD32" opacity="0.7" />
            </>
          )}

          {/* 左の木 */}
          {trees >= 1 && <Tree x={80} y={200} size="large" />}

          {/* 中央の木 */}
          {trees >= 2 && <Tree x={200} y={200} size="large" />}

          {/* 右の木 */}
          {trees >= 3 && <Tree x={320} y={200} size="large" />}

          {/* 花 */}
          {flowers && (
            <>
              <Flower x={60} y={200} color="#FF69B4" />
              <Flower x={120} y="190" color="#FFB6C1" />
              <Flower x={280} y={195} color="#FF69B4" />
              <Flower x={340} y={200} color="#FFB6C1" />
            </>
          )}

          {/* 動物 */}
          {animals.includes('butterfly') && (
            <>
              <Butterfly x={100} y={100} />
              <Butterfly x={280} y={120} />
            </>
          )}
          {animals.includes('bird') && (
            <>
              <Bird x={150} y={80} direction="right" />
              <Bird x={300} y={70} direction="left" />
            </>
          )}
          {animals.includes('rabbit') && (
            <Rabbit x={250} y={210} />
          )}
          {animals.includes('deer') && (
            <Deer x={100} y={190} />
          )}
          {animals.includes('fox') && (
            <Fox x={320} y={185} />
          )}

          {/* 太陽・月 */}
          {(season === 'spring' || season === 'summer') && (
            <circle cx="350" cy="30" r="25" fill="#FFD700" opacity="0.9" />
          )}
          {(season === 'autumn' || season === 'winter') && (
            <circle cx="350" cy="30" r="25" fill="#F0F0F0" opacity="0.8" />
          )}
        </svg>
      </div>

      {/* 成長情報 */}
      <div className="space-y-2">
        {/* プログレスバー */}
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
            style={{ width: `${level}%` }}
          ></div>
        </div>

        {/* テキスト */}
        <div className="flex justify-between text-xs text-gray-600">
          <span>森の成長度</span>
          <span className="font-bold">{level}/100</span>
        </div>

        {/* 成長ステータス */}
        <div className="text-sm text-gray-700 space-y-1 pt-2 border-t border-gray-200">
          {level === 0 && (
            <p>🌱 新しい森が始まります。毎日の習慣で育てましょう</p>
          )}
          {level > 0 && level < 20 && (
            <p>🌱 まだ小さい森。毎日続けることが大切です</p>
          )}
          {level >= 20 && level < 40 && (
            <p>🌿 森が育ってきました。習慣が根付いています</p>
          )}
          {level >= 40 && level < 60 && (
            <p>🌳 しっかりした森になってきました。素敵です</p>
          )}
          {level >= 60 && level < 80 && (
            <p>🌲 豊かな森に成長しました。素晴らしい継続です</p>
          )}
          {level >= 80 && (
            <p>🌳✨ あなたの森は完成に近づいています。これからも一緒に育てましょう</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 木のコンポーネント
 */
function Tree({
  x,
  y,
  size,
}: {
  x: number;
  y: number;
  size: 'small' | 'large';
}) {
  const trunkWidth = size === 'large' ? 12 : 8;
  const trunkHeight = size === 'large' ? 40 : 25;
  const crowRadius = size === 'large' ? 30 : 18;

  return (
    <g>
      {/* 幹 */}
      <rect
        x={x - trunkWidth / 2}
        y={y}
        width={trunkWidth}
        height={trunkHeight}
        fill="#8B4513"
      />
      {/* 樹冠 */}
      <circle cx={x} cy={y - 20} r={crowRadius} fill="#228B22" opacity="0.85" />
      <circle cx={x - 20} cy={y - 10} r={crowRadius * 0.8} fill="#32CD32" opacity="0.75" />
      <circle cx={x + 20} cy={y - 10} r={crowRadius * 0.8} fill="#32CD32" opacity="0.75" />
    </g>
  );
}

/**
 * 花のコンポーネント
 */
function Flower({ x, y, color }: { x: number; y: number | string; color: string }) {
  const yNum = typeof y === 'string' ? parseInt(y) : y;
  return (
    <g>
      {/* 茎 */}
      <line x1={x} y1={yNum + 15} x2={x} y2={yNum - 5} stroke="#228B22" strokeWidth="2" />
      {/* 花弁 */}
      <circle cx={x} cy={yNum - 15} r="4" fill={color} />
      <circle cx={x - 6} cy={yNum - 10} r="3.5" fill={color} />
      <circle cx={x + 6} cy={yNum - 10} r="3.5" fill={color} />
      <circle cx={x - 4} cy={yNum - 20} r="3.5" fill={color} />
      <circle cx={x + 4} cy={yNum - 20} r="3.5" fill={color} />
      {/* 中央 */}
      <circle cx={x} cy={yNum - 15} r="2" fill="#FFD700" />
    </g>
  );
}

/**
 * 蝶のコンポーネント
 */
function Butterfly({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* 体 */}
      <circle cx={x} cy={y} r="2" fill="#333" />
      {/* 羽 */}
      <ellipse cx={x - 5} cy={y - 2} rx="4" ry="6" fill="#FF69B4" opacity="0.8" />
      <ellipse cx={x + 5} cy={y - 2} rx="4" ry="6" fill="#FF69B4" opacity="0.8" />
      <ellipse cx={x - 4} cy={y + 2} rx="3" ry="4" fill="#FFB6C1" opacity="0.8" />
      <ellipse cx={x + 4} cy={y + 2} rx="3" ry="4" fill="#FFB6C1" opacity="0.8" />
    </g>
  );
}

/**
 * 鳥のコンポーネント
 */
function Bird({ x, y, direction }: { x: number; y: number; direction: 'left' | 'right' }) {
  const scaleX = direction === 'right' ? 1 : -1;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
      {/* 体 */}
      <circle cx="0" cy="0" r="3" fill="#FFD700" />
      {/* 頭 */}
      <circle cx="3" cy="-1" r="2" fill="#FFD700" />
      {/* くちばし */}
      <line x1="4" y1="-1" x2="6" y2="-1" stroke="#FF8C00" strokeWidth="1" />
      {/* 羽 */}
      <path d="M -3 0 Q -6 -3 -5 1 Q -6 2 -3 1 Z" fill="#FFA500" opacity="0.8" />
      {/* 尾 */}
      <line x1="-3" y1="0" x2="-8" y2="-1" stroke="#FF8C00" strokeWidth="1.5" />
    </g>
  );
}

/**
 * ウサギのコンポーネント
 */
function Rabbit({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* 体 */}
      <ellipse cx={x} cy={y} rx="6" ry="8" fill="#FFF" stroke="#999" strokeWidth="0.5" />
      {/* 頭 */}
      <circle cx={x} cy={y - 10} r="5" fill="#FFF" stroke="#999" strokeWidth="0.5" />
      {/* 目 */}
      <circle cx={x - 2} cy={y - 11} r="1" fill="#000" />
      <circle cx={x + 2} cy={y - 11} r="1" fill="#000" />
      {/* 耳 */}
      <ellipse cx={x - 3} cy={y - 17} rx="2" ry="6" fill="#FFB6C1" stroke="#999" strokeWidth="0.5" />
      <ellipse cx={x + 3} cy={y - 17} rx="2" ry="6" fill="#FFB6C1" stroke="#999" strokeWidth="0.5" />
    </g>
  );
}

/**
 * シカのコンポーネント
 */
function Deer({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* 体 */}
      <ellipse cx={x} cy={y} rx="8" ry="6" fill="#8B4513" />
      {/* 頭 */}
      <circle cx={x + 8} cy={y - 3} r="4" fill="#A0522D" />
      {/* 目 */}
      <circle cx={x + 10} cy={y - 4} r="1" fill="#000" />
      {/* 角 */}
      <line x1={x + 9} y1={y - 7} x2={x + 8} y2={y - 12} stroke="#696969" strokeWidth="1.5" />
      <line x1={x + 11} y1={y - 7} x2={x + 12} y2={y - 12} stroke="#696969" strokeWidth="1.5" />
      {/* 脚 */}
      <line x1={x - 4} y1={y + 6} x2={x - 4} y2={y + 10} stroke="#696969" strokeWidth="1" />
      <line x1={x + 4} y1={y + 6} x2={x + 4} y2={y + 10} stroke="#696969" strokeWidth="1" />
    </g>
  );
}

/**
 * キツネのコンポーネント
 */
function Fox({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* 体 */}
      <ellipse cx={x} cy={y} rx="7" ry="5" fill="#FF8C00" />
      {/* 頭 */}
      <circle cx={x + 7} cy={y - 2} r="4" fill="#FF7F50" />
      {/* 耳 */}
      <polygon points={`${x + 7},${y - 7} ${x + 5},${y - 10} ${x + 9},${y - 10}`} fill="#FF7F50" />
      {/* 目 */}
      <circle cx={x + 9} cy={y - 3} r="1" fill="#000" />
      {/* 尾 */}
      <path d={`M ${x - 7} ${y} Q ${x - 12} ${y - 3} ${x - 13} ${y - 8}`} stroke="#FF6347" strokeWidth="2" fill="none" />
    </g>
  );
}
