// src/presentation/store/autopercepcionStore.ts

import { create } from 'zustand';
import {
  AutopercepcionResponse,
  AutopercepcionTipo,
} from '../../domain/entities/autopercepcion/AutopercepcionResponse';
import { AutopercepcionRepositoryImpl } from '../../data/repositories/AutopercepcionRepositoryImpl';
import { SaveAutopercepcionUseCase } from '../../domain/usecases/autopercepcion/SaveAutopercepcionUseCase';

interface SaveAutopercepcionPayload {
  emailInstitucional: string;
  tipo: AutopercepcionTipo;
  respuestas: number[];
}

interface AutopercepcionState {
  responses: AutopercepcionResponse[];
  hasCompletedPretest: boolean;
  hasCompletedPostest: boolean;
  isLoading: boolean;
  error: string | null;
  userId: string | null;

  setUserId: (userId: string | null) => void;
  refresh: (userIdParam?: string) => Promise<void>;
  saveResponse: (data: SaveAutopercepcionPayload) => Promise<AutopercepcionResponse | null>;
  reset: () => void;
}

export const useAutopercepcionStore = create<AutopercepcionState>((set, get) => {
  const repository = new AutopercepcionRepositoryImpl();
  const saveUseCase = new SaveAutopercepcionUseCase(repository);

  return {
    responses: [],
    hasCompletedPretest: false,
    hasCompletedPostest: false,
    isLoading: false,
    error: null,
    userId: null,

    setUserId: (userId) => set({ userId }),

    refresh: async (userIdParam) => {
      const userId = userIdParam ?? get().userId;
      if (!userId) {
        set({
          responses: [],
          hasCompletedPretest: false,
          hasCompletedPostest: false,
        });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const responses = await repository.getResponses(userId);
        const pretest = responses.find((r) => r.tipo === 'pretest' && r.completado);
        const postest = responses.find((r) => r.tipo === 'postest' && r.completado);

        set({
          responses,
          hasCompletedPretest: !!pretest,
          hasCompletedPostest: !!postest,
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
        responses: [],
        hasCompletedPretest: false,
        hasCompletedPostest: false,
        isLoading: false,
        error: null,
        userId: null,
      }),
  };
});