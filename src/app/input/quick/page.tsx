'use client';

export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { QuickInputFlow } from '@/components/QuickInputFlow';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

function QuickInputContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      // Demo mode
      if (!user) {
        const appData = storage.getData();
        const entry = {
          date: today,
          text: data.text,
          mood: data.mood,
          energy: data.energy,
          activity: '',
          workTime: 0,
          tasks: {
            pushups: false,
            squats: false,
            plank: false,
            run: false,
            reading: false,
            ai_learning: false,
          },
          imageGenerated: false,
        };

        const existingIndex = appData.entries.findIndex((e) => e.date === today);
        if (existingIndex >= 0) {
          appData.entries[existingIndex] = { ...appData.entries[existingIndex], ...entry };
        } else {
          appData.entries.push(entry);
        }

        localStorage.setItem('diary-calendar-data', JSON.stringify(appData));
        router.push(`/input/confirm?date=${today}`);
      } else {
        // Supabase mode
        const { error: insertError } = await supabase.from('diary_entries').upsert({
          user_id: user.id,
          date: today,
          text: data.text,
          mood: data.mood,
          energy: data.energy,
          activity: '',
          work_time: 0,
          image_generated: false,
        });

        if (insertError) throw insertError;

        // 習慣チェック作成
        await supabase.from('habit_checks').upsert({
          user_id: user.id,
          date: today,
          pushups: false,
          squats: false,
          plank: false,
          run: false,
          reading: false,
          ai_learning: false,
        });

        router.push(`/input/confirm?date=${today}`);
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuickInputFlow onSubmit={handleSubmit} loading={loading} />
  );
}

export default function QuickInputPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
              <p>読み込み中...</p>
            </div>
          </div>
        }
      >
        <QuickInputContent />
      </Suspense>
    </AuthGuard>
  );
}
