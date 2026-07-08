'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAIQuestions } from '@/hooks/useAIQuestions';
import Link from 'next/link';

export default function AIQuestionsPage() {
  const router = useRouter();
  const {
    questions,
    currentQuestionIndex,
    answers,
    loading,
    error,
    currentQuestion,
    progress,
    isComplete,
    initializeQuestions,
    answerQuestion,
    goToPreviousQuestion,
  } = useAIQuestions();

  const [answerInput, setAnswerInput] = useState('');
  const [ratingValue, setRatingValue] = useState(3);

  // 初期化
  useEffect(() => {
    initializeQuestions();
  }, [initializeQuestions]);

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    if (currentQuestion.type === 'rating') {
      await answerQuestion(ratingValue);
    } else {
      if (!answerInput.trim()) return;
      await answerQuestion(answerInput);
    }

    // 入力をクリア
    setAnswerInput('');
    setRatingValue(3);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && currentQuestion?.type === 'text') {
      handleSubmitAnswer();
    }
  };

  const handleComplete = () => {
    // answers を sessionStorage に保存してサマリーページへ移動
    sessionStorage.setItem('aiAnswers', JSON.stringify(answers));
    router.push('/input/ai-summary');
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-600">質問を準備しています...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="max-w-md mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-red-500 text-2xl mb-4">❌</div>
            <h1 className="text-xl font-bold mb-2">エラーが発生しました</h1>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Link
              href="/input/paste"
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              テキスト入力に戻る →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-md mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600">質問を読み込めません</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <Link href="/input/paste" className="text-xs text-blue-600 hover:text-blue-800">
            ← 戻る
          </Link>
          <div className="text-xs font-semibold text-gray-500">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-6 rounded-full h-2 bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* メイン質問 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="mb-2 text-sm text-purple-600 font-semibold">
            💭 AI からの質問
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-6">{currentQuestion.question}</h2>

          {/* テキスト入力 */}
          {currentQuestion.type === 'text' && (
            <div className="space-y-3">
              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentQuestion.placeholder || '思ったことを自由に書いてください'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                rows={4}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={loading || !answerInput.trim()}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition text-sm"
              >
                {loading ? '処理中...' : '次へ'}
              </button>
            </div>
          )}

          {/* レーティング入力 */}
          {currentQuestion.type === 'rating' && (
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setRatingValue(rating)}
                    className={`w-12 h-12 rounded-full font-bold text-sm transition ${
                      ratingValue === rating
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmitAnswer}
                disabled={loading}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition text-sm"
              >
                {loading ? '処理中...' : '次へ'}
              </button>
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        {currentQuestionIndex > 0 && (
          <button
            onClick={goToPreviousQuestion}
            disabled={loading}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:bg-gray-100 transition text-sm"
          >
            前の質問に戻る
          </button>
        )}

        {/* 完了ボタン */}
        {isComplete && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <p className="text-green-700 font-semibold text-sm mb-3">✅ 質問が終わりました</p>
            <button
              onClick={handleComplete}
              className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition text-sm"
            >
              要約を見る →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
