'use client';

import { useState, useEffect } from 'react';
import { CardJSON } from '@/lib/types';
import { CardFlip } from '@/components/CardFlip';
import { CardDisplay } from '@/components/CardDisplay';

interface CardRevealModalProps {
  card: CardJSON;
  imageUrl?: string;
  onClose: () => void;
}

export function CardRevealModal({ card, imageUrl, onClose }: CardRevealModalProps) {
  const [phase, setPhase] = useState<'loading' | 'sparkle' | 'reveal' | 'show'>('loading');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // シーケンス: loading → sparkle → reveal → show
    const sequence = [
      { delay: 800, nextPhase: 'sparkle' as const },
      { delay: 2000, nextPhase: 'reveal' as const },
      { delay: 1200, nextPhase: 'show' as const },
    ];

    sequence.forEach(({ delay, nextPhase }) => {
      setTimeout(() => setPhase(nextPhase), delay);
    });

    // 開封時に紙吹雪
    setTimeout(() => setShowConfetti(true), 2100);
  }, []);

  const rarityColors: Record<string, string> = {
    N: 'from-gray-400 to-gray-500',
    R: 'from-blue-400 to-blue-500',
    SR: 'from-purple-400 to-purple-500',
    SSR: 'from-yellow-300 to-yellow-400',
    UR: 'from-red-400 to-orange-500',
  };

  const rarity = (card.rarity as keyof typeof rarityColors) || 'N';
  const rarityColor = rarityColors[rarity];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* 背景グロー */}
      <div
        className={`absolute inset-0 opacity-0 transition-opacity duration-1000 ${
          phase === 'sparkle' ? 'opacity-100' : ''
        }`}
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
          animation: phase === 'sparkle' ? 'pulse 1s ease-in-out' : 'none',
        }}
      ></div>

      {/* 紙吹雪演出 */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#FFD700', '#FF69B4', '#87CEEB', '#98D8C8'][i % 4],
                opacity: 0.7,
                animation: `fall ${2 + Math.random() * 1}s linear forwards`,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* モーダルコンテナ */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* ローディング画面 */}
        {phase === 'loading' && (
          <div className="text-center animate-pulse">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-white text-xl font-bold">新しいカードが生成されています...</p>
          </div>
        )}

        {/* スパークル演出 */}
        {phase === 'sparkle' && (
          <div className="text-center space-y-4">
            <div className="text-8xl animate-bounce">💫</div>
            <p className="text-white text-2xl font-bold">カードが生成されました！</p>
            <div className="flex justify-center gap-2">
              <span className="text-4xl animate-glow-pulse">✨</span>
              <span className="text-4xl animate-glow-pulse" style={{ animationDelay: '0.3s' }}>
                ✨
              </span>
              <span className="text-4xl animate-glow-pulse" style={{ animationDelay: '0.6s' }}>
                ✨
              </span>
            </div>
          </div>
        )}

        {/* カード開封 */}
        {phase === 'reveal' && (
          <div className="space-y-4">
            <p className="text-white text-center font-bold mb-4 animate-pulse">
              カードを開きます...
            </p>
            <div className="w-96 h-56 mx-auto">
              <CardFlip
                front={
                  <div className={`w-full h-full bg-gradient-to-br ${rarityColor} rounded-xl shadow-2xl flex items-center justify-center transform transition-all duration-500 hover:scale-105`}>
                    <div className="text-center">
                      <div className="text-6xl mb-2">🎴</div>
                      <p className="text-white font-bold text-lg">カード生成中...</p>
                      <div className="mt-4 inline-block px-4 py-2 bg-white/20 rounded-full">
                        <span className="text-white font-bold text-sm">
                          {card.rarity} レアリティ
                        </span>
                      </div>
                    </div>
                  </div>
                }
                back={
                  <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl">
                    <CardDisplay cardJson={card} imageUrl={imageUrl} size="md" />
                  </div>
                }
              />
            </div>
            <p className="text-white text-center text-sm opacity-75">タップして開く</p>
          </div>
        )}

        {/* カード表示 */}
        {phase === 'show' && (
          <div className="space-y-6">
            {/* カード表示 */}
            <div className="max-w-md mx-auto">
              <CardDisplay cardJson={card} imageUrl={imageUrl} size="lg" />
            </div>

            {/* カード情報 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center mb-4">
                <p className="text-yellow-300 text-lg font-bold mb-2">🎉 新しいカードを獲得！</p>
                <h2 className="text-white text-2xl font-bold">{card.card_name}</h2>
              </div>

              {/* ステータスプレビュー */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center bg-white/5 rounded-lg p-3">
                  <p className="text-white/70 text-xs mb-1">HP</p>
                  <p className="text-red-400 text-xl font-bold">{card.hp}</p>
                </div>
                <div className="text-center bg-white/5 rounded-lg p-3">
                  <p className="text-white/70 text-xs mb-1">ATK</p>
                  <p className="text-orange-400 text-xl font-bold">{card.atk}</p>
                </div>
                <div className="text-center bg-white/5 rounded-lg p-3">
                  <p className="text-white/70 text-xs mb-1">Energy</p>
                  <p className="text-blue-400 text-xl font-bold">{card.energy}</p>
                </div>
              </div>

              {/* 説明 */}
              <p className="text-white/80 text-sm italic text-center mb-6">
                "{card.flavor_text}"
              </p>

              {/* ボタン */}
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
              >
                図鑑に追加する
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
