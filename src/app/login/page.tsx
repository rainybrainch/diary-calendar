'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          throw new Error('ユーザー名を入力してください');
        }
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📔 日記カレンダー</h1>
          <p className="text-gray-600 mb-6">
            {isSignUp ? '新規アカウントを作成' : 'ログインする'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-bold mb-1">ユーザー名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：user@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="6文字以上"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 disabled:bg-gray-400 transition"
            >
              {loading ? '処理中...' : isSignUp ? '新規作成' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isSignUp
                ? 'ログインページへ'
                : '新規アカウントを作成'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <p className="text-xs text-gray-600">
              💡 <strong>テスト用</strong><br />
              このアプリはローカルデータ（localStorage）と Supabase クラウドの両方に対応しています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
