import { Timestamp } from 'firebase/firestore';

export interface HabitActivity {
  id: string;
  text: string;
  done: boolean;
}

export interface HabitEntity {
  id: string;
  userId: string;
  title: string;
  objetivo: string;
  semilla: string;
  icon: string;
  color: string;
  progress: boolean[]; // 7 posiciones: Lunes(0) ... Domingo(6)
  activities: HabitActivity[];
  weekStartDate?: string | null; // <-- NUEVO: ISO string del Lunes de la semana actual
  createdAt?: Timestamp | null;
}

// Datos que pide el formulario de "Crear hábito"
export interface CreateHabitInput {
  title: string;
  objetivo: string;
  semilla: string;
  icon: string;
  color: string;
  weekStartDate?: string | null;
}