'use client';

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

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text/plain');
    setText(pasted);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← ホームへ戻る
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Forest Note を貼り付け</h1>
          <p className="text-gray-600">
            カスタム GPT で作成した Forest Note テキストをコピー＆ペースト。
            自動で解析して保存します。
          </p>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-sm font-bold mb-2">Forest Note テキスト</label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            placeholder={`=== FOREST_NOTE_START ===
DATE: 2026-07-07
MENTAL: 今日は気分が良かった...
BODY: 十分な睡眠を取れた...
WORK: プロジェクト進行中...
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
SUMMARY: 今日の総まとめ...
=== FOREST_NOTE_END ===`}
            className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500"
          />

          <p className="text-xs text-gray-500 mt-2">
            💡 クリップボードからペースト可能。Ctrl+V (Windows) / Cmd+V (Mac)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-lg mb-6">
            <div className="font-bold">❌ エラー</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="font-bold text-blue-800 mb-2">📋 Forest Note 形式について</div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ 必須: <code className="bg-white px-2 py-1 rounded">DATE: YYYY-MM-DD</code></li>
            <li>✅ 必須: <code className="bg-white px-2 py-1 rounded">=== FOREST_NOTE_START ===</code> と <code className="bg-white px-2 py-1 rounded">=== FOREST_NOTE_END ===</code></li>
            <li>✅ 習慣: <code className="bg-white px-2 py-1 rounded">true / false</code> で指定</li>
            <li>💡 7項目（MENTAL, BODY, WORK, RELATION, MONEY, HABIT, DREAM）がまとめられます</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end">
          <Link href="/">
            <button className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold transition">
              キャンセル
            </button>
          </Link>
          <button
            onClick={handleSave}
            disabled={loading || !text.trim()}
            className={`px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 ${
              loading || !text.trim()
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
              '保存'
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow text-center text-sm text-gray-600">
          <p>
            💡 まだ AI チャット機能はありません。<br />
            カスタム GPT でまとめたテキストを貼り付けてください。
          </p>
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
