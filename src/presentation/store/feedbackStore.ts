// src/presentation/store/feedbackStore.ts

import { create } from 'zustand';
import { FeedbackResponse } from '../../domain/entities/feedback/FeedbackResponse';
import { FeedbackRepositoryImpl } from '../../data/repositories/FeedbackRepositoryImpl';
import {
  SaveFeedbackUseCase,
  SaveFeedbackData,
} from '../../domain/usecases/feedback/SaveFeedbackUseCase';

type SaveFeedbackPayload = Omit<SaveFeedbackData, 'userId'>;

interface FeedbackState {
  response: FeedbackResponse | null;
  hasCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  userId: string | null;

  setUserId: (userId: string | null) => void;
  refresh: (userIdParam?: string) => Promise<void>;
  saveResponse: (data: SaveFeedbackPayload) => Promise<FeedbackResponse | null>;
  reset: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => {
  const repository = new FeedbackRepositoryImpl();
  const saveUseCase = new SaveFeedbackUseCase(repository);

  return {
    response: null,
    hasCompleted: false,
    isLoading: false,
    error: null,
    userId: null,

    setUserId: (userId) => set({ userId }),

    refresh: async (userIdParam) => {
      const userId = userIdParam ?? get().userId;
      if (!userId) {
        set({ response: null, hasCompleted: false });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const response = await repository.getResponse(userId);
        set({
          response,
          hasCompleted: !!response?.completado,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Error al sincronizar',
          isLoading: false,
        });
      }
    },

    saveResponse: async (data) => {
      const { userId } = get();
      if (!userId) {
        set({ error: 'Usuario no autenticado' });
        return null;
      }

      set({ isLoading: true, error: null });
      try {
        const saved = await saveUseCase.execute({ userId, ...data });
        await get().refresh(userId);
        return saved;
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Error al guardar',
          isLoading: false,
        });
        return null;
      }
    },

    reset: () =>
      set({
        response: null,
        hasCompleted: false,
        isLoading: false,
        error: null,
        userId: null,
      }),
  };
});