'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { parseForestNoteText } from '@/lib/forest-note-parser';
import { saveDiaryEntry } from '@/lib/supabase-api';
import { storage } from '@/lib/storage';
import Link from 'next/link';

function PasteContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text/plain');
    setText(pasted);
    parseAndPreview(pasted);
  };

  const parseAndPreview = (inputText: string) => {
    if (!inputText.trim()) {
      setPreview(null);
      setError(null);
      return;
    }

    try {
      const parsed = parseForestNoteText(inputText);
      if (parsed) {
        setPreview(parsed);
        setError(null);
      } else {
        setPreview(null);
        setError('Forest Note 形式が正しくない可能性があります');
      }
    } catch (err) {
      setPreview(null);
      setError('解析エラー');
    }
  };

  const handleSave = async () => {
    if (!text.trim()) {
      setError('Forest Note テキストを入力してください');
      return;
    }

    if (!user) {
      setError('ログインが必要です');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // テキスト解析
      const parsed = parseForestNoteText(text);
      if (!parsed) {
        setError('Forest Note の解析に失敗しました');
        setLoading(false);
        return;
      }

      // diary_entries に保存
      const savedEntry = await saveDiaryEntry(user.id, {
        date: parsed.date,
        text: parsed.text || '',
        mood: 5, // デフォルト値（ユーザーは後で手入力）
        energy: 5,
        activity: parsed.work || '',
        workTime: 0,
        tasks: {
          pushups: parsed.tasks.pushups,
          squats: parsed.tasks.squats,
          plank: parsed.tasks.plank,
          run: parsed.tasks.run,
          reading: parsed.tasks.reading || false,
          ai_learning: parsed.tasks.ai_learning || false,
        },
        imageGenerated: false,
        mental: parsed.mental,
        body: parsed.body,
        work: parsed.work,
        relationship: parsed.relationship,
        money: parsed.money,
        habit: parsed.habit,
        dream: parsed.dream,
      });

      // localStorage にもバックアップ保存
      storage.saveEntry({
        date: parsed.date,
        text: parsed.text || '',
        mood: 5,
        energy: 5,
        activity: parsed.work || '',
        workTime: 0,
        tasks: parsed.tasks,
        imageGenerated: false,
      });

      // 確認画面へリダイレクト
      router.push(`/input/confirm?date=${parsed.date}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '保存に失敗しました';
      setError(errorMsg);
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-1 text-sm">
            ← ホーム
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">📝 Forest Note を貼り付け</h1>
          <p className="text-sm sm:text-base text-gray-600">
            テキストをペースト → 自動解析 → 確認 → 保存
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Area */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <label className="block text-sm font-bold mb-2">テキストを貼り付け</label>

            <textarea
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setText(e.target.value);
                parseAndPreview(e.target.value);
              }}
              onPaste={handlePaste}
              placeholder={`=== FOREST_NOTE_START ===
DATE: 2026-07-07
MENTAL: 気分が良かった...
BODY: 十分な睡眠...
WORK: プロジェクト進行...
RELATION: 友達と会った...
MONEY: 支出管理...
HABIT:
PushUp: true
Squat: true
Plank: false
Run: true
Reading: true
AI: false
DREAM: 将来への思い...
=== FOREST_NOTE_END ===`}
              className="w-full h-80 p-4 border-2 border-gray-300 rounded-lg font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-none"
            />

            <p className="text-xs text-gray-500 mt-2">
              💡 Ctrl+V でペースト
            </p>
          </div>

          {/* Preview Area */}
          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-lg">
                <div className="font-bold">⚠️ 形式エラー</div>
                <div className="text-sm">{error}</div>
              </div>
            )}

            {preview && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">✅ プレビュー</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">日付</span>
                    <span className="font-bold text-blue-600">{preview.date}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pb-3 border-b">
                    {[
                      { label: 'メンタル', value: preview.mental },
                      { label: '体力', value: preview.body },
                      { label: '仕事', value: preview.work },
                      { label: '関係', value: preview.relationship },
                      { label: 'お金', value: preview.money },
                      { label: '夢', value: preview.dream },
                    ].map((item) => (
                      <div key={item.label} className="text-xs">
                        <div className="text-gray-600">{item.label}</div>
                        <div className="font-semibold text-gray-800 truncate">{item.value || '－'}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pb-3 border-b">
                    <div className="text-gray-600 mb-2">習慣</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(preview.tasks).map(([key, value]: [string, any]) => (
                        value ? (
                          <span key={key} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                            {key === 'pushups' ? '💪' : key === 'squats' ? '🦵' : key === 'plank' ? '🏋️' : key === 'run' ? '🏃' : key === 'reading' ? '📚' : '🤖'}
                          </span>
                        ) : null
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!preview && !error && text.trim() && (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
                <p>解析中...</p>
              </div>
            )}

            {!text.trim() && (
              <div className="bg-blue-50 rounded-lg border-l-4 border-blue-500 p-4">
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-2">📋 形式確認</p>
                  <ul className="text-xs space-y-1 text-blue-700">
                    <li>✅ 開始・終了タグが必須</li>
                    <li>✅ DATE: YYYY-MM-DD 形式</li>
                    <li>✅ HABIT セクション必須</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end mt-6">
          <Link href="/">
            <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold transition text-sm sm:text-base">
              キャンセル
            </button>
          </Link>
          <button
            onClick={handleSave}
            disabled={loading || !preview}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition flex items-center gap-2 text-sm sm:text-base ${
              loading || !preview
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                保存中...
              </>
            ) : (
              <>
                <span>💾 保存</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PastePage() {
  return (
    <AuthGuard>
      <PasteContent />
    </AuthGuard>
  );
}
