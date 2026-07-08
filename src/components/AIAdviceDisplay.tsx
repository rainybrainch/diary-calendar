'use client';

import { AIAdvice } from '@/lib/ai/types';

interface AIAdviceDisplayProps {
  advice: AIAdvice;
  isOpen: boolean;
  onClose: () => void;
}

export function AIAdviceDisplay({ advice, isOpen, onClose }: AIAdviceDisplayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💭</div>
          <h2 className="text-2xl font-bold text-gray-800">あなたへのアドバイス</h2>
          <p className="text-sm text-gray-500 mt-1">今日・明日・今週の3軸で示唆を受け取ります</p>
        </div>

        {/* 3軸アドバイス */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 今日 */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌅</span>
              <h3 className="font-bold text-gray-800">今日へ</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {advice.today}
            </p>
          </div>

          {/* 明日 */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌤️</span>
              <h3 className="font-bold text-gray-800">明日へ</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {advice.tomorrow}
            </p>
          </div>

          {/* 今週 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌈</span>
              <h3 className="font-bold text-gray-800">今週へ</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {advice.thisWeek}
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-4">
            💡 このアドバイスは過去14日のあなたのデータを元に生成されています
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold transition"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}
