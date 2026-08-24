
export interface SesionRelajacion {
  id: string;
  ejercicioId: string;
  fecha: Date;
  duracion: number;
  completado: boolean;
  puntuacion?: number;
  nota?: string;
}