'use client';

import { ReactNode, useState } from 'react';

interface CardFlipProps {
  front: ReactNode;
  back: ReactNode;
  disabled?: boolean;
}

export function CardFlip({ front, back, disabled = false }: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleFlip = () => {
    if (!disabled) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      onClick={toggleFlip}
      className={`relative w-full h-full cursor-pointer transition-all duration-500 ${
        disabled ? 'cursor-default' : ''
      }`}
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          {front}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
        </div>
      </div>

      {/* Flip Hint */}
      {!disabled && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
          {isFlipped ? '表' : '裏'}
        </div>
      )}
    </div>
  );
}
