'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAISummary } from '@/hooks/useAISummary';
import { AIAnswerContext } from '@/lib/ai/types';
import Link from 'next/link';

export default function AISummaryPage() {
  const router = useRouter();
  const {
    title,
    summary,
    tags,
    attribute,
    mood,
    energy,
    loading,
    error,
    generateContent,
    updateTitle,
    updateSummary,
    updateTags,
    addTag,
    removeTag,
    setAttribute,
    setMood,
    setEnergy,
  } = useAISummary();

  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // 初期化：sessionStorage から answers を取得
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem('aiAnswers');
    if (savedAnswers) {
      const parsed = JSON.parse(savedAnswers);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(parsed);

      // 自動でコンテンツを生成
      const context: AIAnswerContext = {
        answers: parsed,
      };
      generateContent(context);
    } else {
      // answers がない場合はテキスト入力ページに戻す
      router.push('/input/paste');
    }
  }, []);

  const handleSaveContent = async () => {
    if (!title.trim() || !summary.trim()) {
      alert('タイトルと要約を入力してください');
      return;
    }

    const content = {
      title,
      summary,
      tags,
      attribute,
      mood: mood || 3,
      energy: energy || 3,
      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem('aiGeneratedContent', JSON.stringify(content));
    router.push('/input/confirmation');
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const attributeEmojis: Record<string, string> = {
    mind: '🧠',
    body: '💪',
    work: '💼',
    relation: '👥',
    money: '💰',
    habit: '🎯',
    dream: '🌟',
  };

  if (loading && !title) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-600">AI が要約を作成しています...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <Link href="/input/ai-questions" className="text-xs text-blue-600 hover:text-blue-800">
            ← 質問に戻る
          </Link>
          <div className="text-xs font-semibold text-purple-600">要約を編集</div>
        </div>

        {/* タイトル */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="mb-2 text-xs text-purple-600 font-semibold">✨ タイトル</div>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => updateTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold"
            />
          ) : (
            <h2 className="text-lg font-bold text-gray-800 mb-3">{title || 'タイトルなし'}</h2>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            {isEditing ? '完了' : '✏️ 編集'}
          </button>
        </div>

        {/* 要約 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="mb-2 text-xs text-purple-600 font-semibold">📝 要約</div>
          <textarea
            value={summary}
            onChange={(e) => updateSummary(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
            rows={4}
          />
        </div>

        {/* 属性と気分 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 属性 */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-xs text-purple-600 font-semibold mb-2">🎨 属性</div>
            <div className="space-y-1">
              {(['mind', 'body', 'work', 'relation', 'money', 'habit', 'dream'] as const).map((attr) => (
                <button
                  key={attr}
                  onClick={() => setAttribute(attr)}
                  className={`block w-full text-left px-2 py-1 rounded text-xs font-semibold transition ${
                    attribute === attr
                      ? 'bg-purple-200 text-purple-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {attributeEmojis[attr]} {attr}
                </button>
              ))}
            </div>
          </div>

          {/* 気分・エネルギー */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-xs text-purple-600 font-semibold mb-2">😊 気分</div>
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMood(r)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition ${
                    mood === r ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="text-xs text-purple-600 font-semibold mb-2">⚡ エネルギー</div>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setEnergy(r)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition ${
                    energy === r ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* タグ */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="mb-3 text-xs text-purple-600 font-semibold">🏷️ タグ（最大8個）</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="font-bold hover:text-purple-900"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {tags.length < 8 && (
            <div className="flex gap-1">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag();
                  }
                }}
                placeholder="新しいタグ"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 disabled:bg-gray-400 transition text-xs"
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* アクション */}
        <div className="space-y-3">
          <button
            onClick={handleSaveContent}
            disabled={loading || !title.trim() || !summary.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition"
          >
            {loading ? '処理中...' : '📸 カードを確認'}
          </button>
          <Link
            href="/input/paste"
            className="block w-full text-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm"
          >
            キャンセル
          </Link>
        </div>
      </div>
    </div>
  );
}
