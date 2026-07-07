'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/', icon: '🏠', label: 'ホーム' },
  { href: '/input/paste', icon: '✍️', label: '記録' },
  { href: '/cards', icon: '🎴', label: 'カード' },
  { href: '/ranking', icon: '🏆', label: 'ランキング' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading || !user || pathname === '/login') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-around items-stretch">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 sm:py-4 transition border-t-4 min-h-[64px] ${
                  isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1">{item.icon}</div>
                <div className="text-xs sm:text-sm font-semibold truncate">{item.label}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
