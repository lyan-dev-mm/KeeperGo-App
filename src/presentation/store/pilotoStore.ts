// src/presentation/store/pilotoStore.ts

import { create } from 'zustand';
import { PilotoStatus } from '../../domain/entities/piloto/PilotoStatus';
import { PilotoRepositoryImpl } from '../../data/repositories/PilotorepositoryImpl';
import {
  GetPilotoStatusUseCase,
  StartPilotoUseCase,
  CompletePilotoUseCase,
} from '../../domain/usecases/piloto/PilotoUseCase';

interface PilotoState {
  status: PilotoStatus | null;
  hasStarted: boolean;
  hasCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  userId: string | null;

  setUserId: (userId: string | null) => void;
  refresh: (userIdParam?: string) => Promise<void>;
  start: () => Promise<void>;
  complete: () => Promise<PilotoStatus | null>;
  reset: () => void;
}

export const usePilotoStore = create<PilotoState>((set, get) => {
  const repository = new PilotoRepositoryImpl();
  const getUseCase = new GetPilotoStatusUseCase(repository);
  const startUseCase = new StartPilotoUseCase(repository);
  const completeUseCase = new CompletePilotoUseCase(repository);

  return {
    status: null,
    hasStarted: false,
    hasCompleted: false,
    isLoading: false,
    error: null,
    userId: null,

    setUserId: (userId) => set({ userId }),

    refresh: async (userIdParam) => {
      const userId = userIdParam ?? get().userId;
      if (!userId) {
        set({ status: null, hasStarted: false, hasCompleted: false });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const status = await getUseCase.execute(userId);
        set({
          status,
          hasStarted: !!status?.fechaInicio,
          hasCompleted: !!status?.completado,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Error al sincronizar',
          isLoading: false,
        });
      }
    },

    start: async () => {
      const { userId } = get();
      if (!userId) return;

      try {
        const status = await startUseCase.execute(userId);
        set({
          status,
          hasStarted: true,
          hasCompleted: status.completado,
        });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Error al iniciar' });
      }
    },

    complete: async () => {
      const { userId } = get();
      if (!userId) return null;

      set({ isLoading: true, error: null });
      try {
        const status = await completeUseCase.execute(userId);
        set({
          status,
          hasCompleted: true,
          isLoading: false,
        });
        return status;
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Error al completar',
          isLoading: false,
        });
        return null;
      }
    },

    reset: () =>
      set({
        status: null,
        hasStarted: false,
        hasCompleted: false,
        isLoading: false,
        error: null,
        userId: null,
      }),
  };
});