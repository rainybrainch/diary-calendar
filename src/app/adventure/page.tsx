'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';

function AdventurePageComponent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col pb-24">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-amber-900 to-amber-950 text-white shadow-lg py-6 px-4">
        <h1 className="forest-hero-title text-3xl md:text-4xl">⚔️ 今日の冒険</h1>
        <p className="forest-subtitle mt-2">本日の経験を記録せよ</p>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col px-4 max-w-2xl mx-auto w-full py-8 gap-6">
        {/* 冒険ログ記録エリア */}
        <section className="forest-panel p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📖</div>
            <h2 className="text-2xl font-bold text-green-800">冒険ログを記録</h2>
            <p className="text-sm text-gray-600 mt-2">今日の経験、感情、学びを記録して、森を成長させましょう</p>
          </div>

          {/* 入力方法選択 */}
          <div className="space-y-4">
            <Link href="/input/paste">
              <button className="forest-btn-primary w-full py-4 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all">
                📝 テキストで記録
              </button>
            </Link>

            <p className="text-center text-gray-600 text-sm">
              または JSON フォーマットで直接入力
            </p>

            <Link href="/input/paste?mode=json">
              <button className="forest-btn-secondary w-full py-4 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all">
                ⚙️ JSON で入力
              </button>
            </Link>
          </div>
        </section>

        {/* 冒険ガイド */}
        <section className="forest-panel p-6">
          <h3 className="text-lg font-bold text-green-800 mb-4">⚔️ 冒険ガイド</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-bold">メンタル</p>
                <p className="text-gray-600">今日の心理状態・気分</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">💪</span>
              <div>
                <p className="font-bold">体力</p>
                <p className="text-gray-600">身体的な調子・活力</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-bold">仕事・作業</p>
                <p className="text-gray-600">本日の生産性・成果</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🤝</span>
              <div>
                <p className="font-bold">人間関係</p>
                <p className="text-gray-600">他者とのつながり</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-bold">金銭</p>
                <p className="text-gray-600">家計・資産状況</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-bold">習慣・夢</p>
                <p className="text-gray-600">日々の実践・目標達成</p>
              </div>
            </div>
          </div>
        </section>

        {/* 前回の冒険へ */}
        <section className="text-center">
          <Link href="/">
            <button className="text-green-700 hover:text-green-900 font-semibold underline">
              ← 森に戻る
            </button>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default function AdventurePage() {
  return (
    <AuthGuard>
      <AdventurePageComponent />
    </AuthGuard>
  );
}
