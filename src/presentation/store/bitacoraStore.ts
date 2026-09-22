// src/presentation/store/bitacoraStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { secureStorageAdapter } from './secureStorageAdapter';
import { RegistroAnimo } from '../../domain/entities/bitacora/RegistroAnimo';
import {
  Alerta,
  AnalisisCompleto,
  Recomendacion,
} from '../../domain/usecases/bitacora/DetectarPatronesUseCase';
import { SaveRegistroData } from '../../domain/usecases/bitacora/SaveRegistroUseCase';
import { GetRegistrosUseCase } from '../../domain/usecases/bitacora/GetRegistroAnimo';
import { SaveRegistroUseCase } from '../../domain/usecases/bitacora/SaveRegistroUseCase';
import { DeleteRegistroUseCase } from '../../domain/usecases/bitacora/DeleteRegistroUseCase';
import { DetectarPatronesUseCase } from '../../domain/usecases/bitacora/DetectarPatronesUseCase';
import { RegistroAnimoRepositoryImpl } from '../../data/repositories/RegistroAnimoRepositoryImpl';

interface BitacoraState {
  registros: RegistroAnimo[];
  isLoading: boolean;
  error: string | null;
  alertas: Alerta[];
  resumenAlerta: string;
  recomendaciones: Recomendacion[];
  requiereProfesional: boolean;
  analisisCompleto: AnalisisCompleto | null;
  userId: string | null;

  setUserId: (userId: string | null) => void;
  /** silent: si es true, no activa `isLoading` (para cargas en segundo plano) */
  loadRegistros: (silent?: boolean) => Promise<void>;
  getRegistroPorFecha: (fecha: Date) => RegistroAnimo | null;
  saveRegistro: (registroData: Omit<SaveRegistroData, 'userId'>) => Promise<RegistroAnimo | null>;
  deleteRegistro: (id: string) => Promise<boolean>;
  /**
   * Corre el análisis de patrones.
   * - `registro`: el registro recién guardado, o `null` cuando el análisis
   *   se dispara solo por haber cargado el historial (sin acción del usuario).
   * - `historialOverride`: úsalo cuando ya tienes el historial a la mano
   *   (por ejemplo justo después de loadRegistros) para evitar una consulta
   *   redundante al repositorio.
   */
  analizarPatrones: (
    registro?: RegistroAnimo | null,
    historialOverride?: RegistroAnimo[]
  ) => Promise<AnalisisCompleto | null>;
  limpiarAlertas: () => void;
  resetStore: () => void;
}

const initialState = {
  registros: [],
  isLoading: false,
  error: null,
  alertas: [],
  resumenAlerta: '',
  recomendaciones: [],
  requiereProfesional: false,
  analisisCompleto: null,
  userId: null,
};

export const useBitacoraStore = create<BitacoraState>()(
  persist(
    (set, get) => {
      const repository = new RegistroAnimoRepositoryImpl();
      const getRegistrosUseCase = new GetRegistrosUseCase(repository);
      const saveRegistroUseCase = new SaveRegistroUseCase(repository);
      const deleteRegistroUseCase = new DeleteRegistroUseCase(repository);
      const detectarPatronesUseCase = new DetectarPatronesUseCase(repository);

      return {
        ...initialState,

        setUserId: (userId: string | null) => {
          if (get().userId !== userId) {
            console.log('Store: setUserId:', userId);
            set({ userId });
          }
        },

        loadRegistros: async (silent: boolean = false) => {
          const { userId } = get();
          console.log('loadRegistros - userId:', userId);

          if (!userId) {
            set({ error: 'Usuario no autenticado' });
            return;
          }

          // FIX: antes esta función no aceptaba parámetros, pero
          // BitacoraScreen la llama con loadRegistros(true) esperando un
          // modo "silencioso" que no dispare el spinner de isLoading.
          if (!silent) {
            set({ isLoading: true, error: null });
          } else {
            set({ error: null });
          }

          try {
            const data = await getRegistrosUseCase.execute(userId);
            const registros = Array.isArray(data) ? data : [];
            set({ registros: [...registros], isLoading: false });
            console.log('✅ Registros cargados en store:', registros.length);

            // Análisis persistente: corre también al cargar, no solo tras
            // guardar un registro, para que sea preventivo de verdad (el
            // usuario puede ver alertas solo con abrir la Bitácora).
            await get().analizarPatrones(null, registros);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar los registros';
            console.error('Error loadRegistros:', errorMessage);
            set({ error: errorMessage, isLoading: false, registros: [] });
          }
        },

        getRegistroPorFecha: (fecha: Date) => {
          const { registros } = get();
          try {
            const targetDate = new Date(fecha);
            targetDate.setHours(0, 0, 0, 0);

            const encontrado = registros.find((r) => {
              const rDate = new Date(r.fecha);
              rDate.setHours(0, 0, 0, 0);
              return rDate.getTime() === targetDate.getTime();
            });

            return encontrado || null;
          } catch (error) {
            console.error('Error en getRegistroPorFecha:', error);
            return null;
          }
        },

        analizarPatrones: async (
          registro: RegistroAnimo | null = null,
          historialOverride?: RegistroAnimo[]
        ) => {
          const { userId, registros } = get();
          console.log('analizarPatrones - Iniciando analisis...');

          if (!userId) {
            console.error('No hay usuario autenticado');
            return null;
          }

          try {
            // FIX: se usa el estado ya cargado del store (o el historial que
            // nos pasen explícitamente) en vez de volver a pedirlo al
            // repositorio. Justo después de guardar/eliminar un registro, una
            // nueva consulta offline-first podría no reflejar todavía el
            // cambio recién hecho; el estado local del store ya lo tiene.
            const fuente = historialOverride ?? registros;

            // FIX: DetectarPatronesUseCase.execute solo ordena el historial
            // cuando lo obtiene él mismo (parámetro historial === null). Si
            // se lo pasamos ya armado, hay que garantizar aquí el orden
            // reciente -> antiguo, que es lo que asumen analizarEnergia y
            // analizarTendencias.
            const historial = [...fuente].sort(
              (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );

            const resultado = await detectarPatronesUseCase.execute(userId, registro, historial);

            set({
              alertas: resultado.alertas,
              resumenAlerta: resultado.resumen,
              recomendaciones: resultado.recomendaciones,
              requiereProfesional: resultado.requiereProfesional,
              analisisCompleto: resultado,
            });

            console.log('✅ Alertas actualizadas en store:', resultado.alertas.length);

            return resultado;
          } catch (error) {
            console.error('Error en analizarPatrones:', error);
            return null;
          }
        },

        saveRegistro: async (registroData: Omit<SaveRegistroData, 'userId'>) => {
          const { userId } = get();
          console.log('saveRegistro - Datos recibidos:', registroData);

          if (!userId) {
            set({ error: 'Usuario no autenticado' });
            return null;
          }

          set({ isLoading: true, error: null });

          try {
            const data: SaveRegistroData = {
              ...registroData,
              userId: userId,
            };

            console.log('Guardando registro...');
            const saved = await saveRegistroUseCase.execute(data);

            if (saved) {
              const currentRegistros = get().registros;
              const existingIndex = currentRegistros.findIndex((r) => r.id === saved.id);

              let updatedRegistros;
              if (existingIndex !== -1) {
                updatedRegistros = [...currentRegistros];
                updatedRegistros[existingIndex] = saved;
              } else {
                updatedRegistros = [saved, ...currentRegistros];
              }

              set({ registros: updatedRegistros, isLoading: false });

              console.log('Analizando patrones para el nuevo registro...');
              // analizarPatrones ya toma `registros` del estado (recién
              // actualizado arriba), así que refleja este guardado sin
              // necesidad de volver a consultar el repositorio.
              await get().analizarPatrones(saved);
            }

            return saved;
          } catch (err) {
            console.error('Error en saveRegistro:', err);
            set({ error: err instanceof Error ? err.message : 'Error al guardar el registro', isLoading: false });
            return null;
          }
        },

        deleteRegistro: async (id: string) => {
          const { userId } = get();
          console.log('deleteRegistro - id:', id);

          if (!userId || userId === 'temp_user' || userId.trim() === '') {
            set({ error: 'Usuario no autenticado' });
            return false;
          }

          set({ isLoading: true, error: null });

          try {
            // FIX: DeleteRegistroUseCase.execute solo acepta (id: string).
            // Pasarle un segundo argumento (userId) no compila con types
            // estrictos ("Expected 1 arguments, but got 2").
            const result = await deleteRegistroUseCase.execute(id, userId);

            if (result) {
              console.log('✅ Registro eliminado, actualizando localmente...');

              const currentRegistros = get().registros;
              const updatedRegistros = currentRegistros.filter((r) => r.id !== id);

              set({ registros: updatedRegistros, isLoading: false });

              // Antes se llamaba limpiarAlertas() aquí, que borraba TODO el
              // análisis de golpe. En vez de eso, se recalcula con la lista
              // ya sin el registro eliminado, para que las alertas reflejen
              // el estado real (por ejemplo, si el registro eliminado era el
              // único que sostenía un patrón, la alerta debería desaparecer
              // por el análisis mismo, no por un borrado manual).
              await get().analizarPatrones(null, updatedRegistros);
            }
            return result;
          } catch (err) {
            console.error('Error en deleteRegistro:', err);
            set({ error: err instanceof Error ? err.message : 'Error al eliminar el registro' });
            return false;
          } finally {
            set({ isLoading: false });
          }
        },

        limpiarAlertas: () => {
          console.log('Limpiando alertas');

          const { alertas, resumenAlerta, analisisCompleto, recomendaciones, requiereProfesional } = get();
          if (
            alertas.length > 0 ||
            resumenAlerta ||
            analisisCompleto ||
            recomendaciones.length > 0 ||
            requiereProfesional
          ) {
            set({
              alertas: [],
              resumenAlerta: '',
              recomendaciones: [],
              requiereProfesional: false,
              analisisCompleto: null,
            });
          }
        },

        resetStore: () => {
          console.log('Resetear store');
          set(initialState);
        },
      };
    },
    {
      name: 'bitacora-storage',
      storage: secureStorageAdapter,
      partialize: (state) => ({
        registros: state.registros,
        alertas: state.alertas,
        resumenAlerta: state.resumenAlerta,
        recomendaciones: state.recomendaciones,
        requiereProfesional: state.requiereProfesional,
        analisisCompleto: state.analisisCompleto,
        userId: state.userId,
      }),
    }
  )
);