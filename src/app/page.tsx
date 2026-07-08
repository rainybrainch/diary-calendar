'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { HomeScreenOptimized } from '@/components/HomeScreenOptimized';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseDiaryEntries } from '@/hooks/useSupabaseData';
import { useAchievements } from '@/hooks/useAchievements';
import { storage } from '@/lib/storage';
import { DiaryEntry } from '@/lib/types';
import { initializeDemoData } from '@/lib/demo-data';

function HomeContent() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const { state: achievementState, newlyUnlocked } = useAchievements();

  // デモモード初期化
  useEffect(() => {
    initializeDemoData();
  }, []);

  // データ取得
  const now = new Date();
  const { entries: supabaseEntries } = useSupabaseDiaryEntries(
    now.getFullYear(),
    now.getMonth()
  );

  useEffect(() => {
    if (user && supabaseEntries.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries(supabaseEntries);
    } else if (!user) {
      const data = storage.getData();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries(data.entries);
    }
  }, [user, supabaseEntries]);

  return (
    <HomeScreenOptimized
      entries={entries}
      achievementState={achievementState}
      newlyUnlocked={newlyUnlocked}
      user={user ?? undefined}
    />
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
