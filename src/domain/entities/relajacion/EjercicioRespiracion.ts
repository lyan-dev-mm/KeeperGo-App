export type TecnicaRespiracion = '4-7-8' | 'diafragmatica' | 'cuadrada';

export interface FaseRespiracion {
  tipo: 'inhalar' | 'mantener' | 'exhalar';
  duracion: number; // en segundos
  animacion: 'expandir' | 'mantener' | 'contraer';
}

export interface EjercicioRespiración {
  id: string;
  nombre: string;
  tecnica: TecnicaRespiracion;
  descripcion: string;
  color: string;
  icono: string;
  fases: FaseRespiracion[];
  duracionTotal: number; // en segundos
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  beneficios: string[];
  instrucciones: string[];
}

export interface SesionRelajacion {
  id: string;
  ejercicioId: string;
  fecha: Date;
  duracion: number; // segundos completados
  completado: boolean;
  puntuacion?: number; // 1-5
  nota?: string;
}