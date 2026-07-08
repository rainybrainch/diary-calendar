'use client';

import { useState, useCallback } from 'react';
import { AIQuestion, AIAnswerContext } from '@/lib/ai/types';
import { createAIProvider, getDefaultAIConfig } from '@/lib/ai';

interface UseAIQuestionsState {
  questions: AIQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  loading: boolean;
  error: string | null;
}

export function useAIQuestions() {
  const [state, setState] = useState<UseAIQuestionsState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    loading: false,
    error: null,
  });

  const aiProvider = createAIProvider(getDefaultAIConfig());

  // 初期質問セットを生成
  const initializeQuestions = useCallback(async (initialContext?: Partial<AIAnswerContext>) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const context: AIAnswerContext = {
        answers: initialContext?.answers || {},
        mood: initialContext?.mood,
        energy: initialContext?.energy,
      };

      const questions = await aiProvider.generateQuestions(context);

      setState((prev) => ({
        ...prev,
        questions,
        loading: false,
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate questions';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));
    }
  }, []);

  // 質問に答える
  const answerQuestion = useCallback(
    async (answer: any) => {
      const { currentQuestionIndex, questions, answers } = state;
      const currentQuestion = questions[currentQuestionIndex];

      if (!currentQuestion) return;

      const newAnswers = {
        ...answers,
        [currentQuestion.id]: answer,
      };

      setState((prev) => ({
        ...prev,
        answers: newAnswers,
      }));

      // 次の質問を生成するか、フォローアップを生成するか
      const hasMoreQuestions = currentQuestionIndex + 1 < questions.length;

      if (hasMoreQuestions) {
        // 次の質問へ
        setState((prev) => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
      } else {
        // フォローアップ質問を試みる
        try {
          setState((prev) => ({ ...prev, loading: true }));

          const context: AIAnswerContext = {
            answers: newAnswers,
          };

          const followUp = await aiProvider.generateFollowUpQuestion(context, String(answer));

          if (followUp) {
            const newQuestions = [...questions, followUp];
            setState((prev) => ({
              ...prev,
              questions: newQuestions,
              currentQuestionIndex: prev.currentQuestionIndex + 1,
              loading: false,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              loading: false,
            }));
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to generate follow-up';
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMsg,
          }));
        }
      }
    },
    [state]
  );

  // 前の質問に戻る
  const goToPreviousQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
    }));
  }, []);

  // 現在の質問を取得
  const currentQuestion = state.questions[state.currentQuestionIndex] || null;

  // 進捗率を計算
  const progress = state.questions.length > 0
    ? ((state.currentQuestionIndex + 1) / state.questions.length) * 100
    : 0;

  // すべての質問が答えられたか
  const isComplete = state.questions.length > 0 &&
    state.currentQuestionIndex === state.questions.length - 1 &&
    state.questions[state.currentQuestionIndex]?.id in state.answers;

  return {
    ...state,
    currentQuestion,
    progress,
    isComplete,
    initializeQuestions,
    answerQuestion,
    goToPreviousQuestion,
  };
}
