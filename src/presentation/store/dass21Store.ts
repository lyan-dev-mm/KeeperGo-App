import { create } from 'zustand';
import {
  DASS21Response,
  DASS21Tipo,
} from '../../domain/entities/dass21/DASS21Response';
import { DASS21RepositoryImpl } from '../../data/repositories/DASS21RepositoryImpl';
import { SaveDASS21UseCase } from '../../domain/usecases/dass21/SaveDass21UseCase';

interface SaveDASS21Payload {
  emailInstitucional: string;
  tipo: DASS21Tipo;
  respuestas: number[];
}

interface DASS21State {
  responses: DASS21Response[];
  hasCompletedInicial: boolean;
  hasCompletedFinal: boolean;
  isLoading: boolean;
  error: string | null;
  userId: string | null;

  setUserId: (userId: string | null) => void;
  /** Única función que sincroniza con Firestore. */
  refresh: (userIdParam?: string) => Promise<void>;
  saveResponse: (data: SaveDASS21Payload) => Promise<DASS21Response | null>;
  reset: () => void;
}

export const useDASS21Store = create<DASS21State>((set, get) => {
  const repository = new DASS21RepositoryImpl();
  const saveUseCase = new SaveDASS21UseCase(repository);

  return {
    responses: [],
    hasCompletedInicial: false,
    hasCompletedFinal: false,
    isLoading: false,
    error: null,
    userId: null,

    setUserId: (userId) => set({ userId }),

    refresh: async (userIdParam) => {
      const userId = userIdParam ?? get().userId;
      if (!userId) {
        set({
          responses: [],
          hasCompletedInicial: false,
          hasCompletedFinal: false,
        });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const responses = await repository.getResponses(userId);
        const inicial = responses.find((r) => r.tipo === 'inicial' && r.completado);
        const final   = responses.find((r) => r.tipo === 'final'   && r.completado);

        set({
          responses,
          hasCompletedInicial: !!inicial,
          hasCompletedFinal:   !!final,
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
        await get().refresh(userId); // re-sincroniza desde Firestore
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
        hasCompletedInicial: false,
        hasCompletedFinal: false,
        isLoading: false,
        error: null,
        userId: null,
      }),
  };
});