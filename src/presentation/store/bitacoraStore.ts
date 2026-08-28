
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegistroAnimo } from '../../domain/entities/bitacora/RegistroAnimo';
import { Alerta, AnalisisCompleto } from '../../domain/usecases/bitacora/DetectarPatronesUseCase';
import { RegistroAnimoRepositoryImpl } from '../../data/repositories/RegistroAnimoRepositoryImpl';
import { GetRegistrosUseCase } from '../../domain/usecases/bitacora/GetRegistroAnimo';
import { SaveRegistroUseCase, SaveRegistroData } from '../../domain/usecases/bitacora/SaveRegistroUseCase';
import { DeleteRegistroUseCase } from '../../domain/usecases/bitacora/DeleteRegistroUseCase';
import { DetectarPatronesUseCase } from '../../domain/usecases/bitacora/DetectarPatronesUseCase';


interface BitacoraState {
  // Estado
  registros: RegistroAnimo[];
  isLoading: boolean;
  error: string | null;
  alertas: Alerta[];
  resumenAlerta: string;
  analisisCompleto: AnalisisCompleto | null;
  userId: string;
  
  // Acciones
  setUserId: (userId: string) => void;
  loadRegistros: () => Promise<void>;
  getRegistroPorFecha: (fecha: Date) => RegistroAnimo | null;
  saveRegistro: (registroData: Omit<SaveRegistroData, 'userId'>) => Promise<RegistroAnimo | null>;
  deleteRegistro: (id: string) => Promise<boolean>;
  analizarPatrones: (registro: RegistroAnimo) => Promise<AnalisisCompleto | null>;
  limpiarAlertas: () => void;
  resetStore: () => void;
}


const initialState = {
  registros: [],
  isLoading: false,
  error: null,
  alertas: [],
  resumenAlerta: '',
  analisisCompleto: null,
  userId: 'temp_user',
};

export const useBitacoraStore = create<BitacoraState>()(
  persist(
    (set, get) => {
      // Repositorio y Use Cases
      const repository = new RegistroAnimoRepositoryImpl();
      const getRegistrosUseCase = new GetRegistrosUseCase(repository);
      const saveRegistroUseCase = new SaveRegistroUseCase(repository);
      const deleteRegistroUseCase = new DeleteRegistroUseCase(repository);
      const detectarPatronesUseCase = new DetectarPatronesUseCase(repository);

      return {
        ...initialState,

        setUserId: (userId: string) => {
          console.log('👤 Seteando userId:', userId);
          set({ userId });
        },

        loadRegistros: async () => {
          const { userId } = get();
          console.log('loadRegistros - userId:', userId);
          
          if (!userId) {
            set({ error: 'Usuario no autenticado' });
            return;
          }

          set({ isLoading: true, error: null });

          try {
            const data = await getRegistrosUseCase.execute(userId);
            set({ registros: data || [] });
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar los registros';
            console.error('Error loadRegistros:', errorMessage);
            set({ error: errorMessage });
          } finally {
            set({ isLoading: false });
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

        analizarPatrones: async (registro: RegistroAnimo) => {
          const { userId } = get();
          console.log('analizarPatrones - Iniciando análisis...');
          
          try {
            const historial = await repository.getRegistros(userId);
            
            const resultado = await detectarPatronesUseCase.execute(
              userId,
              registro,
              historial
            );
            
            set({
              alertas: resultado.alertas,
              resumenAlerta: resultado.resumen,
              analisisCompleto: resultado,
            });
            
            console.log('Estado actualizado - alertas en store:', resultado.alertas.length);
            
            return resultado;
          } catch (error) {
            console.error('Error en analizarPatrones:', error);
            return null;
          }
        },

        saveRegistro: async (registroData: Omit<SaveRegistroData, 'userId'>) => {
          const { userId, analizarPatrones, loadRegistros } = get();
          console.log('saveRegistro - Datos recibidos:', registroData);

          set({ isLoading: true, error: null });

          try {
            const data: SaveRegistroData = {
              ...registroData,
              userId: userId || 'temp_user',
            };
            
            console.log('Guardando registro...');
            const saved = await saveRegistroUseCase.execute(data);
            
            console.log('Recargando registros...');
            await loadRegistros();
            
            if (saved) {
              console.log('Analizando patrones para el nuevo registro...');
              await analizarPatrones(saved);
            }
            
            return saved;
          } catch (err) {
            console.error('Error en saveRegistro:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error al guardar el registro';
            set({ error: errorMessage });
            return null;
          } finally {
            set({ isLoading: false });
          }
        },

        deleteRegistro: async (id: string) => {
          const { loadRegistros, limpiarAlertas } = get();
          console.log('deleteRegistro - id:', id);
          
          set({ isLoading: true, error: null });

          try {
            const result = await deleteRegistroUseCase.execute(id);
            console.log('Resultado delete:', result);
            
            if (result) {
              await loadRegistros();
              limpiarAlertas();
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
          set({
            alertas: [],
            resumenAlerta: '',
            analisisCompleto: null,
          });
        },

        resetStore: () => {
          console.log(' Resetear store');
          set(initialState);
        },
      };
    },
    {
      name: 'bitacora-storage', 
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        registros: state.registros,
        alertas: state.alertas,
        resumenAlerta: state.resumenAlerta,
        analisisCompleto: state.analisisCompleto,
        userId: state.userId,
      }),
    }
  )
);