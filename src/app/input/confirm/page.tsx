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

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const date = searchParams.get('date');

  const [entry, setEntry] = useState<any>(null);
  const [aiContent, setAIContent] = useState<any>(null);
  const [growthReport, setGrowthReport] = useState<GrowthReport | null>(null);
  const [showGrowthReport, setShowGrowthReport] = useState(false);
  const [aiAdvice, setAIAdvice] = useState<AIAdvice | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [previousRank, setPreviousRank] = useState<number | null>(null);

  // Supabase データ取得（成長レポート用）
  const now = new Date();
  const { entries: supabaseEntries } = useSupabaseDiaryEntries(
    now.getFullYear(),
    now.getMonth()
  );

  // AI生成コンテンツを読み込む
  useEffect(() => {
    const savedContent = sessionStorage.getItem('aiGeneratedContent');
    if (savedContent) {
      try {
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
