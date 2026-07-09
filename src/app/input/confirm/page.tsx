'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { GrowthReportModal } from '@/components/GrowthReportModal';
import { AIAdviceDisplay } from '@/components/AIAdviceDisplay';
import { generateCard } from '@/lib/card-generator';
import { DiaryCardComponent } from '@/components/DiaryCard';
import { analyzePastData } from '@/lib/past-data-analyzer';
import { calculateForestState } from '@/lib/forest-calculator';
import { createAIProvider, getDefaultAIConfig } from '@/lib/ai';
import { storage } from '@/lib/storage';
import { useSupabaseDiaryEntries } from '@/hooks/useSupabaseData';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { GrowthReport, AIAdvice } from '@/lib/ai/types';
import { DiaryEntry, CardJSON } from '@/lib/types';
import { DiaryCard } from '@/lib/card-generator';
import { validateCardJson } from '@/lib/forest-note-validator';
import { saveDiaryEntry } from '@/lib/supabase-api';

interface AIGeneratedContent {
  title: string;
  summary: string;
  tags: string[];
  attribute: 'mind' | 'body' | 'work' | 'relation' | 'money' | 'habit' | 'dream';
  mood: number;
  energy: number;
  createdAt: string;
}

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const date = searchParams.get('date');

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [aiContent, setAIContent] = useState<AIGeneratedContent | null>(null);
  const [growthReport, setGrowthReport] = useState<GrowthReport | null>(null);
  const [showGrowthReport, setShowGrowthReport] = useState(false);
  const [aiAdvice, setAIAdvice] = useState<AIAdvice | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [previousRank, setPreviousRank] = useState<number | null>(null);
  // Card JSON input state
  const [showCardInput, setShowCardInput] = useState(false);
  const [cardJsonInput, setCardJsonInput] = useState('');
  const [cardJsonPreview, setCardJsonPreview] = useState<CardJSON | null>(null);
  const [cardJsonError, setCardJsonError] = useState<string | null>(null);
  const [cardSaving, setCardSaving] = useState(false);

  // Supabase データ取得（成長レポート用）
  const now = new Date();
  const { entries: supabaseEntries } = useSupabaseDiaryEntries(
    now.getFullYear(),
    now.getMonth()
  );

  // Card JSON パース＆プレビュー
  const parseAndPreviewCardJson = (inputJson: string) => {
    if (!inputJson.trim()) {
      setCardJsonError(null);
      setCardJsonPreview(null);
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const validated = validateCardJson(parsed);
      setCardJsonPreview(validated);
      setCardJsonError(null);
    } catch (err) {
      setCardJsonPreview(null);
      setCardJsonError(err instanceof Error ? err.message : '不明なエラー');
    }
  };

  // Card JSON 入力変更ハンドラ
  const handleCardJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCardJsonInput(value);
    parseAndPreviewCardJson(value);
  };

  // Card JSON 保存ハンドラ
  const handleSaveCardJson = async () => {
    if (!user || !entry || !cardJsonPreview) {
      setCardJsonError('保存に必要なデータが不足しています');
      return;
    }

    try {
      setCardSaving(true);
      setCardJsonError(null);

      // localStorage バックアップに cardJson を含める
      const allEntries = (() => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem('diary_entries_demo');
        return stored ? JSON.parse(stored) : [];
      })();

      const entryIndex = allEntries.findIndex((e: DiaryEntry) => e.date === entry.date);
      if (entryIndex >= 0) {
        allEntries[entryIndex] = {
          ...allEntries[entryIndex],
          cardJson: cardJsonPreview,
          cardGenerated: true,
        };
        localStorage.setItem('diary_entries_demo', JSON.stringify(allEntries));
      }

      // Supabase に cardJson を保存
      const updatedEntry: DiaryEntry = {
        ...entry,
        cardJson: cardJsonPreview,
        cardGenerated: true,
      };

      await saveDiaryEntry(user.id, updatedEntry);

      setEntry(updatedEntry);
      setShowCardInput(false);
      setCardJsonInput('');
      setCardJsonPreview(null);

      // 成功メッセージ
      alert('Card JSON を保存しました！');
    } catch (err) {
      setCardJsonError(
        err instanceof Error ? err.message : 'Card JSON の保存に失敗しました'
      );
    } finally {
      setCardSaving(false);
    }
  };

  // AI生成コンテンツを読み込む
  useEffect(() => {
    const savedContent = sessionStorage.getItem('aiGeneratedContent');
    if (savedContent) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAIContent(JSON.parse(savedContent));
        sessionStorage.removeItem('aiGeneratedContent');
      } catch (err) {
        console.warn('Failed to parse AI content:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!date || !user) {
        setError('無効な日付またはログイン状態です');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // diary_entries を取得
        const { data: entryData, error: entryError } = await supabase
          .from('diary_entries')
          .select('*, habit_checks(*)')
          .eq('user_id', user.id)
          .eq('date', date)
          .single();

        if (entryError) {
          throw new Error(`日記取得エラー: ${entryError.message}`);
        }

        if (!entryData) {
          throw new Error('保存されたデータが見つかりません');
        }

        // データを整形
        const formattedEntry = {
          id: entryData.id,
          date: entryData.date,
          text: entryData.text || '',
          mood: entryData.mood || 0,
          energy: entryData.energy || 0,
          activity: entryData.activity || '',
          workTime: entryData.work_time || 0,
          tasks: entryData.habit_checks?.[0]
            ? {
                pushups: entryData.habit_checks[0].pushups || false,
                squats: entryData.habit_checks[0].squats || false,
                plank: entryData.habit_checks[0].plank || false,
                run: entryData.habit_checks[0].run || false,
                reading: entryData.habit_checks[0].reading || false,
                ai_learning: entryData.habit_checks[0].ai_learning || false,
              }
            : {
                pushups: false,
                squats: false,
                plank: false,
                run: false,
                reading: false,
                ai_learning: false,
              },
          imageGenerated: entryData.image_generated || false,
        };

        setEntry(formattedEntry);

        // ランキング情報を取得（簡易版）
        const { data: allEntries, error: rankError } = await supabase
          .from('diary_entries')
          .select('date, habit_checks(pushups, squats, plank, run, reading, ai_learning)')
          .eq('user_id', user.id)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('date', { ascending: false });

        if (!rankError && allEntries) {
          // 習慣達成数でランク計算（簡易）
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const scores = allEntries.map((e: any) => {
            const hc = e.habit_checks?.[0];
            return (hc?.pushups ? 1 : 0) +
              (hc?.squats ? 1 : 0) +
              (hc?.plank ? 1 : 0) +
              (hc?.run ? 1 : 0) +
              (hc?.reading ? 1 : 0) +
              (hc?.ai_learning ? 1 : 0);
          });

          const todayScore = formattedEntry.tasks
            ? (formattedEntry.tasks.pushups ? 1 : 0) +
              (formattedEntry.tasks.squats ? 1 : 0) +
              (formattedEntry.tasks.plank ? 1 : 0) +
              (formattedEntry.tasks.run ? 1 : 0) +
              (formattedEntry.tasks.reading ? 1 : 0) +
              (formattedEntry.tasks.ai_learning ? 1 : 0)
            : 0;

          const currentRank = scores.filter((s: number) => s > todayScore).length + 1;
          const previousScore = scores[1] || 0;
          const previousRankValue = scores.filter((s: number) => s > previousScore).length + 1;

          setRank(currentRank);
          setPreviousRank(previousRankValue);
        }

        // 成長レポート＆AIアドバイスを生成
        try {
          const collectEntries = () => {
            if (user && supabaseEntries.length > 0) {
              return supabaseEntries;
            }
            const data = storage.getData();
            return data.entries;
          };

          const allData = collectEntries();
          const pastContext = analyzePastData(allData);
          const aiProvider = createAIProvider(getDefaultAIConfig(), pastContext);

          // 成長レポート
          if (aiProvider.generateGrowthReport) {
            const report = await aiProvider.generateGrowthReport();
            setGrowthReport(report);
            setShowGrowthReport(true);
          }

          // AI アドバイス
          if (aiProvider.generateAdvice) {
            const advice = await aiProvider.generateAdvice();
            setAIAdvice(advice);
            // 成長レポート後に自動で表示するため、ここでは表示しない
          }
        } catch (reportErr) {
          console.warn('Failed to generate growth report/advice:', reportErr);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '読み込みエラー');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, user, supabaseEntries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">保存データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="max-w-md text-center bg-white rounded-lg shadow-lg p-6">
          <div className="text-5xl mb-4">❌</div>
          <div className="text-lg font-bold text-gray-800 mb-2">エラー</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold">
              ホームへ
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">データが見つかりません</p>
        </div>
      </div>
    );
  }

  // AI content を反映させてカードを生成
  const cardEntry = {
    ...entry,
    title: aiContent?.title,
    tags: aiContent?.tags,
    attribute: aiContent?.attribute,
    aiMood: aiContent?.mood,
    aiEnergy: aiContent?.energy,
  };

  const card = generateCard(cardEntry, true);
  const taskCount =
    (entry.tasks.pushups ? 1 : 0) +
    (entry.tasks.squats ? 1 : 0) +
    (entry.tasks.plank ? 1 : 0) +
    (entry.tasks.run ? 1 : 0) +
    (entry.tasks.reading ? 1 : 0) +
    (entry.tasks.ai_learning ? 1 : 0);

  const rankDiff = previousRank ? previousRank - (rank || 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h1 className="text-4xl font-bold text-green-800 mb-2">保存しました！</h1>
          <p className="text-green-700">日記がカード化されました</p>
        </div>

        {/* Date Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
          <div className="text-gray-500 text-sm">記録日</div>
          <div className="text-3xl font-bold text-gray-800">📅 {entry.date}</div>
        </div>

        {/* Generated Card */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🎴 生成されたカード</h2>
          </div>
          <div className="flex justify-center h-96">
            <div className="w-56">
              <DiaryCardComponent card={card} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{taskCount}</div>
            <div className="text-xs text-gray-600">習慣達成</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {card.rarity === 1
                ? '☆'
                : card.rarity === 2
                ? '⭐'
                : card.rarity === 3
                ? '⭐⭐'
                : card.rarity === 4
                ? '⭐⭐⭐'
                : '⭐⭐⭐⭐'}
            </div>
            <div className="text-xs text-gray-600">レアリティ</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{card.stats.habit}</div>
            <div className="text-xs text-gray-600">属性値</div>
          </div>
        </div>

        {/* Ranking Info */}
        {rank && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-blue-600 mb-2">🏆 今月のランキング</div>
              <div className="flex items-center justify-center gap-4">
                <div>
                  <div className="text-3xl font-bold text-blue-600">#{rank}</div>
                  <div className="text-xs text-gray-600">現在の順位</div>
                </div>
                {rankDiff !== 0 && (
                  <div className={rankDiff > 0 ? 'text-green-600' : 'text-gray-600'}>
                    {rankDiff > 0 ? '📈' : '📉'} {Math.abs(rankDiff)} 位{rankDiff > 0 ? 'UP' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 成長レポートモーダル */}
        <GrowthReportModal
          report={growthReport}
          isOpen={showGrowthReport}
          onClose={() => {
            setShowGrowthReport(false);
            // 成長レポートが閉じられたら自動で AI アドバイスを表示
            if (aiAdvice) {
              setTimeout(() => setShowAdvice(true), 300);
            }
          }}
        />

        {/* AI アドバイスモーダル */}
        {aiAdvice && (
          <AIAdviceDisplay
            advice={aiAdvice}
            isOpen={showAdvice}
            onClose={() => setShowAdvice(false)}
          />
        )}

        {/* Card JSON Input Section */}
        {!showCardInput ? (
          <div className="mb-6">
            <button
              onClick={() => setShowCardInput(true)}
              className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-bold transition"
            >
              ➕ Card JSON を追加（手動入力）
            </button>
          </div>
        ) : (
          <div className="bg-pink-50 border-2 border-pink-300 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Card JSON 入力</h3>

            {/* Card JSON Textarea */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Card JSON (v1.0 形式)
              </label>
              <textarea
                value={cardJsonInput}
                onChange={handleCardJsonInputChange}
                placeholder={`{
  "card_id": "card_001",
  "card_type": "Attack",
  "date": "2026-07-09",
  "title": "良い一日",
  "card_name": "朝日の戦士",
  "rarity": "SR",
  "attribute": "Fire",
  "hp": 100,
  "atk": 85,
  "energy": 8,
  "skill": {
    "name": "朝焼けの波動",
    "type": "Fire",
    "effect": "全体に80のダメージ"
  },
  "flavor_text": "新しい朝が始まる",
  "image_prompt": "...",
  "image_url": "",
  "forest_note": {
    "theme": "...",
    "summary": "...",
    "today_best": "...",
    "lesson": "...",
    "tomorrow": "..."
  }
}`}
                className="w-full h-64 p-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Card JSON Preview */}
            {cardJsonPreview && (
              <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-pink-500">
                <div className="text-sm text-gray-700 mb-3">
                  <div className="font-bold">Card ID: {cardJsonPreview.card_id}</div>
                  <div className="font-bold">Name: {cardJsonPreview.card_name}</div>
                  <div className="font-bold">Type: {cardJsonPreview.card_type}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Rarity: {cardJsonPreview.rarity} | Attribute: {cardJsonPreview.attribute}
                  </div>
                  <div className="text-xs text-gray-500">
                    Stats: HP {cardJsonPreview.hp} / ATK {cardJsonPreview.atk} / Energy {cardJsonPreview.energy}
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {cardJsonError && (
              <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-4 text-red-700 text-sm">
                ❌ {cardJsonError}
              </div>
            )}

            {/* Save / Cancel Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveCardJson}
                disabled={!cardJsonPreview || cardSaving}
                className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-400 font-bold transition"
              >
                {cardSaving ? '保存中...' : '💾 Card JSON を保存'}
              </button>
              <button
                onClick={() => {
                  setShowCardInput(false);
                  setCardJsonInput('');
                  setCardJsonPreview(null);
                  setCardJsonError(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-bold transition"
              >
                ❌ キャンセル
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/calendar">
            <button className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold transition">
              📅 カレンダーで確認
            </button>
          </Link>
          <Link href="/cards">
            <button className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold transition">
              🎴 カード一覧を見る
            </button>
          </Link>
          <Link href="/">
            <button className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold transition">
              🏠 ホームへ
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow text-center text-sm text-gray-600">
          <p>
            💡 毎日の記録でカードを集めよう！<br />
            月末にはデッキが完成します。
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p>読み込み中...</p>
            </div>
          </div>
        }
      >
        <ConfirmContent />
      </Suspense>
    </AuthGuard>
  );
}
