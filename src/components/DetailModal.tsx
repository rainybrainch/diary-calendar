'use client';

import { useState, useEffect } from 'react';
import { DiaryEntry, Tasks } from '@/lib/types';
import { storage } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import { saveDiaryEntry, SupabaseError } from '@/lib/supabase-api';

interface DetailModalProps {
  date: string | null;
  onClose: () => void;
  onSave: (entry: DiaryEntry) => void;
}

export function DetailModal({ date, onClose, onSave }: DetailModalProps) {
  const { user } = useAuth();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [text, setText] = useState('');
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [activity, setActivity] = useState('');
  const [workTime, setWorkTime] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Tasks>({ pushups: false, squats: false, plank: false, run: false, reading: false, ai_learning: false });
  const [imageGenerated, setImageGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    setError(null);

    const existingEntry = storage.getEntry(date);
    if (existingEntry) {
      setEntry(existingEntry);
      setText(existingEntry.text);
      setMood(existingEntry.mood);
      setEnergy(existingEntry.energy);
      setActivity(existingEntry.activity);
      setWorkTime(existingEntry.workTime);
      setImagePreview(null);
      setTasks(existingEntry.tasks);
      setImageGenerated(existingEntry.imageGenerated);
    } else {
      setEntry(null);
      setText('');
      setMood(5);
      setEnergy(5);
      setActivity('');
      setWorkTime(0);
      setImagePreview(null);
      setTasks({ pushups: false, squats: false, plank: false, run: false, reading: false, ai_learning: false });
      setImageGenerated(false);
    }
  }, [date]);

  if (!date) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!date || !user) return;

    setSaving(true);
    setError(null);

    const newEntry: DiaryEntry = {
      id: entry?.id,
      date,
      text,
      mood,
      energy,
      activity,
      workTime,
      tasks,
      imageGenerated,
    };

    // localStorage に保存（バックアップ）
    storage.saveEntry(newEntry);

    // Supabase に保存
    try {
      const savedEntry = await saveDiaryEntry(user.id, newEntry);
      onSave(savedEntry);
      onClose();
    } catch (err) {
      const errorMsg = err instanceof SupabaseError ? err.message : '保存に失敗しました';
      setError(`❌ クラウド保存失敗: ${errorMsg}`);
      console.error('Failed to save diary entry:', err);
      // localStorage には保存されているので、ユーザーに知らせる
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (confirm('この日記を削除しますか？')) {
      storage.deleteEntry(date);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">{date} の日記</h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold mb-2">日記画像</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm"
            />
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="max-w-full max-h-96 rounded" />
              </div>
            )}
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-bold mb-2">日記本文</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 p-3 border rounded"
              placeholder="今日の出来事を書きましょう..."
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-bold mb-2">気分: {mood}</label>
            <input
              type="range"
              min="0"
              max="10"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Energy */}
          <div>
            <label className="block text-sm font-bold mb-2">体力: {energy}</label>
            <input
              type="range"
              min="0"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Activity */}
          <div>
            <label className="block text-sm font-bold mb-2">活動内容</label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="例：散歩、読書など"
            />
          </div>

          {/* Work Time */}
          <div>
            <label className="block text-sm font-bold mb-2">作業時間（分）: {workTime}</label>
            <input
              type="number"
              value={workTime}
              onChange={(e) => setWorkTime(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>

          {/* Habits */}
          <div>
            <label className="block text-sm font-bold mb-3">習慣チェック</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tasks.pushups}
                  onChange={(e) => setTasks({ ...tasks, pushups: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>💪 腕立て</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tasks.squats}
                  onChange={(e) => setTasks({ ...tasks, squats: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>🦵 スクワット</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tasks.plank}
                  onChange={(e) => setTasks({ ...tasks, plank: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>📍 プランク</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tasks.run}
                  onChange={(e) => setTasks({ ...tasks, run: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>🏃 ラン</span>
              </label>
            </div>
          </div>

          {/* Image Generated */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={imageGenerated}
                onChange={(e) => setImageGenerated(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-bold">🎨 画像生成済み</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            {entry && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
              >
                削除
              </button>
            )}
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:bg-gray-400"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
