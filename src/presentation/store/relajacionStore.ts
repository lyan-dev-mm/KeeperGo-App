
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EjercicioRespiración, SesionRelajacion } from '../../domain/entities/relajacion/EjercicioRespiracion';
import { RelajacionRepositoryImpl } from '../../data/repositories/relajacion/RelajacionrepositoryImpl';
import { GetEjerciciosUseCase } from '../../domain/usecases/relajacion/GetEjerciciosUseCase';
import { GuardarProgresoUseCase } from '../../domain/usecases/relajacion/GuardarProgresoUseCase';


interface RelajacionState {
  // Estado
  ejercicios: EjercicioRespiración[];
  sesiones: SesionRelajacion[];
  isLoading: boolean;
  error: string | null;
  ejercicioActual: EjercicioRespiración | null;
  progresoSesion: {
    segundosCompletados: number;
    faseActual: number;
    completado: boolean;
  };
  
  // Acciones
  loadEjercicios: () => Promise<void>;
  getEjercicioPorId: (id: string) => EjercicioRespiración | undefined;
  iniciarEjercicio: (ejercicioId: string) => void;
  actualizarProgreso: (segundos: number, fase: number) => void;
  completarEjercicio: (puntuacion?: number, nota?: string) => Promise<void>;
  guardarSesion: (sesion: Omit<SesionRelajacion, 'id'>) => Promise<SesionRelajacion>;
  limpiarError: () => void;
}

const EJERCICIOS_POR_DEFECTO: EjercicioRespiración[] = [
  {
    id: '1',
    nombre: 'Respiración 4-7-8',
    tecnica: '4-7-8',
    descripcion: 'Inhala 4 segundos, mantén 7 segundos, exhala 8 segundos. Ideal para calmar la ansiedad.',
    color: '#4A90D9',
    icono: '🌊',
    fases: [
      { tipo: 'inhalar', duracion: 4, animacion: 'expandir' },
      { tipo: 'mantener', duracion: 7, animacion: 'mantener' },
      { tipo: 'exhalar', duracion: 8, animacion: 'contraer' },
    ],
    duracionTotal: 19,
    nivel: 'principiante',
    beneficios: ['Reduce la ansiedad', 'Mejora el sueño', 'Calma el sistema nervioso'],
    instrucciones: [
      'Siéntate cómodamente con la espalda recta',
      'Coloca la punta de la lengua detrás de los dientes superiores',
      'Exhala completamente por la boca',
      'Inhala por la nariz contando 4 segundos',
      'Mantén la respiración contando 7 segundos',
      'Exhala por la boca contando 8 segundos',
      'Repite el ciclo 4 veces',
    ],
  },
  {
    id: '2',
    nombre: 'Respiración Diafragmática',
    tecnica: 'diafragmatica',
    descripcion: 'Respiración profunda usando el diafragma para relajar todo el cuerpo.',
    color: '#2ECC71',
    icono: '🌿',
    fases: [
      { tipo: 'inhalar', duracion: 5, animacion: 'expandir' },
      { tipo: 'mantener', duracion: 2, animacion: 'mantener' },
      { tipo: 'exhalar', duracion: 6, animacion: 'contraer' },
    ],
    duracionTotal: 13,
    nivel: 'intermedio',
    beneficios: ['Reduce el estrés', 'Mejora la concentración', 'Fortalece el diafragma'],
    instrucciones: [
      'Acuéstate boca arriba con las rodillas dobladas',
      'Coloca una mano en el pecho y otra en el abdomen',
      'Inhala lentamente por la nariz sintiendo cómo se eleva el abdomen',
      'El pecho debe mantenerse quieto',
      'Exhala lentamente por la boca sintiendo cómo baja el abdomen',
      'Repite durante 5-10 minutos',
    ],
  },
  {
    id: '3',
    nombre: 'Respiración Cuadrada',
    tecnica: 'cuadrada',
    descripcion: 'Inhala 4s, mantén 4s, exhala 4s, mantén 4s. Equilibrio y concentración total.',
    color: '#1ABC9C',
    icono: '🔷',
    fases: [
      { tipo: 'inhalar', duracion: 4, animacion: 'expandir' },
      { tipo: 'mantener', duracion: 4, animacion: 'mantener' },
      { tipo: 'exhalar', duracion: 4, animacion: 'contraer' },
      { tipo: 'mantener', duracion: 4, animacion: 'mantener' },
    ],
    duracionTotal: 16,
    nivel: 'intermedio',
    beneficios: ['Mejora la concentración', 'Equilibra el sistema nervioso', 'Aumenta la claridad mental'],
    instrucciones: [
      'Siéntate con la espalda recta y los hombros relajados',
      'Inhala por la nariz contando 4 segundos',
      'Mantén la respiración contando 4 segundos',
      'Exhala por la nariz contando 4 segundos',
      'Mantén los pulmones vacíos contando 4 segundos',
      'Repite el ciclo 5-10 veces',
    ],
  },
  {
    id: '4',
    nombre: 'Respiración Alterna (Nadi Shodhana)',
    tecnica: 'alterna',
    descripcion: 'Alterna la respiración entre fosas nasales para equilibrar los hemisferios cerebrales.',
    color: '#9B59B6',
    icono: '🔄',
    fases: [
      { tipo: 'inhalar', duracion: 4, animacion: 'expandir' },
      { tipo: 'mantener', duracion: 2, animacion: 'mantener' },
      { tipo: 'exhalar', duracion: 4, animacion: 'contraer' },
    ],
    duracionTotal: 10,
    nivel: 'avanzado',
    beneficios: ['Equilibra los hemisferios cerebrales', 'Calma la mente', 'Mejora la respiración'],
    instrucciones: [
      'Siéntate cómodamente con la espalda recta',
      'Usa el pulgar derecho para cerrar la fosa nasal derecha',
      'Inhala por la fosa nasal izquierda contando 4',
      'Cierra la fosa nasal izquierda con el anular',
      'Abre la fosa nasal derecha y exhala contando 4',
      'Inhala por la derecha contando 4',
      'Cierra la derecha y exhala por la izquierda contando 4',
      'Repite el ciclo 5 veces',
    ],
  },
];


const initialState = {
  ejercicios: [],
  sesiones: [],
  isLoading: false,
  error: null,
  ejercicioActual: null,
  progresoSesion: {
    segundosCompletados: 0,
    faseActual: 0,
    completado: false,
  },
};

export const useRelajacionStore = create<RelajacionState>()(
  persist(
    (set, get) => {
      const repository = new RelajacionRepositoryImpl();
      const getEjerciciosUseCase = new GetEjerciciosUseCase(repository);
      const guardarProgresoUseCase = new GuardarProgresoUseCase(repository);

      return {
        ...initialState,

        loadEjercicios: async () => {
          console.log(' loadEjercicios - Cargando ejercicios...');
          set({ isLoading: true, error: null });

          try {
            // Intentar cargar del repositorio
            let ejercicios = await getEjerciciosUseCase.execute();
            
            if (!ejercicios || ejercicios.length === 0) {
              console.log(' Usando ejercicios por defecto');
              ejercicios = EJERCICIOS_POR_DEFECTO;
              // Guardar en el repositorio para futuras veces
              await repository.guardarEjercicios(ejercicios);
            }

            set({ ejercicios });
          } catch (error) {
            console.error('Error loadEjercicios:', error);
            // Fallback a ejercicios por defecto
            set({ ejercicios: EJERCICIOS_POR_DEFECTO });
          } finally {
            set({ isLoading: false });
          }
        },

        getEjercicioPorId: (id: string) => {
          const { ejercicios } = get();
          return ejercicios.find(e => e.id === id);
        },

        iniciarEjercicio: (ejercicioId: string) => {
          const ejercicio = get().getEjercicioPorId(ejercicioId);
          if (ejercicio) {
            set({
              ejercicioActual: ejercicio,
              progresoSesion: {
                segundosCompletados: 0,
                faseActual: 0,
                completado: false,
              },
            });
          }
        },

        actualizarProgreso: (segundos: number, fase: number) => {
          const { progresoSesion, ejercicioActual } = get();
          if (!ejercicioActual) return;

          const totalFases = ejercicioActual.fases.length;
          const nuevoSegundos = progresoSesion.segundosCompletados + segundos;
          const completado = fase >= totalFases - 1 && nuevoSegundos >= ejercicioActual.duracionTotal;

          set({
            progresoSesion: {
              segundosCompletados: nuevoSegundos,
              faseActual: fase,
              completado,
            },
          });
        },

        completarEjercicio: async (puntuacion?: number, nota?: string) => {
          const { ejercicioActual, progresoSesion } = get();
          if (!ejercicioActual) return;

          const sesion: Omit<SesionRelajacion, 'id'> = {
            ejercicioId: ejercicioActual.id,
            fecha: new Date(),
            duracion: progresoSesion.segundosCompletados,
            completado: true,
            puntuacion,
            nota,
          };

          const nuevaSesion = await get().guardarSesion(sesion);
          
          set({
            progresoSesion: {
              segundosCompletados: 0,
              faseActual: 0,
              completado: false,
            },
          });

          return nuevaSesion;
        },

        guardarSesion: async (sesion: Omit<SesionRelajacion, 'id'>) => {
          console.log('guardarSesion - Guardando progreso...');
          
          try {
            const nuevaSesion = await guardarProgresoUseCase.execute(sesion);
            set((state) => ({
              sesiones: [...state.sesiones, nuevaSesion],
            }));
            return nuevaSesion;
          } catch (error) {
            console.error(' Error guardarSesion:', error);
            throw error;
          }
        },

        limpiarError: () => set({ error: null }),
      };
    },
    {
      name: 'relajacion-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ejercicios: state.ejercicios,
        sesiones: state.sesiones,
      }),
    }
  )
);