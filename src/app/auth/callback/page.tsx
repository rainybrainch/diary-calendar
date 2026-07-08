'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // OAuth コールバック後、少し遅延してセッション確認（トークン処理待ち）
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login?error=auth_failed');
          return;
        }

        if (data.session) {
          // ログイン成功 → ホームにリダイレクト
          router.push('/');
        } else {
          // セッションなし → ログイン画面に戻す
          router.push('/login');
        }
      } catch (err) {
        console.error('Callback handling error:', err);
        router.push('/login?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">ログインしています...</p>
      </div>
    </div>
  );
}
