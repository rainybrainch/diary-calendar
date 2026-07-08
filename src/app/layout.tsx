'use client';

import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

function PWAScript() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
        console.log('Service Worker registered:', reg);
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    };

    register();

    // iOS PWA ホーム追加検出
    interface IOSNavigator extends Navigator {
      standalone?: boolean;
    }
    const standalone = (window.navigator as IOSNavigator).standalone === true;
    if (standalone) {
      document.documentElement.setAttribute('data-app-mode', 'pwa');
    }
  }, []);

  return null;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="毎日の日記を写真とテキストで記録。気分、体力、作業時間を可視化します。" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="background-color" content="#ffffff" />

        {/* PWA メタタグ */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%233B82F6' width='192' height='192'/><text x='96' y='130' font-size='120' text-anchor='middle' fill='white' font-weight='bold' font-family='system-ui'>🌲</text></svg>" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Forest Note" />

        {/* アクセシビリティ */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="light" />

        <title>📔 Forest Note - 毎朝開きたくなるライフログ</title>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <PWAScript />
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
