'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getDiaryEntries, SupabaseError } from '@/lib/supabase-api';
import { DiaryEntry } from '@/lib/types';

export function useSupabaseDiaryEntries(year: number, month: number) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getDiaryEntries(user.id, year, month);
      setEntries(data);
    } catch (err) {
      const errorMessage = err instanceof SupabaseError
        ? err.message
        : err instanceof Error
        ? err.message
        : '不明なエラー';
      setError(errorMessage);
      console.error('Failed to fetch diary entries:', err);
    } finally {
      setLoading(false);
    }
  }, [user, year, month]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries();
  }, [fetchEntries]);

  const refetch = useCallback(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, error, refetch, setEntries };
}
