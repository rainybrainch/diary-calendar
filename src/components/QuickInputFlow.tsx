'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuickInputFlowProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function QuickInputFlow({ onSubmit, loading = false }: QuickInputFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<'paste' | 'questions' | 'confirm'>(
    'paste'
  );
  const [text, setText] = useState('');
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [answers, setAnswers] = useState({
    today: '',
    tomorrow: '',
  });

  const handlePaste = async () => {
    try {
      const clipboard = await navigator.clipboard.readText();
      setText(clipboard);
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  const handleNext = () => {
    if (step === 'paste' && text.trim()) {
      setStep('questions');
    } else if (step === 'questions') {
      setStep('confirm');
    }
  };

  const handleSubmit = () => {
    onSubmit({
      text,
      mood,
      energy,
      answers,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSkip = () => {
    // 質問をスキップして確認ステップへ
    if (step === 'questions') {
      setStep('confirm');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
      {/* ヘッダー */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b px-4 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">✏️ 今日の記録</h2>
        <Link href="/">
          <button className="text-gray-600 hover:text-gray-800 font-bold">✕</button>
        </Link>
      </div>

      {/* ステップバー */}
      <div className="flex-shrink-0 bg-white px-4 py-3 flex gap-1">
        {['paste', 'questions', 'confirm'].map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition ${
              step === s ? 'bg-green-500' : ['paste', 'questions'].includes(step) && (step !== s || i > ['paste', 'questions'].indexOf(step)) ? 'bg-green-200' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 flex flex-col overflow-auto px-4 py-6">
        {step === 'paste' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📝 テキスト入力</h3>
              <p className="text-xs text-gray-600 mb-3">
                今日の出来事をペーストするか、手入力してください
              </p>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="今日の出来事を入力..."
              className="w-full h-32 p-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 resize-none"
            />

            <button
              onClick={handlePaste}
              className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-bold text-sm transition"
            >
              📋 クリップボードから貼り付け
            </button>
          </div>
        )}

        {step === 'questions' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-4">💭 2つの質問</h3>
            </div>

            {/* Q1 */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-800 text-sm">
                🌅 今日で良かったことは？
              </label>
              <textarea
                value={answers.today}
                onChange={(e) =>
                  setAnswers({ ...answers, today: e.target.value })
                }
                placeholder="例：朝日を見ることができた"
                className="w-full h-20 p-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 resize-none text-sm"
              />
            </div>

            {/* Q2 */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-800 text-sm">
                ⭐ 明日の目標は？
              </label>
              <textarea
                value={answers.tomorrow}
                onChange={(e) =>
                  setAnswers({ ...answers, tomorrow: e.target.value })
                }
                placeholder="例：運動を30分やる"
                className="w-full h-20 p-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 resize-none text-sm"
              />
            </div>

            {/* 気分・エネルギー */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-800 text-sm mb-2">
                  😊 気分
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMood(n)}
                      className={`flex-1 py-2 rounded font-bold text-sm transition ${
                        mood === n
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 text-sm mb-2">
                  ⚡ エネルギー
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setEnergy(n)}
                      className={`flex-1 py-2 rounded font-bold text-sm transition ${
                        energy === n
                          ? 'bg-red-400 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-bold text-gray-800 mb-1">記録完了の準備</h3>
              <p className="text-sm text-gray-600">
                下のボタンを押すと保存されます
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-3 max-h-48 overflow-auto">
              <div>
                <div className="text-xs font-bold text-gray-600 mb-1">
                  📝 テキスト
                </div>
                <p className="text-sm text-gray-800 line-clamp-3">{text}</p>
              </div>
              {answers.today && (
                <div>
                  <div className="text-xs font-bold text-gray-600 mb-1">
                    🌅 良かったこと
                  </div>
                  <p className="text-sm text-gray-800">{answers.today}</p>
                </div>
              )}
              {answers.tomorrow && (
                <div>
                  <div className="text-xs font-bold text-gray-600 mb-1">
                    ⭐ 明日の目標
                  </div>
                  <p className="text-sm text-gray-800">{answers.tomorrow}</p>
                </div>
              )}
              <div className="flex gap-2 text-sm">
                <div>😊 気分: {mood}</div>
                <div>⚡ エネルギー: {energy}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* フッターボタン */}
      <div className="flex-shrink-0 bg-white shadow-2xl border-t px-4 py-3 flex gap-2">
        {step !== 'paste' && (
          <button
            onClick={() => {
              if (step === 'confirm') setStep('questions');
              else setStep('paste');
            }}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition"
          >
            戻る
          </button>
        )}

        {step === 'questions' && (
          <button
            onClick={handleSkip}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-bold transition text-sm"
          >
            スキップ
          </button>
        )}

        <button
          onClick={
            step === 'confirm'
              ? handleSubmit
              : handleNext
          }
          disabled={
            (step === 'paste' && !text.trim()) || loading
          }
          className={`flex-1 py-3 rounded-lg font-bold text-white transition ${
            step === 'confirm'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300'
          }`}
        >
          {loading ? '保存中...' : step === 'confirm' ? '✅ 保存する' : '次へ'}
        </button>
      </div>
    </div>
  );
}
