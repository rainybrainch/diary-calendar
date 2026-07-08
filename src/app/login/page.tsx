'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, signUpWithEmail, user, error: authError } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(!DEMO_MODE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // デモモード時：ユーザーがログイン状態なら自動でホームへ
  if (DEMO_MODE && user) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          throw new Error('ユーザー名を入力してください');
        }
        await signUpWithEmail(email, password, username);
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : '認証エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Google ログインに失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* デモモード時：大きなCTAボタン */}
        {DEMO_MODE && !showLoginForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">📔</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">日記カレンダー</h1>
              <p className="text-gray-600">毎日の記録を365日続けよう</p>
            </div>

            <div className="space-y-4">
              {/* デモを始める - 大きなCTA */}
              <button
                onClick={() => router.push('/')}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition transform hover:scale-105 shadow-lg"
              >
                🚀 デモを始める
              </button>

              <p className="text-xs text-gray-500">インストール不要・今すぐ始められます</p>
            </div>

            {/* デモ機能説明 */}
            <div className="mt-8 space-y-3 text-left">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded">
                <span className="text-lg">✍️</span>
                <div>
                  <div className="font-bold text-sm text-gray-800">日記を記録</div>
                  <div className="text-xs text-gray-600">毎日の出来事をテキストで保存</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
                <span className="text-lg">🎴</span>
                <div>
                  <div className="font-bold text-sm text-gray-800">カードを集める</div>
                  <div className="text-xs text-gray-600">記録がカードに変身。レアリティを目指そう</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded">
                <span className="text-lg">🏆</span>
                <div>
                  <div className="font-bold text-sm text-gray-800">ランキングに参加</div>
                  <div className="text-xs text-gray-600">習慣の達成度を競いあう</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLoginForm(true)}
              className="mt-6 text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              詳細 / Supabase 接続 →
            </button>
          </div>
        )}

        {/* 通常のログインフォーム */}
        {showLoginForm && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📔</h1>
                <h2 className="text-sm text-gray-600 mt-1">
                  {DEMO_MODE ? 'Supabase接続' : 'ログイン'}
                </h2>
              </div>
              {DEMO_MODE && (
                <button
                  onClick={() => setShowLoginForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  ← 戻る
                </button>
              )}
            </div>

            {/* Google ログインボタン */}
            {!DEMO_MODE && !isSignUp && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2 px-4 border-2 border-gray-300 text-gray-700 rounded font-bold hover:bg-gray-50 disabled:bg-gray-100 transition text-sm flex items-center justify-center gap-2"
                >
                  <span>🔐</span>
                  <span>Google でログイン</span>
                </button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">または</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {(localError || authError) && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {localError || authError}
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="block text-sm font-bold mb-1">ユーザー名</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="例：tanaka"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="user@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="6文字以上"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 disabled:bg-gray-400 transition text-sm"
              >
                {loading ? '処理中...' : isSignUp ? '新規作成' : 'ログイン'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setLocalError('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                {isSignUp ? 'ログインページへ' : '新規アカウントを作成'}
              </button>
            </div>

            {DEMO_MODE && (
              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                <div className="font-bold mb-1">💚 デモモード有効</div>
                データは localhost に自動保存されます。Supabase を接続すると、クラウド同期が有効になります。
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
