'use client';

import { useEffect, useState } from 'react';
import { GrowthReport } from '@/lib/ai/types';

interface GrowthReportModalProps {
  report: GrowthReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GrowthReportModal({ report, isOpen, onClose }: GrowthReportModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // 3秒後に自動でクローズ
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, onClose]);

  if (!isVisible || !report) {
    return null;
  }

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* モーダル */}
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
                   bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4
                   animate-bounce-in"
      >
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4 animate-pulse">{report.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-800">{report.title}</h2>
        </div>

        {/* メッセージ */}
        <div className="space-y-3 mb-6">
          {report.messages.map((message, idx) => (
            <p
              key={idx}
              className="text-gray-700 text-sm leading-relaxed animate-fade-in"
              style={{
                animationDelay: `${idx * 100}ms`,
              }}
            >
              {message}
            </p>
          ))}
        </div>

        {/* クローズボタン */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold
                     hover:bg-blue-600 transition text-sm"
          >
            続ける
          </button>
        </div>

        {/* 装飾的な背景 */}
        <div className="absolute inset-0 rounded-lg opacity-0 pointer-events-none" />
      </div>

      {/* アニメーションスタイル */}
      <style>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}
