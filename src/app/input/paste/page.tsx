'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { parseForestNoteText, ParsedForestNote } from '@/lib/forest-note-parser';
import { validateForestNoteJson } from '@/lib/forest-note-validator';
import { saveDiaryEntry } from '@/lib/supabase-api';
import { storage } from '@/lib/storage';
import { ForestNoteJSON } from '@/lib/types';
import Link from 'next/link';

function PasteContent() {
  const { user } = useAuth();
  const router = useRouter();
  // テキスト入力モード
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedForestNote | null>(null);
  // JSON 入力モード
  const [inputMode, setInputMode] = useState<'text' | 'json'>('text');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonPreview, setJsonPreview] = useState<ForestNoteJSON | null>(null);

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

  const parseAndPreviewJson = (inputJson: string) => {
    if (!inputJson.trim()) {
      setJsonPreview(null);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const validated = validateForestNoteJson(parsed);
      setJsonPreview(validated);
      setError(null);
    } catch (err) {
      setJsonPreview(null);
      const errorMsg = err instanceof Error ? err.message : 'JSON 解析エラー';
      setError(errorMsg);
    }
  };

  const handleSave = async () => {
    // 入力モードに応じたバリデーション
    if (inputMode === 'text' && !text.trim()) {
      setError('Forest Note テキストを入力してください');
      return;
    }
    if (inputMode === 'json' && !jsonInput.trim()) {
      setError('Forest Note JSON を入力してください');
      return;
    }

    if (!user) {
      setError('ログインが必要です');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (inputMode === 'json') {
        // JSON 入力モード
        if (!jsonPreview) {
          setError('JSON が正しくありません。先にプレビューを確認してください。');
          setLoading(false);
          return;
        }

        // diary_entries に保存（JSON モード）
        await saveDiaryEntry(user.id, {
          date: jsonPreview.date,
          text: jsonPreview.summary || '',
          mood: 5, // デフォルト値
          energy: 5,
          activity: '',
          workTime: 0,
          tasks: {
            pushups: false,
            squats: false,
            plank: false,
            run: false,
            reading: false,
            ai_learning: false,
          },
          imageGenerated: false,
          // Forest Note JSON を直接保存
          forestNoteJson: jsonPreview,
          forestGenerated: true,
          // 7-item scores を JSON から抽出
          mental: jsonPreview.scores.mental,
          body: jsonPreview.scores.body,
          work: jsonPreview.scores.work,
          relationship: jsonPreview.scores.relationship,
          money: jsonPreview.scores.money,
          habit: jsonPreview.scores.habit,
          dream: jsonPreview.scores.dream,
          // 7-item text descriptions を JSON から抽出
          mentalText: jsonPreview.mental,
          bodyText: jsonPreview.body,
          workText: jsonPreview.work,
          relationshipText: jsonPreview.relationship,
          moneyText: jsonPreview.money,
          habitText: jsonPreview.habit,
          dreamText: jsonPreview.dream,
        });

        // localStorage にもバックアップ保存
        storage.saveEntry({
          date: jsonPreview.date,
          text: jsonPreview.summary || '',
          mood: 5,
          energy: 5,
          activity: '',
          workTime: 0,
          tasks: {
            pushups: false,
            squats: false,
            plank: false,
            run: false,
            reading: false,
            ai_learning: false,
          },
          imageGenerated: false,
        });

        // 確認画面へリダイレクト
        router.push(`/input/confirm?date=${jsonPreview.date}`);
      } else {
        // テキスト入力モード（既存処理）
        const parsed = parseForestNoteText(text);
        if (!parsed) {
          setError('Forest Note の解析に失敗しました');
          setLoading(false);
          return;
        }

        // diary_entries に保存
        await saveDiaryEntry(user.id, {
          date: parsed.date,
          text: parsed.text || '',
          mood: parsed.mood || 5,
          energy: parsed.energy || 5,
          activity: parsed.workText || '',
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
          // 7-item life log text descriptions
          mentalText: parsed.mentalText,
          bodyText: parsed.bodyText,
          workText: parsed.workText,
          relationshipText: parsed.relationshipText,
          moneyText: parsed.moneyText,
          habitText: parsed.habitText,
          dreamText: parsed.dreamText,
        });

        // localStorage にもバックアップ保存
        storage.saveEntry({
          date: parsed.date,
          text: parsed.text || '',
          mood: parsed.mood || 5,
          energy: parsed.energy || 5,
          activity: parsed.workText || '',
          workTime: 0,
          tasks: parsed.tasks,
          imageGenerated: false,
          mentalText: parsed.mentalText,
          bodyText: parsed.bodyText,
          workText: parsed.workText,
          relationshipText: parsed.relationshipText,
          moneyText: parsed.moneyText,
          habitText: parsed.habitText,
          dreamText: parsed.dreamText,
        });

        // 確認画面へリダイレクト
        router.push(`/input/confirm?date=${parsed.date}`);
      }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Input Area */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            {/* タブ切り替え */}
            <div className="flex gap-1 mb-4 border-b border-gray-300">
              <button
                onClick={() => setInputMode('text')}
                className={`px-4 py-2 font-semibold transition border-b-2 ${
                  inputMode === 'text'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                📝 テキスト入力
              </button>
              <button
                onClick={() => setInputMode('json')}
                className={`px-4 py-2 font-semibold transition border-b-2 ${
                  inputMode === 'json'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                📋 JSON 入力
              </button>
            </div>

            {/* テキスト入力モード */}
            {inputMode === 'text' && (
              <div>
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
            )}

            {/* JSON 入力モード */}
            {inputMode === 'json' && (
              <div>
                <label className="block text-sm font-bold mb-2">Forest Note JSON を貼り付け</label>
                <textarea
                  value={jsonInput}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setJsonInput(e.target.value);
                    parseAndPreviewJson(e.target.value);
                  }}
                  placeholder={`{
  "version": "1.0",
  "date": "2026-07-09",
  "title": "今日のタイトル",
  "theme": "テーマ1 テーマ2",
  "summary": "今日のサマリー",
  "scores": {
    "mental": 70,
    "body": 80,
    "work": 60,
    "relationship": 60,
    "money": 40,
    "habit": 80,
    "dream": 65
  },
  ...
}`}
                  className="w-full h-80 p-4 border-2 border-gray-300 rounded-lg font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Forest Note JSON を貼り付け（GPT①から取得）
                </p>
              </div>
            )}
          </div>

          {/* Preview Area */}
          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-lg">
                <div className="font-bold">⚠️ 形式エラー</div>
                <div className="text-sm">{error}</div>
              </div>
            )}

            {/* テキストモード プレビュー */}
            {inputMode === 'text' && preview && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">✅ プレビュー</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">日付</span>
                    <span className="font-bold text-blue-600">{preview.date}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pb-3 border-b">
                    {[
                      { label: 'メンタル', value: preview.mentalText },
                      { label: '体力', value: preview.bodyText },
                      { label: '仕事', value: preview.workText },
                      { label: '関係', value: preview.relationshipText },
                      { label: 'お金', value: preview.moneyText },
                      { label: '夢', value: preview.dreamText },
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
                      {Object.entries(preview.tasks).map(([key, value]: [string, boolean]) => (
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

            {inputMode === 'text' && !preview && !error && text.trim() && (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
                <p>解析中...</p>
              </div>
            )}

            {inputMode === 'text' && !text.trim() && (
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

            {/* JSON モード プレビュー */}
            {inputMode === 'json' && jsonPreview && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">✅ JSON プレビュー</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">日付</span>
                    <span className="font-bold text-blue-600">{jsonPreview.date}</span>
                  </div>

                  <div className="pb-3 border-b">
                    <span className="text-gray-600 font-semibold">タイトル</span>
                    <p className="text-gray-800 mt-1">{jsonPreview.title}</p>
                  </div>

                  <div className="pb-3 border-b">
                    <span className="text-gray-600 font-semibold">スコア</span>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      {Object.entries(jsonPreview.scores).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key}</span>
                          <span className="font-bold text-blue-600">{value}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pb-3">
                    <span className="text-gray-600 font-semibold">テーマ</span>
                    <p className="text-gray-800 mt-1">{jsonPreview.theme}</p>
                  </div>
                </div>
              </div>
            )}

            {inputMode === 'json' && !jsonPreview && !error && jsonInput.trim() && (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
                <p>バリデーション中...</p>
              </div>
            )}

            {inputMode === 'json' && !jsonInput.trim() && (
              <div className="bg-amber-50 rounded-lg border-l-4 border-amber-500 p-4">
                <div className="text-sm text-amber-800">
                  <p className="font-bold mb-2">📋 JSON 入力ガイド</p>
                  <ul className="text-xs space-y-1 text-amber-700">
                    <li>✅ Forest Note v1.0 JSON をペースト</li>
                    <li>✅ 必須項目: version, date, title, scores等</li>
                    <li>✅ スコアは0-100の範囲</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap justify-end mt-6 pb-8 sm:pb-0">
          <Link href="/">
            <button className="px-4 sm:px-6 py-3 sm:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold transition text-sm sm:text-base min-h-12 sm:min-h-auto">
              キャンセル
            </button>
          </Link>
          {inputMode === 'text' && preview && (
            <Link href="/input/ai-questions">
              <button className="px-4 sm:px-6 py-3 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-bold transition text-sm sm:text-base min-h-12 sm:min-h-auto">
                💭 AI 質問チャット
              </button>
            </Link>
          )}
          <button
            onClick={handleSave}
            disabled={loading || (inputMode === 'text' ? !preview : !jsonPreview)}
            className={`px-6 sm:px-8 py-3 sm:py-3 rounded-lg font-bold transition flex items-center gap-2 text-sm sm:text-base min-h-12 sm:min-h-auto ${
              loading || (inputMode === 'text' ? !preview : !jsonPreview)
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
