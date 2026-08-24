import { EjercicioRespiración, SesionRelajacion } from '../../domain/entities/relajacion/EjercicioRespiracion';

export interface IRelajacionRepository {
  getEjercicios(): Promise<EjercicioRespiración[]>;
  guardarEjercicios(ejercicios: EjercicioRespiración[]): Promise<void>;
  getSesiones(): Promise<SesionRelajacion[]>;
  guardarSesion(sesion: Omit<SesionRelajacion, 'id'>): Promise<SesionRelajacion>;
}