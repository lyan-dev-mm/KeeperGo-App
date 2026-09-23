// src/presentation/store/susStore.ts

import { create } from 'zustand';
import { SUSResponse } from '../../domain/entities/sus/SUSResponse';
import { SUSRepositoryImpl } from '../../data/repositories/SUSRepositoryImpl';
import { SaveSUSUseCase } from '../../domain/usecases/sus/SaveSUSUseCase';

interface SaveSUSPayload {
  emailInstitucional: string;
  respuestas: number[];
}

interface SUSState {
  response: SUSResponse | null;
  hasCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  userId: string | null;

  setUserId: (userId: string | null) => void;
  refresh: (userIdParam?: string) => Promise<void>;
  saveResponse: (data: SaveSUSPayload) => Promise<SUSResponse | null>;
  reset: () => void;
}

export const useSUSStore = create<SUSState>((set, get) => {
  const repository = new SUSRepositoryImpl();
  const saveUseCase = new SaveSUSUseCase(repository);

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
          error: error instanceof Error ? error.message : 'Error al sincronizar SUS',
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
          error: error instanceof Error ? error.message : 'Error al guardar SUS',
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