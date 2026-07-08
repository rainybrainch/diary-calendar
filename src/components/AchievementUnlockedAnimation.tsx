'use client';

import { Achievement } from '@/lib/achievements';
import { useEffect, useState } from 'react';

interface AchievementUnlockedAnimationProps {
  achievements: Achievement[];
  onComplete?: () => void;
}

export function AchievementUnlockedAnimation({
  achievements,
  onComplete,
}: AchievementUnlockedAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (achievements.length === 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsVisible(false);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 2500); // 各実績を2.5秒表示

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, onComplete]);

  if (!isVisible || achievements.length === 0) return null;

  const current = achievements[currentIndex];

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
      <div
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in bounce-in duration-500"
        style={{
          animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }}
      >
        {/* 実績アイコン */}
        <div className="text-6xl text-center mb-4 animate-pulse">
          {current.icon}
        </div>

        {/* 実績タイトル */}
        <h2 className="text-2xl font-bold text-center mb-2">実績解除！</h2>

        {/* 実績名 */}
        <h3 className="text-xl font-bold text-center mb-2">{current.name}</h3>

        {/* 説明 */}
        <p className="text-center text-yellow-100 text-sm mb-4">
          {current.description}
        </p>

        {/* プログレス */}
        <div className="flex items-center justify-center gap-2">
          {achievements.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index < currentIndex
                  ? 'bg-white w-3'
                  : index === currentIndex
                    ? 'bg-white'
                    : 'bg-yellow-300'
              }`}
            />
          ))}
        </div>

        {/* パーティクル効果 */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${50 + Math.random() * 30 - 15}%`,
                top: `${50 + Math.random() * 30 - 15}%`,
                animation: `ping 1.5s cubic-bezier(0, 0, 0.2, 1) ${i * 0.1}s infinite`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
