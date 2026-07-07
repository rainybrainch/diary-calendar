'use client';

import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DiaryEntry } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseDiaryEntries } from '@/hooks/useSupabaseData';
import { storage } from '@/lib/storage';

interface DiaryGraphProps {
  entries?: DiaryEntry[];
}

export function DiaryGraph({ entries: passedEntries }: DiaryGraphProps) {
  const { user } = useAuth();
  const now = new Date();

  // 過去30日分のデータを取得
  const { entries: supabaseEntries } = useSupabaseDiaryEntries(now.getFullYear(), now.getMonth());

  // データソース決定（ログイン時: Supabase、未ログイン: localStorage）
  const entries = user ? supabaseEntries : (passedEntries || storage.getData().entries);

  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 29 + i);
      return date.toISOString().split('T')[0];
    });

    return last30Days.map((date) => {
      const entry = entries.find((e) => e.date === date);
      const taskCount = entry
        ? (entry.tasks.pushups ? 1 : 0) +
          (entry.tasks.squats ? 1 : 0) +
          (entry.tasks.plank ? 1 : 0) +
          (entry.tasks.run ? 1 : 0) +
          (entry.tasks.reading ? 1 : 0) +
          (entry.tasks.ai_learning ? 1 : 0)
        : 0;
      return {
        date,
        mood: entry?.mood ?? 0,
        energy: entry?.energy ?? 0,
        workTime: entry?.workTime ?? 0,
        tasks: taskCount,
      };
    });
  }, [entries, user]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">気分・体力推移（過去30日）</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="mood" stroke="#fbbf24" name="気分" dot={false} />
            <Line type="monotone" dataKey="energy" stroke="#34d399" name="体力" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">習慣達成数（過去30日）</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 4]} />
            <Tooltip />
            <Bar dataKey="tasks" fill="#8b5cf6" name="習慣達成数" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">作業時間（過去30日）</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="workTime" fill="#3b82f6" name="作業時間（分）" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">統計</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-yellow-50 p-4 rounded">
            <div className="text-sm text-gray-600">平均気分</div>
            <div className="text-2xl font-bold">
              {(chartData.filter((d) => d.mood > 0).reduce((sum, d) => sum + d.mood, 0) / chartData.filter((d) => d.mood > 0).length || 0).toFixed(1)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="text-sm text-gray-600">平均体力</div>
            <div className="text-2xl font-bold">
              {(chartData.filter((d) => d.energy > 0).reduce((sum, d) => sum + d.energy, 0) / chartData.filter((d) => d.energy > 0).length || 0).toFixed(1)}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <div className="text-sm text-gray-600">習慣達成</div>
            <div className="text-2xl font-bold">{chartData.reduce((sum, d) => sum + d.tasks, 0)}</div>
            <div className="text-xs text-gray-500">回</div>
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-sm text-gray-600">合計作業時間</div>
            <div className="text-2xl font-bold">{chartData.reduce((sum, d) => sum + d.workTime, 0)}</div>
            <div className="text-xs text-gray-500">分</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded">
            <div className="text-sm text-gray-600">記録日数</div>
            <div className="text-2xl font-bold">{chartData.filter((d) => d.mood > 0 || d.energy > 0).length}</div>
            <div className="text-xs text-gray-500">日</div>
          </div>
        </div>
      </div>
    </div>
  );
}
