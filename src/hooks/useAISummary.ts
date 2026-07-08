'use client';

import { useState, useCallback } from 'react';
import { AIAnswerContext, AIGeneratedContent } from '@/lib/ai/types';
import { createAIProvider, getDefaultAIConfig } from '@/lib/ai';

interface UseAISummaryState {
  title: string;
  summary: string;
  tags: string[];
  attribute: 'mind' | 'body' | 'work' | 'relation' | 'money' | 'habit' | 'dream';
  mood?: number;
  energy?: number;
  loading: boolean;
  error: string | null;
  lastGeneratedContent?: AIGeneratedContent;
}

export function useAISummary() {
  const [state, setState] = useState<UseAISummaryState>({
    title: '',
    summary: '',
    tags: [],
    attribute: 'mind',
    loading: false,
    error: null,
  });

  const aiProvider = createAIProvider(getDefaultAIConfig());

  // 全コンテンツを生成
  const generateContent = useCallback(async (context: AIAnswerContext) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const content = await aiProvider.generateAll(context);

      setState((prev) => ({
        ...prev,
        title: content.title,
        summary: content.summary,
        tags: content.tags,
        attribute: content.attribute,
        mood: content.mood,
        energy: content.energy,
        loading: false,
        lastGeneratedContent: content,
      }));

      return content;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate content';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));
      throw err;
    }
  }, []);

  // タイトルを編集
  const updateTitle = useCallback((newTitle: string) => {
    setState((prev) => ({
      ...prev,
      title: newTitle,
    }));
  }, []);

  // 要約を編集
  const updateSummary = useCallback((newSummary: string) => {
    setState((prev) => ({
      ...prev,
      summary: newSummary,
    }));
  }, []);

  // タグを編集
  const updateTags = useCallback((newTags: string[]) => {
    setState((prev) => ({
      ...prev,
      tags: newTags,
    }));
  }, []);

  // タグを追加
  const addTag = useCallback((tag: string) => {
    setState((prev) => {
      if (prev.tags.length >= 8 || prev.tags.includes(tag)) {
        return prev;
      }
      return {
        ...prev,
        tags: [...prev.tags, tag],
      };
    });
  }, []);

  // タグを削除
  const removeTag = useCallback((tag: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  // 属性を変更
  const setAttribute = useCallback(
    (newAttribute: 'mind' | 'body' | 'work' | 'relation' | 'money' | 'habit' | 'dream') => {
      setState((prev) => ({
        ...prev,
        attribute: newAttribute,
      }));
    },
    []
  );

  // 気分を更新
  const setMood = useCallback((mood: number) => {
    setState((prev) => ({
      ...prev,
      mood: Math.max(1, Math.min(5, mood)),
    }));
  }, []);

  // エネルギーを更新
  const setEnergy = useCallback((energy: number) => {
    setState((prev) => ({
      ...prev,
      energy: Math.max(1, Math.min(5, energy)),
    }));
  }, []);

  // リセット
  const reset = useCallback(() => {
    setState({
      title: '',
      summary: '',
      tags: [],
      attribute: 'mind',
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    generateContent,
    updateTitle,
    updateSummary,
    updateTags,
    addTag,
    removeTag,
    setAttribute,
    setMood,
    setEnergy,
    reset,
  };
}
