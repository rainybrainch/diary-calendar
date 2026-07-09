'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/', icon: '🏠', label: 'ホーム' },
  { href: '/input/paste', icon: '✍️', label: '記録' },
  { href: '/cards', icon: '🎴', label: 'カード' },
  { href: '/forest', icon: '🌲', label: '森' },
  { href: '/profile', icon: '👤', label: 'プロフィール' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading || !user || pathname === '/login') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-green-900 to-green-950 border-t-2 border-green-700 shadow-2xl z-50 pb-safe">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex justify-around items-stretch">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 sm:py-3 transition-all border-b-4 min-h-[60px] sm:min-h-[64px] ${
                  isActive
                    ? 'border-yellow-400 text-yellow-300 bg-green-800/50'
                    : 'border-transparent text-green-100 hover:text-yellow-200 hover:bg-green-800/30'
                }`}
              >
                <div className="text-lg sm:text-2xl">{item.icon}</div>
                <div className="text-xs sm:text-xs font-semibold truncate mt-0.5">{item.label}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
